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
            <div v-if="esAdmin" class="row q-gutter-sm q-mb-md">
              <q-btn
                outline
                color="primary"
                icon="person_add"
                label="Nuevo colaborador"
                no-caps
                @click="dlgColab = true"
              />
              <q-btn
                outline
                color="orange-9"
                icon="payments"
                label="Asignar deuda"
                no-caps
                @click="dlgDeuda = true"
              />
            </div>
            <q-form @submit.prevent="procesar" class="q-gutter-md">
              <q-input
                v-model="form.fecha"
                type="date"
                label="Fecha de pago"
                outlined
                dense
              />
              <q-select
                v-model="form.nombre"
                :options="opcionesColab"
                option-label="nombre"
                option-value="nombre"
                emit-value
                map-options
                use-input
                input-debounce="0"
                @filter="filtrarColab"
                @update:model-value="alElegir"
                label="Colaborador"
                outlined
                dense
                :rules="[(v) => !!v || 'Seleccione un colaborador']"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey"
                      >Sin resultados</q-item-section
                    >
                  </q-item>
                </template>
              </q-select>
              <q-banner
                v-if="deuda.total > 0"
                dense
                rounded
                class="bg-orange-2 text-orange-10"
              >
                <template #avatar>
                  <q-icon name="warning" color="orange-10" />
                </template>
                Este colaborador tiene una deuda pendiente de
                <b>{{ money(deuda.total) }}</b>
                <div
                  v-for="d in deuda.items"
                  :key="d.id_deuda"
                  class="text-caption"
                >
                  • {{ d.concepto || "Sin concepto" }}: {{ money(d.saldo) }}
                </div>
              </q-banner>
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
                :rules="[(v) => v > 0 || 'Debe ser mayor a 0']"
              />
              <q-input
                v-model.number="form.dias"
                label="Días trabajados (1-30)"
                type="number"
                min="1"
                max="30"
                outlined
                dense
                :rules="[(v) => (v >= 1 && v <= 30) || 'Entre 1 y 30']"
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
              <q-input
                v-if="deuda.total > 0"
                v-model.number="form.descuentoDeuda"
                label="Descontar deuda de esta planilla ($)"
                type="number"
                step="0.01"
                min="0"
                :max="deuda.total"
                outlined
                dense
                hint="Máximo: lo que debe"
                :rules="[
                  (v) => v <= deuda.total || 'No puede superar la deuda',
                ]"
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
            <q-item v-if="resultado.descuento_deuda > 0">
              <q-item-section>
                <q-item-label caption>Descuento por deuda</q-item-label>
                <q-item-label class="text-negative">
                  -{{ money(resultado.descuento_deuda) }}
                </q-item-label>
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
            <div class="text-subtitle1 q-mt-md">
              Completa los campos para procesar la planilla.
            </div>
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
    <!-- Nuevo colaborador (solo admin) -->
    <q-dialog v-model="dlgColab" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Nuevo colaborador</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="nuevoColab.nombre"
            label="Nombre completo"
            outlined
            dense
            autofocus
          />
          <q-select
            v-model="nuevoColab.tipoPersonal"
            :options="tiposPersonal"
            label="Tipo de personal"
            outlined
            dense
          />
          <q-input
            v-model.number="nuevoColab.salarioBase"
            label="Salario mensual base ($)"
            type="number"
            step="0.01"
            min="0"
            outlined
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn
            color="primary"
            label="Guardar"
            no-caps
            :loading="guardando"
            @click="guardarColab"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Asignar deuda (solo admin) -->
    <q-dialog v-model="dlgDeuda" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Asignar deuda</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="nuevaDeuda.nombre"
            :options="colaboradores"
            option-label="nombre"
            option-value="nombre"
            emit-value
            map-options
            label="Colaborador"
            outlined
            dense
          />
          <q-input
            v-model="nuevaDeuda.concepto"
            label="Concepto (ej. Anticipo de salario)"
            outlined
            dense
          />
          <q-input
            v-model.number="nuevaDeuda.monto"
            label="Monto ($)"
            type="number"
            step="0.01"
            min="0"
            outlined
            dense
          />
          <q-input
            v-model="nuevaDeuda.fecha"
            type="date"
            label="Fecha"
            outlined
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn
            color="orange-9"
            label="Guardar"
            no-caps
            :loading="guardando"
            @click="guardarDeuda"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import {
  procesarPlanilla,
  listarPlanillas,
  obtenerDeuda,
} from "../services/planilla";
import { esAdmin } from "../services/auth";
import {
  listarColaboradores,
  crearColaborador,
  asignarDeuda,
} from "../services/colaboradores";

const $q = useQuasar();
const loading = ref(false);
const resultado = ref(null);
const historial = ref([]);

const tiposPersonal = [
  "Personal de Operación / Apícola",
  "Personal Administrativo",
  "Personal de Ventas",
];

const hoy = () => new Date().toLocaleDateString("en-CA");
const money = (n) =>
  "$" +
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const form = ref({
  fecha: hoy(),
  nombre: "",
  tipoPersonal: "Personal de Operación / Apícola",
  salarioBase: null,
  dias: 30,
  bonos: 0,
  descuentoDeuda: 0,
});

const deuda = ref({ items: [], total: 0 });

let timerDeuda = null;
watch(
  () => form.value.nombre,
  (nombre) => {
    clearTimeout(timerDeuda);
    if (!nombre || nombre.trim().length < 3) {
      deuda.value = { items: [], total: 0 };
      form.value.descuentoDeuda = 0;
      return;
    }
    timerDeuda = setTimeout(async () => {
      try {
        deuda.value = await obtenerDeuda(nombre);
        form.value.descuentoDeuda = 0;
      } catch (e) {
        console.error(e);
      }
    }, 400);
  },
);

const colaboradores = ref([]);
const opcionesColab = ref([]);
const dlgColab = ref(false);
const dlgDeuda = ref(false);
const guardando = ref(false);

const nuevoColab = ref({
  nombre: "",
  tipoPersonal: "Personal de Operación / Apícola",
  salarioBase: null,
});
const nuevaDeuda = ref({
  nombre: null,
  concepto: "",
  monto: null,
  fecha: hoy(),
});

async function cargarColaboradores() {
  try {
    colaboradores.value = await listarColaboradores();
    opcionesColab.value = colaboradores.value;
  } catch (e) {
    $q.notify({
      type: "negative",
      message: "No se pudieron cargar los colaboradores: " + e.message,
    });
  }
}

function filtrarColab(val, update) {
  update(() => {
    const q = val.toLowerCase();
    opcionesColab.value = colaboradores.value.filter((c) =>
      c.nombre.toLowerCase().includes(q),
    );
  });
}

function alElegir(nombre) {
  const c = colaboradores.value.find((c) => c.nombre === nombre);
  if (c) {
    form.value.tipoPersonal = c.tipo_personal;
    form.value.salarioBase = Number(c.salario_base);
  }
}

async function guardarColab() {
  const n = nuevoColab.value;
  if (!n.nombre?.trim() || !(n.salarioBase > 0)) {
    $q.notify({ type: "warning", message: "Complete nombre y salario" });
    return;
  }
  guardando.value = true;
  try {
    await crearColaborador(n);
    await cargarColaboradores();
    form.value.nombre = n.nombre.trim();
    alElegir(form.value.nombre);
    dlgColab.value = false;
    nuevoColab.value = {
      nombre: "",
      tipoPersonal: "Personal de Operación / Apícola",
      salarioBase: null,
    };
    $q.notify({ type: "positive", message: "Colaborador creado" });
  } catch (e) {
    $q.notify({ type: "negative", message: e.message });
  } finally {
    guardando.value = false;
  }
}

async function guardarDeuda() {
  const d = nuevaDeuda.value;
  if (!d.nombre || !(d.monto > 0)) {
    $q.notify({ type: "warning", message: "Elija colaborador y monto" });
    return;
  }
  guardando.value = true;
  try {
    await asignarDeuda(d);
    if (form.value.nombre === d.nombre) {
      deuda.value = await obtenerDeuda(d.nombre);
    }
    dlgDeuda.value = false;
    nuevaDeuda.value = {
      nombre: null,
      concepto: "",
      monto: null,
      fecha: hoy(),
    };
    $q.notify({ type: "positive", message: "Deuda asignada" });
  } catch (e) {
    $q.notify({ type: "negative", message: e.message });
  } finally {
    guardando.value = false;
  }
}

const columnas = [
  { name: "fecha", label: "Fecha", field: "fecha", align: "left" },
  {
    name: "nombre",
    label: "Colaborador",
    field: "nombre_empleado",
    align: "left",
  },
  { name: "tipo", label: "Tipo", field: "tipo_personal", align: "left" },
  {
    name: "devengado",
    label: "Devengado",
    field: (r) => money(r.devengado),
    align: "right",
  },
  {
    name: "isss",
    label: "ISSS",
    field: (r) => money(r.isss),
    align: "right",
  },
  {
    name: "afp",
    label: "AFP",
    field: (r) => money(r.afp),
    align: "right",
  },
  {
    name: "renta",
    label: "Renta",
    field: (r) => money(r.renta),
    align: "right",
  },
  {
    name: "deuda",
    label: "Desc. deuda",
    field: (r) => money(r.descuento_deuda),
    align: "right",
  },
  {
    name: "totalDesc",
    label: "Total descuentos",
    field: (r) =>
      money(
        Number(r.isss || 0) +
          Number(r.afp || 0) +
          Number(r.renta || 0) +
          Number(r.descuento_deuda || 0),
      ),
    align: "right",
  },
  {
    name: "neto",
    label: "Neto pagado",
    field: (r) => money(r.salario_neto),
    align: "right",
  },
  {
    name: "asiento",
    label: "Asiento",
    field: (r) => "#" + r.id_asiento,
    align: "right",
  },
];

async function cargarHistorial() {
  try {
    historial.value = await listarPlanillas();
  } catch (e) {
    $q.notify({
      type: "negative",
      message: "No se pudo cargar el historial: " + e.message,
    });
  }
}

async function procesar() {
  loading.value = true;
  try {
    resultado.value = await procesarPlanilla(form.value);
    $q.notify({
      type: "positive",
      message: "Planilla procesada y contabilizada",
    });
    form.value.nombre = null;
    form.value.salarioBase = null;
    form.value.bonos = 0;
    form.value.descuentoDeuda = 0;
    deuda.value = { items: [], total: 0 };
    await cargarHistorial();
  } catch (e) {
    $q.notify({ type: "negative", message: e.message });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  cargarHistorial();
  cargarColaboradores();
});
</script>
