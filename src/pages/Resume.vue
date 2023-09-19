<template>
  <div class="resume-container">
    <!-- Header Section -->
    <div class="resume-header">
      <h1>RAVINO JUWONO</h1>
      <p>ravino.juwono@gmail.com | 250-863-2454 | <a href="https://www.linkedin.com/in/ravinojuwono" target="_blank">LinkedIn Profile</a></p>
    </div>

    <!-- Objective Section -->
    <div class="resume-section">
      <h2>OBJECTIVE</h2>
      <p>A recent physics graduate from the University of British Columbia with experience in software and web development.</p>
    </div>

    <!-- Professional Experience Section -->
    <div class="resume-section">
      <h2>PROFESSIONAL EXPERIENCE</h2>
      <div class="resume-job">
        <h3>Project Developer, ZenuQR</h3>
        <p>July 2023 - Present</p>
        <p>Spearheading a project to enhance restaurant QR menu code analytics and customer engagement strategies utilizing Vue, Node, and PostgreSQL.</p>
      </div>
      <div class="resume-job">
        <h3>Freelance Developer, ParkBench</h3>
        <p>July 2023 - September 2023</p>
        <p>Consulted directly with CEO and Lead Developer to develop a web application identifying top Instagram accounts in specified locations, integrating a web scraper and Vue.js.</p>
      </div>
      <div class="resume-job">
        <h3>Software Developer/Co-Creator, Rangouts</h3>
        <p>October 2020 to May 2023</p>
        <p>Co-founded and developed a scalable SaaS web application, with aspects ranging from front-end development (Vue.js, HTML5, CSS) to backend integration (Node, PostgreSQL). Integrated PayPal Payment API, facilitating financial transactions on the platform. Utilized AWS through Docker on Linux for cloud computing and deployment.</p>
      </div>
      <div class="resume-job">
        <h3>Full Stack Developer Intern, Maybank Indonesia</h3>
        <p>Jakarta, Indonesia – July 2020 to October 2020</p>
        <p>Developed a news feature for the MyNET HR app, enhancing communication for over 8000 employees during the COVID pandemic. Developed new SQL queries and C# .NET endpoints, utilizing Microsoft Azure DevOps for version control and deployment.</p>
      </div>
    </div>

    <!-- Academic Projects Section -->
    <div class="resume-section">
      <h2>ACADEMIC PROJECTS</h2>
      <div class="resume-project">
        <h3>Course Project, Stellar Astrophysics Models using Python</h3>
        <p>PHYS 321 Course, December 2021</p>
        <p>Created a Python simulation model of a star, honing technical design skills. Authored an academic paper highlighting the project findings and methodology.</p>
      </div>
    </div>

    <!-- Certifications Section -->
    <div class="resume-section">
      <h2>CERTIFICATIONS</h2>
      <p>JavaScript Algorithms and Data Structures Certification - freeCodeCamp</p>
    </div>

    <!-- Education Section -->
    <div class="resume-section">
      <h2>EDUCATION</h2>
      <div class="resume-education">
        <h3>BSc, Physics, University of British Columbia</h3>
        <p>September 2019 – May 2023</p>
        <p>Acquired a strong foundation in software development through courses in Java, SQL, Python, and data structures. Developed analytical skills through studies in probability theory and statistics.</p>
      </div>
    </div>

    <!-- Volunteer Section -->
    <div class="resume-section">
      <h2>VOLUNTEER</h2>
      <div class="resume-volunteer">
        <h3>Breast Cancer Canada - Kelowna PRO Representative</h3>
        <p>August 2023 – Present</p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ResumePage",
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
}}

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
