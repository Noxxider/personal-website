<template>
  <!-- Main page container -->
  <q-page class="flex flex-center">
    <!-- Container for the first section with full width and specific height -->
    <div
      class="q-pa-md row justify-center full-width responsive-landing-div-height"
    >
      <!-- Start of first column (text and button) -->
      <div
        class="my-section col-xs-12 col-sm-6 q-pa-md responsive-padding text-left"
      >
        <!-- Heading for the first section -->
        <div class="text-h3 text-weight-bold">Hello!</div>
        <!-- Subheading for the first section -->
        <div class="text-h4 q-my-md">
          I’m Vino, a fresh physics grad turned software developer
        </div>
        <!-- Button for the first section -->
        <q-btn
          label="My Resume"
          type="primary"
          class="full-width q-mt-xl shadow-1"
          style="max-width: 400px"
          no-caps
          padding="md xl"
          to="resume"
          color="accent"
          unelevated
        />
      </div>
      <!-- End of first column -->
      <!-- Start of second column (image) -->
      <div class="my-section col-xs-12 col-sm-6 flex flex-center">
        <!-- Logo image -->
        <img
          class="responsive-image"
          alt="Quasar logo"
          src="~assets/landing-one.jpg"
          fit="contain"
        />
      </div>
      <!-- End of second column -->
    </div>
    <!-- End of first section -->

    <!-- Start of second section (What We Do) -->
    <div
      class="full-width text-weight-medium second-section flex justify-center text-left items-center text-h4 text-standard responsive-padding"
      style="min-height: 20vh"
    >
      About Me
    </div>

    <!-- Full-width container for third section -->
    <div class="no-flex responsive-padding q-mx-auto">
      <!-- Container for third section content -->
      <div class="q-py-xl flex-column text-center" style="max-width: 700px">
        <!-- Heading for the third section -->
        <div class="text-h5 text-weight-medium">
          Blending Scientific Insight with Innovative Web Development
        </div>
        <!-- Description for the third section -->
        <div class="text-h6 q-my-md text-weight-regular">
          From delving into physics at UBCO to crafting innovative web
          solutions, my journey has been nothing short of exciting.<br /><br />With
          a knack for software development, I've honed my skills in Vue.js,
          Node.js, and more, spearheading projects and creating impactful
          digital solutions.
        </div>
      </div>
    </div>
    <!-- End of third section -->

    <div class="q-px-md q-pb-md row justify-center full-width">
      <!-- Start of first column (text and button) -->
      <div
        class="q-my-auto col-xs-12 col-sm-6 q-pa-md responsive-padding text-left"
      >
        <!-- Heading for the first section -->
        <div class="text-h5 text-weight-medium">Software Development</div>
        <!-- Subheading for the first section -->
        <div class="text-h6 q-mt-md text-weight-regular">
          <ul>
            <li>
              <b>Proficient in:</b> HTML, JavaScript, CSS, Java, Python, C# and
              SQL
            </li>
          </ul>
          <ul>
            <li>
              <b>Experienced in:</b> Vue, Node, .NET, Bootstrap and Android
              Development
            </li>
          </ul>
        </div>

        <div class="text-h5 text-weight-medium">Languages</div>
        <!-- Subheading for the first section -->
        <div class="text-h6 q-mt-md text-weight-regular">
          <ul>
            <li>
              English and Indonesian (Fluent), German (Proficient), French and
              Spanish (Intermediate)
            </li>
          </ul>
        </div>
        <!-- Button for the first section -->
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
      <!-- End of first column -->
      <!-- Start of second column (image) -->
      <div class="col-xs-12 col-sm-6 flex flex-center">
        <!-- Logo image -->
        <img
          class="responsive-image"
          alt="Quasar logo"
          src="~assets/landing-two.png"
          fit="contain"
        />
      </div>
      <!-- End of second column -->
    </div>

    <!-- Start of fourth section -->
    <div
      class="full-width no-flex responsive-padding q-mt-xl"
      ref="transformExperience"
      style="padding-top: 50px; margin-top: -50px"
    >
      <!-- Container for fourth section content -->
      <div class="q-py-xl flex-column text-left">
        <!-- Heading for the fourth section -->
        <div class="text-h4 text-weight-medium">Portfolio Snapshot</div>
        <!-- Description for the fourth section -->
        <div class="text-h6 q-mt-sm text-weight-regular">
          From developing scalable SaaS applications to enhancing customer
          engagement strategies, my portfolio shows my dedication and skills in
          the web development domain.
        </div>
      </div>
    </div>
    <!-- End of fourth section -->

    <!-- Start of row with 3 columns -->
    <div class="row justify-center responsive-padding same-height">
      <!-- Start of first column -->
      <div class="my-section-three col-12 col-md-4 responsive-padding-gallery">
        <!-- Image for the first column -->
        <q-img
          class="q-mt-lg q-mb-md"
          src="~assets/project-one.png"
          fit="contain"
          height="40vh"
        />
        <!-- Headline for the first column -->
        <div class="section-headline text-h5 text-left text-weight-medium">
          Rangouts
        </div>
        <!-- Content for the first column -->
        <div class="section-content text-h6 text-weight-regular">
          Revolutionizing communication with a scalable SaaS web application.<br /><br />Rangouts
          has a feed, a live map and ticket system for local event discovery.
        </div>
      </div>
      <!-- End of first column -->

      <!-- Start of second column -->
      <div class="my-section-three col-12 col-md-4 responsive-padding-gallery">
        <!-- Image for the second column -->
        <q-img
          class="q-mt-lg q-mb-md"
          src="~assets/project-two.png"
          fit="contain"
          height="40vh"
        />
        <!-- Headline for the second column -->
        <div class="section-headline text-h5 text-left text-weight-medium">
          Freelance at Parkbench
        </div>
        <!-- Content for the second column -->
        <div class="section-content text-h6 text-weight-regular">
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
          class="q-mt-lg q-mb-md"
          height="40vh"
          src="~assets/project-three.png"
          fit="contain"
        />
        <!-- Headline for the third column -->
        <div class="section-headline text-h5 text-left text-weight-medium">
          ZenuQR
        </div>
        <!-- Content for the third column -->
        <div class="section-content text-h6 text-weight-regular">
          Enhancing restaurant QR menu code analytics, customer engagement
          strategies and menu design.
        </div>
      </div>
      <!-- End of third column -->
    </div>
    <!-- End of row with 3 columns -->

    <!-- Start of section for right aligned button -->
    <div class="flex justify-end full-width">
      <q-btn
        label="My Resume"
        type="primary"
        class="q-my-xl shadow-1 responsive-margin-button"
        style="max-width: 350px; padding-left: 56px; padding-right: 56px"
        no-caps
        to="/resume"
        padding="md xl"
        color="accent"
        unelevated
      />
    </div>
    <!-- End of section for right aligned button -->

    <!-- Start of picture background div -->
    <div
      class="full-width flex justify-end items-center landingSinging"
    >
      <!-- Start of white box -->
      <div
        class="q-pa-lg responsive-margin"
        style="
          background-color: white;
          max-width: 600px;
          align-self: center;
          border-radius: 16px;
        "
      >
        <!-- Headline -->
        <div class="text-h4 text-weight-medium text-center">
          Personal Interests
        </div>
        <!-- Subheadline -->
        <div class="text-h6 q-my-md text-weight-regular">
          I'm not just about codes and algorithms; I'm also a singer, having
          sang acapella internationally. Music is a passion that resonates
          deeply with me.
        </div>
      </div>
      <!-- End of white box -->
    </div>
    <!-- End of picture background div -->

    <!-- Start of final section -->
    <div class="full-width no-flex responsive-padding q-my-lg">
      <!-- Container for final section content -->
      <div class="q-py-xl flex-column text-left" style="max-width: 1000px">
        <!-- Heading for the final section -->
        <div class="text-h4 text-weight-medium">
          I would love to join your team
        </div>
        <!-- Improved subheadline for the final section -->
        <div class="text-h6 text-weight-regular q-my-md">
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
          class="q-mt-lg shadow-1"
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
    <div class="footer-section flex text-white">
      <!-- Logo and company contact information -->
      <div class="footer-item q-pa-md responsive-margin-footer full-width">
        <div class="text-h5 text-weight-medium">Ravino Juwono</div>
        <div class="text-h6 text-weight-light q-mt-lg">
          <b>Email:</b>
          <a href="mailto:ravino.juwono@gmail.com" style="color: white"
            >ravino.juwono@gmail.com</a
          >
        </div>

        <div class="text-h6 text-weight-light q-mt-sm">
          <b>Phone:</b> 250-863-2454
        </div>
      </div>

      <!-- Company Column -->
      <div class="footer-item q-pa-md responsive-margin-footer full-width">
        <div class="text-h5 text-weight-medium">Links</div>
        <div class="text-h6 text-weight-light q-mt-lg">
          <a href="/resume" class="text-white">Resume</a> <br />
        </div>

        <div class="text-h6 text-weight-light q-mt-sm">
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
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",
});
</script>

<style scoped>
.full-height {
  height: calc(100vh - 56px);
}

.text-standard {
  color: #f7f7f7;
}
.second-section {
  background-color: #202030;
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
