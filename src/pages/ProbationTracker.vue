<template>
  <q-page class="flex flex-center">
    <div
      class="q-py-sm q-px-xl"
      style="max-width: 400px; border: 1px solid #cccccc; border-radius: 8px"
    >
      <div class="text-h6 text-center">Probation Tracker</div>

      <div class="text-h3 text-weight-medium text-center q-mt-md">
        {{ this.progress }}%
      </div>

      <div class="text-h7 text-weight-medium q-mt-md">Enter Starting Date</div>

      <q-input
        outlined
        v-model="startDate"
        label="DD-MM-YYYY"
        debounce="300"
        class="q-mb-sm"
        style="max-width: 200px"
      />

      <div class="text-h7 text-weight-medium q-mt-xs">Enter Number of Days</div>

      <q-input
        outlined
        v-model="numDays"
        class="q-mb-sm"
        style="max-width: 200px"
      />
      <q-btn
        @click="calculateProgress()"
        color="accent"
        label="Tap"
        no-caps
        class="q-py-md q-mb-sm full-width"
      />
      <q-toggle v-model="saveParams" label="Save data?" />
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      taps: [],
      percentage: "",
      startDate: "",
      processedStartDate: "",
      numDays: 90,
      saveParams: false,
      progress: 0,
    };
  },

  methods: {
    calculateProgress() {
      var numWorkDays;
      this.convertStartDate()
      if (this.isValidDate(this.processedStartDate)) {
        numWorkDays = this.countWorkingDays(this.processedStartDate);
        console.log(numWorkDays)
        console.log(this.numDays)
        this.progress = ((numWorkDays / this.numDays) * 100).toPrecision(3);
      } else {
        return;
      }
    },

    /* 
    isValidDate(dateString)
    Purpose: Validates if a given string adheres to the YYYY-MM-DD date format and represents a valid date.
    Details: Uses a regular expression to match the input string to the date format, and verifies the date's 
    validity using a Date object. Function is called in advancedSearchFilter()
    Error Handling: Returns false for invalid date formats or dates.
    Testing: Test with various date strings e.g. 2020-12-31 or a2020-12-31 or 2020-12-
    */
    isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/; // Regular expression to check if the string matches the YYYY-MM-DD format.
      if (!regex.test(dateString)) {
        return false; // Return false if the string doesn't match the format.
      }

      const date = new Date(dateString);
      return !isNaN(date); // Check if the constructed date is valid.
    },

    countWorkingDays(startDate) {
      let count = 0;
      let currentDate = new Date(startDate);
      let endDate = new Date()
      // Loop from start date to end date
      while (currentDate <= endDate) {
        // Get the day of the week: 0 is Sunday, 1 is Monday, ..., 6 is Saturday
        const dayOfWeek = currentDate.getDay();
        // Increment the count if it's a weekday (Monday to Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          count++;
        }
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return count;
    },

    convertStartDate(){
      const parts = this.startDate.trim().split("-");

      // Rearrange the array to the format [YYYY, MM, DD]
      this.processedStartDate = parts[2] + "-" + parts[1] + "-" + parts[0];
    }
  },
};
</script>