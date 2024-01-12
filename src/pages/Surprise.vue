<template class="layout">
  <q-page class="flex flex-center">
    <!-- Header Section -->
    <div class="q-mx-md">
      <h6 class="text-weight-medium text-center q-mb-none">
        Perception
      </h6>
      <div
        class="q-mt-sm custom-paragraph text-weight-regular"
        style="max-width: 550px"
        ref="email"
      >
        I love you Kaya, you silly girl 💗<br><br>Thank you for being such a cool person since 2003 in Trail. Love you 😁 <br><br>p.s. Sorry for the perceiving
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

