<template>
  <q-page class="flex flex-center text-center">
    <div>
      <q-icon name="hive" size="100px" color="amber-8" />
      <div class="text-h4 text-weight-bold q-mt-md"
        >Sistema Autónomo Apícola</div
      >
      <p class="text-subtitle1 text-grey-7 q-mt-sm">
        Bienvenido al panel de control central. Selecciona el módulo de
        planillas en el menú lateral para comenzar.
      </p>
      <q-btn
        color="primary"
        label="Ir a Planillas"
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
