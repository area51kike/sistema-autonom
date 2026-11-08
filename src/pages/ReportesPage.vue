<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md">
        <div class="text-h4 text-weight-bold text-primary"
          >Reportes Contables</div
        >
      </div>
      <div class="col-6 col-md-2">
        <q-input
          v-model="desde"
          type="date"
          label="Desde"
          outlined
          dense
          clearable
        />
      </div>
      <div class="col-6 col-md-2">
        <q-input v-model="hasta" type="date" label="Hasta" outlined dense />
      </div>
      <div class="col-12 col-md-auto">
        <q-toggle v-model="detalle" label="Ver detalle" />
        <q-btn
          flat
          icon="refresh"
          label="Actualizar"
          no-caps
          color="primary"
          :loading="cargando"
          @click="cargar"
        />
      </div>
    </div>

    <q-tabs
      v-model="tab"
      align="left"
      dense
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="balanza" label="Balanza de comprobación" no-caps />
      <q-tab name="resultados" label="Estado de resultados" no-caps />
      <q-tab name="balance" label="Balance general" no-caps />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- BALANZA -->
      <q-tab-panel name="balanza" class="q-pa-none q-pt-md">
        <q-markup-table flat bordered dense>
          <thead>
            <tr>
              <th class="text-left">Código</th>
              <th class="text-left">Cuenta</th>
              <th class="text-right">Debe</th>
              <th class="text-right">Haber</th>
              <th class="text-right">Saldo deudor</th>
              <th class="text-right">Saldo acreedor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in balanza" :key="r.id_cuenta">
              <td class="text-left">{{ r.codigo }}</td>
              <td class="text-left">{{ r.nombre }}</td>
              <td class="text-right">{{ fmt(r.debe) }}</td>
              <td class="text-right">{{ fmt(r.haber) }}</td>
              <td class="text-right">{{ r.neto > 0 ? fmt(r.neto) : '' }}</td>
              <td class="text-right">{{ r.neto < 0 ? fmt(-r.neto) : '' }}</td>
            </tr>
            <tr v-if="!balanza.length">
              <td colspan="6" class="text-center text-grey-6"
                >Sin movimientos en el periodo</td
              >
            </tr>
          </tbody>
          <tfoot>
            <tr class="text-weight-bold bg-grey-2">
              <td colspan="2" class="text-right">TOTALES</td>
              <td class="text-right">{{ fmt(totBalanza.debe) }}</td>
              <td class="text-right">{{ fmt(totBalanza.haber) }}</td>
              <td class="text-right">{{ fmt(totBalanza.deudor) }}</td>
              <td class="text-right">{{ fmt(totBalanza.acreedor) }}</td>
            </tr>
          </tfoot>
        </q-markup-table>
        <q-banner
          dense
          rounded
          class="q-mt-md text-white"
          :class="balanzaCuadra ? 'bg-positive' : 'bg-negative'"
        >
          {{
            balanzaCuadra
              ? 'La balanza cuadra: debe = haber'
              : 'La balanza NO cuadra'
          }}
        </q-banner>
      </q-tab-panel>

      <!-- ESTADO DE RESULTADOS -->
      <q-tab-panel name="resultados" class="q-pa-none q-pt-md">
        <q-markup-table flat bordered dense>
          <tbody>
            <tr v-for="(l, i) in estado.lineas" :key="i" :class="claseLinea(l)">
              <td class="text-left" :style="estiloLinea(l)">
                <span v-if="l.codigo" class="text-grey-6 q-mr-sm">{{
                  l.codigo
                }}</span>
                {{ l.texto }}
              </td>
              <td class="text-right">{{
                l.monto !== undefined ? money(l.monto) : ''
              }}</td>
            </tr>
          </tbody>
        </q-markup-table>
        <q-banner
          dense
          rounded
          class="q-mt-md text-white text-subtitle1"
          :class="estado.utilidad >= 0 ? 'bg-positive' : 'bg-negative'"
        >
          {{
            estado.utilidad >= 0
              ? 'Utilidad del periodo'
              : 'Pérdida del periodo'
          }}:
          <b>{{ money(estado.utilidad) }}</b>
        </q-banner>
      </q-tab-panel>

      <!-- BALANCE GENERAL -->
      <q-tab-panel name="balance" class="q-pa-none q-pt-md">
        <div class="text-caption text-grey-7 q-mb-sm"
          >Acumulado al {{ hasta || 'la fecha' }}</div
        >
        <q-markup-table flat bordered dense>
          <tbody>
            <tr
              v-for="(l, i) in balance.lineas"
              :key="i"
              :class="claseLinea(l)"
            >
              <td class="text-left" :style="estiloLinea(l)">
                <span v-if="l.codigo" class="text-grey-6 q-mr-sm">{{
                  l.codigo
                }}</span>
                {{ l.texto }}
              </td>
              <td class="text-right">{{
                l.monto !== undefined ? money(l.monto) : ''
              }}</td>
            </tr>
          </tbody>
        </q-markup-table>
        <q-banner
          dense
          rounded
          class="q-mt-md text-white"
          :class="balance.cuadra ? 'bg-positive' : 'bg-negative'"
        >
          {{
            balance.cuadra
              ? 'Activo = Pasivo + Patrimonio'
              : 'El balance NO cuadra'
          }}
        </q-banner>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { obtenerSaldos } from '../services/reportes'

const $q = useQuasar()
const tab = ref('balanza')
const desde = ref(null)
const hasta = ref(new Date().toLocaleDateString('en-CA'))
const detalle = ref(false)
const cargando = ref(false)
const periodo = ref([]) // desde..hasta (balanza y resultados)
const acumulado = ref([]) // inicio..hasta (balance general)

const fmt = n =>
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
const money = n => (n < 0 ? '-$' : '$') + fmt(Math.abs(n))
const cent = n => Math.round(n * 100)
const tot = (datos, cod) => datos.find(r => r.codigo === cod)?.saldo ?? 0

async function cargar() {
  cargando.value = true
  try {
    const [p, a] = await Promise.all([
      obtenerSaldos({ desde: desde.value || null, hasta: hasta.value || null }),
      obtenerSaldos({ desde: null, hasta: hasta.value || null })
    ])
    periodo.value = p
    acumulado.value = a
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los reportes: ' + e.message
    })
  } finally {
    cargando.value = false
  }
}

watch([desde, hasta], cargar)
onMounted(cargar)

// ---------- Balanza ----------
const balanza = computed(() =>
  periodo.value
    .filter(r => !r.es_titulo && (r.debe !== 0 || r.haber !== 0))
    .map(r => ({ ...r, neto: r.debe - r.haber }))
)

const totBalanza = computed(() =>
  balanza.value.reduce(
    (t, r) => ({
      debe: t.debe + r.debe,
      haber: t.haber + r.haber,
      deudor: t.deudor + (r.neto > 0 ? r.neto : 0),
      acreedor: t.acreedor + (r.neto < 0 ? -r.neto : 0)
    }),
    { debe: 0, haber: 0, deudor: 0, acreedor: 0 }
  )
)

const balanzaCuadra = computed(
  () =>
    cent(totBalanza.value.debe) === cent(totBalanza.value.haber) &&
    cent(totBalanza.value.deudor) === cent(totBalanza.value.acreedor)
)

// ---------- Secciones de estados financieros ----------
// Las cuentas con naturaleza contraria al grupo (depreciación, devoluciones...) restan.
function seccion(datos, grupo, titulo, natGrupo) {
  const filas = datos.filter(
    r =>
      r.codigo.split('.')[0] === grupo &&
      r.nivel >= 3 &&
      (detalle.value || r.nivel === 3) &&
      (r.debe !== 0 || r.haber !== 0)
  )
  return [
    { tipo: 'titulo', texto: titulo },
    ...filas.map(r => ({
      tipo: r.es_titulo ? 'subtitulo' : 'fila',
      codigo: r.codigo,
      texto: r.nombre,
      nivel: r.nivel,
      monto: r.naturaleza === natGrupo ? r.saldo : -r.saldo
    }))
  ]
}

const estado = computed(() => {
  const d = periodo.value
  const ingresos = tot(d, '5')
  const costos = tot(d, '4')
  return {
    lineas: [
      ...seccion(d, '5', 'INGRESOS', 'Acreedor'),
      { tipo: 'total', texto: 'TOTAL INGRESOS', monto: ingresos },
      ...seccion(d, '4', 'COSTOS Y GASTOS', 'Deudor'),
      { tipo: 'total', texto: 'TOTAL COSTOS Y GASTOS', monto: costos }
    ],
    utilidad: ingresos - costos
  }
})

const balance = computed(() => {
  const d = acumulado.value
  const activo = tot(d, '1')
  const pasivo = tot(d, '2')
  const patrimonio = tot(d, '3')
  const resultado = tot(d, '5') - tot(d, '4') // resultado aún sin cerrar
  const pasivoPatrimonio = pasivo + patrimonio + resultado
  return {
    lineas: [
      ...seccion(d, '1', 'ACTIVO', 'Deudor'),
      { tipo: 'total', texto: 'TOTAL ACTIVO', monto: activo },
      ...seccion(d, '2', 'PASIVO', 'Acreedor'),
      { tipo: 'total', texto: 'TOTAL PASIVO', monto: pasivo },
      ...seccion(d, '3', 'PATRIMONIO', 'Acreedor'),
      {
        tipo: 'fila',
        texto: 'Resultado del ejercicio (sin cerrar)',
        nivel: 3,
        monto: resultado
      },
      {
        tipo: 'total',
        texto: 'TOTAL PATRIMONIO',
        monto: patrimonio + resultado
      },
      {
        tipo: 'total',
        texto: 'TOTAL PASIVO + PATRIMONIO',
        monto: pasivoPatrimonio
      }
    ],
    cuadra: cent(activo) === cent(pasivoPatrimonio)
  }
})

function claseLinea(l) {
  if (l.tipo === 'titulo') return 'bg-grey-3 text-weight-bold'
  if (l.tipo === 'total') return 'bg-grey-2 text-weight-bold'
  if (l.tipo === 'subtitulo') return 'text-weight-bold'
  return ''
}
function estiloLinea(l) {
  return l.nivel ? { paddingLeft: 16 + (l.nivel - 3) * 16 + 'px' } : {}
}
</script>
