<template>
  <q-layout class="layout" view="lHh Lpr lFf">
    <q-header>
      <q-toolbar style="align-items: center;">
        <div
          style="display: flex; align-items: center"
          class="q-ml-auto"
        >
          <q-btn
            flat
            no-caps
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
            class="small-screen-only"
          />

          <q-btn
            to="/"
            class="large-screen-only q-ml-md"
            flat
          >
            <img
              src="~src\assets\header.svg"
              class="q-my-auto"
              style="height: 24px; padding: 0px"
            />
          </q-btn>
        </div>
        <div class="" style="display: flex; align-items: center">
          <q-btn
            class="large-screen-only q-px-xl q-mx-xl"
            no-caps
            to="/events"
            text-color="dark"
            label="Home"
            style="padding: 8px 12px"
            unelevated
          />
          <q-btn
            class="large-screen-only q-px-xl"
            no-caps
            to="/settings"
            text-color="dark"
            label="Contact"
            style="padding: 8px 12px"
            unelevated
          />
        </div>

        <div
          class="q-pr-md q-mr-auto q-ml-xl"
          style="display: flex; justify-content: flex-end; align-items: center"
        >
          <q-btn
            class="large-screen-only"
            no-caps
            to="/resume"
            color="accent"
            label="Resume"
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
