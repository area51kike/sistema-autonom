import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import routes from './routes.js'
import { sesion, iniciarSesion, esAdmin } from '../services/auth'

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  Router.beforeEach(async to => {
    if (!sesion.listo) await iniciarSesion()
    if (to.meta.publica) return sesion.user ? '/' : true
    if (!sesion.user) return '/login'
    if (to.meta.admin && !esAdmin.value) return '/'
    return true
  })

  return Router
})
