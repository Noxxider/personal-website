<template>
  <q-page class="flex flex-center">
    <!-- Main box containing contents -->
    <div
      class="q-py-md q-px-md"
      style="border: 1px solid #cccccc; border-radius: 8px; min-width: 400px"
    >
      <!-- Title -->
      <div class="text-h5 text-center">Probation Tracker</div>

      <!-- Box containing UI elements when data is entered -->
      <div v-if="progressVisible">
        <!-- % of progress -->
        <div class="text-h3 text-weight-medium text-center q-mt-md">
          {{ this.progress }}%
        </div>

        <!-- Detail of number of work days completed -->
        <div class="text-h7 text-weight-medium text-center q-mt-sm">
          {{ numWorkDays }} out of {{ numWorkDaysToComplete }} work days
          completed
        </div>

        <!-- Progress bar -->
        <q-linear-progress
          :value="this.progress / 100"
          rounded
          color="positive"
          class="q-mt-md"
          :size="'xl'"
        />

        <!-- Reset button -->
        <q-btn
          @click="resetData()"
          color="accent"
          outline
          label="Reset"
          no-caps
          class="q-py-md q-mt-lg q-mb-sm full-width"
        />
      </div>

      <!-- Box containing UI elements when data is empty -->
      <div v-if="!progressVisible">
        <!-- Text and input box to enter start date -->
        <div class="text-h7 text-weight-medium q-mt-md">
          Enter Starting Date
        </div>

        <q-input
          outlined
          v-model="startDate"
          label="DD-MM-YYYY"
          debounce="300"
          class="q-mb-sm"
        />

        <!-- Text and input box to enter number of probation days -->
        <div class="text-h7 text-weight-medium q-mt-xs">
          Enter Number of Days
        </div>

        <q-input outlined v-model="numDays" class="q-mb-sm" />

        <!-- Calculate progress button -->
        <q-btn
          @click="calculateProgress()"
          color="accent"
          label="Calculate"
          no-caps
          class="q-py-md q-mb-sm full-width"
        />

        <!-- Toggle to save data to device -->
        <div class="full-width flex justify-end q-pr-xs">
          <q-toggle v-model="saveParams" label="Save data?" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script> 
export default {
  /*
  Data that the web app needs to run
  */
  data() {
    return {
      //* Inputs *//
      startDate: "", // Start date. Entered in DD-MM-YYYY but will be converted when calculateProgress() is run
      numDays: 90, // Number of days of probation
      saveParams: false, // Toggle to save parameters

      // *Outputs* //
      progress: 0, // % of progress
      numWorkDays: 0, // Num of Work Days completed
      numWorkDaysToComplete: 0, // Number of work days to complete

      // **Data Storage Key** //
      localStorageKey: "probationTrackerParameters", // Key for local storage
    };
  },

  /* 
  Callback when the app is started to check if there is saved data
  */
  mounted() {
    var saveObject = this.getData();
    if (saveObject != null && saveObject != undefined) {
      this.startDate = saveObject.startDate;
      this.numDays = saveObject.numDays;
      this.calculateProgress();
    }
  },

  /*
  Reactive variable called progressVisible() to determine if progress has been entered
  and show appropriate UI 
  */
  computed: {
    progressVisible() {
      if (this.progress == 0) {
        return false;
      } else {
        return true;
      }
    },
  },
  methods: {
    /* 
    calculateProgress()
    Purpose: Calculates progress of work probation
    Details: Counts the working days completed and working days to complete using helper functions, and returns a percentage.
    Error Handling: Returns void for invalid date formats or dates.
    Testing: Test with various date strings e.g. 2020-12-31 or a2020-12-31 or 2020-12-
    */
    calculateProgress() {
      var processedStartDate = this.convertStartDate(this.startDate);
      if (
        this.isValidDate(processedStartDate) &&
        Number.isInteger(this.numDays) &&
        this.numDays > 0
      ) {
        this.numWorkDays = this.workDaysCompleted(processedStartDate);
        this.numWorkDaysToComplete = this.workDaysToComplete(
          processedStartDate,
          this.numDays
        );

        this.progress = (
          (this.numWorkDays / this.numWorkDaysToComplete) *
          100
        ).toPrecision(3);

        if (this.saveParams) {
          this.saveData();
        }
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

    /* 
    countWorkDays(startDate, endDate)
    Purpose: A helper function to calculate work days between two given dates.
    Details: Uses a date objects and a while loop
    Error Handling: Invalid dates inputted
    Testing: Test with various dates
    */
    countWorkDays(startDate, endDate) {
      let count = 0;
      let currentDate = new Date(startDate);
      const finalDate = new Date(endDate);

      while (currentDate <= finalDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Monday to Friday
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return count;
    },

    /* 
    workDaysToComplete(startDate, numDays)
    Purpose: Calculates work days to complete using helper functions
    Details: Uses the helper function countWorkDays.
    Error Handling: Returns invalid numbers for invalid dates
    Testing: Test with various dates
    */
    workDaysToComplete(startDate, numDays) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + numDays);

      return this.countWorkDays(startDate, end);
    },

    /* 
    workDaysCompleted(startDate)
    Purpose: Calculates work days completed using helper functions
    Details: Uses the helper function countWorkDays.
    Error Handling: Returns invalid numbers for invalid dates
    Testing: Test with various dates
    */
    workDaysCompleted(startDate) {
      const today = new Date();
      return this.countWorkDays(startDate, today);
    },

    /* 
    convertStartDate(startDate)
    Purpose: Converts user input to the accepted date format
    Details: Uses split to reorganize the date
    Error Handling: Returns invalid dates
    Testing: Test with various dates
    */
    convertStartDate(startDate) {
      const parts = startDate.trim().split("-");

      // Rearrange the array to the format [YYYY, MM, DD]
      return parts[2] + "-" + parts[1] + "-" + parts[0];
    },

    /* 
    resetData()
    Purpose: Resets data
    Details: Uses local storage and resets progress
    Error Handling: N/A
    Testing: N/A
    */
    resetData() {
      this.progress = 0;
      localStorage.clear();
    },

    /* 
    saveData()
    Purpose: Saves data if user chooses to do so
    Details: Uses local storage
    Error Handling: Saves invalid data
    Testing: Try with multiple dates and numbers.
    */
    saveData() {
      var saveObject = {
        startDate: this.startDate,
        numDays: this.numDays,
      };
      saveObject = JSON.stringify(saveObject);

      if (localStorage.getItem(this.localStorageKey) == null) {
        localStorage.setItem(this.localStorageKey, saveObject);
      }
    },

    /* 
    getData()
    Purpose: Returns saved data
    Details: Uses local storage
    Error Handling: Returns invalid data
    Testing: Try with multiple dates and numbers.
    */
    getData() {
      var saveData = JSON.parse(localStorage.getItem(this.localStorageKey));
      return saveData;
    },
  },
};
</script>