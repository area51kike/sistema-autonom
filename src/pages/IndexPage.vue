<template>
  <q-page class="bg-apicola flex flex-center text-center q-pa-md">
    <div class="panel-bienvenida shadow-4">
      <q-icon name="hive" size="100px" color="yellow-9" />
      <div class="text-h4 text-weight-bold q-mt-md text-grey-10">
        Sistema Autónomo Apícola
      </div>
      <p class="text-subtitle1 text-grey-8 q-mt-sm">
        Bienvenido al panel de control central. Seleccione el módulo de
        su interés en el menú lateral para comenzar.
      </p>
      <q-btn
        color="primary"
        label="Ir a catálogo de cuentas"
        to="/catalogo"
        class="q-mt-md"
        icon-right="arrow_forward"
      />
    </div>
  </q-page>
</template>

<script setup>
// Lógica de la página de inicio si la requieres
</script>
