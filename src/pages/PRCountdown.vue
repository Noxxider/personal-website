<template>
  <q-page class="q-pa-md ecopr-page">
    <div class="header-row">
      <div>
        <div class="text-h5">Work Days to eCOPR</div>
        <div class="text-caption">
          Today (PST): <strong>{{ todayDateStr }}</strong>
        </div>
      </div>
      <div class="target-date">
        <q-input
          v-model="ecoprInput"
          type="date"
          label="Target eCOPR Date"
          dense
          outlined
          @change="onEcoprChange"
        />
      </div>
    </div>

    <div class="q-mt-md summary-row">
      <q-card flat bordered class="summary-card">
        <q-card-section>
          <div class="text-caption text-grey-7">Work days remaining</div>
          <div class="text-h5">{{ totalWorkDays }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="summary-card">
        <q-card-section>
          <div class="text-caption text-grey-7">In-office days (Tue/Thu)</div>
          <div class="text-h5">{{ totalOfficeDays }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="summary-card">
        <q-card-section>
          <div class="text-caption text-grey-7">Target eCOPR</div>
          <div class="text-body1">
            {{ prettyEcoprDate }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-if="totalWorkDays === 0" class="q-mt-lg text-grey-7">
      No remaining work days between today and the selected eCOPR date.
    </div>

    <div v-else class="q-mt-lg">
      <div class="legend-row q-mb-sm">
        <div class="legend-item">
          <span class="legend-box day-work"></span>
          <span>Work day</span>
        </div>
        <div class="legend-item">
          <span class="legend-box day-office"></span>
          <span>In-office (Tue/Thu)</span>
        </div>
        <div class="legend-item">
          <span class="legend-box day-active-now"></span>
          <span>Right now (6am–4pm PST)</span>
        </div>
      </div>

      <div class="days-grid">
        <div
          v-for="(day, index) in workDays"
          :key="day.date"
          class="day-box"
          :class="{
            'day-office': day.isOffice && !isActiveNow(day.date),
            'day-active-now': isActiveNow(day.date)
          }"
        >
          <div class="day-index">#{{ index + 1 }}</div>
          <div class="day-date">{{ formatDayLabel(day.date) }}</div>
          <div class="day-tag" v-if="day.isOffice && !isActiveNow(day.date)">
            Office
          </div>
          <div class="day-tag" v-else-if="isActiveNow(day.date)">
            Today
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
const ECOPR_STORAGE_KEY = 'ecoprTargetDate';

export default {
  name: 'WorkDaysToEcopr',

  data() {
    return {
      todayDateStr: '', // YYYY-MM-DD in PST
      currentHourPst: null,
      ecoprInput: '', // bound to <input type="date">
      holidays: [
        // Static "stats"/days off. Extend if you want more.
        '2025-12-25', // Christmas Day
        '2025-12-26', // Boxing Day (treated as off for you)
        '2026-01-01', // New Year's Day
        '2026-02-16', // Family Day 2026
        '2026-04-03', // Good Friday 2026
        '2026-04-06'  // Easter Monday 2026 (if your org treats it as off)
      ],
      vacationRanges: [
        // Static PTO schedule from your list
        { start: '2026-01-02', end: '2026-01-02' },
        { start: '2026-02-13', end: '2026-02-13' },
        { start: '2026-02-17', end: '2026-02-17' },
        { start: '2026-03-02', end: '2026-03-02' },
        { start: '2026-03-27', end: '2026-03-27' },
        { start: '2026-03-30', end: '2026-04-02' },
        { start: '2026-04-27', end: '2026-04-28' },
        { start: '2026-05-15', end: '2026-05-15' },
        { start: '2026-05-19', end: '2026-05-19' },
        { start: '2026-06-22', end: '2026-06-26' },
        { start: '2026-06-29', end: '2026-06-30' }
      ],
      timerId: null
    };
  },

  computed: {
    ecoprDateObj() {
      if (!this.ecoprInput) return null;
      return this.parseDate(this.ecoprInput);
    },

    prettyEcoprDate() {
      if (!this.ecoprInput) return 'Not set';
      const d = this.ecoprDateObj;
      if (!d) return 'Invalid date';

      // Render in UTC so our YYYY-MM-DD (stored as UTC) doesn't shift back a day in local time
        return d.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC'
        });
    },

    workDays() {
      if (!this.ecoprInput || !this.todayDateStr) return [];

      const start = this.parseDate(this.todayDateStr);
      const end = this.ecoprDateObj;
      if (!end || end < start) return [];

      const days = [];
      let cursor = new Date(start.getTime());

      while (cursor <= end) {
        const dateStr = this.formatDate(cursor);
        const weekday = cursor.getUTCDay(); // 0 = Sun ... 6 = Sat

        const isWeekend = weekday === 0 || weekday === 6;
        const isHoliday = this.isHoliday(dateStr);
        const isVacation = this.isVacation(dateStr);

        if (!isWeekend && !isHoliday && !isVacation) {
          const isOffice = weekday === 2 || weekday === 4; // Tue / Thu
          days.push({
            date: dateStr,
            isOffice
          });
        }

        cursor = this.addDays(cursor, 1);
      }

      return days;
    },

    totalWorkDays() {
      return this.workDays.length;
    },

    totalOfficeDays() {
      return this.workDays.filter(d => d.isOffice).length;
    },

    isWorkHoursNow() {
      // 6am–4pm PST, inclusive of 6:00, exclusive of 16:00
      if (this.currentHourPst === null) return false;
      return this.currentHourPst >= 6 && this.currentHourPst < 16;
    }
  },

  methods: {
    onEcoprChange() {
      if (!this.ecoprInput) return;
      // Basic sanity: require YYYY-MM-DD
      const isValid = /^\d{4}-\d{2}-\d{2}$/.test(this.ecoprInput);
      if (!isValid) return;

      // Persist
      try {
        window.localStorage.setItem(ECOPR_STORAGE_KEY, this.ecoprInput);
      } catch (e) {
        // ignore storage errors
      }
    },

    updateNowPst() {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Vancouver',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(now);
      const map = {};
      parts.forEach(p => {
        if (p.type !== 'literal') {
          map[p.type] = p.value;
        }
      });

      const y = map.year;
      const m = map.month;
      const d = map.day;
      const h = map.hour;

      this.todayDateStr = `${y}-${m}-${d}`;
      this.currentHourPst = parseInt(h, 10);
    },

    isHoliday(dateStr) {
      return this.holidays.includes(dateStr);
    },

    isVacation(dateStr) {
      const target = this.parseDate(dateStr);
      return this.vacationRanges.some(range => {
        const start = this.parseDate(range.start);
        const end = this.parseDate(range.end);
        return target >= start && target <= end;
      });
    },

    parseDate(str) {
      // str: YYYY-MM-DD
      const [y, m, d] = str.split('-').map(Number);
      // Use UTC so day-of-week is stable regardless of local timezone
      return new Date(Date.UTC(y, m - 1, d));
    },

    formatDate(dateObj) {
      const y = dateObj.getUTCFullYear();
      const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    addDays(dateObj, n) {
      const d = new Date(dateObj.getTime());
      d.setUTCDate(d.getUTCDate() + n);
      return d;
    },

    formatDayLabel(dateStr) {
      const d = this.parseDate(dateStr);
      return d.toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
          timeZone: 'UTC'
      });
    },

    isActiveNow(dateStr) {
      if (!this.isWorkHoursNow) return false;
      return dateStr === this.todayDateStr;
    }
  },

  mounted() {
    // Init eCOPR date from storage or default (2026-03-31)
    let stored = null;
    try {
      stored = window.localStorage.getItem(ECOPR_STORAGE_KEY);
    } catch (e) {
      stored = null;
    }

    if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) {
      this.ecoprInput = stored;
    } else {
      this.ecoprInput = '2026-03-31';
    }

    this.updateNowPst();
    // Refresh every minute so "today" and work-hours highlighting stay accurate
    this.timerId = window.setInterval(this.updateNowPst, 60 * 1000);
  },

  beforeUnmount() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  }
};
</script>

<style scoped>
.ecopr-page {
  max-width: 900px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.target-date {
  min-width: 220px;
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-card {
  flex: 1 1 160px;
}

.legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
}

.legend-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid #ccc;
}

/* Base day styles */
.days-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
}

.day-box {
  background: #f2f2f2;
  border-radius: 6px;
  padding: 8px;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid #e0e0e0;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.1s ease;
}

.day-box:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.day-index {
  font-weight: 600;
  color: #555;
}

.day-date {
  color: #777;
}

.day-tag {
  margin-top: 2px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Office days (blue) */
.day-office,
.legend-box.day-office {
  background: #e3f2fd;
  border-color: #90caf9;
}

/* Active "right now" day (green) */
.day-active-now,
.legend-box.day-active-now {
  background: #e8f5e9 !important;
  border-color: #81c784 !important;
}

/* Base "work day" legend color */
.legend-box.day-work {
  background: #f2f2f2;
  border-color: #e0e0e0;
}
</style>
