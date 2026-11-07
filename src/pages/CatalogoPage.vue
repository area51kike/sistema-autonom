<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold text-primary q-mb-md">Catálogo de Cuentas - Sector Apícola</div>
    <p class="text-subtitle1 text-grey-7">Estructura jerárquica orientada a NIIF para PYMES aplicada a la apicultura.</p>

    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <q-list separator>
          <q-item v-for="cta in cuentasApicolas" :key="cta.codigo">
            <q-item-section avatar>
              <q-badge :color="getColorBadge(cta.codigo)">{{ cta.codigo }}</q-badge>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ cta.nombre }}</q-item-label>
              <q-item-label caption>Naturaleza: {{ cta.naturaleza }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const cuentasApicolas = ref([
  { codigo: '1.1.01', nombre: 'EFECTIVO Y EQUIVALENTES (Caja y Bancos)', naturaleza: 'Deudor' },
  { codigo: '1.1.02.03.03', nombre: 'ANTICIPO A EMPLEADOS (Personal Apícola)', naturaleza: 'Deudor' },
  { codigo: '1.1.04.01', nombre: 'INVENTARIO PRODUCTOS APÍCOLAS (Miel, Polen, Cera)', naturaleza: 'Deudor' },
  { codigo: '1.2.03.01', nombre: 'ACTIVOS BIOLÓGICOS (Colmenas)', naturaleza: 'Deudor' },
  { codigo: '2.1.03.01', nombre: 'RETENCIONES LABORALES (ISSS, AFP por pagar)', naturaleza: 'Acreedor' },
  { codigo: '2.1.02.03', nombre: 'CUENTA DE IMPUESTO SOBRE LA RENTA', naturaleza: 'Acreedor' },
  { codigo: '4.1.02.01.04.01', nombre: 'MANO DE OBRA APÍCOLA (Costos Directos)', naturaleza: 'Deudor' },
  { codigo: '5.1.01.01', nombre: 'VENTAS DE MIEL Y DERIVADOS', naturaleza: 'Acreedor' }
])

const getColorBadge = (codigo) => {
  if (codigo.startsWith('1')) return 'primary'
  if (codigo.startsWith('2')) return 'orange'
  if (codigo.startsWith('4')) return 'negative'
  return 'positive'
}
</script>
