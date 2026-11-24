<template>
  <q-page class="bg-apicola flex flex-center text-center q-pa-md">
    <div class="panel-bienvenida shadow-4">
      <q-icon name="hive" size="100px" color="yellow-9" />
      <div class="text-h4 text-weight-bold q-mt-md text-grey-10">
        Sistema Autónomo Apícola
      </div>
      <p class="text-subtitle1 text-grey-8 q-mt-sm">
        Bienvenido al panel de control central. Selecciona el módulo de
        tu interés en el menú lateral para comenzar.
      </p>
      <q-btn
        color="primary"
        label="Ir a catálogo de cuentas"
        to="/planillas"
        class="q-mt-md"
        icon-right="arrow_forward"
      />
    </div>
  </q-page>
</template>

<script setup>
// Lógica de la página de inicio si la requieres
</script>
