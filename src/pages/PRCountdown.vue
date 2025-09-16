<template>
  <q-page class="q-pa-md">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">PR Countdown</div>
        <div class="text-caption text-grey-6">Hidden route: <code>/pr</code></div>
      </div>

      <!-- Controls -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select v-model="selectedMilestone" :options="milestoneOptions" label="Target milestone" dense emit-value
              map-options filled />
          </div>

          <div class="col-12 col-md-8">
            <div class="row items-center">
              <div class="col-grow q-pr-md">
                <q-slider v-model="monthsAheadMap[selectedMilestone]" :min="0" :max="24" :step="0.5" label label-always
                  :disable="!!actualDateForSelected" dense />
              </div>
              <div class="col-auto text-caption">
                <div class="text-bold">Months from today</div>
                <div class="text-grey-7">Defaults: AOR 1, P1 4, P2 6, eCOPR 8</div>
              </div>
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Each milestone remembers its own slider (persisted to localStorage).
            </div>
            <div v-if="actualDateForSelected" class="text-caption text-info q-mt-xs">
              Using actual {{ selectedMilestone }} date: <b>{{ fmtDate(actualDateForSelected) }}</b>.
              Slider &amp; custom date are ignored.
            </div>
          </div>

          <div class="col-12">
            <q-toggle v-model="useCustomDate" label="Use custom calendar date instead of slider" />
          </div>

          <div class="col-12 col-md-6" v-if="useCustomDate">
            <q-input v-model="customDateStr" type="date" label="Custom target date" dense filled />
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model.number="hourlyRate" type="number" step="0.01" min="0" label="Hourly rate (CAD)" dense
              filled />
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model.number="hoursPerDay" type="number" step="0.25" min="0" max="12" label="Hours per workday"
              dense filled />
          </div>

          <div class="col-12 col-md-6">
            <q-toggle v-model="subtractVacation" :label="`Subtract paid vacation days (${vacationDays} days)`" />
            <q-input v-model.number="vacationDays" type="number" min="0" max="60" step="1" dense filled class="q-mt-sm"
              label="Paid vacation days to subtract" />
          </div>

          <div class="col-12 col-md-6">
            <q-toggle v-model="includeToday" label="Include today as a workday if eligible" />
          </div>

          <!-- Custom holiday add/remove -->
          <div class="col-12">
            <div class="text-subtitle2 q-mb-xs">Custom holidays (added to stat-holiday set)</div>
            <div class="row items-center q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input v-model="customHolidayDateInput" type="date" label="Add AAAA-MM-DD" dense filled />
              </div>
              <div class="col-auto">
                <q-btn dense outline label="Add" @click="addCustomHoliday" />
              </div>
              <div class="col-12">
                <div class="row items-center wrap">
                  <q-chip v-for="d in customHolidays" :key="d" removable @remove="removeCustomHoliday(d)"
                    class="q-mr-xs q-mb-xs" color="grey-3" text-color="black">
                    {{ d }}
                  </q-chip>
                  <div v-if="!customHolidays.length" class="text-caption text-grey-6">
                    No custom holidays. (Example: personal days, org-specific closures)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Milestone dates (optional) -->
          <div class="col-12">
            <div class="text-subtitle2 q-mb-xs">Milestone dates (optional)</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="milestoneActuals.AOR" type="date" label="AOR date" dense filled />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="milestoneActuals.P1" type="date" label="P1 date" dense filled />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="milestoneActuals.P2" type="date" label="P2 date" dense filled />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="milestoneActuals.eCOPR" type="date" label="eCOPR date" dense filled />
              </div>
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">If set, markers appear on the sparkline.</div>
          </div>


          <div class="col-12">
            <q-banner class="bg-grey-2">
              <div class="text-caption">
                Province assumed: <b>British Columbia (IH)</b>. Working days exclude weekends and **stat holidays
                including Boxing Day**.
                Weekend holidays are observed on Monday. This is a personal estimate tool — not official.
              </div>
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Target & Progress -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-xs">
                Target: <b>{{ selectedMilestone }}</b>
              </div>
              <div class="text-body2">
                Submission date: <b>{{ fmtDate(submissionDate) }}</b><br>
                Target date: <b>{{ fmtDate(targetDate) }}</b><br>
                Today: <b>{{ fmtDate(today) }}</b>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs">Timeline progress</div>
              <q-linear-progress :value="progressFraction" color="primary" size="lg" rounded />
              <div class="row justify-between text-caption q-mt-xs">
                <div>{{ (progressFraction * 100).toFixed(1) }}% done</div>
                <div>ETA: {{ fmtDate(targetDate) }}</div>
              </div>

              <!-- Sparkline -->
              <div class="q-mt-sm">
                <div class="text-caption text-grey-7 q-mb-xs">Progress sparkline</div>
                <div style="width: 100%; height: 44px;">
                  <svg :viewBox="`0 0 ${sparkWidth} ${sparkHeight}`" preserveAspectRatio="none"
                    style="width:100%; height:100%;">
                    <polyline :points="sparkPoints" fill="none" stroke="currentColor" stroke-width="2" />
                    <!-- Milestone markers -->
                    <g v-for="m in sparkMarkers" :key="m.key">
                      <line :x1="m.x" :x2="m.x" y1="0" :y2="sparkHeight" stroke="currentColor" stroke-width="1"
                        stroke-dasharray="3,3" />
                      <circle :cx="m.x" :cy="m.y" r="2" fill="currentColor" />
                    </g>
                  </svg>
                </div>
                <div class="text-caption text-grey-6">
                  {{ daysSinceSubmission }} days since submission.
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Core Stats -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">Time Remaining</div>
              <div class="row">
                <div class="col-6 text-caption text-grey-7">Calendar days</div>
                <div class="col-6 text-right text-body1"><b>{{ Math.max(0, daysLeft) }}</b></div>

                <div class="col-6 text-caption text-grey-7 q-mt-xs">Weeks (≈)</div>
                <div class="col-6 text-right text-body1 q-mt-xs"><b>{{ weeksLeftApprox }}</b></div>

                <div class="col-6 text-caption text-grey-7 q-mt-xs">Months (≈)</div>
                <div class="col-6 text-right text-body1 q-mt-xs"><b>{{ monthsLeftApprox }}</b></div>
              </div>
              <q-separator spaced />
              <div class="row">
                <div class="col-6 text-caption text-grey-7">Stat holidays in window</div>
                <div class="col-6 text-right text-body1"><b>{{ holidaysInRange }}</b></div>

                <div class="col-6 text-caption text-grey-7 q-mt-xs">Weekend days left</div>
                <div class="col-6 text-right text-body1 q-mt-xs"><b>{{ weekendDaysLeft }}</b></div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">Work & Money</div>

              <div class="row">
                <div class="col-6 text-caption text-grey-7">Working days left</div>
                <div class="col-6 text-right text-body1"><b>{{ workingDaysLeft }}</b></div>

                <div class="col-6 text-caption text-grey-7 q-mt-xs">Hours left ({{ hoursPerDay }} h/day)</div>
                <div class="col-6 text-right text-body1 q-mt-xs"><b>{{ workHoursLeft.toLocaleString() }}</b></div>

                <div class="col-6 text-caption text-grey-7 q-mt-xs">Money @ {{ moneyFmt(hourlyRate) }}/h</div>
                <div class="col-6 text-right text-body1 q-mt-xs">
                  <b>{{ moneyFmt(moneyLeft) }}</b>
                </div>
              </div>

              <q-separator spaced />

              <div class="row">
                <div class="col-6 text-caption text-grey-7">Biweekly pay periods left (≈)</div>
                <div class="col-6 text-right text-body1"><b>{{ biweeklyPeriodsLeft }}</b></div>

                <div class="col-6 text-caption text-grey-7 q-mt-xs">Fridays left</div>
                <div class="col-6 text-right text-body1 q-mt-xs"><b>{{ fridaysLeft }}</b></div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Scenario compare -->
      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Scenario Compare ({{ selectedMilestone }})</div>

          <q-tabs v-model="activeScenarioKey" dense active-color="primary" indicator-color="primary" align="left"
            narrow-indicator>
            <q-tab v-for="s in scenarioItems" :key="s.key" :name="s.key" :label="s.label" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeScenarioKey" animated>
            <q-tab-panel v-for="s in scenarioItems" :key="s.key" :name="s.key" class="q-pa-sm">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <div class="text-caption text-grey-7">Target</div>
                  <div class="text-body1"><b>{{ fmtDate(s.metrics.targetDate) }}</b></div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">Days left</div>
                  <div class="text-body1"><b>{{ s.metrics.daysLeft }}</b></div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">Work days</div>
                  <div class="text-body1"><b>{{ s.metrics.workingDays }}</b></div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="text-caption text-grey-7">Money</div>
                  <div class="text-body1"><b>{{ moneyFmt(s.metrics.money) }}</b></div>
                </div>
              </div>
              <div class="q-mt-sm">
                <q-linear-progress :value="s.metrics.progress" color="primary" size="sm" rounded />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <!-- Notes -->
      <div class="text-caption text-grey-7 q-mt-md">
        * Working days exclude weekends and BC stat holidays (incl. Boxing Day); weekend holidays observed Monday.
        Counts are whole-day granularity. Settings persist locally.
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PRCountdown',
  data() {
    return {
      // Persisted settings
      selectedMilestone: 'eCOPR',
      monthsAheadMap: {
        AOR: 1,
        P1: 4,
        P2: 6,
        eCOPR: 8,  // default requested: 8 months from today
      },
      useCustomDate: false,
      customDateStr: '',

      hourlyRate: 37.23,
      hoursPerDay: 7.5,
      subtractVacation: false,
      vacationDays: 20,
      includeToday: false,

      // Custom holidays (user-added, YYYY-MM-DD)
      customHolidays: [],
      customHolidayDateInput: '',

      submissionDateStr: '2025-04-05', // Apr 5, 2025
      province: 'BC', // fixed

      // Optional actual milestone dates (YYYY-MM-DD)
      milestoneActuals: {
        AOR: '', P1: '', P2: '', eCOPR: ''
      },

      // Scenario UI
      activeScenarioKey: 'base',

      // Sparkline
      sparkWidth: 200,
      sparkHeight: 40
    };
  },
  computed: {
    milestoneOptions() {
      return [
        { label: 'AOR', value: 'AOR' },
        { label: 'P1', value: 'P1' },
        { label: 'P2', value: 'P2' },
        { label: 'eCOPR', value: 'eCOPR' },
      ];
    },
    today() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
    submissionDate() {
      const [y, m, d] = this.submissionDateStr.split('-').map(n => parseInt(n, 10));
      return new Date(y, m - 1, d);
    },
    // If an actual date is set for the selected milestone, prefer it
    actualDateForSelected() {
      const s = this.milestoneActuals?.[this.selectedMilestone];
      return this.parseYmd(s);
    },
    targetDate() {
      if (this.actualDateForSelected) {
        return this.actualDateForSelected;
      } else if (this.useCustomDate && this.customDateStr) {
        const [y, m, d] = this.customDateStr.split('-').map(n => parseInt(n, 10));
        return new Date(y, m - 1, d);
      } else {
        const months = Number(this.monthsAheadMap[this.selectedMilestone] || 0);
        return this.addMonths(this.today, months);
      }
    },

    // Deltas (base)
    daysLeft() {
      const deltaMs = this.targetDate - this.today;
      if (deltaMs <= 0) return 0;
      return Math.ceil(deltaMs / 86400000);
    },
    weeksLeftApprox() {
      return (this.daysLeft / 7).toFixed(2);
    },
    monthsLeftApprox() {
      return (this.daysLeft / 30.4375).toFixed(2);
    },

    // Holiday set for range (base)
    holidayKeysInRange() {
      const ys = this.today.getFullYear();
      const ye = this.targetDate.getFullYear();
      const set = new Set();
      for (let y = ys; y <= ye; y++) {
        const dates = this.bcStatHolidaysObserved(y);
        for (const dt of dates) set.add(this.key(dt));
      }
      // add custom holidays
      for (const d of this.customHolidays) set.add(d);
      return set;
    },

    // Workdays and related (base)
    workingDaysRaw() {
      return this.countBusinessDays(this.today, this.targetDate, this.holidayKeysInRange, this.includeToday);
    },
    workingDaysLeft() {
      const raw = this.workingDaysRaw;
      if (!this.subtractVacation) return raw;
      return Math.max(0, raw - Number(this.vacationDays || 0));
    },
    workHoursLeft() {
      return Math.max(0, Math.round(this.workingDaysLeft * Number(this.hoursPerDay || 0) * 100) / 100);
    },
    // Money should be based on paid hours (vacation is paid), so do NOT subtract vacation days.
    // Paid hours = workingDaysRaw * hoursPerDay
    moneyLeft() {
      const paidHours = Math.max(0, Math.round(this.workingDaysRaw * Number(this.hoursPerDay || 0) * 100) / 100);
      const n = paidHours * Number(this.hourlyRate || 0);
      return Math.max(0, Math.round(n * 100) / 100);
    },

    // Other stats
    holidaysInRange() {
      return this.countHolidaysInRange(this.today, this.targetDate, this.holidayKeysInRange, this.includeToday);
    },
    weekendDaysLeft() {
      return this.countWeekendDays(this.today, this.targetDate, this.includeToday);
    },
    fridaysLeft() {
      return this.countSpecificWeekday(this.today, this.targetDate, 5, this.includeToday);
    },
    biweeklyPeriodsLeft() {
      return Math.max(0, Math.ceil(this.daysLeft / 14));
    },
    progressFraction() {
      const start = this.submissionDate.getTime();
      const end = this.targetDate.getTime();
      const now = this.today.getTime();
      if (end <= start) return 1;
      const v = (now - start) / (end - start);
      return Math.max(0, Math.min(1, v));
    },
    daysSinceSubmission() {
      const delta = this.today - this.submissionDate;
      return delta > 0 ? Math.floor(delta / 86400000) : 0;
    },

    // Sparkline
    sparkPoints() {
      const series = this.progressSeries(this.submissionDate, this.targetDate, this.today);
      if (!series.length) return '';
      const w = this.sparkWidth;
      const h = this.sparkHeight;
      const n = series.length - 1;
      return series.map((p, i) => {
        const x = n === 0 ? 0 : (i / n) * w;
        const y = (1 - p.f) * h; // 0 at bottom -> 0 progress; invert for SVG
        return `${x},${y}`;
      }).join(' ');
    },

    // Scenario compare items
    scenarioItems() {
      const baseMonths = Number(this.monthsAheadMap[this.selectedMilestone] || 0);
      let monthsList;
      if (this.selectedMilestone === 'eCOPR') {
        monthsList = [6, 8, 10];
      } else {
        monthsList = [Math.max(0, baseMonths - 1), baseMonths, baseMonths + 1];
      }
      const items = monthsList.map(m => {
        const key = m === baseMonths ? 'base' : `${m}m`;
        const metrics = this.metricsForMonths(m);
        return {
          key,
          label: m === baseMonths ? `${m} mo (current)` : `${m} mo`,
          metrics
        };
      });
      // ensure active key exists
      if (!items.find(i => i.key === this.activeScenarioKey)) {
        this.activeScenarioKey = items[0]?.key || 'base';
      }
      return items;
    },
    sparkPoints() {
      const series = this.progressSeries(this.submissionDate, this.targetDate, this.today);
      if (!series.length) return '';
      const w = this.sparkWidth;
      const h = this.sparkHeight;
      const n = series.length - 1;
      return series.map((p, i) => {
        const x = n === 0 ? 0 : (i / n) * w;
        const y = (1 - p.f) * h;
        return `${x},${y}`;
      }).join(' ');
    },
    sparkMarkers() {
      const start = this.submissionDate.getTime();
      const end = this.targetDate.getTime();
      if (end <= start) return [];
      const now = this.today.getTime();
      const range = end - start;
      const w = this.sparkWidth;
      const h = this.sparkHeight;
      const labels = ['AOR', 'P1', 'P2', 'eCOPR'];
      const out = [];
      for (const lbl of labels) {
        const d = this.parseYmd(this.milestoneActuals[lbl]);
        if (!d) continue;
        const t = d.getTime();
        if (t < start || t > end) continue; // only draw if within domain
        const f = Math.max(0, Math.min(1, (Math.min(now, t) - start) / range));
        out.push({ key: `${lbl}-${this.milestoneActuals[lbl]}`, x: (t - start) / range * w, y: (1 - f) * h, label: lbl });
      }
      return out;
    }
  },
  watch: {
    // persist settings
    selectedMilestone() { this.persist(); },
    monthsAheadMap: {
      deep: true,
      handler() { this.persist(); }
    },
    useCustomDate() { this.persist(); },
    customDateStr() { this.persist(); },
    hourlyRate() { this.persist(); },
    hoursPerDay() { this.persist(); },
    subtractVacation() { this.persist(); },
    vacationDays() { this.persist(); },
    includeToday() { this.persist(); },
    customHolidays: {
      deep: true,
      handler() { this.persist(); }
    },
    milestoneActuals: {
      deep: true,
      handler() { this.persist(); }
    }
  },
  created() {
    // load persisted settings
    try {
      const raw = localStorage.getItem('prCountdownSettings');
      if (raw) {
        const obj = JSON.parse(raw);
        Object.assign(this.$data, obj, {
          monthsAheadMap: { ...this.monthsAheadMap, ...(obj.monthsAheadMap || {}) },
          milestoneActuals: {
            ...this.milestoneActuals,
            ...(obj.milestoneActuals || {})
          }
        });
      }
    } catch (e) {
      // ignore
    }
  },
  methods: {
    // ---------- Persistence ----------
    persist() {
      try {
        const payload = {
          selectedMilestone: this.selectedMilestone,
          monthsAheadMap: this.monthsAheadMap,
          useCustomDate: this.useCustomDate,
          customDateStr: this.customDateStr,
          hourlyRate: this.hourlyRate,
          hoursPerDay: this.hoursPerDay,
          subtractVacation: this.subtractVacation,
          vacationDays: this.vacationDays,
          includeToday: this.includeToday,
          customHolidays: this.customHolidays,
          submissionDateStr: this.submissionDateStr,
          province: this.province,
          milestoneActuals: this.milestoneActuals,
        };
        localStorage.setItem('prCountdownSettings', JSON.stringify(payload));
      } catch (e) {
        // ignore storage failures
      }
    },

    // ---------- Formatting ----------
    fmtDate(d) {
      try {
        return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
      } catch {
        return d?.toISOString?.().slice(0, 10) || '';
      }
    },
    moneyFmt(n) {
      try {
        return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 }).format(n);
      } catch {
        return `CAD ${Number(n || 0).toFixed(2)}`;
      }
    },

    // ---------- Date utils ----------
    addMonths(base, months) {
      // safe-ish month addition with fractional months
      const b = new Date(base.getFullYear(), base.getMonth(), base.getDate());
      const y = b.getFullYear();
      const m = b.getMonth() + Math.trunc(months);
      const frac = months - Math.trunc(months);
      const d = new Date(y, m, b.getDate());
      if (frac !== 0) {
        const daysToAdd = Math.round(frac * 30.4375);
        d.setDate(d.getDate() + daysToAdd);
      }
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    },
    key(d) {
      const y = d.getFullYear();
      const m = `${d.getMonth() + 1}`.padStart(2, '0');
      const dd = `${d.getDate()}`.padStart(2, '0');
      return `${y}-${m}-${dd}`;
    },
    isWeekend(d) {
      const day = d.getDay();
      return day === 0 || day === 6;
    },

    countBusinessDays(startInclusive, endInclusive, holidaySet, includeStart) {
      if (endInclusive <= startInclusive) return 0;
      const start = new Date(startInclusive.getFullYear(), startInclusive.getMonth(), startInclusive.getDate());
      const end = new Date(endInclusive.getFullYear(), endInclusive.getMonth(), endInclusive.getDate());
      let d = new Date(start);
      if (!includeStart) d.setDate(d.getDate() + 1);
      let count = 0;
      while (d <= end) {
        const weekday = !this.isWeekend(d);
        const notHoliday = !holidaySet.has(this.key(d));
        if (weekday && notHoliday) count++;
        d.setDate(d.getDate() + 1);
      }
      return count;
    },
    countWeekendDays(startInclusive, endInclusive, includeStart) {
      if (endInclusive <= startInclusive) return 0;
      const start = new Date(startInclusive.getFullYear(), startInclusive.getMonth(), startInclusive.getDate());
      const end = new Date(endInclusive.getFullYear(), endInclusive.getMonth(), endInclusive.getDate());
      let d = new Date(start);
      if (!includeStart) d.setDate(d.getDate() + 1);
      let count = 0;
      while (d <= end) {
        if (this.isWeekend(d)) count++;
        d.setDate(d.getDate() + 1);
      }
      return count;
    },
    countSpecificWeekday(startInclusive, endInclusive, weekday /* 0=Sun..6=Sat */, includeStart) {
      if (endInclusive <= startInclusive) return 0;
      const start = new Date(startInclusive.getFullYear(), startInclusive.getMonth(), startInclusive.getDate());
      const end = new Date(endInclusive.getFullYear(), endInclusive.getMonth(), endInclusive.getDate());
      let d = new Date(start);
      if (!includeStart) d.setDate(d.getDate() + 1);
      let count = 0;
      while (d <= end) {
        if (d.getDay() === weekday) count++;
        d.setDate(d.getDate() + 1);
      }
      return count;
    },
    countHolidaysInRange(startInclusive, endInclusive, holidaySet, includeStart) {
      if (endInclusive <= startInclusive) return 0;
      const start = new Date(startInclusive.getFullYear(), startInclusive.getMonth(), startInclusive.getDate());
      const end = new Date(endInclusive.getFullYear(), endInclusive.getMonth(), endInclusive.getDate());
      let d = new Date(start);
      if (!includeStart) d.setDate(d.getDate() + 1);
      let count = 0;
      while (d <= end) {
        if (holidaySet.has(this.key(d))) count++;
        d.setDate(d.getDate() + 1);
      }
      return count;
    },

    // ---------- BC Holidays (Observed) ----------
    // Returns observed holiday dates for BC in a given year (IH policy: includes Boxing Day).
    bcStatHolidaysObserved(year) {
      const dates = [];

      const observeMonIfWeekend = (dateObj) => {
        const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const day = d.getDay();
        if (day === 0) d.setDate(d.getDate() + 1);        // Sunday -> Monday
        else if (day === 6) d.setDate(d.getDate() + 2);   // Saturday -> Monday
        return d;
      };

      // New Year's Day – Jan 1
      dates.push(observeMonIfWeekend(new Date(year, 0, 1)));
      // Family Day (BC) – 3rd Monday in Feb
      dates.push(this.nthWeekdayOfMonth(year, 1, 1, 3));
      // Good Friday – Friday before Easter Sunday
      const easter = this.easterSunday(year);
      dates.push(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2));
      // Victoria Day – Monday before May 25
      dates.push(this.mondayOnOrBefore(new Date(year, 4, 24)));
      // Canada Day – July 1 (observe Monday if weekend)
      dates.push(observeMonIfWeekend(new Date(year, 6, 1)));
      // BC Day – First Monday in August
      dates.push(this.nthWeekdayOfMonth(year, 7, 1, 1));
      // Labour Day – First Monday in September
      dates.push(this.nthWeekdayOfMonth(year, 8, 1, 1));
      // National Day for Truth and Reconciliation – Sep 30 (observe if weekend)
      dates.push(observeMonIfWeekend(new Date(year, 8, 30)));
      // Thanksgiving – Second Monday in October
      dates.push(this.nthWeekdayOfMonth(year, 9, 1, 2));
      // Remembrance Day – Nov 11 (observe if weekend)
      dates.push(observeMonIfWeekend(new Date(year, 10, 11)));
      // Christmas Day – Dec 25 (observe if weekend)
      dates.push(observeMonIfWeekend(new Date(year, 11, 25)));
      // Boxing Day – Dec 26 (IH treats as stat; observe if weekend)
      dates.push(observeMonIfWeekend(new Date(year, 11, 26)));

      // Deduplicate
      const map = new Map();
      for (const d of dates) map.set(this.key(d), d);
      // return in ascending order (cosmetic)
      return Array.from(map.values()).sort((a, b) => a - b);
    },
    nthWeekdayOfMonth(year, month, weekday, n) {
      const d = new Date(year, month, 1);
      while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
      d.setDate(d.getDate() + 7 * (n - 1));
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    },
    mondayOnOrBefore(dateObj) {
      const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      while (d.getDay() !== 1) d.setDate(d.getDate() - 1);
      return d;
    },
    // Meeus/Jones/Butcher algorithm
    easterSunday(Y) {
      const a = Y % 19;
      const b = Math.floor(Y / 100);
      const c = Y % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31);
      const day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(Y, month - 1, day);
    },

    // ---------- Sparkline helpers ----------
    progressSeries(start, end, now) {
      const res = [];
      if (end <= start) return res;
      const totalDays = Math.max(1, Math.floor((end - start) / 86400000));
      const step = totalDays > 120 ? 7 : 1; // weekly when long
      for (let i = 0; i <= totalDays; i += step) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const f = Math.max(0, Math.min(1, (Math.min(now, d) - start) / (end - start)));
        res.push({ d, f });
      }
      // ensure last point at end
      if (res[res.length - 1]?.d < end) {
        res.push({ d: end, f: Math.max(0, Math.min(1, (Math.min(now, end) - start) / (end - start))) });
      }
      return res;
    },

    parseYmd(s) {
      if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
      const [y, m, d] = s.split('-').map(n => parseInt(n, 10));
      return new Date(y, m - 1, d);
    },

    // ---------- Scenario helpers ----------
    metricsForMonths(months) {
      const tgt = this.addMonths(this.today, months);
      const hs = (() => {
        const set = new Set();
        for (let y = this.today.getFullYear(); y <= tgt.getFullYear(); y++) {
          const dates = this.bcStatHolidaysObserved(y);
          for (const dt of dates) set.add(this.key(dt));
        }
        for (const d of this.customHolidays) set.add(d);
        return set;
      })();

      const daysLeft = Math.max(0, Math.ceil((tgt - this.today) / 86400000));
      const workingDays = this.countBusinessDays(this.today, tgt, hs, this.includeToday);
      const adjWorking = this.subtractVacation ? Math.max(0, workingDays - Number(this.vacationDays || 0)) : workingDays;
      const hours = adjWorking * Number(this.hoursPerDay || 0);
      const money = Math.max(0, Math.round(hours * Number(this.hourlyRate || 0) * 100) / 100);

      let progress = 1;
      const start = this.submissionDate.getTime();
      const end = tgt.getTime();
      if (end > start) progress = Math.max(0, Math.min(1, (this.today.getTime() - start) / (end - start)));

      return { targetDate: tgt, daysLeft, workingDays: adjWorking, money, progress };
    },

    // ---------- Custom holidays UI ----------
    addCustomHoliday() {
      const v = (this.customHolidayDateInput || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
      if (!this.customHolidays.includes(v)) this.customHolidays.push(v);
      this.customHolidayDateInput = '';
    },
    removeCustomHoliday(d) {
      this.customHolidays = this.customHolidays.filter(x => x !== d);
    }
  }
};
</script>

<style scoped>
.text-bold {
  font-weight: 600;
}
</style>
