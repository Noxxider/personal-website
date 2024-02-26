<template>
  <q-page class="flex flex-center">
    <div class="text-h4 text-center q-mt-lg q-mb-md text-weight-medium">
      Resume
    </div>
    
    <div class="full-width">
      <q-pdfviewer class="q-px-sm q-mb-xl q-mx-auto" type="html5" :src="url" style="height: 800px; max-width: 1000px" />
    </div>
    <!-- Start of footer section -->
    <Footer />
    <!-- End of footer section -->
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";

import Footer from "src/components/Footer.vue";

export default defineComponent({
  components: {
    Footer,
  },
  data() {
    return {
      url: "~assets/Ravino Juwono Software General Resume.pdf",
    };
  },
});
</script>
