<template>
  <q-page class="flex flex-center">
    <div class="q-py-md q-px-xl" style="max-width: 400px;  border: 1px solid #CCCCCC; border-radius: 8px">
      <div class="text-h6 text-center">Tap to count BPM</div>
      <div v-if="displayBPM != ''" class="text-h3 text-weight-medium text-center q-mt-md">{{displayBPM}}</div>
      <div v-if="displayBPM != ''" class="text-h7 text-weight-medium text-center q-mt-xs">Beats/Minute</div>
      <q-btn @click="calculateBPM" color="accent" label="Tap" no-caps class="q-mt-md q-py-md q-mb-sm full-width" />
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      taps: [],
      displayBPM: '',
      maxTaps: 8
    };
  },
  methods: {
    calculateBPM() {
      const now = Date.now();
      this.taps.push(now);

      // Keep only the last two taps to calculate the BPM
      if (this.taps.length > this.maxTaps) {
        this.taps.shift();
      }

      if (this.taps.length > 1) {
        let totalInterval = 0;
        // Calculate the total interval between consecutive taps
        for (let i = 1; i < this.taps.length; i++) {
          totalInterval += (this.taps[i] - this.taps[i - 1]);
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