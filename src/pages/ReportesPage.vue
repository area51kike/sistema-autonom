<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md">
        <div class="text-h4 text-weight-bold text-primary">
          Reportes Contables
        </div>
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
      <q-tab name="ajustada" label="Balanza ajustada" no-caps />
      <q-tab name="mayor" label="Libro mayor" no-caps />
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
              <td class="text-right">{{ r.neto > 0 ? fmt(r.neto) : "" }}</td>
              <td class="text-right">{{ r.neto < 0 ? fmt(-r.neto) : "" }}</td>
            </tr>
            <tr v-if="!balanza.length">
              <td colspan="6" class="text-center text-grey-6">
                Sin movimientos en el periodo
              </td>
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
              ? "La balanza cuadra: debe = haber"
              : "La balanza NO cuadra"
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
              <td class="text-right">
                {{ l.monto !== undefined ? money(l.monto) : "" }}
              </td>
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
              ? "Utilidad del periodo"
              : "Pérdida del periodo"
          }}:
          <b>{{ money(estado.utilidad) }}</b>
        </q-banner>
      </q-tab-panel>

      <!-- BALANCE GENERAL -->
      <q-tab-panel name="balance" class="q-pa-none q-pt-md">
        <div class="text-caption text-grey-7 q-mb-sm">
          Acumulado al {{ hasta || "la fecha" }}
        </div>
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
              <td class="text-right">
                {{ l.monto !== undefined ? money(l.monto) : "" }}
              </td>
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
              ? "Activo = Pasivo + Patrimonio"
              : "El balance NO cuadra"
          }}
        </q-banner>
      </q-tab-panel>

      <!-- BALANZA AJUSTADA -->
      <!-- BALANZA AJUSTADA -->
      <q-tab-panel name="ajustada" class="q-pa-none q-pt-md">
        <q-markup-table flat bordered dense>
          <thead>
            <tr>
              <th rowspan="2" class="text-left">Código</th>
              <th rowspan="2" class="text-left">Cuenta</th>
              <th colspan="2" class="text-center">Sin ajustar</th>
              <th colspan="2" class="text-center">Ajustes</th>
              <th colspan="2" class="text-center">Ajustada</th>
            </tr>
            <tr>
              <th class="text-right">Debe</th>
              <th class="text-right">Haber</th>
              <th class="text-right">Debe</th>
              <th class="text-right">Haber</th>
              <th class="text-right">Debe</th>
              <th class="text-right">Haber</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in hoja"
              :key="r.id_cuenta"
              :class="{ 'bg-orange-1': saldoContrario(r) }"
            >
              <td class="text-left">{{ r.codigo }}</td>
              <td class="text-left">
                {{ r.nombre }}
                <q-icon
                  v-if="saldoContrario(r)"
                  name="warning"
                  color="warning"
                  size="xs"
                >
                  <q-tooltip>Saldo contrario a su naturaleza</q-tooltip>
                </q-icon>
              </td>
              <td class="text-right">{{ deudor(r.netoSA) }}</td>
              <td class="text-right">{{ acreedor(r.netoSA) }}</td>
              <td class="text-right">{{ r.ajDebe ? fmt(r.ajDebe) : "" }}</td>
              <td class="text-right">{{ r.ajHaber ? fmt(r.ajHaber) : "" }}</td>
              <td class="text-right">{{ deudor(r.neto) }}</td>
              <td class="text-right">{{ acreedor(r.neto) }}</td>
            </tr>
            <tr v-if="!hoja.length">
              <td colspan="8" class="text-center text-grey-6">
                Sin movimientos en el periodo
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="text-weight-bold bg-grey-2">
              <td colspan="2" class="text-right">TOTALES</td>
              <td class="text-right">{{ fmt(totHoja.saD) }}</td>
              <td class="text-right">{{ fmt(totHoja.saH) }}</td>
              <td class="text-right">{{ fmt(totHoja.ajD) }}</td>
              <td class="text-right">{{ fmt(totHoja.ajH) }}</td>
              <td class="text-right">{{ fmt(totHoja.adD) }}</td>
              <td class="text-right">{{ fmt(totHoja.adH) }}</td>
            </tr>
          </tfoot>
        </q-markup-table>

        <q-banner
          dense
          rounded
          class="q-mt-md text-white"
          :class="hojaCuadra ? 'bg-positive' : 'bg-negative'"
        >
          {{
            hojaCuadra ? "La balanza ajustada cuadra" : "La balanza NO cuadra"
          }}
          <div v-if="!hojaCuadra && pistaDescuadre" class="text-caption">
            {{ pistaDescuadre }}
          </div>
        </q-banner>

        <q-banner
          v-if="cuentasContrarias.length"
          dense
          rounded
          class="q-mt-sm bg-orange-2"
        >
          {{ cuentasContrarias.length }} cuenta(s) con saldo contrario a su
          naturaleza (posible asiento invertido).
        </q-banner>
      </q-tab-panel>

      <!-- LIBRO MAYOR -->
      <q-tab-panel name="mayor" class="q-pa-none q-pt-md">
        <q-select
          v-model="cuentaSel"
          :options="opcionesFiltradas"
          label="Cuenta"
          outlined
          dense
          use-input
          input-debounce="0"
          @filter="filtrarCuentas"
          class="q-mb-md"
          style="max-width: 480px"
        />

        <q-markup-table v-if="cuentaSel" flat bordered dense>
          <thead>
            <tr>
              <th class="text-left">Fecha</th>
              <th class="text-left">Asiento</th>
              <th class="text-left">Concepto</th>
              <th class="text-right">Debe</th>
              <th class="text-right">Haber</th>
              <th class="text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-grey-2 text-weight-bold">
              <td colspan="5" class="text-right">Saldo inicial</td>
              <td class="text-right">{{ money(saldoInicial) }}</td>
            </tr>
            <tr v-for="(m, i) in mayor.filas" :key="i">
              <td class="text-left">{{ m.fecha }}</td>
              <td class="text-left">#{{ m.numero }}</td>
              <td class="text-left">{{ m.concepto }}</td>
              <td class="text-right">{{ m.debe ? fmt(m.debe) : "" }}</td>
              <td class="text-right">{{ m.haber ? fmt(m.haber) : "" }}</td>
              <td class="text-right">{{ money(m.saldo) }}</td>
            </tr>
            <tr v-if="!mayor.filas.length">
              <td colspan="6" class="text-center text-grey-6">
                Sin movimientos en el periodo
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="text-weight-bold bg-grey-2">
              <td colspan="3" class="text-right">TOTALES</td>
              <td class="text-right">{{ fmt(mayor.totDebe) }}</td>
              <td class="text-right">{{ fmt(mayor.totHaber) }}</td>
              <td class="text-right">{{ money(mayor.saldoFinal) }}</td>
            </tr>
          </tfoot>
        </q-markup-table>

        <div v-else class="text-grey-6">
          Seleccione una cuenta para ver su mayor.
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { obtenerSaldos, obtenerMovimientos } from "../services/reportes";

const $q = useQuasar();
const tab = ref("balanza");
const desde = ref(null);
const hasta = ref(new Date().toLocaleDateString("en-CA"));
const detalle = ref(false);
const cargando = ref(false);
const periodo = ref([]); // desde..hasta (balanza y resultados)
const acumulado = ref([]); // inicio..hasta (balance general)
const sinAjustar = ref([]);
const soloAjustes = ref([]);

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const money = (n) => (n < 0 ? "-$" : "$") + fmt(Math.abs(n));
const cent = (n) => Math.round(n * 100);
const tot = (datos, cod) => datos.find((r) => r.codigo === cod)?.saldo ?? 0;

/*async function cargar() {
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
}*/

async function cargar() {
  cargando.value = true;
  try {
    const base = { desde: desde.value || null, hasta: hasta.value || null };
    const [p, a, sa, aj] = await Promise.all([
      obtenerSaldos(base), // ajustada (todo)
      obtenerSaldos({ desde: null, hasta: base.hasta }),
      obtenerSaldos({ ...base, ajustes: "excluir" }), // sin ajustar
      obtenerSaldos({ ...base, ajustes: "solo" }), // solo ajustes
    ]);
    periodo.value = p;
    acumulado.value = a;
    sinAjustar.value = sa;
    soloAjustes.value = aj;
  } catch (e) {
    $q.notify({
      type: "negative",
      message: "No se pudieron cargar los reportes: " + e.message,
    });
  } finally {
    cargando.value = false;
  }
}

watch([desde, hasta], cargar);
onMounted(cargar);

// ---------- Balanza ----------

const balanza = computed(() =>
  periodo.value
    .filter((r) => !r.es_titulo && (r.debe !== 0 || r.haber !== 0))
    .map((r) => ({ ...r, neto: r.debe - r.haber })),
);

const totBalanza = computed(() =>
  balanza.value.reduce(
    (t, r) => ({
      debe: t.debe + r.debe,
      haber: t.haber + r.haber,
      deudor: t.deudor + (r.neto > 0 ? r.neto : 0),
      acreedor: t.acreedor + (r.neto < 0 ? -r.neto : 0),
    }),
    { debe: 0, haber: 0, deudor: 0, acreedor: 0 },
  ),
);

const balanzaCuadra = computed(
  () =>
    cent(totBalanza.value.debe) === cent(totBalanza.value.haber) &&
    cent(totBalanza.value.deudor) === cent(totBalanza.value.acreedor),
);

// ---------- Balanza ajustada ----------
const idx = (arr) => new Map(arr.map((r) => [r.id_cuenta, r]));
const deudor = (n) => (n > 0 ? fmt(n) : "");
const acreedor = (n) => (n < 0 ? fmt(-n) : "");
const saldoContrario = (r) =>
  (r.naturaleza === "Deudor" && r.neto < 0) ||
  (r.naturaleza === "Acreedor" && r.neto > 0);

const hoja = computed(() => {
  const sa = idx(sinAjustar.value);
  const aj = idx(soloAjustes.value);
  return periodo.value
    .filter((r) => !r.es_titulo && (r.debe !== 0 || r.haber !== 0))
    .map((r) => {
      const s = sa.get(r.id_cuenta);
      const a = aj.get(r.id_cuenta);
      return {
        ...r,
        neto: r.debe - r.haber, // ajustada
        netoSA: s ? s.debe - s.haber : 0, // sin ajustar
        ajDebe: a?.debe ?? 0,
        ajHaber: a?.haber ?? 0,
      };
    });
});

const totHoja = computed(() =>
  hoja.value.reduce(
    (t, r) => ({
      saD: t.saD + (r.netoSA > 0 ? r.netoSA : 0),
      saH: t.saH + (r.netoSA < 0 ? -r.netoSA : 0),
      ajD: t.ajD + r.ajDebe,
      ajH: t.ajH + r.ajHaber,
      adD: t.adD + (r.neto > 0 ? r.neto : 0),
      adH: t.adH + (r.neto < 0 ? -r.neto : 0),
    }),
    { saD: 0, saH: 0, ajD: 0, ajH: 0, adD: 0, adH: 0 },
  ),
);

const hojaCuadra = computed(
  () =>
    cent(totHoja.value.saD) === cent(totHoja.value.saH) &&
    cent(totHoja.value.ajD) === cent(totHoja.value.ajH) &&
    cent(totHoja.value.adD) === cent(totHoja.value.adH),
);

const pistaDescuadre = computed(() => {
  const d = Math.abs(cent(totHoja.value.adD) - cent(totHoja.value.adH));
  if (!d) return "";
  if (d % 9 === 0)
    return "La diferencia es divisible entre 9: busque una cifra traspuesta.";
  if (d % 100 === 0)
    return "Diferencia redonda: probablemente un asiento incompleto.";
  return "Revise el traspaso de los ajustes al Mayor.";
});

const cuentasContrarias = computed(() => hoja.value.filter(saldoContrario));

// ---------- Secciones de estados financieros ----------
// Las cuentas con naturaleza contraria al grupo (depreciación, devoluciones...) restan.
function seccion(datos, grupo, titulo, natGrupo) {
  const filas = datos.filter(
    (r) =>
      r.codigo.split(".")[0] === grupo &&
      r.nivel >= 3 &&
      (detalle.value || r.nivel === 3) &&
      (r.debe !== 0 || r.haber !== 0),
  );
  return [
    { tipo: "titulo", texto: titulo },
    ...filas.map((r) => ({
      tipo: r.es_titulo ? "subtitulo" : "fila",
      codigo: r.codigo,
      texto: r.nombre,
      nivel: r.nivel,
      monto: r.naturaleza === natGrupo ? r.saldo : -r.saldo,
    })),
  ];
}

const estado = computed(() => {
  const d = periodo.value;
  const ingresos = tot(d, "5");
  const costos = tot(d, "4");
  return {
    lineas: [
      ...seccion(d, "5", "INGRESOS", "Acreedor"),
      { tipo: "total", texto: "TOTAL INGRESOS", monto: ingresos },
      ...seccion(d, "4", "COSTOS Y GASTOS", "Deudor"),
      { tipo: "total", texto: "TOTAL COSTOS Y GASTOS", monto: costos },
    ],
    utilidad: ingresos - costos,
  };
});

const balance = computed(() => {
  const d = acumulado.value;
  const activo = tot(d, "1");
  const pasivo = tot(d, "2");
  const patrimonio = tot(d, "3");
  const resultado = tot(d, "5") - tot(d, "4"); // resultado aún sin cerrar
  const pasivoPatrimonio = pasivo + patrimonio + resultado;
  return {
    lineas: [
      ...seccion(d, "1", "ACTIVO", "Deudor"),
      { tipo: "total", texto: "TOTAL ACTIVO", monto: activo },
      ...seccion(d, "2", "PASIVO", "Acreedor"),
      { tipo: "total", texto: "TOTAL PASIVO", monto: pasivo },
      ...seccion(d, "3", "PATRIMONIO", "Acreedor"),
      {
        tipo: "fila",
        texto: "Resultado del ejercicio (sin cerrar)",
        nivel: 3,
        monto: resultado,
      },
      {
        tipo: "total",
        texto: "TOTAL PATRIMONIO",
        monto: patrimonio + resultado,
      },
      {
        tipo: "total",
        texto: "TOTAL PASIVO + PATRIMONIO",
        monto: pasivoPatrimonio,
      },
    ],
    cuadra: cent(activo) === cent(pasivoPatrimonio),
  };
});

function claseLinea(l) {
  if (l.tipo === "titulo") return "bg-grey-3 text-weight-bold";
  if (l.tipo === "total") return "bg-grey-2 text-weight-bold";
  if (l.tipo === "subtitulo") return "text-weight-bold";
  return "";
}

function estiloLinea(l) {
  const nivel = l.nivel ?? 1;
  return { paddingLeft: `${Math.max(nivel - 1, 0) * 16 + 8}px` };
}

// ---------- Libro mayor ----------
const cuentaSel = ref(null)
const movimientos = ref([])
const saldoInicial = ref(0)
const filtroCuenta = ref('')

const opcionesCuentas = computed(() =>
  acumulado.value
    .filter(r => !r.es_titulo)
    .map(r => ({
      label: `${r.codigo} - ${r.nombre}`,
      value: r.id_cuenta,
      naturaleza: r.naturaleza
    }))
)

const opcionesFiltradas = computed(() => {
  const q = filtroCuenta.value.toLowerCase()
  return opcionesCuentas.value.filter(o => o.label.toLowerCase().includes(q))
})

function filtrarCuentas(val, update) {
  update(() => {
    filtroCuenta.value = val
  })
}

function diaAnterior(fecha) {
  const d = new Date(fecha + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA')
}

async function cargarMayor() {
  if (!cuentaSel.value) return
  const { value: idCuenta, naturaleza } = cuentaSel.value
  try {
    movimientos.value = await obtenerMovimientos({
      idCuenta,
      desde: desde.value || null,
      hasta: hasta.value || null
    })
    // Saldo inicial = lo acumulado hasta el día anterior a "desde"
    if (desde.value) {
      const previos = await obtenerSaldos({
        desde: null,
        hasta: diaAnterior(desde.value)
      })
      const f = previos.find(r => r.id_cuenta === idCuenta)
      saldoInicial.value = !f
        ? 0
        : naturaleza === 'Deudor'
          ? f.debe - f.haber
          : f.haber - f.debe
    } else {
      saldoInicial.value = 0
    }
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el mayor: ' + e.message
    })
  }
}

watch(cuentaSel, cargarMayor)
watch([desde, hasta], cargarMayor)

const mayor = computed(() => {
  const nat = cuentaSel.value?.naturaleza
  let saldo = saldoInicial.value
  let totDebe = 0
  let totHaber = 0
  const filas = movimientos.value.map(m => {
    totDebe += m.debe
    totHaber += m.haber
    saldo += nat === 'Deudor' ? m.debe - m.haber : m.haber - m.debe
    return { ...m, saldo }
  })
  return { filas, totDebe, totHaber, saldoFinal: saldo }
})

</script>
