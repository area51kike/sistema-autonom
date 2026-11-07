<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold text-primary q-mb-md">
      Sistema Autónomo de Costos Apícolas
    </div>
    <div class="text-subtitle1 text-grey-7 q-mb-lg">
      Gestión y clasificación de costos directos (Pre-cosecha, Cosecha, Post-cosecha) y Mano de Obra.
    </div>

    <div class="row q-col-gutter-md">
      <!-- Formulario de Registro de Insumos / Costos -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="shadow-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Registrar Costo de Operación</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="registrarCosto" class="q-gutter-md">
              <q-select
                v-model="form.etapa"
                :options="etapasProceso"
                label="Etapa del Manejo Apícola"
                outlined
                dense
                required
              />

              <q-input
                v-model="form.concepto"
                label="Concepto / Insumo (Ej: Thymol, Cera, Azúcar)"
                outlined
                dense
                required
              />

              <q-input
                v-model.number="form.monto"
                label="Monto Total ($)"
                type="number"
                step="0.01"
                outlined
                dense
                required
              />

              <q-input
                v-model="form.cuentaContable"
                label="Código Cuenta Catálogo (Ej: 4.1.02.01.01.03)"
                outlined
                dense
                required
              />

              <q-btn
                label="Registrar y Contabilizar"
                type="submit"
                color="primary"
                class="full-width"
                :loading="loading"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Historial de Costos Registrados -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="shadow-2">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Historial de Costos de Producción Apícola</div>
          </q-card-section>

          <q-card-section>
            <q-list bordered separator v-if="listaCostos.length > 0">
              <q-item v-for="(item, index) in listaCostos" :key="index">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ item.concepto }}</q-item-label>
                  <q-item-label caption>Cuenta: {{ item.cuentaContable }} | Etapa: {{ item.etapa }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="negative" class="text-subtitle2">${{ item.monto.toFixed(2) }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-else class="text-center text-grey-6 q-pa-lg">
              No hay costos registrados en esta sesión.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const listaCostos = ref([])

const etapasProceso = [
  'Manejo Pre-Cosecha',
  'Manejo Cosecha',
  'Manejo Post-Cosecha (Escasez de Néctar)',
  'Mano de Obra Apícola',
  'Costos Indirectos de Producción'
]

const form = ref({
  etapa: 'Manejo Pre-Cosecha',
  concepto: '',
  monto: null,
  cuentaContable: '4.1.02.01.01.03'
})

const registrarCosto = () => {
  loading.value = true
  setTimeout(() => {
    listaCostos.value.push({ ...form.value })
    $q.notify({
      color: 'positive',
      message: '¡Costo apícola registrado y vinculado al catálogo con éxito!',
      icon: 'check_circle'
    })
    form.value.concepto = ''
    form.value.monto = null
    loading.value = false
  }, 500)
}
</script>
