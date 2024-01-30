<template class="layout">
  <q-page class="flex flex-center">
    <!-- Header Section -->
    <div class="q-mx-md">
      <h6 class="text-weight-medium text-center q-mb-none">
        Contact Information
      </h6>
      <div
        class="q-mt-sm custom-paragraph text-weight-regular"
        style="max-width: 550px"
        ref="email"
      >
        Need a website or custom software? Let's connect — I'm always open to
        projects and employment opportunities!
      </div>
      <!-- Email -->
      <div class="flex q-mt-sm" style="max-width: 550px">
        <svg
          class="q-my-auto"
          style="fill: #262626"
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
        >
          <!-- Your SVG paths, shapes, etc. go here -->
          <path
            d="M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm340-308q5 0 8.5-1.5t7.5-3.5l314-205q5-3 7.5-8t2.5-11q0-13-11.5-20.5t-23.5.5L480-522 176-717q-12-8-24-1t-12 20q0 6 3 11.5t7 8.5l314 205q4 2 7.5 3.5t8.5 1.5Z"
          />
        </svg>

        <div
          class="q-my-auto custom-paragraph q-mx-md text-weight-regular"
          ref="email"
        >
          <a href="mailto:ravino.juwono@gmail.com">ravino.juwono@gmail.com</a>
        </div>

        <q-btn
          :ripple="false"
          @click="copyToClipboard('email')"
          class="q-ml-auto"
          flat
          icon="content_copy"
        />
      </div>

    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ResumePage",
  methods: {
    async copyToClipboard(refName) {
      try {
        const textToCopy = this.$refs[refName].innerText;
        await navigator.clipboard.writeText(textToCopy);
        this.$q.notify({ type: "positive", message: "Copied!" });
      } catch (err) {
        console.error("Failed to copy text: ", err);
        this.$q.notify({ type: "negative", message: "Failed to copy!" });
      }
    },
  },
});
</script>

