
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Landing.vue') },
      //{ path: '/resume', component: () => import('pages/ResumePDF.vue') },
      //{ path: '/contact', component: () => import('pages/Contact.vue')},
      { path: '/surprise', component: () => import('pages/Surprise.vue')},
      { path: '/weighttracker', component: () => import('pages/BodyweightTracker.vue')},
      { path: '/tapbpm', component: () => import('pages/BPMCounter.vue')},
      { path: '/dentaltechnician', component: () => import('pages/DentalAnatomy.vue')},
      { path: '/jobprobation', component: () => import('pages/ProbationTracker.vue')},
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

