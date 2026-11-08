<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h4 text-weight-bold text-primary">Catálogo de Cuentas</div>
        <div class="text-subtitle2 text-grey-7">Sector apícola · NIIF para PYMES</div>
      </div>
      <q-btn color="primary" icon="add" label="Nueva cuenta" no-caps @click="abrirDialogo" />
    </div>

    <q-table
      flat
      bordered
      dense
      :rows="filas"
      :columns="columnas"
      row-key="id_cuenta"
      :loading="cargando"
      :filter="busqueda"
      v-model:pagination="paginacion"
      :rows-per-page-options="[25, 50, 100, 0]"
      no-data-label="Sin cuentas"
    >
      <template #top>
        <q-input
          v-model="busqueda"
          dense
          outlined
          debounce="200"
          placeholder="Buscar código o nombre"
          style="min-width: 280px"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="grupo"
          :options="grupos"
          emit-value
          map-options
          dense
          outlined
          label="Grupo"
          class="q-ml-md"
          style="min-width: 240px"
        />
      </template>

      <template #body-cell-codigo="props">
        <q-td :props="props">
          <q-badge :color="colorGrupo(props.row.codigo)" :label="props.row.codigo" />
        </q-td>
      </template>

      <template #body-cell-nombre="props">
        <q-td :props="props">
          <span
            :style="{ paddingLeft: (props.row.nivel - 1) * 14 + 'px' }"
            :class="{ 'text-weight-bold': props.row.esTitulo }"
          >
            {{ props.row.nombre }}
          </span>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogo" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section class="bg-primary text-white text-h6">Nueva cuenta</q-card-section>
        <q-form @submit.prevent="guardar">
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="nuevo.padre"
              :options="opcionesPadre"
              label="Cuenta padre"
              outlined
              dense
              use-input
              input-debounce="0"
              @filter="filtrarPadre"
              @update:model-value="alElegirPadre"
              :rules="[v => !!v || 'Elige la cuenta padre']"
            />
            <q-input
              v-model="nuevo.codigo"
              label="Código"
              outlined
              dense
              :rules="[reglaCodigo]"
            />
            <q-input
              v-model="nuevo.nombre"
              label="Nombre"
              outlined
              dense
              :rules="[v => !!v || 'Requerido']"
            />
            <q-select
              v-model="nuevo.naturaleza"
              :options="['Deudor', 'Acreedor']"
              label="Naturaleza"
              outlined
              dense
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" no-caps v-close-popup />
            <q-btn color="primary" label="Guardar" type="submit" no-caps :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { listarCuentas, crearCuenta } from '../services/catalogo'

const $q = useQuasar()
const cuentas = ref([])
const cargando = ref(false)
const busqueda = ref('')
const grupo = ref(null)
const paginacion = ref({ rowsPerPage: 50 })

const grupos = [
  { label: 'Todos', value: null },
  { label: '1 · Activo', value: '1' },
  { label: '2 · Pasivo', value: '2' },
  { label: '3 · Patrimonio', value: '3' },
  { label: '4 · Resultado deudoras (costos y gastos)', value: '4' },
  { label: '5 · Resultado acreedoras (ingresos)', value: '5' },
  { label: '6 · Liquidadoras', value: '6' },
  { label: '7 · Cuentas de orden', value: '7' }
]

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'naturaleza', label: 'Naturaleza', field: 'naturaleza', align: 'left' },
  {
    name: 'tipo',
    label: 'Tipo',
    field: r => (r.esTitulo ? 'Título' : 'Movimiento'),
    align: 'left'
  }
]

const filas = computed(() => {
  const padres = new Set(cuentas.value.map(c => c.id_cuenta_padre).filter(Boolean))
  return cuentas.value
    .filter(c => !grupo.value || c.codigo.split('.')[0] === grupo.value)
    .map(c => ({
      ...c,
      nivel: c.codigo.split('.').length,
      esTitulo: padres.has(c.id_cuenta)
    }))
})

function colorGrupo(codigo) {
  const g = codigo.split('.')[0]
  return { 1: 'primary', 2: 'orange', 3: 'purple', 4: 'negative', 5: 'positive' }[g] || 'grey-7'
}

async function cargar() {
  cargando.value = true
  try {
    cuentas.value = await listarCuentas()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'No se pudo cargar el catálogo: ' + e.message })
  } finally {
    cargando.value = false
  }
}

// --- Diálogo nueva cuenta ---
const dialogo = ref(false)
const guardando = ref(false)
const nuevo = ref({ padre: null, codigo: '', nombre: '', naturaleza: 'Deudor' })
const opcionesTodas = computed(() =>
  cuentas.value.map(c => ({ label: `${c.codigo} · ${c.nombre}`, value: c.id_cuenta, cuenta: c }))
)
const opcionesPadre = ref([])

function abrirDialogo() {
  nuevo.value = { padre: null, codigo: '', nombre: '', naturaleza: 'Deudor' }
  opcionesPadre.value = opcionesTodas.value
  dialogo.value = true
}

function filtrarPadre(val, update) {
  update(() => {
    const q = val.toLowerCase()
    opcionesPadre.value = q
      ? opcionesTodas.value.filter(o => o.label.toLowerCase().includes(q))
      : opcionesTodas.value
  })
}

function siguienteCodigo(padre) {
  const hijos = cuentas.value.filter(c => c.id_cuenta_padre === padre.id_cuenta)
  const max = hijos.reduce((m, h) => Math.max(m, parseInt(h.codigo.split('.').pop(), 10)), 0)
  const relleno = padre.codigo.split('.').length >= 2 ? 2 : 1
  return `${padre.codigo}.${String(max + 1).padStart(relleno, '0')}`
}

function alElegirPadre(op) {
  if (!op) return
  nuevo.value.codigo = siguienteCodigo(op.cuenta)
  nuevo.value.naturaleza = op.cuenta.naturaleza
}

function reglaCodigo(v) {
  if (!v) return 'Requerido'
  if (nuevo.value.padre && !v.startsWith(nuevo.value.padre.cuenta.codigo + '.')) {
    return `Debe empezar con ${nuevo.value.padre.cuenta.codigo}.`
  }
  if (cuentas.value.some(c => c.codigo === v)) return 'Ese código ya existe'
  return true
}

async function guardar() {
  guardando.value = true
  try {
    await crearCuenta({
      codigo: nuevo.value.codigo,
      nombre: nuevo.value.nombre,
      naturaleza: nuevo.value.naturaleza,
      id_cuenta_padre: nuevo.value.padre.value
    })
    $q.notify({ type: 'positive', message: 'Cuenta creada' })
    dialogo.value = false
    await cargar()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>
