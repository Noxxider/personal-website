<template>
  <q-page class="flex flex-center">
    <div
      class="q-pt-md q-pb-xs q-px-sm disable-tap-zoom bg-accent"
      style="min-width: 300px; border: 1px solid #cccccc; border-radius: 8px"
    >
      <div class="text-h6 text-center text-white">Tap to count BPM</div>
      <div
        v-if="displayBPM != ''"
        class="text-h3 text-weight-medium text-center q-mt-md text-white"
      >
        {{ displayBPM }}
      </div>
      <div
        v-if="displayBPM != ''"
        class="text-h7 text-weight-medium text-center q-mt-xs text-white"
      >
        Beats/Minute
      </div>
      <q-btn
        @click="calculateBPM"
        :ripple="false"
        color="accent"
        label="Tap"
        no-caps
        unelevated
        class="dark-button text-white q-mt-md q-py-md q-mb-sm full-width"
      />
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      taps: [],
      displayBPM: "",
      maxTaps: 8,
    };
  },
  methods: {
    calculateBPM() {
      const now = Date.now();
      this.taps.push(now);

      // Keep only the last eight taps to calculate the BPM
      if (this.taps.length > this.maxTaps) {
        this.taps.shift();
      }

      if (this.taps.length > 1) {
        // Auto-reset if more than 2 seconds have passed since the last tap
        if (now - this.taps[this.taps.length - 2] > 2000) {
          this.taps = [];
          return;
        }

        let totalInterval = 0;
        // Calculate the total interval between consecutive taps
        for (let i = 1; i < this.taps.length; i++) {
          totalInterval += this.taps[i] - this.taps[i - 1];
        }
        // Calculate average interval between taps
        const averageInterval = totalInterval / (this.taps.length - 1);
        // Calculate BPM
        const bpm = 60000 / averageInterval;
        this.displayBPM = bpm.toFixed(0);
      }
    },
  },
};
</script>

<style scoped>
.disable-tap-zoom {
  touch-action: manipulation;
}

.dark-button {
  background-color: #4f539e !important;
  border-radius: 8px;
}
</style>