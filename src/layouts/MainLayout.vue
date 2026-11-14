<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menú"
          @click="drawer = !drawer"
        />
        <q-toolbar-title>Sistema Contable Autónomo 🐝✨</q-toolbar-title>
        <div class="q-mr-md gt-xs">
          {{ sesion.perfil?.email }}
          <q-badge
            :color="esAdmin ? 'amber-8' : 'teal'"
            :label="sesion.perfil?.rol"
            class="q-ml-xs"
          />
        </div>
        <q-btn flat dense icon="logout" label="Salir" no-caps @click="salir" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered>
      <q-list>
        <q-item-label header>Módulos del Sistema</q-item-label>
        <q-item
          v-for="m in modulosVisibles"
          :key="m.to"
          clickable
          v-ripple
          :to="m.to"
          :exact="m.exact"
        >
          <q-item-section avatar><q-icon :name="m.icono" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ m.titulo }}</q-item-label>
            <q-item-label v-if="m.detalle" caption>{{
              m.detalle
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sesion, esAdmin, logout } from '../services/auth'

const router = useRouter()
const drawer = ref(false)

const modulos = [
  { to: '/', exact: true, icono: 'home', titulo: 'Inicio / Panel' },
  {
    to: '/catalogo',
    icono: 'account_balance',
    titulo: 'Catálogo de Cuentas',
    detalle: 'Sector Apícola (NIIF PyMES)'
  },
  {
    to: '/asientos',
    icono: 'menu_book',
    titulo: 'Libro Diario',
    detalle: 'Asientos de partida doble'
  },
  {
    to: '/reportes',
    icono: 'assessment',
    titulo: 'Reportes',
    detalle: 'Balanza, resultados y balance'
  },
  {
    to: '/planillas',
    icono: 'receipt_long',
    titulo: 'Planilla y Salarios',
    detalle: 'ISSS, AFP, Renta automática'
  },
  {
    to: '/costos',
    icono: 'hive',
    titulo: 'Costos de Producción',
    detalle: 'Pre-cosecha y Cosecha'
  },
  {
    to: '/bitacora',
    icono: 'history',
    titulo: 'Bitácora de cambios',
    detalle: 'Solo administrador',
    admin: true
  }
]

const modulosVisibles = computed(() =>
  modulos.filter(m => !m.admin || esAdmin.value)
)

async function salir() {
  await logout()
  router.replace('/login')
}
</script>
