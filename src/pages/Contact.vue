<template class="layout">
  <q-page class="flex flex-center">
    <!-- Header Section -->
    <div>
      <h4 class="text-weight-medium text-center">Contact Information</h4>

      <!-- Email -->
      <div class="flex" style="max-width: 500px">
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

        <h6 class="q-my-auto q-mx-md text-weight-regular" ref="email">
          ravino.juwono@gmail.com
        </h6>

        <q-btn
          :ripple="false"
          @click="copyToClipboard('email')"
          class="q-ml-auto"
          flat
          icon="content_copy"
        />
      </div>

      <!-- Phone -->
      <div class="flex q-mt-md" style="max-width: 500px">
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
            d="M795-120q-116 0-236.5-56T335-335Q232-438 176-558.5T120-795q0-19 13-32t32-13h140q14 0 24 10t14 25l27 126q2 14-.5 25.5T359-634L259-533q26 44 55 82t64 72q37 38 78 69.5t86 55.5l95-98q10-11 23-15t26-2l119 26q15 4 25 16t10 27v135q0 19-13 32t-32 13Z"
          />
        </svg>
        <h6 class="q-my-auto q-mx-md text-weight-regular" ref="phone">
          250 863 2454
        </h6>

        <q-btn
          :ripple="false"
          @click="copyToClipboard('phone')"
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

<style scoped>
.full-height {
  height: calc(100vh - 56px);
}

.text-standard {
  color: #f7f7f7;
}

@media screen and (min-width: 600px) {
  .responsive-image {
    height: auto;
    max-width: 55%;
    width: auto;
    margin-top: 48px;
    margin-bottom: 48px;
  }
}

@media screen and (max-width: 600px) {
  .responsive-image {
    height: auto;
    width: 80%;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 16px;
    padding-bottom: 16px;
  }
}

@media screen and (max-width: 1000px) {
  .responsive-padding {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media screen and (min-width: 950px) {
  .responsive-padding-gallery {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media screen and (max-width: 1000px) {
  .responsive-margin-landing {
    margin-top: 64px;
  }
}

.responsive-margin {
  margin-left: 96px;
  margin-right: 96px;
}

@media screen and (max-width: 1000px) {
  .responsive-margin {
    margin-left: 16px;
    margin-right: 16px;
  }
}

.responsive-margin-button {
  margin-left: 96px;
  margin-right: 96px;
}

@media screen and (max-width: 1000px) {
  .responsive-margin-button {
    margin-left: 32px;
    margin-right: 32px;
  }
}

.responsive-landing-div-height {
  height: 95vh;
}

@media screen and (max-width: 800px) {
  .responsive-landing-div-height {
    height: auto;
  }
}

.my-section-three {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.section-headline {
  margin-top: 24px;
  margin-bottom: 8px;
  width: 100%;
  word-wrap: break-word;
}

.section-content {
  width: 100%;
  word-wrap: break-word;
}

.section-image {
  height: 100%;
}

.same-height > div {
  display: flex;
  flex-direction: column;
}

.same-height .section-image {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.same-height .section-image q-img {
  max-height: 100%;
  object-fit: contain;
}
</style>
