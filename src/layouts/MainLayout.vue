<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="q-py-sm" style="min-height: 68px">
        <q-btn
          flat
          dense
          round
          icon="menu"
          size="lg"
          aria-label="Menú"
          @click="drawer = !drawer"
        />
        <q-toolbar-title
          class="row items-center text-weight-medium"
          style="font-size: 26px"
        >
          <span>Sistema Contable Autónomo</span>
          <q-icon name="mdi-bee-flower" size="50px" class="q-ml-sm" />
        </q-toolbar-title>


        <div class="q-mr-md gt-xs" style="font-size: 16px">
          <q-icon name="mdi-account-circle" size="30px" class="q-ml-sm" />
          {{ sesion.perfil?.email }}
          <q-badge
            :color="esAdmin ? 'secondary' : 'secondary'"
            :label="sesion.perfil?.rol"
            class="q-ml-xs text-subtitle1"
          />
        </div>

        <q-btn
          flat
          dense
          icon="logout"
          label="Salir"
          size="md"
          no-caps
          @click="salir"
        />
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
          <q-item-section avatar><q-icon :name="m.icono" size="30px"/></q-item-section>
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { sesion, esAdmin, logout } from "../services/auth";

const router = useRouter();
const drawer = ref(false);

const modulos = [
  { to: "/", exact: true, icono: "mdi-home-account", titulo: "Inicio / Panel" },
  {
    to: "/catalogo",
    icono: "mdi-file-document-multiple",
    titulo: "Catálogo de Cuentas",
    detalle: "Sector Apícola (NIIF PyMES)",
  },
  {
    to: "/asientos",
    icono: "mdi-book-open",
    titulo: "Libro Diario",
    detalle: "Asientos de partida doble",
  },
  {
    to: "/reportes",
    icono: "mdi-file-chart",
    titulo: "Reportes",
    detalle: "Balanza, resultados y balance",
  },
  {
    to: "/planillas",
    icono: "mdi-account-cash",
    titulo: "Planilla y Salarios",
    detalle: "ISSS, AFP, Renta automática",
  },
  {
    to: "/costos",
    icono: "mdi-beehive-outline",
    titulo: "Costos de Producción",
    detalle: "Pre-cosecha y Cosecha",
  },
  {
    to: "/bitacora",
    icono: "history",
    titulo: "Bitácora de cambios",
    detalle: "Solo administrador",
    admin: true,
  },
];

const modulosVisibles = computed(() =>
  modulos.filter((m) => !m.admin || esAdmin.value),
);

async function salir() {
  await logout();
  router.replace("/login");
}
</script>
