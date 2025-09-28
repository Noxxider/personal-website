<template>
  <q-page class="q-pa-md analytics-page">
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-weight-bold">Kaya Episodes — Analytics</div>
        <div class="text-caption text-grey-5">Anonymized export for clinical discussion • Informational only</div>
      </div>

      <q-space/>

      <!-- File loader -->
      <div class="col-12 col-md-auto">
        <q-file
          dense
          standout
          input-class="text-body2"
          v-model="xlsxFile"
          @update:model-value="onXlsxSelected"
          label="Load Excel (.xlsx)"
          accept=".xlsx,.xls"
          clear-icon="close"
          prepend-icon="upload"
        />
      </div>

      <div class="col-12 col-md-auto">
        <q-btn dense flat icon="autorenew" label="Reset" @click="resetAll"/>
      </div>

      <div class="col-12 col-md-auto" v-if="episodes.length">
        <q-btn dense color="primary" icon="print" label="Print / PDF for Doctor" @click="printHandout"/>
      </div>
    </div>

    <q-banner v-if="!episodes.length" rounded class="bg-grey-10 text-grey-2 q-pa-md q-mb-lg">
      <div class="row items-center q-col-gutter-md">
        <div class="col-auto"><q-icon name="info" size="md"/></div>
        <div class="col">
          <div class="text-subtitle1">Start by loading the Excel file</div>
          <div class="text-body2">This page expects a worksheet named <span class="text-bold">"Date Interval"</span>. You'll be able to map columns in case headers differ. All analysis runs locally in your browser.</div>
        </div>
      </div>
    </q-banner>

    <q-splitter v-model="splitter" style="height: calc(100vh - 180px);" unit="px" v-if="true">
      <!-- LEFT: Filters & Mapping -->
      <template #before>
        <div class="q-pa-sm scroll column q-gutter-sm">
          <q-expansion-item dense default-opened icon="tune" label="Filters" class="bg-dark-panel" header-class="text-grey-2">
            <div class="q-pa-sm column q-gutter-sm">
              <q-input dense v-model="filter.dateFrom" label="From (YYYY-MM-DD)" type="date"/>
              <q-input dense v-model="filter.dateTo" label="To (YYYY-MM-DD)" type="date"/>
              <q-range range
                dense
                v-model="filter.hourRange"
                :min="0" :max="23" :step="1"
                label-always
              >
                <template #left-label>Hour {{ filter.hourRange.min }}</template>
                <template #right-label>{{ filter.hourRange.max }}</template>
              </q-range>
              <q-select dense v-model="filter.weekdays" multiple emit-value map-options :options="weekdayOptions" label="Weekdays"/>
              <q-select dense v-model="filter.temperature" emit-value map-options :options="tempOptions" label="Temperature (episode)" clearable/>
              <q-toggle dense v-model="filter.onPeriodOnly" label="On period only"/>
              <q-toggle dense v-model="filter.hasSeverityOnly" label="Has severity recorded"/>
            </div>
          </q-expansion-item>

          <q-expansion-item dense icon="view_list" label="Column Mapping" class="bg-dark-panel" header-class="text-grey-2" :default-opened="episodes.length === 0">
            <div class="q-pa-sm column q-gutter-xs">
              <div class="text-caption text-grey-5">If headers in your sheet differ, map them here.</div>
              <div v-for="(target, key) in mapping" :key="key" class="row items-center">
                <div class="col-6 text-caption">{{ target.label }}</div>
                <div class="col-6">
                  <q-select
                    dense
                    options-dense
                    clearable
                    v-model="mapping[key].column"
                    :options="availableHeaders"
                    :hint="mapping[key].required ? 'Required' : 'Optional'"
                    :rules="mapping[key].required ? [v => !!v || 'Required'] : []"
                    behavior="menu"
                  />
                </div>
              </div>
              <q-separator dark spaced/>
              <q-btn dense color="primary" label="Re-parse with mapping" @click="reparseWithMapping" :disable="!workbook"/>
            </div>
          </q-expansion-item>

          <q-expansion-item dense icon="list_alt" label="Diet Keywords" class="bg-dark-panel" header-class="text-grey-2">
            <div class="q-pa-sm">
              <q-select
                v-model="dietKeywords"
                dense
                use-input
                use-chips
                multiple
                new-value-mode="add-unique"
                label="Keywords to scan in notes/diet fields"
                :options="dietKeywords"
                @filter="() => {}"
              />
              <div class="text-caption text-grey-5 q-mt-xs">We will count frequency and show mean severity when these appear in notes.</div>
            </div>
          </q-expansion-item>

          <q-expansion-item dense icon="help" label="Doctor Questions (editable)" class="bg-dark-panel" header-class="text-grey-2">
            <div class="q-pa-sm column q-gutter-xs">
              <q-input dense autogrow v-model="doctorQuestions" type="textarea"/>
              <div class="text-caption text-grey-5">These print at the end of the handout.</div>
            </div>
          </q-expansion-item>

          <q-expansion-item dense icon="info" label="Notes" class="bg-dark-panel" header-class="text-grey-2">
            <div class="q-pa-sm text-caption text-grey-5">
              <ul class="q-pl-md">
                <li>All calculations are descriptive and run locally. Not medical advice.</li>
                <li>For occurrence modeling, days without an episode in the loaded range are treated as non-episode days. Features for those days are limited to calendar/recency signals unless you provide a daily diary sheet.</li>
              </ul>
            </div>
          </q-expansion-item>
        </div>
      </template>

      <!-- RIGHT: Content -->
      <template #after>
        <div class="q-pa-sm scroll">
          <div v-if="episodes.length" class="column q-gutter-md">

            <!-- KPI Cards -->
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-md-3" v-for="card in kpiCards" :key="card.label">
                <q-card flat bordered class="kpi-card">
                  <q-card-section>
                    <div class="text-caption text-grey-5">{{ card.label }}</div>
                    <div class="text-h6">{{ card.value }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Timeline -->
            <q-card flat bordered class="panel-card">
              <q-card-section class="row items-center q-col-gutter-sm">
                <div class="col-auto"><q-icon name="timeline"/></div>
                <div class="col"><div class="text-subtitle1">Episodes over time</div></div>
                <div class="col-auto"><q-toggle v-model="showMedsOnTimeline" dense label="Show meds"/></div>
              </q-card-section>
              <q-separator dark/>
              <q-card-section>
                <apexchart type="line" height="250" :options="charts.timeline.options" :series="charts.timeline.series"/>
              </q-card-section>
            </q-card>

            <!-- Distributions: Hour & Weekday -->
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-card flat bordered class="panel-card">
                  <q-card-section class="row items-center q-col-gutter-sm">
                    <div class="col-auto"><q-icon name="schedule"/></div>
                    <div class="col"><div class="text-subtitle1">Hour of onset</div></div>
                  </q-card-section>
                  <q-separator dark/>
                  <q-card-section>
                    <apexchart type="bar" height="240" :options="charts.hour.options" :series="charts.hour.series"/>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-6">
                <q-card flat bordered class="panel-card">
                  <q-card-section class="row items-center q-col-gutter-sm">
                    <div class="col-auto"><q-icon name="event"/></div>
                    <div class="col"><div class="text-subtitle1">Weekday distribution</div></div>
                  </q-card-section>
                  <q-separator dark/>
                  <q-card-section>
                    <apexchart type="bar" height="240" :options="charts.weekday.options" :series="charts.weekday.series"/>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Correlation Panel -->
            <q-card flat bordered class="panel-card">
              <q-card-section class="row items-center q-col-gutter-sm">
                <div class="col-auto"><q-icon name="insights"/></div>
                <div class="col"><div class="text-subtitle1">Associations with severity (Spearman ρ)</div></div>
              </q-card-section>
              <q-separator dark/>
              <q-card-section>
                <apexchart type="bar" height="240" :options="charts.corr.options" :series="charts.corr.series"/>
                <div class="text-caption text-grey-5 q-mt-xs">Only episodes with severity & the given factor recorded are included. Not causal.</div>
              </q-card-section>
            </q-card>

            <!-- Trigger matrix (heatmap) -->
            <q-card flat bordered class="panel-card">
              <q-card-section class="row items-center q-col-gutter-sm">
                <div class="col-auto"><q-icon name="grid_on"/></div>
                <div class="col"><div class="text-subtitle1">Trigger matrix — mean severity by factor</div></div>
              </q-card-section>
              <q-separator dark/>
              <q-card-section>
                <apexchart type="heatmap" height="320" :options="charts.heatmap.options" :series="charts.heatmap.series"/>
              </q-card-section>
            </q-card>

            <!-- Diet keywords -->
            <q-card flat bordered class="panel-card">
              <q-card-section class="row items-center q-col-gutter-sm">
                <div class="col-auto"><q-icon name="restaurant"/></div>
                <div class="col"><div class="text-subtitle1">Diet/Notes keywords</div></div>
              </q-card-section>
              <q-separator dark/>
              <q-card-section>
                <apexchart type="bar" height="240" :options="charts.keywords.options" :series="charts.keywords.series"/>
                <div class="text-caption text-grey-5 q-mt-xs">Bars show frequency; label shows mean severity when keyword present.</div>
              </q-card-section>
            </q-card>

            <!-- Occurrence model -->
            <q-card flat bordered class="panel-card">
              <q-card-section class="row items-center q-col-gutter-sm">
                <div class="col-auto"><q-icon name="analytics"/></div>
                <div class="col"><div class="text-subtitle1">Occurrence model (logistic) — next 14 days risk</div></div>
                <div class="col-auto"><q-btn dense flat icon="refresh" label="Re-fit" @click="fitOccurrenceModel"/></div>
              </q-card-section>
              <q-separator dark/>
              <q-card-section>
                <div v-if="occurrenceModel.fitted" class="row q-col-gutter-sm">
                  <div class="col-12 col-md-7">
                    <apexchart type="line" height="260" :options="charts.riskForecast.options" :series="charts.riskForecast.series"/>
                  </div>
                  <div class="col-12 col-md-5">
                    <apexchart type="bar" height="260" :options="charts.riskWeights.options" :series="charts.riskWeights.series"/>
                    <div class="text-caption text-grey-5 q-mt-xs">Weights (positive → higher risk). Model uses calendar & recency features only.</div>
                  </div>
                </div>
                <div v-else class="text-caption text-grey-5">Load data to fit the model.</div>
              </q-card-section>
            </q-card>

            <!-- Data quality -->
            <q-card flat bordered class="panel-card">
              <q-card-section class="row items-center q-col-gutter-sm">
                <div class="col-auto"><q-icon name="rule"/></div>
                <div class="col"><div class="text-subtitle1">Data quality checks</div></div>
              </q-card-section>
              <q-separator dark/>
              <q-card-section>
                <ul class="text-body2 q-pl-md q-mb-none">
                  <li v-for="q in dataQuality.issues" :key="q.msg">{{ q.msg }}</li>
                </ul>
              </q-card-section>
            </q-card>

          </div>
        </div>
      </template>
    </q-splitter>

    <!-- Print footer (appears only in print) -->
    <div class="print-footer no-print-hide">
      <div><span class="text-weight-bold">Patient:</span> K.</div>
      <div><span class="text-weight-bold">Generated:</span> {{ new Date().toISOString().slice(0,10) }}</div>
      <div><span class="text-weight-bold">Key questions:</span>
        <ul>
          <li v-for="(q, idx) in doctorQuestionsLines" :key="idx">{{ q }}</li>
        </ul>
      </div>
      <div class="text-caption">This handout is informational only and not a medical diagnosis.</div>
    </div>
  </q-page>
</template>

<script>
import * as XLSX from 'xlsx'
import ApexChart from 'vue3-apexcharts'

const WEEKDAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default {
  name: 'KayaEpisodesAnalytics',
  components: { apexchart: ApexChart },
  data () {
    return {
      // UI
      splitter: 330,
      xlsxFile: null,
      workbook: null,
      availableHeaders: [],
      showMedsOnTimeline: false,

      // Config / mapping
      mapping: {
        startDate: { label: 'Start Date', column: null, required: true },
        startTime: { label: 'Start Time', column: null, required: false },
        endDate:   { label: 'End Date', column: null, required: false },
        endTime:   { label: 'End Time', column: null, required: false },
        severity:  { label: 'Severity', column: null, required: false },
        stress:    { label: 'Stress (0-3 or Low/Med/High)', column: null, required: false },
        sleep:     { label: 'Sleep Quality (0-3 or Poor/OK/Good)', column: null, required: false },
        hydration: { label: 'Hydration (0-3 or Low/OK/High)', column: null, required: false },
        activity:  { label: 'Activity (rest/light/moderate/hard)', column: null, required: false },
        temperature: { label: 'Temperature (cold/warm/hot/mixed)', column: null, required: false },
        onPeriod:  { label: 'On Period (Y/N)', column: null, required: false },
        meds:      { label: 'Medications (free text)', column: null, required: false },
        notes:     { label: 'Notes / Diet', column: null, required: false }
      },

      // Filters
      filter: {
        dateFrom: '',
        dateTo: '',
        hourRange: { min: 0, max: 23 },
        weekdays: [],
        temperature: null,
        onPeriodOnly: false,
        hasSeverityOnly: false
      },

      dietKeywords: ['caffeine','coffee','alcohol','wine','beer','spicy','chili','fatty','sugar','dessert'],
      doctorQuestions: `• Could dysautonomia/vasomotor instability or small-fiber neuropathy explain nocturnal leg erythema with burning pain?\n• Any value in autonomic testing (e.g., tilt table) or skin biopsy for small fibers?\n• Cooling vs warming strategies during episodes?\n• Medication adjustments (dose/timing) to blunt overnight episodes?\n• Red flags that warrant ED vs home care?`,

      // Data
      rawRows: [],
      episodes: [],
      filteredEpisodes: [],

      // Aggregates
      kpiCards: [],
      charts: {
        timeline: { options: {}, series: [] },
        hour: { options: {}, series: [] },
        weekday: { options: {}, series: [] },
        corr: { options: {}, series: [] },
        heatmap: { options: {}, series: [] },
        keywords: { options: {}, series: [] },
        riskForecast: { options: {}, series: [] },
        riskWeights: { options: {}, series: [] }
      },

      dataQuality: { issues: [] },

      // Occurrence model
      occurrenceModel: {
        fitted: false,
        weights: [],
        features: [],
        forecast: []
      }
    }
  },
  computed: {
    weekdayOptions () {
      return WEEKDAY_LABELS.map((l, i) => ({ label: l, value: i }))
    },
    tempOptions () {
      return [
        { label: 'Cold', value: 'cold' },
        { label: 'Warm', value: 'warm' },
        { label: 'Hot', value: 'hot' },
        { label: 'Mixed', value: 'mixed' }
      ]
    },
    doctorQuestionsLines () {
      return this.doctorQuestions.split(/\n|\r/).map(s => s.replace(/^•\s*/,'').trim()).filter(Boolean)
    }
  },
  watch: {
    filter: {
      handler () { this.applyFiltersAndRefresh() },
      deep: true
    },
    episodes: {
      handler () { this.applyFiltersAndRefresh() },
      deep: true
    },
    dietKeywords () { this.refreshKeywordChart(); this.saveConfig() }
  },
  mounted () {
    this.loadConfig()
  },
  methods: {
    resetAll () {
      this.xlsxFile = null
      this.workbook = null
      this.availableHeaders = []
      this.rawRows = []
      this.episodes = []
      this.filteredEpisodes = []
      this.kpiCards = []
      this.charts = { timeline: {options:{},series:[]}, hour:{options:{},series:[]}, weekday:{options:{},series:[]}, corr:{options:{},series:[]}, heatmap:{options:{},series:[]}, keywords:{options:{},series:[]}, riskForecast:{options:{},series:[]}, riskWeights:{options:{},series:[]} }
      this.dataQuality.issues = []
      this.occurrenceModel = { fitted: false, weights: [], features: [], forecast: [] }
    },

    saveConfig () {
      const cfg = {
        mapping: this.mapping,
        dietKeywords: this.dietKeywords,
        doctorQuestions: this.doctorQuestions
      }
      localStorage.setItem('kaya-analytics-cfg', JSON.stringify(cfg))
    },
    loadConfig () {
      try {
        const raw = localStorage.getItem('kaya-analytics-cfg')
        if (!raw) return
        const cfg = JSON.parse(raw)
        if (cfg.mapping) this.mapping = cfg.mapping
        if (cfg.dietKeywords) this.dietKeywords = cfg.dietKeywords
        if (cfg.doctorQuestions) this.doctorQuestions = cfg.doctorQuestions
      } catch (e) { /* ignore */ }
    },

    async onXlsxSelected (file) {
      if (!file) return
      const buf = await file.arrayBuffer()
      this.workbook = XLSX.read(buf, { type: 'array' })
      const sheetName = this.workbook.SheetNames.find(n => n.toLowerCase().includes('date') && n.toLowerCase().includes('interval')) || this.workbook.SheetNames[0]
      const ws = this.workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: null })

      this.availableHeaders = Object.keys(rows[0] || {})
      this.autodetectMapping(this.availableHeaders)

      this.rawRows = rows
      this.parseRows()
      this.saveConfig()
    },

    autodetectMapping (headers) {
      const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,'')
      const H = headers.map(h => ({ h, n: norm(h) }))
      const pick = (...cands) => (H.find(x => cands.some(c => x.n.includes(c))) || {}).h || null

      this.mapping.startDate.column = this.mapping.startDate.column || pick('startdate','date','onsetdate')
      this.mapping.startTime.column = this.mapping.startTime.column || pick('starttime','onsettime','time')
      this.mapping.endDate.column   = this.mapping.endDate.column   || pick('enddate')
      this.mapping.endTime.column   = this.mapping.endTime.column   || pick('endtime')
      this.mapping.severity.column  = this.mapping.severity.column  || pick('severity','pain','nrs')
      this.mapping.stress.column    = this.mapping.stress.column    || pick('stress')
      this.mapping.sleep.column     = this.mapping.sleep.column     || pick('sleep','sleepquality')
      this.mapping.hydration.column = this.mapping.hydration.column || pick('hydration')
      this.mapping.activity.column  = this.mapping.activity.column  || pick('activity','exercise')
      this.mapping.temperature.column = this.mapping.temperature.column || pick('temp','temperature')
      this.mapping.onPeriod.column  = this.mapping.onPeriod.column  || pick('onperiod','period')
      this.mapping.meds.column      = this.mapping.meds.column      || pick('med','meds','medication')
      this.mapping.notes.column     = this.mapping.notes.column     || pick('notes','diet','comment')
    },

    reparseWithMapping () {
      this.parseRows()
      this.saveConfig()
    },

    parseRows () {
      const m = this.mapping
      const issues = []
      const episodes = []

      const toDate = (val) => {
        if (val == null || val === '') return null
        if (val instanceof Date) return val
        // Excel date serial or ISO/string
        if (typeof val === 'number') {
          // Excel stores dates as days since 1899-12-30
          const epoch = new Date(Date.UTC(1899, 11, 30))
          const ms = val * 24 * 60 * 60 * 1000
          return new Date(epoch.getTime() + ms)
        }
        const d = new Date(val)
        return isNaN(d) ? null : d
      }

      const toTime = (val) => {
        if (val == null || val === '') return null
        if (typeof val === 'number') {
          // Excel time fraction of day
          const total = Math.round(val * 24 * 60) // minutes
          const h = Math.floor(total / 60)
          const min = total % 60
          return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`
        }
        const s = String(val).trim()
        const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)
        if (m) {
          let h = parseInt(m[1]); const mi = parseInt(m[2])
          const ap = (m[3]||'').toUpperCase()
          if (ap === 'PM' && h < 12) h += 12
          if (ap === 'AM' && h === 12) h = 0
          return `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`
        }
        return s
      }

      const toNum = (v) => {
        if (v == null || v === '') return null
        const n = Number(String(v).replace(/[^0-9.\-]/g,''))
        return isNaN(n) ? null : n
      }

      const normYN = (v) => {
        if (v == null) return null
        const s = String(v).toLowerCase().trim()
        if (['y','yes','true','1'].includes(s)) return true
        if (['n','no','false','0'].includes(s)) return false
        return null
      }

      const normCat = (v) => String(v == null ? '' : v).toLowerCase().trim()

      for (const r of this.rawRows) {
        const sd = toDate(r[m.startDate.column])
        if (!sd) { issues.push({ msg: 'Row missing Start Date — skipped' }); continue }
        const st = toTime(r[m.startTime.column]) || '00:00'
        const ed = toDate(r[m.endDate.column])
        const et = toTime(r[m.endTime.column])

        const start = this.combineDateTime(sd, st)
        let end = null
        if (ed || et) {
          end = this.combineDateTime(ed || sd, et || st)
          if (end < start) end = new Date(end.getTime() + 24*60*60*1000) // overnight wrap
        }

        const ep = {
          start,
          end,
          durationMin: end ? Math.round((end - start)/60000) : null,
          startHour: start.getHours(),
          weekday: start.getDay(),
          severity: toNum(r[m.severity.column]),
          stress: this.ordStress(normCat(r[m.stress.column])),
          sleep: this.ordSleep(normCat(r[m.sleep.column])),
          hydration: this.ordHydration(normCat(r[m.hydration.column])),
          activity: this.catActivity(normCat(r[m.activity.column])),
          temperature: this.catTemperature(normCat(r[m.temperature.column])),
          onPeriod: normYN(r[m.onPeriod.column]),
          meds: String(r[m.meds.column] || '').toLowerCase(),
          notes: String(r[m.notes.column] || '')
        }
        episodes.push(ep)
      }

      // Sort
      episodes.sort((a,b) => a.start - b.start)

      // Set
      this.episodes = episodes
      this.dataQuality.issues = issues

      this.applyFiltersAndRefresh()
    },

    combineDateTime (dateObj, timeStr) {
      const d = new Date(dateObj)
      const [hh, mm] = (String(timeStr||'00:00').split(':'))
      d.setHours(Number(hh)||0, Number(mm)||0, 0, 0)
      return d
    },

    // --- Normalizers (ordinal encodings) ---
    ordStress (s) { if (!s) return null; if (/^(3|high|severe)/.test(s)) return 3; if (/^(2|med|moderate)/.test(s)) return 2; if (/^(1|low|mild)/.test(s)) return 1; if (/^(0|none)/.test(s)) return 0; return null },
    ordSleep (s) { if (!s) return null; if (/^(good|3)/.test(s)) return 3; if (/^(ok|fair|2)/.test(s)) return 2; if (/^(poor|1)/.test(s)) return 1; if (/^(0|none)/.test(s)) return 0; return null },
    ordHydration (s) { if (!s) return null; if (/^(high|well|3)/.test(s)) return 3; if (/^(ok|2|moderate)/.test(s)) return 2; if (/^(low|1|poor)/.test(s)) return 1; if (/^(0|none)/.test(s)) return 0; return null },
    catActivity (s) { if (!s) return null; if (/^(hard|heavy|intense)/.test(s)) return 'hard'; if (/^(mod|moderate)/.test(s)) return 'moderate'; if (/^(light|walk|stretch)/.test(s)) return 'light'; if (/^(rest|none)/.test(s)) return 'rest'; return s || null },
    catTemperature (s) { if (!s) return null; if (/^cold/.test(s)) return 'cold'; if (/^warm/.test(s)) return 'warm'; if (/^hot/.test(s)) return 'hot'; if (/^mixed|var/.test(s)) return 'mixed'; return s || null },

    // --- Filters & Charts ---
    applyFiltersAndRefresh () {
      const eps = this.episodes.filter(ep => {
        const d = ep.start
        if (this.filter.dateFrom && d < new Date(this.filter.dateFrom)) return false
        if (this.filter.dateTo && d > new Date(this.filter.dateTo + 'T23:59:59')) return false
        if (ep.startHour < this.filter.hourRange.min || ep.startHour > this.filter.hourRange.max) return false
        if (this.filter.weekdays.length && !this.filter.weekdays.includes(ep.weekday)) return false
        if (this.filter.temperature && ep.temperature !== this.filter.temperature) return false
        if (this.filter.onPeriodOnly && ep.onPeriod !== true) return false
        if (this.filter.hasSeverityOnly && (ep.severity == null)) return false
        return true
      })

      this.filteredEpisodes = eps
      this.refreshKPIs()
      this.refreshTimeline()
      this.refreshHourChart()
      this.refreshWeekdayChart()
      this.refreshCorrPanel()
      this.refreshHeatmap()
      this.refreshKeywordChart()
      this.fitOccurrenceModel()
      this.runDataQuality()
    },

    refreshKPIs () {
      if (!this.filteredEpisodes.length) { this.kpiCards = []; return }
      const total = this.filteredEpisodes.length
      const night = this.filteredEpisodes.filter(e => (e.startHour >= 20 || e.startHour < 6)).length
      const withDur = this.filteredEpisodes.filter(e => e.durationMin != null)
      const medDur = withDur.length ? Math.round(this.median(withDur.map(e => e.durationMin))) : '—'
      const withSev = this.filteredEpisodes.filter(e => e.severity != null)
      const medSev = withSev.length ? this.median(withSev.map(e => e.severity)).toFixed(1) : '—'

      // bursts: within 24h of another
      const within24h = (() => {
        let count = 0
        for (let i=0;i<this.filteredEpisodes.length;i++) {
          const prev = this.filteredEpisodes[i-1]
          const cur = this.filteredEpisodes[i]
          if (!prev) continue
          if ((cur.start - prev.start) <= 24*60*60*1000) count++
        }
        return count
      })()

      this.kpiCards = [
        { label: 'Total episodes', value: total },
        { label: '% at night (20:00–06:00)', value: ((night/total)*100).toFixed(0) + '%' },
        { label: 'Median duration (min)', value: medDur },
        { label: 'Median severity', value: medSev }
      ]
    },

    refreshTimeline () {
      const byDay = new Map()
      const medsMarks = []
      for (const e of this.filteredEpisodes) {
        const key = e.start.toISOString().slice(0,10)
        byDay.set(key, (byDay.get(key)||0)+1)
        if (this.showMedsOnTimeline && e.meds) medsMarks.push({ x: e.start.getTime(), y: 0, meds: e.meds })
      }
      const dates = Array.from(byDay.keys()).sort()
      const series = dates.map(d => ({ x: new Date(d).getTime(), y: byDay.get(d) }))

      const annotations = this.showMedsOnTimeline ? {
        points: medsMarks.slice(0,100).map(m => ({ x: m.x, y: m.y, marker: { size: 4 }, label: { text: 'meds', offsetY: -10 } }))
      } : {}

      this.charts.timeline = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          xaxis: { type: 'datetime' },
          yaxis: { min: 0, forceNiceScale: true },
          stroke: { width: 2 },
          dataLabels: { enabled: false },
          grid: { borderColor: '#444' },
          annotations
        },
        series: [{ name: 'Episodes', data: series }]
      }
    },

    refreshHourChart () {
      const bins = Array(24).fill(0)
      for (const e of this.filteredEpisodes) bins[e.startHour]++
      this.charts.hour = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          xaxis: { categories: [...Array(24).keys()].map(h => String(h).padStart(2,'0')) },
          grid: { borderColor: '#444' },
          dataLabels: { enabled: false }
        },
        series: [{ name: 'Count', data: bins }]
      }
    },

    refreshWeekdayChart () {
      const bins = Array(7).fill(0)
      for (const e of this.filteredEpisodes) bins[e.weekday]++
      this.charts.weekday = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          xaxis: { categories: WEEKDAY_LABELS },
          grid: { borderColor: '#444' },
          dataLabels: { enabled: false }
        },
        series: [{ name: 'Count', data: bins }]
      }
    },

    refreshCorrPanel () {
      // Spearman rho of severity vs ordinal features
      const feats = [
        { key: 'stress', label: 'Stress' },
        { key: 'sleep', label: 'Sleep' },
        { key: 'hydration', label: 'Hydration' },
        { key: 'startHour', label: 'Hour of onset' }
      ]
      const rows = []
      const withSev = this.filteredEpisodes.filter(e => e.severity != null)
      for (const f of feats) {
        const pairs = withSev.map(e => ({ x: e[f.key], y: e.severity })).filter(p => p.x != null && p.y != null)
        if (pairs.length >= 5) rows.push({ label: f.label, rho: this.spearman(pairs.map(p => p.x), pairs.map(p => p.y)) })
      }
      rows.sort((a,b) => Math.abs(b.rho) - Math.abs(a.rho))
      this.charts.corr = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          xaxis: { categories: rows.map(r => r.label) },
          plotOptions: { bar: { distributed: true } },
          dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) },
          grid: { borderColor: '#444' }
        },
        series: [{ name: 'Spearman ρ', data: rows.map(r => r.rho) }]
      }
    },

    refreshHeatmap () {
      // Heatmap of mean severity by factor levels
      const factors = [
        { key: 'temperature', label: 'Temperature', levels: ['cold','warm','hot','mixed'] },
        { key: 'activity', label: 'Activity', levels: ['rest','light','moderate','hard'] },
        { key: 'onPeriod', label: 'On period', levels: [true,false] }
      ]

      const series = factors.map(f => {
        const cells = []
        for (const lvl of f.levels) {
          const subset = this.filteredEpisodes.filter(e => e.severity != null && (lvl === true || lvl === false ? e[f.key] === lvl : e[f.key] === lvl))
          const mean = subset.length ? (subset.reduce((a, b) => a + (b.severity || 0), 0) / subset.length) : null
          cells.push({ x: String(lvl), y: mean == null ? null : Number(mean.toFixed(2)) })
        }
        return { name: f.label, data: cells }
      })

      this.charts.heatmap = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          plotOptions: { heatmap: { colorScale: { ranges: [
            { from: 0, to: 2, color: '#004d40' },
            { from: 2, to: 4, color: '#00695c' },
            { from: 4, to: 6, color: '#00897b' },
            { from: 6, to: 8, color: '#26a69a' },
            { from: 8, to: 10, color: '#80cbc4' }
          ] } } },
          dataLabels: { enabled: true },
          xaxis: { labels: { rotate: 0 } },
          grid: { borderColor: '#444' }
        },
        series
      }
    },

    refreshKeywordChart () {
      const counts = []
      const sevByKey = new Map()
      for (const kw of this.dietKeywords) {
        const re = new RegExp(`(^|\\b)${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\b|$)`, 'i')
        const subset = this.filteredEpisodes.filter(e => re.test(e.notes || '') || re.test(e.meds || ''))
        counts.push({ kw, n: subset.length })
        if (subset.length) {
          const withSev = subset.filter(e => e.severity != null)
          const mean = withSev.length ? (withSev.reduce((a,b)=>a+b.severity,0)/withSev.length) : null
          sevByKey.set(kw, mean)
        } else {
          sevByKey.set(kw, null)
        }
      }

      counts.sort((a,b) => b.n - a.n)
      this.charts.keywords = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          xaxis: { categories: counts.map(c => c.kw) },
          dataLabels: { enabled: true, formatter: (v, opts) => {
            const kw = counts[opts.dataPointIndex].kw
            const m = sevByKey.get(kw)
            return m == null ? '' : `avg sev ${m.toFixed(1)}`
          } },
          grid: { borderColor: '#444' }
        },
        series: [{ name: 'Mentions', data: counts.map(c => c.n) }]
      }
    },

    // --- Occurrence modeling ---
    fitOccurrenceModel () {
      if (!this.filteredEpisodes.length) { this.occurrenceModel = { fitted: false, weights: [], features: [], forecast: [] }; return }

      // Build day-level data between min and max date in filtered episodes
      const minDate = new Date(this.filteredEpisodes[0].start.toDateString())
      const maxDate = new Date(this.filteredEpisodes[this.filteredEpisodes.length - 1].start.toDateString())

      const dayKeys = []
      for (let d = new Date(minDate); d <= maxDate; d = new Date(d.getTime() + 86400000)) {
        dayKeys.push(new Date(d))
      }

      const episodeSet = new Set(this.filteredEpisodes.map(e => e.start.toISOString().slice(0,10)))

      // Recency features depend on prior days
      let daysSinceLast = 30
      const rolling7 = new Array(dayKeys.length).fill(0)

      // Precompute episodes per day index for rolling window
      const epIdx = new Set()
      this.filteredEpisodes.forEach(e => {
        const idx = Math.floor((new Date(e.start.toDateString()) - minDate)/86400000)
        if (idx >= 0) epIdx.add(idx)
      })

      const y = []
      const X = []
      const featureNames = ['bias','sinDOW','cosDOW','daysSinceLast','rolling7']

      for (let i=0;i<dayKeys.length;i++) {
        const d = dayKeys[i]
        const key = d.toISOString().slice(0,10)
        const isEp = episodeSet.has(key) ? 1 : 0
        y.push(isEp)

        const dow = d.getDay()
        const sinDOW = Math.sin(2*Math.PI*dow/7)
        const cosDOW = Math.cos(2*Math.PI*dow/7)

        // rolling 7 before day i (exclude today)
        const start = Math.max(0, i-7)
        let rcount = 0
        for (let j=start;j<i;j++) if (epIdx.has(j)) rcount++

        X.push([1, sinDOW, cosDOW, daysSinceLast, rcount])

        // update recency for next day
        if (isEp) { daysSinceLast = 0 } else { daysSinceLast = Math.min(daysSinceLast + 1, 60) }
      }

      // Standardize non-bias columns roughly
      const means = [0,0,0,0,0]
      const stds = [1,1,1,1,1]
      for (let j=1;j<5;j++) {
        const col = X.map(r => r[j])
        const mu = col.reduce((a,b)=>a+b,0)/col.length
        const sd = Math.sqrt(col.reduce((a,b)=>a+(b-mu)*(b-mu),0)/(col.length-1) || 1)
        for (let i=0;i<X.length;i++) X[i][j] = (X[i][j]-mu)/(sd||1)
        means[j] = mu; stds[j] = sd || 1
      }

      // Logistic regression via gradient descent
      const w = [0,0,0,0,0]
      const lr = 0.1
      const iters = 400
      const reg = 0.01

      const sigmoid = (z) => 1/(1+Math.exp(-z))

      for (let it=0; it<iters; it++) {
        const grad = [0,0,0,0,0]
        for (let i=0;i<X.length;i++) {
          const z = w[0]*X[i][0] + w[1]*X[i][1] + w[2]*X[i][2] + w[3]*X[i][3] + w[4]*X[i][4]
          const p = sigmoid(z)
          const err = p - y[i]
          for (let j=0;j<w.length;j++) grad[j] += err * X[i][j]
        }
        for (let j=0;j<w.length;j++) {
          w[j] = w[j] - lr * ((grad[j]/X.length) + reg*w[j])
        }
      }

      // Forecast next 14 days using last known recency
      const lastDay = dayKeys[dayKeys.length-1]
      let daysSince = (() => {
        // find back from last day
        for (let k=0;k<60;k++) {
          const key = new Date(lastDay.getTime() - k*86400000).toISOString().slice(0,10)
          if (episodeSet.has(key)) return Math.min(k,60)
        }
        return 60
      })()

      const forecast = []
      let rollingHist = []
      for (let k=6; k>=0; k--) {
        const key = new Date(lastDay.getTime() - k*86400000).toISOString().slice(0,10)
        rollingHist.push(episodeSet.has(key) ? 1 : 0)
      }

      for (let h=1; h<=14; h++) {
        const d = new Date(lastDay.getTime() + h*86400000)
        const dow = d.getDay()
        const sinDOW = Math.sin(2*Math.PI*dow/7)
        const cosDOW = Math.cos(2*Math.PI*dow/7)
        const r7 = rollingHist.reduce((a,b)=>a+b,0)
        const rowRaw = [1, sinDOW, cosDOW, daysSince, r7]
        const row = [ rowRaw[0], (rowRaw[1]-means[1])/stds[1], (rowRaw[2]-means[2])/stds[2], (rowRaw[3]-means[3])/stds[3], (rowRaw[4]-means[4])/stds[4] ]
        const z = w[0]*row[0] + w[1]*row[1] + w[2]*row[2] + w[3]*row[3] + w[4]*row[4]
        const p = 1/(1+Math.exp(-z))
        forecast.push({ x: d.getTime(), y: Number((p*100).toFixed(1)) })

        // update recency & rolling
        daysSince = Math.min(daysSince + 1, 60)
        rollingHist = rollingHist.slice(1).concat([0])
      }

      this.occurrenceModel = {
        fitted: true,
        weights: [ { name: 'sinDOW', w: w[1] }, { name: 'cosDOW', w: w[2] }, { name: 'daysSinceLast', w: w[3] }, { name: 'rolling7', w: w[4] } ],
        features: featureNames,
        forecast
      }

      // Charts for forecast & weights
      this.charts.riskForecast = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          xaxis: { type: 'datetime' },
          yaxis: { min: 0, max: 100, labels: { formatter: (v) => v + '%' } },
          dataLabels: { enabled: false },
          stroke: { width: 2 },
          grid: { borderColor: '#444' }
        },
        series: [{ name: 'Predicted risk', data: forecast }]
      }

      this.charts.riskWeights = {
        options: {
          chart: { foreColor: '#e0e0e0', toolbar: { show: false } },
          xaxis: { categories: ['sinDOW','cosDOW','daysSinceLast','rolling7'] },
          dataLabels: { enabled: true, formatter: v => v.toFixed(2) },
          grid: { borderColor: '#444' }
        },
        series: [{ name: 'Weight', data: this.occurrenceModel.weights.map(o => o.w) }]
      }
    },

    runDataQuality () {
      const issues = [...this.dataQuality.issues]
      let missingSev = 0, missingEnd = 0
      for (const e of this.filteredEpisodes) {
        if (e.severity == null) missingSev++
        if (e.end == null) missingEnd++
      }
      if (missingSev) issues.push({ msg: `${missingSev} episode(s) missing severity` })
      if (missingEnd) issues.push({ msg: `${missingEnd} episode(s) missing end time (duration unknown)` })
      this.dataQuality.issues = issues
    },

    // --- Stats helpers ---
    median (arr) { const a = [...arr].sort((x,y)=>x-y); const mid = Math.floor(a.length/2); return a.length%2? a[mid] : (a[mid-1]+a[mid])/2 },
    rank (arr) {
      const pairs = arr.map((v,i)=>({v,i}))
      pairs.sort((a,b)=>a.v-b.v)
      const ranks = Array(arr.length)
      for (let i=0;i<pairs.length;i++) ranks[pairs[i].i] = i+1
      return ranks
    },
    spearman (x, y) {
      if (x.length !== y.length || x.length < 3) return 0
      const rx = this.rank(x)
      const ry = this.rank(y)
      const n = x.length
      let num = 0, dx2 = 0, dy2 = 0
      const mean = (a)=>a.reduce((p,c)=>p+c,0)/a.length
      const mx = mean(rx), my = mean(ry)
      for (let i=0;i<n;i++) {
        num += (rx[i]-mx)*(ry[i]-my)
        dx2 += (rx[i]-mx)*(rx[i]-mx)
        dy2 += (ry[i]-my)*(ry[i]-my)
      }
      const den = Math.sqrt(dx2*dy2)
      return den === 0 ? 0 : num/den
    },

    printHandout () {
      window.print()
    }
  }
}
</script>

<style scoped>
.analytics-page { background: #121212; color: #e0e0e0; }
.bg-dark-panel { background: #1c1c1e; border-radius: 12px; }
.panel-card { background: #1a1a1a; border-radius: 16px; }
.kpi-card { background: #151515; border-radius: 16px; }
.no-print-hide { display: none; }

@media print {
  .analytics-page { background: #ffffff; color: #000; }
  .q-header, .q-footer, .q-drawer, .q-toolbar, .q-file, .q-btn, .q-banner, .q-splitter, .bg-dark-panel, .panel-card { display: none !important; }
  .no-print-hide { display: block; }
  .print-footer { page-break-before: always; }
}
</style>
