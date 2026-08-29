<template>
  <!-- Main container for the page -->
  <q-page class="flex flex-center">
    <div class="q-px-md full-width">
      <!-- Title of the page -->
      <div class="text-h6 text-weight-bold text-center full-width q-mt-xl">
        Bodyweight Tracker
      </div>

      <!-- Input section for weights, visible when the graph is not displayed -->
      <div
        v-if="!graphVisible"
        style="max-width: 400px"
        class="q-mx-auto q-mt-md q-mb-xl"
      >
        <!-- Input field for weight entries -->
        <q-input
          class="q-mb-md"
          outlined
          v-model="weightInput"
          color="dark"
          label-color="dark"
          label="Enter Weights (kg)"
          hint="Enter weights separated by spaces (e.g., 70 70.2 70.1 70.4)"
        />

        <!-- Input field for start date with a calendar popup -->
        <q-input
          filled
          readonly
          v-model="startDate"
          mask="date"
          label="Start Date"
          :rules="[validateDate]"
          hint="Press calendar symbol to choose a start date"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <!-- Calendar component for selecting start date -->
                <q-date v-model="startDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <!-- Button to generate the graph based on input data -->
        <q-btn
          label="Generate Graph"
          type="primary"
          class="shadow-1 q-mt-md full-width button-color"
          no-caps
          padding="md lg"
          color="accent"
          @click="generateGraph"
          unelevated
        />
      </div>

      <!-- Section to display the graph, visible when graph data is available -->
      <div
        v-if="graphVisible"
        style="max-width: 800px"
        class="q-mx-auto q-mt-lg"
      >
        <!-- ApexCharts component to render the graph -->
        <ApexCharts
          style="max-width: 100%"
          :options="options"
          :series="options.series"
        ></ApexCharts>
      </div>

      <!-- Section to display weight statistics, visible when stats are available -->
      <div
        v-if="statsVisible"
        style="max-width: 600px"
        class="q-mx-auto q-mt-md q-mb-xl"
      >
        <q-list bordered class="rounded-borders">
          <div class="text-h6 text-weight-bold q-my-md text-center">
            Weight Statistics
          </div>
          <!-- List of weight statistics -->
          <!-- Each item displays a specific statistic -->
          <q-item-label class="q-pb-none" header>Average Weight</q-item-label>
          <q-item class="q-pt-none">
            <q-item-section>{{ averageWeight }} kg</q-item-section>
          </q-item>

          <q-item-label class="q-pb-none" header>Net Weight Gain</q-item-label>
          <q-item class="q-pt-none">
            <q-item-section>{{ netWeightGain }} kg</q-item-section>
          </q-item>

          <q-item-label class="q-pb-none" header>Minimum Weight</q-item-label>
          <q-item class="q-pt-none">
            <q-item-section>{{ minWeight }} kg</q-item-section>
          </q-item>

          <q-item-label class="q-pb-none" header>Maximum Weight</q-item-label>
          <q-item class="q-pt-none">
            <q-item-section>{{ maxWeight }} kg</q-item-section>
          </q-item>

          <q-item-label class="q-pb-none" header>Weight Range</q-item-label>
          <q-item class="q-pt-none">
            <q-item-section>{{ weightRange }} kg</q-item-section>
          </q-item>

          <q-item-label class="q-pb-none" header
            >Average Daily Weight Change</q-item-label
          >
          <q-item class="q-pt-none">
            <q-item-section>{{ dailyWeightGain }} kg</q-item-section>
          </q-item>

          <!-- Button to reset the data -->
          <q-item class="q-pt-none q-px-md">
            <q-btn
              label="Reset Data"
              type="primary"
              class="shadow-1 q-mb-md full-width button-color"
              no-caps
              outline
              padding="md lg"
              @click="resetData()"
              unelevated
            />
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>
<script>
import { defineComponent, ref, computed } from "vue";
import ApexCharts from "vue3-apexcharts";

export default defineComponent({
  name: "BodyweightTracker",
  components: { ApexCharts },
  setup() {
    // Refs for user inputs
    var weightInput = ref("");
    var startDate = ref("");

    // Refs for visibility toggles
    const graphVisible = ref(false);
    const statsVisible = ref(false);

    // Refs for computed statistics
    let averageWeight = ref("0.00");
    let netWeightGain = ref("0.00");
    let minWeight = ref("0.00");
    let maxWeight = ref("0.00");
    let weightRange = ref("0.00");
    let dailyWeightGain = ref("0.00");

    // Chart configuration options
    var options = {
      chart: { type: "line" },
      series: [{ name: "Series 1", data: [] }],
      xaxis: { title: { text: "Date" }, type: "datetime" },
      yaxis: { title: { text: "Weight (kg)" } },
      title: { text: "Bodyweight trend since" },
      stroke: { curve: "smooth" },
    };

    // Function to reset data
    const resetData = () => {
      statsVisible.value = false;
      graphVisible.value = false;
    };

    // Function to validate date input
    const validateDate = (val) => {
      return val && !isNaN(Date.parse(val)) ? true : "Invalid date";
    };

    // Function to generate the graph
    const generateGraph = () => {
      if (!validateDate(startDate.value)) {
        alert("Please enter a valid start date.");
        return;
      }

      const weights = weightInput.value.trim().split(" ").map(Number);
      if (weights.some(isNaN)) {
        alert("Please enter valid weights.");
        return;
      }

      // Calculate and update statistics
      if (weights.length > 0) {
        const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
        averageWeight.value = (totalWeight / weights.length).toFixed(2);
        netWeightGain.value = (weights.at(-1) - weights[0]).toFixed(2);
        minWeight.value = Math.min(...weights).toFixed(2);
        maxWeight.value = Math.max(...weights).toFixed(2);
        weightRange.value = (maxWeight.value - minWeight.value).toFixed(2);
        dailyWeightGain.value = (netWeightGain.value / weights.length).toFixed(
          2
        );
      }

      // Generate date labels for the graph
      const dateLabels = generateDateLabels(
        weights.length,
        new Date(startDate.value)
      );
      if (dateLabels.length !== weights.length) {
        alert("Date labels and weights count mismatch.");
        return;
      }

      // Map weights to date labels for graph data points
      const dataPoints = weights.map((weight, index) => [
        dateLabels[index],
        weight,
      ]);

      // Update chart series with new data
      options.series[0].data = dataPoints;
      options.title.text =
        "Bodyweight Trend Since " +
        new Date(dateLabels[0]).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

      // Make graph and stats visible
      graphVisible.value = true;
      if (weights.length > 0) {
        statsVisible.value = true;
      }
    };

    // Function to generate date labels based on count and start date
    const generateDateLabels = (count, startDate) => {
      const dates = [];
      for (let i = 0; i < count; i++) {
        let date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date.getTime()); // Store dates as timestamps
      }
      return dates;
    };

    return {
      weightInput,
      startDate,
      resetData,
      options,
      graphVisible,
      generateGraph,
      statsVisible,
      averageWeight,
      netWeightGain,
      minWeight,
      maxWeight,
      weightRange,
      dailyWeightGain,
    };
  },
});
</script>

<style scoped>
.button-color {
  color: #ed6a5a;
}
</style>

