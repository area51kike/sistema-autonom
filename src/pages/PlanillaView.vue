<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold q-mb-md text-primary">
      Sistema Autónomo de Planillas - Sector Apícola
    </div>

    <div class="row q-col-gutter-md">
      <!-- Formulario -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="shadow-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Procesar Nueva Planilla</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="procesarPlanilla" class="q-gutter-md">
              <q-input v-model.number="form.idEmpleado" label="ID Empleado" type="number" outlined dense required />
              <q-input v-model="form.nombre" label="Nombre Colaborador" outlined dense required />
              <q-select v-model="form.tipoPersonal" :options="tiposPersonal" label="Tipo Personal" outlined dense required />
              <q-input v-model.number="form.salarioBase" label="Salario Base ($)" type="number" step="0.01" outlined dense required />
              <q-input v-model.number="form.dias" label="Días Trabajados (1-30)" type="number" min="1" max="30" outlined dense required />
              <q-input v-model.number="form.bonos" label="Bonificaciones ($)" type="number" step="0.01" outlined dense />

              <q-btn label="Calcular y Contabilizar" type="submit" color="primary" class="full-width" :loading="loading" />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Detalle e Impacto Contable -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="shadow-2" v-if="resultadoPlanilla">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Desglose de Planilla y Asiento Generado</div>
          </q-card-section>
          <q-card-section>
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Colaborador</q-item-label>
                  <q-item-label class="text-weight-medium">{{ resultadoPlanilla.nombreEmpleado }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="accent">{{ resultadoPlanilla.tipoPersonal }}</q-badge>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Deducción ISSS (3%)</q-item-label>
                  <q-item-label class="text-negative">-${{ resultadoPlanilla.isss }}</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Deducción AFP (7.25%)</q-item-label>
                  <q-item-label class="text-negative">-${{ resultadoPlanilla.afp }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Retención Renta</q-item-label>
                  <q-item-label class="text-negative">-${{ resultadoPlanilla.renta }}</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>ID Asiento Contable Generado</q-item-label>
                  <q-item-label class="text-weight-bold text-primary">#{{ resultadoPlanilla.idAsientoContable }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item class="bg-grey-2">
                <q-item-section>
                  <q-item-label class="text-h6 text-weight-bold">Salario Neto a Pagar</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-weight-bold text-positive">${{ resultadoPlanilla.salarioNeto }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        <q-card flat bordered class="shadow-2 flex flex-center text-grey-6 q-pa-xl" v-else>
          <div class="text-center">
            <q-icon name="receipt_long" size="64px" />
            <div class="text-subtitle1 q-mt-md">Completa los campos para procesar la nómina.</div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const loading = ref(false)
const resultadoPlanilla = ref(null)

const tiposPersonal = [
  'Personal de Operación / Apícola',
  'Personal Administrativo',
  'Personal de Ventas'
]

const form = ref({
  idEmpleado: null,
  nombre: '',
  tipoPersonal: 'Personal de Operación / Apícola',
  salarioBase: null,
  dias: 30,
  bonos: 0.00
})

const procesarPlanilla = async () => {
  loading.value = true
  try {
    const response = await axios.post('http://localhost:8080/api/planillas/procesar-autonoma', null, {
      params: {
        idEmpleado: form.value.idEmpleado,
        nombre: form.value.nombre,
        tipoPersonal: form.value.tipoPersonal,
        salarioBase: form.value.salarioBase,
        dias: form.value.dias,
        bonos: form.value.bonos
      }
    })
    resultadoPlanilla.value = response.data
    $q.notify({ color: 'positive', message: '¡Planilla procesada con éxito!', icon: 'check_circle' })
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error: ' + (error.response?.data || error.message) })
  } finally {
    loading.value = false
  }
}
</script>
