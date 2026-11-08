<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold q-mb-md text-primary">
      Planilla y Salarios - Sector Apícola
    </div>

    <div class="row q-col-gutter-md">
      <!-- Formulario -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="shadow-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Procesar planilla</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="procesar" class="q-gutter-md">
              <q-input
                v-model="form.fecha"
                type="date"
                label="Fecha de pago"
                outlined
                dense
              />
              <q-input
                v-model="form.nombre"
                label="Nombre del colaborador"
                outlined
                dense
                :rules="[v => !!v || 'Requerido']"
              />
              <q-select
                v-model="form.tipoPersonal"
                :options="tiposPersonal"
                label="Tipo de personal"
                outlined
                dense
              />
              <q-input
                v-model.number="form.salarioBase"
                label="Salario mensual base ($)"
                type="number"
                step="0.01"
                min="0"
                outlined
                dense
                :rules="[v => v > 0 || 'Debe ser mayor a 0']"
              />
              <q-input
                v-model.number="form.dias"
                label="Días trabajados (1-30)"
                type="number"
                min="1"
                max="30"
                outlined
                dense
                :rules="[v => (v >= 1 && v <= 30) || 'Entre 1 y 30']"
              />
              <q-input
                v-model.number="form.bonos"
                label="Bonificaciones ($)"
                type="number"
                step="0.01"
                min="0"
                outlined
                dense
              />
              <q-btn
                label="Calcular y contabilizar"
                type="submit"
                color="primary"
                class="full-width"
                no-caps
                :loading="loading"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Resultado -->
      <div class="col-12 col-md-7">
        <q-card v-if="resultado" flat bordered class="shadow-2">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Desglose y asiento generado</div>
          </q-card-section>
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label caption>Colaborador</q-item-label>
                <q-item-label class="text-weight-medium">{{
                  resultado.nombre_empleado
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="accent">{{ resultado.tipo_personal }}</q-badge>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption
                  >Devengado ({{ resultado.dias }} días + bonos)</q-item-label
                >
                <q-item-label class="text-weight-bold">{{
                  money(resultado.devengado)
                }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Asiento contable</q-item-label>
                <q-item-label class="text-weight-bold text-primary"
                  >#{{ resultado.id_asiento }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>ISSS (3%)</q-item-label>
                <q-item-label class="text-negative"
                  >-{{ money(resultado.isss) }}</q-item-label
                >
              </q-item-section>
              <q-item-section>
                <q-item-label caption>AFP (7.25%)</q-item-label>
                <q-item-label class="text-negative"
                  >-{{ money(resultado.afp) }}</q-item-label
                >
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Retención de renta</q-item-label>
                <q-item-label class="text-negative"
                  >-{{ money(resultado.renta) }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>ISSS patronal (7.5%)</q-item-label>
                <q-item-label>{{
                  money(resultado.isss_patronal)
                }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label caption>AFP patronal (7.75%)</q-item-label>
                <q-item-label>{{ money(resultado.afp_patronal) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="bg-grey-2">
              <q-item-section>
                <q-item-label class="text-h6 text-weight-bold"
                  >Salario neto a pagar</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-h6 text-weight-bold text-positive">
                  {{ money(resultado.salario_neto) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
        <q-card
          v-else
          flat
          bordered
          class="shadow-2 flex flex-center text-grey-6 q-pa-xl"
        >
          <div class="text-center">
            <q-icon name="receipt_long" size="64px" />
            <div class="text-subtitle1 q-mt-md"
              >Completa los campos para procesar la planilla.</div
            >
          </div>
        </q-card>
      </div>
    </div>

    <!-- Historial -->
    <q-table
      class="q-mt-lg"
      flat
      bordered
      dense
      title="Planillas procesadas"
      :rows="historial"
      :columns="columnas"
      row-key="id_planilla"
      :rows-per-page-options="[10, 20]"
      no-data-label="Aún no hay planillas"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { procesarPlanilla, listarPlanillas } from '../services/planilla'

const $q = useQuasar()
const loading = ref(false)
const resultado = ref(null)
const historial = ref([])

const tiposPersonal = [
  'Personal de Operación / Apícola',
  'Personal Administrativo',
  'Personal de Ventas'
]

const hoy = () => new Date().toLocaleDateString('en-CA')
const money = n =>
  '$' +
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

const form = ref({
  fecha: hoy(),
  nombre: '',
  tipoPersonal: 'Personal de Operación / Apícola',
  salarioBase: null,
  dias: 30,
  bonos: 0
})

const columnas = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  {
    name: 'nombre',
    label: 'Colaborador',
    field: 'nombre_empleado',
    align: 'left'
  },
  { name: 'tipo', label: 'Tipo', field: 'tipo_personal', align: 'left' },
  {
    name: 'devengado',
    label: 'Devengado',
    field: r => money(r.devengado),
    align: 'right'
  },
  {
    name: 'neto',
    label: 'Neto',
    field: r => money(r.salario_neto),
    align: 'right'
  },
  {
    name: 'asiento',
    label: 'Asiento',
    field: r => '#' + r.id_asiento,
    align: 'right'
  }
]

async function cargarHistorial() {
  try {
    historial.value = await listarPlanillas()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el historial: ' + e.message
    })
  }
}

async function procesar() {
  loading.value = true
  try {
    resultado.value = await procesarPlanilla(form.value)
    $q.notify({
      type: 'positive',
      message: 'Planilla procesada y contabilizada'
    })
    form.value.nombre = ''
    form.value.salarioBase = null
    form.value.bonos = 0
    await cargarHistorial()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    loading.value = false
  }
}

onMounted(cargarHistorial)
</script>
