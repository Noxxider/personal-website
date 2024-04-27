<template>
  <q-page class="flex flex-center">
    <div class="text-h4 text-center q-mt-lg large-screen-only q-mb-md text-weight-medium">
      Resume
    </div>

    <div class="text-h4 text-center q-mt-md small-screen-only q-mb-md text-weight-medium">
      Resume
    </div>

    <div class="full-width large-screen-only">
      <q-pdfviewer
        class="q-px-sm q-mb-xl q-mx-auto"
        type="pdfjs"
        :src="url"
        style="height: 90vh; max-width: 1000px"
      />
    </div>

    <div class="full-width small-screen-only disable-tap-zoom">
      <q-pdfviewer
        class="q-px-md q-mb-xl q-mx-auto disable-tap-zoom"
        type="pdfjs"
        :src="url"
        style="height: 65vh; max-width: 1000px"
      />
    </div>
    <!-- Start of footer section -->
    <Footer />
    <!-- End of footer section -->
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";

import Footer from "src/components/Footer.vue";
import pdf from "assets/Ravino Juwono Software General Resume.pdf";

export default defineComponent({
  components: {
    Footer,
  },
  data() {
    return {
      url: pdf,
    };
  },
});
</script>

<style scoped>
.disable-tap-zoom {
  touch-action: manipulation;
}
</style>