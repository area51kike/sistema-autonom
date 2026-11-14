const routes = [
  {
    path: '/login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { publica: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      {
        path: 'planillas',
        component: () => import('@/pages/PlanillaView.vue')
      },
      { path: 'catalogo', component: () => import('@/pages/CatalogoPage.vue') },
      { path: 'asientos', component: () => import('@/pages/AsientosPage.vue') },
      { path: 'reportes', component: () => import('@/pages/ReportesPage.vue') },
      { path: 'costos', component: () => import('@/pages/CostosPage.vue') },
      {
        path: 'bitacora',
        component: () => import('@/pages/BitacoraPage.vue'),
        meta: { admin: true }
      },
      { path: 'second', component: () => import('@/pages/SecondPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
  }
]

export default routes
