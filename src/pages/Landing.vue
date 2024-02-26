<template>
  <!-- Main page container -->
  <q-page class="flex flex-center">
    <!-- Container for the first section with full width and specific height -->
    <!-- Section 1: Introduction with image and text -->
    <div class="full-width landingFirst flex flex-center">
      <div
        class="q-pa-md row justify-center responsive-landing-div-height wrapper-width"
      >
        <div
          class="my-section col-xs-12 col-sm-6 q-pa-md responsive-padding text-left"
        >
          <div class="text-h2 text-weight-medium">Hello!</div>
          <div class="text-h5 q-my-md">
            I’m Vino, a physics grad turned software developer
          </div>
          <div class="flex">
            <q-btn
              label="My Resume"
              type="primary"
              class="q-mt-md q-mr-sm shadow-1"
              style="max-width: 400px; flex: 1"
              no-caps
              padding="md xl"
              to="resume"
              color="accent"
              unelevated
            />
            <q-btn
              type="primary"
              class="q-mt-md q-ml-sm text-center justify-center"
              style="flex: 1"
              no-caps
              outline
              rounded
              padding="md xl"
              href="https://github.com/Noxxider"
              target="_blank"
              color="accent"
            >
              <div class="flex">
                <q-icon name="code" class="q-mr-xs" />
                <div class="text-center q-ml-xs">GitHub</div>
              </div>
            </q-btn>
          </div>
        </div>
        <div class="my-section col-xs-12 col-sm-6 flex flex-center">
          <img
            class="responsive-image"
            alt="Quasar logo"
            src="~assets/landing-one.jpg"
            fit="contain"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: About Me -->
    <div
      class="text-weight-regular flex justify-center text-center items-center responsive-padding q-mt-xl wrapper-width"
      style="
        width: 100%;
        font-weight: 500;
        font-size: 24px;
        line-height: 140%;
        font-family: Polysans, Arial, Helvetica, sans-serif;
      "
    >
      Languages and Frameworks
    </div>

    <!-- Section 3: Skills and Languages -->
    <div
      class="responsive-padding q-mx-auto q-mt-sm q-pb-xl flex-column text-center wrapper-width"
      style="width: 100%"
    >
      <Vue3Marquee
        :duration="22"
        :gradient="true"
        :gradient-color="FDFEFF"
        gradient-length="30%"
      >
        <div class="q-px-md" v-for="icon in techIcons" :key="icon.alt">
          <img :src="icon.src" :alt="icon.alt" height="90" />
          <div class="custom-paragraph" style="font-weight: 500">
            {{ icon.alt }}
          </div>
        </div>
      </Vue3Marquee>
    </div>

    <!-- Section 4: Skills and Languages -->
    <div class="q-px-md q-pb-md row justify-center wrapper-width">
      <div
        class="q-my-auto col-xs-12 col-sm-6 q-pa-md responsive-padding text-left"
      >
        <div
          class="text-h5 text-weight-medium q-mb-md"
          style="text-decoration: underline"
        >
          Projects
        </div>
        <div class="text-h6 text-weight-medium">Body Weight Tracker App</div>
        <div class="custom-paragraph q-mt-md text-weight-regular">
          <p>
            Just paste a string of numbers or upload your data on this site to
            see your weight trend graph and key stats.
          </p>
        </div>
        <q-btn
          label="Launch Tracker"
          type="primary"
          outline
          class="full-width q-mt-none q-mb-md"
          style="max-width: 400px"
          no-caps
          to="/weighttracker"
          padding="md xl"
          color="accent"
          unelevated
        />

        <div class="text-h6 text-weight-medium q-mt-md">
          Beats/Minute Counter App
        </div>
        <div class="custom-paragraph q-mt-md text-weight-regular">
          <p>
            Tap the button to calculate a beat. Useful for checking your pulse
            and music!
          </p>
        </div>
        <q-btn
          label="Launch Counter"
          type="primary"
          outline
          class="full-width q-mt-none q-mb-md"
          style="max-width: 400px"
          no-caps
          to="/tapbpm"
          padding="md xl"
          color="accent"
          unelevated
        />
      </div>

      <div class="col-xs-12 col-sm-6 flex flex-center">
        <img
          class="responsive-image"
          alt="Quasar logo"
          src="~assets/sample.png"
          fit="contain"
          style="max-height: 700px"
        />
      </div>
    </div>

    <div
      class="row justify-center responsive-padding wrapper-width"
      style="width: 100%; margin: auto"
    >
      <div class="col responsive-padding-gallery">
        <div class="text-h4 text-weight-medium">Portfolio Snapshot</div>
        <div class="custom-paragraph q-mt-sm text-weight-regular">
          From SaaS applications to an Instagram web scraper, I have extensively
          explored the web development domain.
        </div>
      </div>
    </div>

    <!-- Section 6: Row of 3 Columns for Project Display -->
    <div
      class="row justify-center responsive-padding same-height wrapper-width"
      style="margin-left: auto; margin-right: auto"
    >
      <!-- Start of first column -->
      <div class="my-section-three col-12 col-md-4 responsive-padding-gallery">
        <!-- Image for the first column -->
        <q-img
          class="q-mt-md"
          src="~assets/project-one.png"
          fit="contain"
          height="40vh"
        />
        <!-- Headline for the first column -->
        <div class="section-headline text-h6 text-left text-weight-medium">
          Rangouts
        </div>
        <!-- Content for the first column -->
        <div class="section-content custom-paragraph text-weight-regular">
          Revolutionizing communication with a scalable SaaS web application.<br /><br />Rangouts
          has a feed, a live map and ticket system for local event discovery.
        </div>
      </div>
      <!-- End of first column -->

      <!-- Start of second column -->
      <div class="my-section-three col-12 col-md-4 responsive-padding-gallery">
        <!-- Image for the second column -->
        <q-img
          class="q-mt-md"
          src="~assets/project-two.png"
          fit="contain"
          height="40vh"
        />
        <!-- Headline for the second column -->
        <div class="section-headline text-h6 text-left text-weight-medium">
          Freelance at Parkbench
        </div>
        <!-- Content for the second column -->
        <div class="section-content custom-paragraph text-weight-regular">
          Developed a web application to identify top Instagram accounts in
          specified locations.<br /><br />My work is Parkbench property now so I
          can’t show the code.
        </div>
      </div>
      <!-- End of second column -->

      <!-- Start of third column -->
      <div class="my-section-three col-12 col-md-4 responsive-padding-gallery">
        <!-- Image for the third column -->
        <q-img
          class="q-mt-md"
          height="40vh"
          src="~assets/project-three.png"
          fit="contain"
        />
        <!-- Headline for the third column -->
        <div class="section-headline text-h6 text-left text-weight-medium">
          ZenuQR
        </div>
        <!-- Content for the third column -->
        <div class="section-content custom-paragraph text-weight-regular">
          Enhancing restaurant QR menu code analytics, customer engagement
          strategies and menu design.
        </div>
      </div>
      <!-- End of third column -->
    </div>

    <!-- Start of picture background div -->
    <div class="full-width landingMusic flex justifyCenter q-py-xl q-mt-xl">
      <div class="q-mx-auto flex justify-center wrapper-width">
        <!-- Start of first column (text and button) -->
        <div
          class="col-xs-12 col-sm-6 responsive-padding text-center"
          style="min-height: 15vh"
        >
          <!-- Flex container for vertical centering -->
          <div
            class="flex flex-center column justify-center"
            style="height: 100%"
          >
            <!-- Heading for the first section -->
            <div class="text-h4 text-weight-medium text-wh">
              Besides codes and algorithms,
            </div>
            <!-- Subheading for the first section -->
            <div class="custom-paragraph q-mb-xl q-mt-xs">
              I'm also a singer, having sang acapella internationally. Music is
              a passion that resonates deeply with me.
            </div>
          </div>
        </div>
        <!-- End of first column -->
        <!-- Start of second column (image) -->
        <div class="flex flex-center q-mb-xl">
          <!-- Logo image -->
          <img
            style="max-width: 100%"
            alt="Quasar logo"
            src="~assets/acapella.png"
            fit="contain"
          />
        </div>
        <!-- End of second column -->
      </div>
      <!-- End of picture background div -->
    </div>

    <!-- Section 7: Contact and Resume Info -->
    <div
      class="row responsive-padding q-my-lg wrapper-width text-center q-py-lg"
      style="flex-direction: column"
    >
      <div class="text-h5 text-weight-medium">
        I would love to join your team
      </div>
      <div class="custom-paragraph text-weight-regular q-my-md">
        Don't hesitate to reach out via
        <a
          href="mailto:ravino.juwono@gmail.com?subject=Inquiry%20from%20a%20Potential%20Collaborator%20or%20Employer"
          >email</a
        >
        or text. You can view my resume by clicking the button below
      </div>
      <!-- Button for the final section -->
      <q-btn
        label="Resume"
        type="primary"
        class="q-mt-sm shadow-1 q-mx-auto"
        style="max-width: 350px; padding-left: 56px; padding-right: 56px"
        no-caps
        to="/resume"
        padding="md xl"
        color="accent"
        unelevated
      />
    </div>
    <!-- End of final section -->

    <!-- Start of footer section -->
    <Footer />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { Vue3Marquee } from "vue3-marquee";

// Import footer
import Footer from "src/components/Footer.vue";

// Import SVG assets
import androidSvg from "src/assets/carousel/android.svg";
import awsSvg from "src/assets/carousel/aws.svg";
import azureSvg from "src/assets/carousel/azure.svg";
import bootstrapSvg from "src/assets/carousel/bootstrap.svg";
import csharpSvg from "src/assets/carousel/csharp.svg";
import cssSvg from "src/assets/carousel/css.svg";
import dockerSvg from "src/assets/carousel/docker.svg";
import figmaSvg from "src/assets/carousel/figma.svg";
import html5Svg from "src/assets/carousel/html5.svg";
import ionicSvg from "src/assets/carousel/ionic.svg";
import javaSvg from "src/assets/carousel/java.svg";
import jsSvg from "src/assets/carousel/js.svg";
import mongodbSvg from "src/assets/carousel/mongodb.svg";
import mysqlSvg from "src/assets/carousel/mysql.svg";
import nodejsSvg from "src/assets/carousel/nodejs.svg";
import postgresqlSvg from "src/assets/carousel/postgresql.svg";
import pwaSvg from "src/assets/carousel/pwa.svg";
import pythonSvg from "src/assets/carousel/python.svg";
import reactSvg from "src/assets/carousel/react.svg";
import typescriptSvg from "src/assets/carousel/typescript.svg";
import vueSvg from "src/assets/carousel/vue.svg";

export default defineComponent({
  name: "Landing",
  components: { Vue3Marquee, Footer },
  data() {
    return {
      techIcons: [
        { src: androidSvg, alt: "Android" },
        { src: awsSvg, alt: "AWS" },
        { src: azureSvg, alt: "Azure" },
        { src: bootstrapSvg, alt: "Bootstrap" },
        { src: csharpSvg, alt: "C#" },
        { src: cssSvg, alt: "CSS" },
        { src: dockerSvg, alt: "Docker" },
        { src: figmaSvg, alt: "Figma" },
        { src: html5Svg, alt: "HTML5" },
        { src: ionicSvg, alt: "Ionic" },
        { src: javaSvg, alt: "Java" },
        { src: jsSvg, alt: "JavaScript" },
        { src: mongodbSvg, alt: "MongoDB" },
        { src: mysqlSvg, alt: "MySQL" },
        { src: nodejsSvg, alt: "Node.js" },
        { src: postgresqlSvg, alt: "PostgreSQL" },
        { src: pwaSvg, alt: "PWA" },
        { src: pythonSvg, alt: "Python" },
        { src: reactSvg, alt: "React" },
        { src: typescriptSvg, alt: "TypeScript" },
        { src: vueSvg, alt: "Vue" },
      ],
    };
  },
  methods: {
    getIconPath(iconName) {
      // Dynamically require the image
      return require(`@/assets/carousel/${iconName}.svg`);
    },
  },
});
</script>


<style scoped>
.wrapper-width {
  max-width: 1400px;
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

.same-height {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
