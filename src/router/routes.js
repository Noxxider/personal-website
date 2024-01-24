
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/resume', component: () => import('pages/Resume.vue') },
      { path: '/contact', component: () => import('pages/Contact.vue')},
      { path: '/surprise', component: () => import('pages/Surprise.vue')},
      { path: '/weighttracker', component: () => import('pages/BodyweightTracker.vue')},
      { path: '/dentaltechnician', component: () => import('pages/DentalAnatomy.vue')},
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
