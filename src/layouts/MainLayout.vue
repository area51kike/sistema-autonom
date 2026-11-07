<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          Sistema Contable Autónomo - Mago Kike 🐝✨
        </q-toolbar-title>
        <div>UES OCC - Sistemas</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Módulos del Sistema</q-item-label>

        <q-item clickable v-ripple to="/" exact>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section><q-item-label>Inicio / Panel</q-item-label></q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/planillas">
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section>
            <q-item-label>Planilla y Salarios</q-item-label>
            <q-item-label caption>ISSS, AFP, Renta automática</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/catalogo">
          <q-item-section avatar><q-icon name="account_balance" /></q-item-section>
          <q-item-section>
            <q-item-label>Catálogo de Cuentas</q-item-label>
            <q-item-label caption>Sector Apícola (NIIF PyMES)</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/costos">
          <q-item-section avatar><q-icon name="hive" /></q-item-section>
          <q-item-section>
            <q-item-label>Costos de Producción</q-item-label>
            <q-item-label caption>Pre-cosecha y Cosecha</q-item-label>
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
import { ref } from 'vue'
const leftDrawerOpen = ref(false)
function toggleLeftDrawer () { leftDrawerOpen.value = !leftDrawerOpen.value }
</script>
