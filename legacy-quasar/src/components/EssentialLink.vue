<template>
  <q-item clickable tag="a" :href="link">
    <div class="q-my-auto" v-if="icon" avatar style="height: 24px">
      <q-icon size="24px" :name="icon" />
    </div>

    <q-item-section class="q-ml-md">
      <div class="q-my-auto">{{ title }}</div>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "EssentialLink",
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    link: {
      type: String,
      default: "#",
    },

    icon: {
      type: String,
      default: "",
    },
  },
});
</script>
