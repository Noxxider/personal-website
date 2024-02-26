<template>
  <q-layout class="layout" view="lHh Lpr lFf">
    <q-header>
      <q-toolbar style="align-items: center">
        <div class="small-screen-only q-mx-auto full-width">
          <div class="flex justify-between">
            <q-btn to="/" flat>
              <img
                src="~assets/header.svg"
                class="q-my-auto"
                style="height: 24px; padding: 0px"
              />
            </q-btn>

            <q-btn
              flat
              no-caps
              dense
              icon="menu"
              style="color: #262626"
              aria-label="Menu"
              @click="toggleLeftDrawer"
              class="small-screen-only q-my-auto"
            />
          </div>
        </div>

        <div
          class="large-screen-only"
          style="display: flex; align-items: center"
        >
          <q-btn to="/" class="large-screen-only q-ml-md" flat>
            <img
              src="~src\assets\header.svg"
              class="q-my-auto"
              style="height: 24px; padding: 0px"
            />
          </q-btn>
          <q-btn
            class="large-screen-only q-px-xl q-mx-lg"
            no-caps
            to="/"
            text-color="dark"
            :ripple="false"
            label="Home"
            style="padding: 8px 12px"
            unelevated
          />
          <q-btn
            class="large-screen-only q-px-xl q-mr-lg"
            no-caps
            to="/weighttracker"
            text-color="dark"
            :ripple="false"
            label="Weight Tracker"
            style="padding: 8px 12px"
            unelevated
          />
          
               <q-btn
            class="large-screen-only q-px-xl q-mr-lg"
            no-caps
            to="/tapbpm"
            :ripple="false"
            text-color="dark"
            label="BPM Counter"
            style="padding: 8px 12px"
            unelevated
          />

          <q-btn
            class="large-screen-only q-px-xl "
            no-caps
            to="/contact"
            :ripple="false"
            text-color="dark"
            label="Contact"
            style="padding: 8px 12px"
            unelevated
          />
          <q-btn
            class="large-screen-only q-ml-lg"
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

    <q-drawer v-model="leftDrawerOpen" :width="200" bordered behavior="mobile">
      <q-list>
        <div class="text-h6 q-pa-md" header>Pages</div>
        <q-separator />
        <EssentialLink
          class="q-mt-sm"
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
    title: "Weight Tracker",
    icon: "fitness_center",
    link: "/weighttracker",
  },
   {
    title: "BPM Tracker",
    icon: "favorite",
    link: "/tapbpm",
  },
  {
    title: "Resume",
    icon: "menu_book",
    link: "/resume",
  },
  {
    title: "GitHub",
    icon: "code",
    link: "https://github.com/Noxxider",
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
