<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold text-primary q-mb-xs">
      Costos de Producción Apícola
    </div>
    <div class="text-subtitle1 text-grey-7 q-mb-lg">
      Cada costo registrado genera su asiento contable.
    </div>

    <div class="row q-col-gutter-md">
      <!-- Formulario -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="shadow-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Registrar costo de operación</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="registrar" class="q-gutter-md">
              <q-input
                v-model="form.fecha"
                type="date"
                label="Fecha"
                outlined
                dense
              />

              <q-select
                v-model="form.etapa"
                :options="etapas"
                label="Etapa del manejo apícola"
                emit-value
                map-options
                outlined
                dense
                @update:model-value="alCambiarEtapa"
              />

              <q-select
                v-model="form.cuenta"
                :options="opcionesCuenta"
                label="Cuenta de costo"
                emit-value
                map-options
                outlined
                dense
                :rules="[v => !!v || 'Elige la cuenta']"
              />

              <q-input
                v-model="form.concepto"
                label="Detalle (Ej: Thymol 5 frascos)"
                outlined
                dense
                :rules="[v => !!v || 'Requerido']"
              />

              <q-input
                v-model.number="form.monto"
                label="Monto sin IVA ($)"
                type="number"
                step="0.01"
                min="0"
                outlined
                dense
                :rules="[v => v > 0 || 'Debe ser mayor a 0']"
              />

              <q-toggle
                v-model="form.conIva"
                label="Incluye IVA 13% (crédito fiscal)"
                :disable="!etapaActual.iva"
              />

              <q-select
                v-model="form.pago"
                :options="formasPago"
                label="Forma de pago"
                emit-value
                map-options
                outlined
                dense
              />

              <div class="text-subtitle2 q-pa-sm bg-grey-2 rounded-borders">
                Subtotal {{ money(subtotal) }} · IVA {{ money(iva) }} ·
                <b>Total {{ money(total) }}</b>
              </div>

              <q-btn
                label="Registrar y contabilizar"
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

      <!-- Historial -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="shadow-2">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Costos registrados</div>
          </q-card-section>
          <q-list bordered separator v-if="historial.length">
            <q-item v-for="a in historial" :key="a.id_asiento">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{
                  a.descripcion
                }}</q-item-label>
                <q-item-label caption
                  >{{ a.fecha }} · Asiento #{{ a.id_asiento }}</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-badge color="negative" class="text-subtitle2">
                  {{ money(totalAsiento(a)) }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-center text-grey-6 q-pa-lg"
            >Aún no hay costos registrados.</div
          >
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { listarCuentas } from '../services/catalogo'
import { registrarAsiento, listarAsientos } from '../services/asientos'

const $q = useQuasar()
const loading = ref(false)
const cuentas = ref([])
const historial = ref([])

const etapas = [
  { label: 'Manejo Pre-Cosecha', value: '4.1.02.01.01.', iva: true },
  { label: 'Manejo Cosecha', value: '4.1.02.01.02.', iva: true },
  {
    label: 'Manejo Post-Cosecha (Escasez de Néctar)',
    value: '4.1.02.01.03.',
    iva: true
  },
  { label: 'Mano de Obra Apícola', value: '4.1.02.01.04.', iva: false },
  {
    label: 'Costos Indirectos de Producción',
    value: '4.1.02.02.01.',
    iva: true
  }
]

const formasPago = [
  { label: 'Contado (Caja General)', value: '1.1.01.01' },
  { label: 'Crédito (Proveedores locales)', value: '2.1.01.01' }
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
  etapa: etapas[0].value,
  cuenta: null,
  concepto: '',
  monto: null,
  conIva: true,
  pago: '1.1.01.01'
})

const etapaActual = computed(() =>
  etapas.find(e => e.value === form.value.etapa)
)

const opcionesCuenta = computed(() =>
  cuentas.value
    .filter(c => c.codigo.startsWith(form.value.etapa))
    .map(c => ({ label: `${c.codigo} · ${c.nombre}`, value: c.id_cuenta }))
)

const subtotal = computed(
  () => Math.round((Number(form.value.monto) || 0) * 100) / 100
)
const iva = computed(() =>
  form.value.conIva && etapaActual.value.iva
    ? Math.round(subtotal.value * 13) / 100
    : 0
)
const total = computed(
  () => Math.round((subtotal.value + iva.value) * 100) / 100
)

const idPorCodigo = codigo =>
  cuentas.value.find(c => c.codigo === codigo)?.id_cuenta
const totalAsiento = a =>
  a.detalle_asiento.reduce((s, d) => s + (d.debe || 0), 0)

function alCambiarEtapa() {
  form.value.cuenta = null
  form.value.conIva = etapaActual.value.iva
}

async function cargarHistorial() {
  try {
    historial.value = await listarAsientos(15, 'Costo')
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el historial: ' + e.message
    })
  }
}

async function registrar() {
  const idIva = idPorCodigo('1.1.12.01')
  const idPago = idPorCodigo(form.value.pago)
  if (!idPago || (iva.value > 0 && !idIva)) {
    $q.notify({
      type: 'negative',
      message: 'Faltan cuentas en el catálogo (caja, proveedores o IVA)'
    })
    return
  }

  const detalles = [
    { id_cuenta: form.value.cuenta, debe: subtotal.value, haber: 0 }
  ]
  if (iva.value > 0)
    detalles.push({ id_cuenta: idIva, debe: iva.value, haber: 0 })
  detalles.push({ id_cuenta: idPago, debe: 0, haber: total.value })

  loading.value = true
  try {
    const id = await registrarAsiento({
      fecha: form.value.fecha,
      descripcion: `Costo apícola: ${form.value.concepto}`,
      tipo: 'Costo',
      detalles
    })
    $q.notify({
      type: 'positive',
      message: `Costo contabilizado en el asiento #${id}`
    })
    form.value.concepto = ''
    form.value.monto = null
    form.value.cuenta = null
    await cargarHistorial()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    cuentas.value = await listarCuentas()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el catálogo: ' + e.message
    })
  }
  await cargarHistorial()
})
</script>
