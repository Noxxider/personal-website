<template class="layout">
  <q-page class="flex flex-center">
    <!-- Header Section -->
    <div class="q-mx-md" style="max-width: 700px">
      <!-- Dental Anatomy and Terminology Section -->
      <h4 class="text-weight-medium text-center q-mb-none q-mt-xl">
        Understanding Dental Anatomy and Terminology
      </h4>
        <div class="q-mt-sm text-weight-regular">
        <h6 class="text-weight-medium q-mb-xs q-mt-lg">Dental Anatomy and Terminology</h6>
    <p>
      Dental anatomy and terminology are essential in the field of dental
      technology. They help people understand the structure, function,
      and conditions of teeth and surrounding tissues.
    </p>

    <h6 class="text-weight-medium q-mb-xs q-mt-lg">Basic Dental Anatomy</h6>
<p>
  <b>Teeth Incisors</b>: Front teeth used for cutting food. 
  <br/><b>Canines (Cuspids)</b>: Pointed teeth for tearing and grasping food. 
  <br/><b>Premolars</b>: Flat-surfaced teeth behind canines for crushing and grinding. 
  <br/><b>Molars</b>: Back teeth with large surfaces for grinding. Wisdom teeth also fall in this category.
</p>

<h6 class="text-weight-medium q-mb-xs q-mt-lg">Parts of a Tooth</h6>
<p>
   <b>Crown</b>: Visible part above the gum line. 
  <br/><b>Root</b>: Embedded part in the jawbone. 
  <br/><b>Enamel</b>: Hard, outer surface layer. 
  <br/><b>Dentin</b>: Layer beneath enamel, softer. If exposed, can cause sensitivity to ice cream.
  <br/><b>Pulp</b>: Soft center with nerves and blood vessels.
</p>

<h6 class="text-weight-medium q-mb-xs q-mt-lg">Dental Arches</h6>
<p>
  <b>Maxillary Arch</b>: Upper jaw. 
  <br/><b>Mandibular Arch</b>: Lower jaw. 
  <br/><b>Occlusion</b>: Alignment and contact of upper and lower teeth when mouth is closed. If your occlusion is off, some dentists will say 'your bite is off'
</p>

<h6 class="text-weight-medium q-mb-xs q-mt-lg">Tooth Numbering Systems</h6>
<p>
  The tooth numbering system is how dentists
  refer to specific teeth. The most common systems are the Universal
  Numbering System, the Palmer Notation Method, and the FDI World Dental
  Federation notation.
  <ul>
    <li><b>Universal Numbering System:</b> Used primarily in the United States, it numbers teeth from 1 to 32 for permanent teeth, and A to T for baby teeth.</li>
    <li><b>Palmer Notation Method:</b> Often used by orthodontists, it assigns a number (1-8) and a quadrant symbol to each tooth.</li>
    <li><b>FDI Notation:</b> Internationally recognized, it uses a two-digit system where the first number indicates the quadrant and the second the tooth within that quadrant. The quadrant number goes from 1 to 4, going clockwise from the top right</li>
  </ul>
</p>

<h6 class="text-weight-medium q-mb-xs q-mt-lg">Common Dental Conditions</h6>
<p>
  <b>Caries</b>: Tooth decay or cavities. 
  <br/><b>Periodontal</b>: Pertaining to gums and supporting structures. 
  <br/><b>Endodontic</b>: Related to dental pulp and root canal treatments. Inside the teeth
  <br/><b>Prosthodontics</b>: Dental prostheses field.
  <br/><b>Orthodontics</b>: Correction of teeth and jaw alignment. 
  
  <br/><b>Impacted Teeth</b>: Teeth not erupted properly. Like wisdom tooth!
  <br/><b>Plaque</b>: Bacteria and sugar film on teeth. 
  <br/><b>Tartar</b>: Hardened plaque leading to periodontal disease.
</p>

<h6 class="text-weight-medium q-mb-xs q-mt-lg">Dental Products and Services</h6>
<p>
  <b>Dental Prostheses</b>: Includes crowns (caps for damaged teeth), bridges (false teeth held by neighboring teeth), and dentures (removable replacements for missing teeth).
  <br/><b>Orthodontic Appliances</b>: Comprises braces (for correcting teeth and jaw alignment) and aligners (clear, removable teeth straightening devices).
  <br/><b>Dental Implants</b>: Artificial tooth roots used for replacing missing teeth, providing a foundation for fixed or removable teeth.
  <br/><b>Veneers</b>: Thin covers placed over teeth to improve appearance, addressing issues like discoloration and chips.
  <br/><b>Dental Restorations</b>: Includes fillings (for cavities), inlays, and onlays (less extensive alternatives to crowns).
  <br/><b>Custom Mouthguards</b>: Protective devices covering teeth and gums to prevent injuries, used in sports and for teeth grinding.
</p>

<h6 class="text-weight-medium q-mb-xs q-mt-lg">Dental Technology Integration</h6>
<p>
  <b>3D Imaging</b>: Advanced visualization of dental structures. 
  <br/><b>CAD/CAM</b>: Computer-aided design and manufacturing for precise restorations or builds, such as Invisalign
</p>
<h6 class="text-weight-medium q-mb-xs q-mt-lg">Contact Information</h6>
        <!-- Email -->
        <div class="flex q-mt-sm" style="max-width: 550px">
          <svg
            class="q-my-auto"
            style="fill: #262626"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
          >
            <!-- Your SVG paths, shapes, etc. go here -->
            <path
              d="M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm340-308q5 0 8.5-1.5t7.5-3.5l314-205q5-3 7.5-8t2.5-11q0-13-11.5-20.5t-23.5.5L480-522 176-717q-12-8-24-1t-12 20q0 6 3 11.5t7 8.5l314 205q4 2 7.5 3.5t8.5 1.5Z"
            />
          </svg>

          <div
            class="q-my-auto custom-paragraph q-mx-md text-weight-regular"
            ref="email"
          >
            <a href="mailto:ravino.juwono@gmail.com">ravino.juwono@gmail.com</a>
          </div>

          <q-btn
            :ripple="false"
            @click="copyToClipboard('email')"
            class="q-ml-auto"
            flat
            icon="content_copy"
          />
        </div>

 
      </div>

      <!-- Existing Contact Information Section -->
      <!-- Keep your existing contact information code here -->
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "DentalPage",
  methods: {
    async copyToClipboard(refName) {
      try {
        const textToCopy = this.$refs[refName].innerText;
        await navigator.clipboard.writeText(textToCopy);
        this.$q.notify({ type: "positive", message: "Copied!" });
      } catch (err) {
        console.error("Failed to copy text: ", err);
        this.$q.notify({ type: "negative", message: "Failed to copy!" });
      }
    },
  },
});
</script>

