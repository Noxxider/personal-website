<template>
  <q-layout class="layout" view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        style="
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
        "
      >
        <div style="display: flex; align-items: center" class="q-pr-md">
          <q-btn
            flat
            no-caps
            dense
            round
            icon="menu"
            color="secondary"
            aria-label="Menu"
            @click="toggleLeftDrawer"
            class="small-screen-only"
          />

          <q-btn
            flat
            no-caps
            round
            dense
            size="18px"
            to="/"
            color="secondary"
            label="Home"
            class="large-screen-only q-ml-md"
            padding="md"
          />

          <q-btn
            flat
            no-caps
            round
            dense
            size="18px"
            to="/contact"
            color="secondary"
            label="Contact"
            class="large-screen-only q-ml-md"
            padding="md"
          />
        </div>

        <img
          class="q-py-sm q-mx-auto"
          src="~src\assets\header.svg"
          style="height: 48px"
        />

        <div
          class="q-pr-md"
          style="display: flex; justify-content: flex-end; align-items: center"
        >
          <q-btn
            class="large-screen-only"
            no-caps
            to="/resume"
            color="accent"
            label="My Resume"
            style="padding: 8px 16px"
            unelevated
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered behavior="mobile">
      <q-list>
        <q-item-label header> Pages </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "Home",
    icon: "home",
    link: "https://ravinojuwono.com",
  },
  {
    title: "Resume",
    icon: "menu_book",
    link: "/resume",
  },
  {
    title: "LinkedIn",
    icon: "person",
    link: "https://linkedin.com/in/ravinojuwono",
  },

  {
    title: "Contact",
    icon: "phone",
    link: "/contact",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
