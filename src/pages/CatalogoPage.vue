<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h4 text-weight-bold text-primary"
          >Catálogo de Cuentas</div
        >
        <div class="text-subtitle2 text-grey-7"
          >Sector apícola · NIIF para PYMES · clic en una cuenta para ver su
          descripción</div
        >
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nueva cuenta"
        no-caps
        @click="abrirDialogo"
      />
    </div>

    <q-table
      class="tabla-cuentas"
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
      @row-click="(evt, row) => verInfo(row)"
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
          <q-badge
            :color="colorGrupo(props.row.codigo)"
            :label="props.row.codigo"
          />
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

      <template #body-cell-acciones="props">
        <q-td :props="props" auto-width>
          <q-btn
            flat
            dense
            round
            icon="info"
            color="info"
            @click.stop="verInfo(props.row)"
          >
            <q-tooltip>Ver descripción</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="edit"
            color="primary"
            @click.stop="abrirEditar(props.row)"
          >
            <q-tooltip>Modificar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click.stop="abrirEliminar(props.row)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Popup descripción de la cuenta -->
    <q-dialog v-model="dialogoInfo">
      <q-card v-if="info" style="width: 560px; max-width: 95vw">
        <q-card-section
          :class="'bg-' + colorGrupo(info.codigo)"
          class="text-white"
        >
          <div class="text-caption">{{ info.codigo }}</div>
          <div class="text-h6">{{ info.nombre }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm scroll" style="max-height: 65vh">
          <div class="row q-gutter-sm">
            <q-badge color="grey-8" :label="nombreGrupo(info.codigo)" />
            <q-badge
              :color="info.naturaleza === 'Deudor' ? 'primary' : 'orange'"
              :label="'Naturaleza ' + info.naturaleza"
            />
            <q-badge
              :color="info.esTitulo ? 'purple' : 'teal'"
              :label="info.esTitulo ? 'Cuenta título' : 'Cuenta de movimiento'"
            />
          </div>

          <div v-if="info.cadena.length" class="text-caption text-grey-7">
            Ubicación:
            <span v-for="(a, i) in info.cadena" :key="a.id_cuenta">
              {{ a.codigo }} {{ a.nombre
              }}<span v-if="i < info.cadena.length - 1"> › </span>
            </span>
          </div>

          <q-separator />

          <div class="text-subtitle2">Descripción</div>
          <div v-if="info.descripcion" class="descripcion">{{
            info.descripcion
          }}</div>
          <template v-else-if="info.heredada">
            <div class="text-caption text-grey-7"
              >Cuenta de detalle de
              <b>{{ info.heredada.codigo }} · {{ info.heredada.nombre }}</b
              >:</div
            >
            <div class="descripcion">{{ info.heredada.descripcion }}</div>
          </template>
          <div v-else class="text-grey-6">Sin descripción registrada.</div>

          <div v-if="info.se_carga || info.se_abona" class="descripcion">
            <div v-if="info.se_carga"><b>SE CARGA:</b> {{ info.se_carga }}</div>
            <div v-if="info.se_abona"><b>SE ABONA:</b> {{ info.se_abona }}</div>
          </div>

          <q-banner dense rounded class="bg-grey-2">
            {{ explicacionNaturaleza(info.naturaleza) }}
          </q-banner>

          <div v-if="info.hijos.length">
            <div class="text-subtitle2">
              Subcuentas ({{ info.hijos.length }})
            </div>
            <div class="hijos">
              <div v-for="h in info.hijos" :key="h.id_cuenta">
                <span class="text-grey-7">{{ h.codigo }}</span> {{ h.nombre }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" no-caps color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Nueva cuenta -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="width: 560px; max-width: 95vw">
        <q-card-section class="bg-primary text-white text-h6"
          >Nueva cuenta</q-card-section
        >
        <q-form @submit.prevent="guardar">
          <q-card-section class="q-gutter-md scroll" style="max-height: 68vh">
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

            <q-separator />
            <div class="text-subtitle2 text-grey-8"
              >Datos que se mostrarán en el popup de la cuenta</div
            >

            <q-input
              v-model="nuevo.descripcion"
              type="textarea"
              rows="3"
              label="Descripción de la cuenta (mín. 10 caracteres)"
              outlined
              dense
              :rules="[
                v => (v || '').trim().length >= 10 || 'Mínimo 10 caracteres'
              ]"
            />
            <q-input
              v-model="nuevo.se_carga"
              type="textarea"
              rows="2"
              label="SE CARGA: cuándo aumenta o se debita (opcional)"
              outlined
              dense
            />
            <q-input
              v-model="nuevo.se_abona"
              type="textarea"
              rows="2"
              label="SE ABONA: cuándo disminuye o se acredita (opcional)"
              outlined
              dense
            />
            <q-input
              v-model="nuevo.justificacion"
              label="Justificación del alta (opcional)"
              outlined
              dense
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" no-caps v-close-popup />
            <q-btn
              color="primary"
              label="Guardar"
              type="submit"
              no-caps
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Modificar cuenta -->
    <q-dialog v-model="dialogoEditar" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section class="bg-orange text-white text-h6"
          >Modificar cuenta</q-card-section
        >
        <q-form @submit.prevent="guardarEdicion">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="edit.codigo"
              label="Código"
              outlined
              dense
              :rules="[v => !!v || 'Requerido']"
            />
            <q-input
              v-model="edit.nombre"
              label="Nombre"
              outlined
              dense
              :rules="[v => !!v || 'Requerido']"
            />
            <q-select
              v-model="edit.naturaleza"
              :options="['Deudor', 'Acreedor']"
              label="Naturaleza"
              outlined
              dense
            />
            <q-input
              v-model="edit.justificacion"
              type="textarea"
              rows="2"
              label="Justificación del cambio (mín. 10 caracteres)"
              outlined
              dense
              :rules="[reglaJustificacion]"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" no-caps v-close-popup />
            <q-btn
              color="orange"
              label="Guardar cambios"
              type="submit"
              no-caps
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Eliminar cuenta -->
    <q-dialog v-model="dialogoEliminar" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section class="bg-negative text-white text-h6"
          >Eliminar cuenta</q-card-section
        >
        <q-form @submit.prevent="confirmarEliminar">
          <q-card-section class="q-gutter-md">
            <div>
              ¿Eliminar <b>{{ elim.codigo }} · {{ elim.nombre }}</b>? Solo es
              posible si no tiene subcuentas ni movimientos.
            </div>
            <q-input
              v-model="elim.justificacion"
              type="textarea"
              rows="2"
              label="Justificación (mín. 10 caracteres)"
              outlined
              dense
              :rules="[reglaJustificacion]"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" no-caps v-close-popup />
            <q-btn
              color="negative"
              label="Eliminar"
              type="submit"
              no-caps
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  listarCuentas,
  crearCuenta,
  modificarCuenta,
  eliminarCuenta
} from '../services/catalogo'

const $q = useQuasar()
const cuentas = ref([])
const cargando = ref(false)
const guardando = ref(false)
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
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    align: 'left',
    sortable: true
  },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  {
    name: 'naturaleza',
    label: 'Naturaleza',
    field: 'naturaleza',
    align: 'left'
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: r => (r.esTitulo ? 'Título' : 'Movimiento'),
    align: 'left'
  },
  { name: 'acciones', label: '', field: 'id_cuenta', align: 'right' }
]

const filas = computed(() => {
  const padres = new Set(
    cuentas.value.map(c => c.id_cuenta_padre).filter(Boolean)
  )
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
  return (
    { 1: 'primary', 2: 'orange', 3: 'purple', 4: 'negative', 5: 'positive' }[
      g
    ] || 'grey-7'
  )
}

const nombresGrupo = {
  1: 'Activo',
  2: 'Pasivo',
  3: 'Patrimonio',
  4: 'Resultado deudoras',
  5: 'Resultado acreedoras',
  6: 'Liquidadoras',
  7: 'Cuentas de orden'
}
const nombreGrupo = codigo => nombresGrupo[codigo.split('.')[0]] || 'Otro'

const explicacionNaturaleza = n =>
  n === 'Deudor'
    ? 'Naturaleza deudora: aumenta con cargos (debe) y disminuye con abonos (haber).'
    : 'Naturaleza acreedora: aumenta con abonos (haber) y disminuye con cargos (debe).'

const reglaJustificacion = v =>
  (v || '').trim().length >= 10 || 'Mínimo 10 caracteres'

async function cargar() {
  cargando.value = true
  try {
    cuentas.value = await listarCuentas()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el catálogo: ' + e.message
    })
  } finally {
    cargando.value = false
  }
}

// --- Popup de descripción ---
const dialogoInfo = ref(false)
const info = ref(null)
const mapa = computed(() => new Map(cuentas.value.map(c => [c.id_cuenta, c])))

function cadenaPadres(c) {
  const r = []
  let p = mapa.value.get(c.id_cuenta_padre)
  while (p) {
    r.unshift(p)
    p = mapa.value.get(p.id_cuenta_padre)
  }
  return r
}

function verInfo(row) {
  const cadena = cadenaPadres(row)
  const heredada = row.descripcion
    ? null
    : [...cadena].reverse().find(a => a.descripcion) || null
  const hijos = cuentas.value.filter(c => c.id_cuenta_padre === row.id_cuenta)
  info.value = { ...row, cadena, heredada, hijos }
  dialogoInfo.value = true
}

// --- Nueva cuenta ---
const nuevoVacio = () => ({
  padre: null,
  codigo: '',
  nombre: '',
  naturaleza: 'Deudor',
  descripcion: '',
  se_carga: '',
  se_abona: '',
  justificacion: ''
})
const dialogo = ref(false)
const nuevo = ref(nuevoVacio())
const opcionesTodas = computed(() =>
  cuentas.value.map(c => ({
    label: `${c.codigo} · ${c.nombre}`,
    value: c.id_cuenta,
    cuenta: c
  }))
)
const opcionesPadre = ref([])

function abrirDialogo() {
  nuevo.value = nuevoVacio()
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
  const max = hijos.reduce(
    (m, h) => Math.max(m, parseInt(h.codigo.split('.').pop(), 10)),
    0
  )
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
  if (
    nuevo.value.padre &&
    !v.startsWith(nuevo.value.padre.cuenta.codigo + '.')
  ) {
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
      id_cuenta_padre: nuevo.value.padre.value,
      descripcion: nuevo.value.descripcion,
      se_carga: nuevo.value.se_carga,
      se_abona: nuevo.value.se_abona,
      justificacion: nuevo.value.justificacion
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

// --- Modificar cuenta ---
const dialogoEditar = ref(false)
const edit = ref({})

function abrirEditar(row) {
  edit.value = {
    id: row.id_cuenta,
    codigo: row.codigo,
    nombre: row.nombre,
    naturaleza: row.naturaleza,
    justificacion: ''
  }
  dialogoEditar.value = true
}

async function guardarEdicion() {
  guardando.value = true
  try {
    await modificarCuenta(edit.value)
    $q.notify({ type: 'positive', message: 'Cuenta modificada' })
    dialogoEditar.value = false
    await cargar()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    guardando.value = false
  }
}

// --- Eliminar cuenta ---
const dialogoEliminar = ref(false)
const elim = ref({})

function abrirEliminar(row) {
  elim.value = {
    id: row.id_cuenta,
    codigo: row.codigo,
    nombre: row.nombre,
    justificacion: ''
  }
  dialogoEliminar.value = true
}

async function confirmarEliminar() {
  guardando.value = true
  try {
    await eliminarCuenta(elim.value)
    $q.notify({ type: 'positive', message: 'Cuenta eliminada' })
    dialogoEliminar.value = false
    await cargar()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.tabla-cuentas :deep(tbody tr) {
  cursor: pointer;
}
.descripcion {
  white-space: pre-line;
  line-height: 1.5;
}
.hijos {
  max-height: 160px;
  overflow: auto;
  font-size: 13px;
}
</style>
