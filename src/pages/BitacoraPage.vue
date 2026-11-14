<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h4 text-weight-bold text-primary"
          >Bitácora de cambios</div
        >
        <div class="text-subtitle2 text-grey-7"
          >Quién, cuándo, dónde y por qué se modificó cada registro</div
        >
      </div>
      <q-select
        v-model="modulo"
        :options="modulos"
        emit-value
        map-options
        dense
        outlined
        label="Módulo"
        style="min-width: 200px"
        class="q-mr-sm"
        @update:model-value="cargar"
      />
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

    <q-table
      flat
      bordered
      dense
      :rows="filas"
      :columns="columnas"
      row-key="id_bitacora"
      :loading="cargando"
      :filter="busqueda"
      :rows-per-page-options="[20, 50, 100, 0]"
      no-data-label="Sin registros"
    >
      <template #top>
        <q-input
          v-model="busqueda"
          dense
          outlined
          debounce="200"
          placeholder="Buscar usuario, acción o justificación"
          style="min-width: 320px"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </template>

      <template #body-cell-accion="props">
        <q-td :props="props">
          <q-badge
            :color="colorAccion(props.row.accion)"
            :label="props.row.accion"
          />
        </q-td>
      </template>

      <template #body-cell-detalle="props">
        <q-td :props="props" auto-width>
          <q-btn
            flat
            dense
            round
            icon="visibility"
            color="primary"
            @click="ver(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogo">
      <q-card style="width: 800px; max-width: 95vw" v-if="sel">
        <q-card-section class="bg-primary text-white text-h6">
          {{ sel.accion }} · {{ sel.modulo }} #{{ sel.id_registro }}
        </q-card-section>
        <q-card-section>
          <div><b>Usuario:</b> {{ sel.usuario_email }} ({{ sel.rol }})</div>
          <div><b>Fecha:</b> {{ fechaHora(sel.fecha) }}</div>
          <div><b>IP:</b> {{ sel.ip || '—' }}</div>
          <div><b>Dispositivo:</b> {{ sel.dispositivo || '—' }}</div>
          <div class="q-mt-sm"
            ><b>Justificación:</b> {{ sel.justificacion }}</div
          >
        </q-card-section>
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-subtitle2">Antes</div>
            <pre class="bg-grey-2 q-pa-sm rounded-borders json">{{
              json(sel.datos_antes)
            }}</pre>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-subtitle2">Después</div>
            <pre class="bg-grey-2 q-pa-sm rounded-borders json">{{
              json(sel.datos_despues)
            }}</pre>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" no-caps v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { listarBitacora } from '../services/bitacora'

const $q = useQuasar()
const filas = ref([])
const cargando = ref(false)
const busqueda = ref('')
const modulo = ref(null)
const dialogo = ref(false)
const sel = ref(null)

const modulos = [
  { label: 'Todos', value: null },
  { label: 'Catálogo', value: 'Catálogo' },
  { label: 'Libro diario', value: 'Libro diario' }
]

const fechaHora = f =>
  new Date(f).toLocaleString('es-SV', { timeZone: 'America/El_Salvador' })
const json = o => (o ? JSON.stringify(o, null, 2) : '—')
const colorAccion = a =>
  ({ CREAR: 'positive', MODIFICAR: 'orange', ELIMINAR: 'negative' })[a] ||
  'grey-7'

const columnas = [
  {
    name: 'fecha',
    label: 'Fecha y hora',
    field: r => fechaHora(r.fecha),
    align: 'left',
    sortable: true
  },
  {
    name: 'usuario',
    label: 'Usuario',
    field: r => `${r.usuario_email || '—'} (${r.rol || '—'})`,
    align: 'left'
  },
  { name: 'modulo', label: 'Módulo', field: 'modulo', align: 'left' },
  { name: 'accion', label: 'Acción', field: 'accion', align: 'left' },
  {
    name: 'registro',
    label: 'Registro',
    field: r => `${r.tabla} #${r.id_registro}`,
    align: 'left'
  },
  {
    name: 'ip',
    label: 'IP',
    field: r => r.ip || '—',
    align: 'left'
  },
  {
    name: 'justificacion',
    label: 'Justificación',
    field: 'justificacion',
    align: 'left',
    style: 'max-width: 280px; white-space: normal'
  },
  { name: 'detalle', label: '', field: 'id_bitacora', align: 'center' }
]

function ver(r) {
  sel.value = r
  dialogo.value = true
}

async function cargar() {
  cargando.value = true
  try {
    filas.value = await listarBitacora({ modulo: modulo.value })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar la bitácora: ' + e.message
    })
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.json {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  max-height: 300px;
  overflow: auto;
}
</style>
