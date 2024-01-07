<template>
  <!-- Main page container -->
  <q-page class="flex flex-center">
    <!-- Container for the first section with full width and specific height -->
    <!-- Section 1: Introduction with image and text -->
    <div class="full-width landingFirst flex flex-center">
      <div
        class="q-pa-md row justify-center responsive-landing-div-height"
        style="max-width: 1400px"
      >
        <div
          class="my-section col-xs-12 col-sm-6 q-pa-md responsive-padding text-left"
        >
          <div class="text-h2 text-weight-medium">Hello!</div>
          <div class="text-h5 q-my-md">
            I’m Vino, a physics grad turned software developer
          </div>
          <q-btn
            label="My Resume"
            type="primary"
            class="full-width q-mt-md shadow-1"
            style="max-width: 400px"
            no-caps
            padding="md xl"
            to="resume"
            color="accent"
            unelevated
          />
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
      class="text-weight-regular flex justify-center text-center items-center responsive-padding q-mt-xl"
      style="
        max-width: 1400px;
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
      class="responsive-padding q-mx-auto q-mt-sm q-pb-xl flex-column text-center"
      style="width: 100%; max-width: 1400px"
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
    <div class="q-px-md q-pb-md row justify-center" style="max-width: 1400px">
      <div
        class="q-my-auto col-xs-12 col-sm-6 q-pa-md responsive-padding text-left"
      >
        <div class="text-h6 text-weight-medium">
          Coming Soon: Body Weight Tracker App
        </div>
        <div class="custom-paragraph q-mt-md text-weight-regular">
          <p>
            Just paste a string of numbers or upload your data on this site to
            see your weight trend graph and key stats.
          </p>
        </div>

        <div class="text-h6 text-weight-medium">Spoken Languages</div>
        <div class="custom-paragraph q-mt-md text-weight-regular">
          <ul>
            <li>English and Indonesian (Fluent)</li>
            <li>German (Proficient)</li>
            <li>French and Spanish (Intermediate)</li>
          </ul>
        </div>
        <q-btn
          label="My Resume"
          type="primary"
          class="full-width q-mt-lg q-mb-md shadow-1"
          style="max-width: 400px"
          no-caps
          to="/resume"
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
      class="row justify-center responsive-padding"
      style="width: 100%; max-width: 1400px; margin: auto"
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
      class="row justify-center responsive-padding same-height"
      style="max-width: 1400px; margin-left: auto; margin-right: auto"
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
      <div class="q-mx-auto flex justify-center" style="max-width: 1400px">
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
    <div class="row responsive-padding q-my-lg" style="max-width: 1400px">
      <div class="q-py-xl text-center" style="max-width: 1000px">
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
          class="q-mt-sm shadow-1"
          style="max-width: 350px; padding-left: 56px; padding-right: 56px"
          no-caps
          to="/resume"
          padding="md xl"
          color="accent"
          unelevated
        />
      </div>
    </div>
    <!-- End of final section -->

    <!-- Start of footer section -->
    <div class="footer-background full-width">
      <div class="footer-section flex text-white">
        <div class="footer-item q-px-md q-py-xl q-my-auto">
          <div class="custom-paragraph text-weight-medium">Ravino Juwono</div>
          <div class="custom-paragraph text-weight-light q-mt-sm">
            <a href="mailto:ravino.juwono@gmail.com" style="color: white"
              >ravino.juwono@gmail.com</a
            >
          </div>

          <div class="custom-paragraph text-weight-light q-mt-sm">
            250-863-2454
          </div>
        </div>

        <div class="footer-item q-px-md q-py-xl q-my-auto">
          <div class="custom-paragraph text-weight-medium">Links</div>
          <div class="custom-paragraph text-weight-light q-mt-sm">
            <a href="/resume" class="text-white">Resume</a> <br />
          </div>

          <div class="custom-paragraph text-weight-light q-mt-sm">
            <a
              href="https://www.linkedin.com/in/ravinojuwono"
              target="_blank"
              class="text-white"
              >Linkedin</a
            >
          </div>
        </div>
      </div>
      <!-- End of footer section -->
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { Vue3Marquee } from "vue3-marquee";

export default defineComponent({
  name: "IndexPage",
  components: { Vue3Marquee },
  data() {
    return {
      techIcons: [
        { src: "~assets/carousel/android.svg", alt: "Android" },
        { src: "~assets/carousel/aws.svg", alt: "AWS" },
        { src: "~assets/carousel/azure.svg", alt: "Azure" },
        { src: "~assets/carousel/bootstrap.svg", alt: "Bootstrap" },
        { src: "~assets/carousel/csharp.svg", alt: "C#" },
        { src: "~assets/carousel/css.svg", alt: "CSS" },
        { src: "~assets/carousel/docker.svg", alt: "Docker" },
        { src: "~assets/carousel/figma.svg", alt: "Figma" },
        { src: "src/assets/carousel/html5.svg", alt: "HTML5" },
        { src: "src/assets/carousel/ionic.svg", alt: "Ionic" },
        { src: "src/assets/carousel/java.svg", alt: "Java" },
        { src: "src/assets/carousel/js.svg", alt: "JavaScript" },
        { src: "src/assets/carousel/mongodb.svg", alt: "MongoDB" },
        { src: "src/assets/carousel/mysql.svg", alt: "MySQL" },
        { src: "src/assets/carousel/nodejs.svg", alt: "Node.js" },
        { src: "src/assets/carousel/postgresql.svg", alt: "PostgreSQL" },
        { src: "src/assets/carousel/pwa.svg", alt: "PWA" },
        { src: "src/assets/carousel/python.svg", alt: "Python" },
        { src: "src/assets/carousel/react.svg", alt: "React" },
        { src: "src/assets/carousel/typescript.svg", alt: "TypeScript" },
        // Keep the Vue entry as is, since it works
        { src: "src/assets/carousel/vue.svg", alt: "Vue" },
      ],
    };
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
