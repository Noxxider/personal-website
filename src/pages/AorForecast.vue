<template>
    <q-page class="q-pa-md aor-page">
        <div class="header-row">
            <div>
                <div class="text-h5">AOR & eCOPR Forecast</div>
                <div class="text-caption">
                    Today (PST): <strong>{{ todayDateStr || '—' }}</strong>
                </div>
                <div class="text-caption text-grey-7">
                    PR file date (BC PNP Non-EE): <strong>{{ prFileDateStr }}</strong>
                </div>
            </div>

            <div class="target-date">
                <q-input v-model.number="daysToEcoprAfterAor" type="number" label="Days from AOR → eCOPR" dense outlined
                    min="0" />
            </div>
        </div>

        <!-- Summary cards -->
        <div class="q-mt-md summary-row">
            <q-card flat bordered class="summary-card">
                <q-card-section>
                    <div class="text-caption text-grey-7">Processing speed</div>
                    <div class="text-body1" v-if="aorSpeed">
                        {{ aorSpeed.toFixed(2) }} AOR days / calendar day
                    </div>
                    <div class="text-caption text-grey-7" v-else>
                        Add two observations to compute speed.
                    </div>
                </q-card-section>
            </q-card>

            <q-card flat bordered class="summary-card">
                <q-card-section>
                    <div class="text-caption text-grey-7">IRL days to AOR (approx)</div>
                    <div class="text-h5" v-if="daysToAorReal !== null">
                        {{ daysToAorReal }}
                    </div>
                    <div class="text-caption text-grey-7" v-else>
                        —
                    </div>
                    <div class="text-caption text-grey-6" v-if="daysToAorReal !== null && daysToAorReal === 0">
                        Model thinks you should already be at or past AOR.
                    </div>
                </q-card-section>
            </q-card>

            <q-card flat bordered class="summary-card">
                <q-card-section>
                    <div class="text-caption text-grey-7">Work days to AOR</div>
                    <div class="text-h5">
                        {{ workDaysToAor !== null ? workDaysToAor : '—' }}
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                        Office days (Tue/Thu): {{ officeDaysToAor !== null ? officeDaysToAor : '—' }}
                    </div>
                </q-card-section>
            </q-card>

            <q-card flat bordered class="summary-card">
                <q-card-section>
                    <div class="text-caption text-grey-7">Predicted AOR</div>
                    <div class="text-body1">
                        {{ prettyPredictedAor }}
                    </div>
                    <div class="text-caption text-grey-7 q-mt-sm">Predicted eCOPR</div>
                    <div class="text-body1">
                        {{ prettyPredictedEcopr }}
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <!-- Input cards -->
        <div class="q-mt-lg inputs-grid">
            <q-card flat bordered>
                <q-card-section>
                    <div class="text-subtitle2 q-mb-sm">Observation 1</div>
                    <div class="text-caption text-grey-7 q-mb-sm">
                        Example: “On this date, people with AOR up to X were getting AOR.”
                    </div>

                    <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                            <q-input v-model="processedAorDate1" type="date" label="Processed up to AOR date" dense
                                outlined />
                        </div>
                        <div class="col-12 col-sm-6">
                            <q-input v-model="obsDate1" type="date" label="Observation date" dense outlined />
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <q-card flat bordered>
                <q-card-section>
                    <div class="text-subtitle2 q-mb-sm">Observation 2</div>
                    <div class="text-caption text-grey-7 q-mb-sm">
                        Second data point for rate calculation. Ideally this is the most recent one (often “today”).
                    </div>

                    <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                            <q-input v-model="processedAorDate2" type="date" label="Processed up to AOR date" dense
                                outlined />
                        </div>
                        <div class="col-12 col-sm-6">
                            <q-input v-model="obsDate2" type="date" label="Observation date" dense outlined />
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <!-- Detailed stats -->
        <div class="q-mt-lg">
            <q-card flat bordered>
                <q-card-section>
                    <div class="text-subtitle2 q-mb-sm">Details</div>

                    <div v-if="!aorSpeed" class="text-caption text-grey-7">
                        Fill all four dates above to see detailed calculations.
                    </div>

                    <div v-else class="text-body2">
                        <p class="q-mb-xs">
                            Between Observation 1 ({{ obsDate1 || '—' }}) and Observation 2 ({{ obsDate2 || '—' }}),
                            IRCC moved from AOR {{ processedAorDate1 || '—' }} to {{ processedAorDate2 || '—' }}.
                        </p>
                        <p class="q-mb-xs">
                            That’s <strong>{{ deltaAorDays }}</strong> AOR days advanced over
                            <strong>{{ deltaObsDays }}</strong> calendar days
                            ⇒ <strong>{{ aorSpeed.toFixed(2) }}</strong> AOR days per real day.
                        </p>
                        <p class="q-mb-xs">
                            Your PR application date is <strong>{{ prFileDateStr }}</strong>.
                        </p>
                        <p class="q-mb-xs" v-if="backlogAorDaysToday !== null">
                            Estimated AOR days still ahead of you (today): <strong>{{ backlogAorDaysToday }}</strong>.
                        </p>
                        <p class="q-mb-xs" v-if="daysToAorReal !== null">
                            On this model, that translates to roughly
                            <strong>{{ daysToAorReal }}</strong> calendar days from today until AOR.
                        </p>
                        <p class="q-mb-xs" v-if="predictedAorDateStr">
                            Predicted AOR date: <strong>{{ prettyPredictedAor }}</strong>.
                        </p>
                        <p class="q-mb-xs" v-if="predictedEcoprDateStr && daysToEcoprAfterAorNumber > 0">
                            With <strong>{{ daysToEcoprAfterAorNumber }}</strong> days from AOR to eCOPR,
                            predicted eCOPR: <strong>{{ prettyPredictedEcopr }}</strong>.
                        </p>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script>
const STORAGE_KEYS = {
    aor1: 'aorCalc_processedAor1',
    aor2: 'aorCalc_processedAor2',
    obs1: 'aorCalc_obsDate1',
    obs2: 'aorCalc_obsDate2',
    ecoprOffset: 'aorCalc_daysToEcoprOffset'
};

export default {
    name: 'AorForecast',

    data() {
        return {
            todayDateStr: '',
            processedAorDate1: '',
            processedAorDate2: '',
            obsDate1: '',
            obsDate2: '',
            daysToEcoprAfterAor: 83, // default guess
            holidays: [
                '2025-12-25', // Christmas Day
                '2025-12-26', // Boxing Day
                '2026-01-01', // New Year's Day
                '2026-02-16', // Family Day
                '2026-04-03', // Good Friday
                '2026-04-06'  // Easter Monday (if treated as off)
            ],
            vacationRanges: [
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
        prFileDateStr() {
            return '2025-04-05';
        },

        daysToEcoprAfterAorNumber() {
            const n = parseInt(this.daysToEcoprAfterAor, 10);
            return Number.isFinite(n) && n > 0 ? n : 0;
        },

        haveAllObservationDates() {
            return (
                this.processedAorDate1 &&
                this.processedAorDate2 &&
                this.obsDate1 &&
                this.obsDate2
            );
        },

        deltaObsDays() {
            if (!this.haveAllObservationDates) return null;
            const d1 = this.dateToDayNumber(this.obsDate1);
            const d2 = this.dateToDayNumber(this.obsDate2);
            const diff = d2 - d1;
            return diff > 0 ? diff : null;
        },

        deltaAorDays() {
            if (!this.haveAllObservationDates) return null;
            const a1 = this.dateToDayNumber(this.processedAorDate1);
            const a2 = this.dateToDayNumber(this.processedAorDate2);
            const diff = a2 - a1;
            return diff > 0 ? diff : null;
        },

        aorSpeed() {
            if (this.deltaObsDays === null || this.deltaAorDays === null) return null;
            const speed = this.deltaAorDays / this.deltaObsDays;
            return speed > 0 ? speed : null;
        },

        myAorDayNumber() {
            return this.dateToDayNumber(this.prFileDateStr);
        },

        todayDayNumber() {
            if (!this.todayDateStr) return null;
            return this.dateToDayNumber(this.todayDateStr);
        },

        backlogAorDaysToday() {
            if (!this.aorSpeed || !this.haveAllObservationDates || this.todayDayNumber === null) {
                return null;
            }

            const a2 = this.dateToDayNumber(this.processedAorDate2);
            const obs2 = this.dateToDayNumber(this.obsDate2);

            const backlogAtObs2 = this.myAorDayNumber - a2;

            if (backlogAtObs2 <= 0) {
                return 0;
            }

            const daysSinceObs2 = Math.max(0, this.todayDayNumber - obs2);
            const processedAdvanceSinceObs2 = daysSinceObs2 * this.aorSpeed;
            const backlogToday = Math.round(backlogAtObs2 - processedAdvanceSinceObs2);

            return backlogToday <= 0 ? 0 : backlogToday;
        },

        daysToAorReal() {
            if (!this.aorSpeed || this.todayDayNumber === null || this.backlogAorDaysToday === null) {
                return null;
            }

            if (this.backlogAorDaysToday <= 0) {
                return 0;
            }

            const calendarDays = this.backlogAorDaysToday / this.aorSpeed;
            return Math.max(0, Math.ceil(calendarDays));
        },

        predictedAorDateStr() {
            if (this.daysToAorReal === null || this.todayDayNumber === null) return null;
            const start = this.parseDate(this.todayDateStr);
            const target = this.addDays(start, this.daysToAorReal);
            return this.formatDate(target);
        },

        prettyPredictedAor() {
            if (!this.predictedAorDateStr) return '—';
            const d = this.parseDate(this.predictedAorDateStr);
            return d.toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });
        },

        predictedEcoprDateStr() {
            if (!this.predictedAorDateStr || this.daysToEcoprAfterAorNumber <= 0) return null;
            const aor = this.parseDate(this.predictedAorDateStr);
            const ecopr = this.addDays(aor, this.daysToEcoprAfterAorNumber);
            return this.formatDate(ecopr);
        },

        prettyPredictedEcopr() {
            if (!this.predictedEcoprDateStr) return '—';
            const d = this.parseDate(this.predictedEcoprDateStr);
            return d.toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });
        },

        workDaysToAor() {
            if (!this.predictedAorDateStr || !this.todayDateStr) return null;
            const result = this.enumerateWorkDays(this.todayDateStr, this.predictedAorDateStr);
            return result ? result.workDays : null;
        },

        officeDaysToAor() {
            if (!this.predictedAorDateStr || !this.todayDateStr) return null;
            const result = this.enumerateWorkDays(this.todayDateStr, this.predictedAorDateStr);
            return result ? result.officeDays : null;
        }
    },

    watch: {
        processedAorDate1: 'persistInputs',
        processedAorDate2: 'persistInputs',
        obsDate1: 'persistInputs',
        obsDate2: 'persistInputs',
        daysToEcoprAfterAor: 'persistInputs'
    },

    methods: {
        updateTodayPst() {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Vancouver',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const parts = formatter.formatToParts(now);
            const map = {};
            parts.forEach(p => {
                if (p.type !== 'literal') map[p.type] = p.value;
            });

            const y = map.year;
            const m = map.month;
            const d = map.day;
            this.todayDateStr = `${y}-${m}-${d}`;
        },

        persistInputs() {
            try {
                window.localStorage.setItem(STORAGE_KEYS.aor1, this.processedAorDate1 || '');
                window.localStorage.setItem(STORAGE_KEYS.aor2, this.processedAorDate2 || '');
                window.localStorage.setItem(STORAGE_KEYS.obs1, this.obsDate1 || '');
                window.localStorage.setItem(STORAGE_KEYS.obs2, this.obsDate2 || '');
                window.localStorage.setItem(STORAGE_KEYS.ecoprOffset, String(this.daysToEcoprAfterAor || ''));
            } catch (e) {
                // ignore storage errors
            }
        },

        loadInputs() {
            try {
                const a1 = window.localStorage.getItem(STORAGE_KEYS.aor1);
                const a2 = window.localStorage.getItem(STORAGE_KEYS.aor2);
                const o1 = window.localStorage.getItem(STORAGE_KEYS.obs1);
                const o2 = window.localStorage.getItem(STORAGE_KEYS.obs2);
                const off = window.localStorage.getItem(STORAGE_KEYS.ecoprOffset);

                if (a1) this.processedAorDate1 = a1;
                if (a2) this.processedAorDate2 = a2;
                if (o1) this.obsDate1 = o1;
                if (o2) this.obsDate2 = o2;
                if (off !== null && off !== '') this.daysToEcoprAfterAor = Number(off);
            } catch (e) {
                // ignore storage errors
            }
        },

        parseDate(str) {
            const [y, m, d] = str.split('-').map(Number);
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

        dateToDayNumber(str) {
            const d = this.parseDate(str);
            const msPerDay = 24 * 60 * 60 * 1000;
            return Math.floor(d.getTime() / msPerDay);
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

        enumerateWorkDays(startStr, endStr) {
            const start = this.parseDate(startStr);
            const end = this.parseDate(endStr);
            if (end < start) return null;

            let cursor = new Date(start.getTime());
            let workDays = 0;
            let officeDays = 0;

            while (cursor <= end) {
                const dateStr = this.formatDate(cursor);
                const weekday = cursor.getUTCDay(); // 0 Sun ... 6 Sat
                const isWeekend = weekday === 0 || weekday === 6;
                const isHoliday = this.isHoliday(dateStr);
                const isVacation = this.isVacation(dateStr);

                if (!isWeekend && !isHoliday && !isVacation) {
                    workDays++;
                    const isOffice = weekday === 2 || weekday === 4; // Tue/Thu
                    if (isOffice) officeDays++;
                }

                cursor = this.addDays(cursor, 1);
            }

            return { workDays, officeDays };
        }
    },

    mounted() {
        this.updateTodayPst();
        this.loadInputs();
        // update at midnight-ish if user leaves tab open
        this.timerId = window.setInterval(this.updateTodayPst, 60 * 60 * 1000);
    },

    beforeUnmount() {
        if (this.timerId) {
            window.clearInterval(this.timerId);
        }
    }
};
</script>

<style scoped>
.aor-page {
    max-width: 900px;
    margin: 0 auto;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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
    flex: 1 1 180px;
}

.inputs-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
}

@media (min-width: 800px) {
    .inputs-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
