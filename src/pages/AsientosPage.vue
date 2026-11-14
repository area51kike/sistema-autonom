<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold text-primary q-mb-md"
      >Libro Diario</div
    >

    <div class="row q-col-gutter-md">
      <!-- Formulario (nuevo / corrección) -->
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section
            class="text-white text-h6"
            :class="editandoId ? 'bg-orange' : 'bg-primary'"
          >
            {{
              editandoId ? 'Corregir asiento #' + editandoId : 'Nuevo asiento'
            }}
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="guardar" class="q-gutter-md">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.fecha"
                    type="date"
                    label="Fecha"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="form.tipo"
                    :options="tiposOpc"
                    label="Tipo"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.descripcion"
                    label="Descripción"
                    outlined
                    dense
                    :rules="[v => !!v || 'Requerida']"
                  />
                </div>
              </div>

              <div
                v-for="(l, i) in form.lineas"
                :key="i"
                class="row q-col-gutter-xs items-center"
              >
                <div class="col-12 col-md-5">
                  <q-select
                    v-model="l.cuenta"
                    :options="opcionesFiltradas"
                    label="Cuenta"
                    outlined
                    dense
                    use-input
                    input-debounce="0"
                    @filter="filtrarCuentas"
                  />
                </div>
                <div class="col-5 col-md-3">
                  <q-input
                    :model-value="l.debe"
                    @update:model-value="v => setDebe(l, v)"
                    type="number"
                    step="0.01"
                    min="0"
                    label="Debe"
                    outlined
                    dense
                  />
                </div>
                <div class="col-5 col-md-3">
                  <q-input
                    :model-value="l.haber"
                    @update:model-value="v => setHaber(l, v)"
                    type="number"
                    step="0.01"
                    min="0"
                    label="Haber"
                    outlined
                    dense
                  />
                </div>
                <div class="col-2 col-md-1">
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    :disable="form.lineas.length <= 2"
                    @click="form.lineas.splice(i, 1)"
                  />
                </div>
              </div>

              <q-btn
                flat
                icon="add"
                label="Agregar línea"
                no-caps
                color="primary"
                @click="agregarLinea"
              />

              <q-input
                v-if="editandoId"
                v-model="form.justificacion"
                type="textarea"
                rows="2"
                label="Justificación de la corrección (mín. 10 caracteres)"
                outlined
                dense
                :rules="[
                  v => (v || '').trim().length >= 10 || 'Mínimo 10 caracteres'
                ]"
              />

              <div
                class="row justify-end items-center q-gutter-md text-subtitle1"
              >
                <div>Debe: <b>${{ totalDebe.toFixed(2) }}</b></div>
                <div>Haber: <b>${{ totalHaber.toFixed(2) }}</b></div>
                <q-badge
                  :color="cuadra ? 'positive' : 'negative'"
                  :label="
                    cuadra ? 'Cuadrado' : 'Diferencia $' + diferencia.toFixed(2)
                  "
                />
              </div>

              <div class="row q-gutter-sm">
                <q-btn
                  v-if="editandoId"
                  flat
                  label="Cancelar corrección"
                  no-caps
                  @click="cancelarEdicion"
                />
                <q-btn
                  :label="
                    editandoId ? 'Guardar corrección' : 'Registrar asiento'
                  "
                  type="submit"
                  :color="editandoId ? 'orange' : 'primary'"
                  class="col"
                  no-caps
                  :disable="!cuadra"
                  :loading="guardando"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Últimos asientos -->
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section class="bg-secondary text-white text-h6"
            >Últimos asientos</q-card-section
          >
          <q-inner-loading :showing="cargando" />
          <q-list separator>
            <q-item v-if="!asientos.length && !cargando">
              <q-item-section class="text-grey-6 text-center"
                >Aún no hay asientos.</q-item-section
              >
            </q-item>
            <q-expansion-item v-for="a in asientos" :key="a.id_asiento">
              <template #header>
                <q-item-section>
                  <q-item-label
                    >#{{ a.id_asiento }} · {{ a.descripcion }}</q-item-label
                  >
                  <q-item-label caption
                    >{{ a.fecha }} · {{ a.tipo }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <b>${{ totalAsiento(a).toFixed(2) }}</b>
                </q-item-section>
              </template>
              <q-markup-table flat dense>
                <thead>
                  <tr>
                    <th class="text-left">Cuenta</th>
                    <th class="text-right">Debe</th>
                    <th class="text-right">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in a.detalle_asiento" :key="d.id_detalle">
                    <td class="text-left">
                      {{ d.catalogo_cuentas.codigo }} ·
                      {{ d.catalogo_cuentas.nombre }}
                    </td>
                    <td class="text-right">{{
                      d.debe ? d.debe.toFixed(2) : ''
                    }}</td>
                    <td class="text-right">{{
                      d.haber ? d.haber.toFixed(2) : ''
                    }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
              <div class="q-pa-sm text-right">
                <q-btn
                  flat
                  dense
                  icon="edit"
                  label="Editar / corregir"
                  color="orange"
                  no-caps
                  @click="cargarEdicion(a)"
                />
              </div>
            </q-expansion-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { listarCuentas } from '../services/catalogo'
import {
  registrarAsiento,
  modificarAsiento,
  listarAsientos
} from '../services/asientos'

const $q = useQuasar()
const tipos = ['Diario', 'Apertura', 'Ajuste', 'Cierre']
const hoy = () => new Date().toLocaleDateString('en-CA')
const num = x => Math.round((Number(x) || 0) * 100) / 100
const lineaVacia = () => ({ cuenta: null, debe: null, haber: null })
const formVacio = () => ({
  fecha: hoy(),
  tipo: 'Diario',
  descripcion: '',
  justificacion: '',
  lineas: [lineaVacia(), lineaVacia()]
})

const form = ref(formVacio())
const editandoId = ref(null)
const asientos = ref([])
const cargando = ref(false)
const guardando = ref(false)

const tiposOpc = computed(() => [...new Set([...tipos, form.value.tipo])])

const opcionesCuenta = ref([])
const opcionesFiltradas = ref([])

function filtrarCuentas(val, update) {
  update(() => {
    const q = val.toLowerCase()
    opcionesFiltradas.value = q
      ? opcionesCuenta.value.filter(o => o.label.toLowerCase().includes(q))
      : opcionesCuenta.value
  })
}

function setDebe(l, v) {
  l.debe = v === '' || v === null ? null : Number(v)
  if (l.debe) l.haber = null
}
function setHaber(l, v) {
  l.haber = v === '' || v === null ? null : Number(v)
  if (l.haber) l.debe = null
}
function agregarLinea() {
  form.value.lineas.push(lineaVacia())
}

const totalDebe = computed(() =>
  form.value.lineas.reduce((s, l) => s + num(l.debe), 0)
)
const totalHaber = computed(() =>
  form.value.lineas.reduce((s, l) => s + num(l.haber), 0)
)
const diferencia = computed(() => Math.abs(totalDebe.value - totalHaber.value))
const cuadra = computed(
  () =>
    totalDebe.value > 0 &&
    Math.round(totalDebe.value * 100) === Math.round(totalHaber.value * 100)
)

const totalAsiento = a =>
  a.detalle_asiento.reduce((s, d) => s + (d.debe || 0), 0)

async function cargarCuentas() {
  const todas = await listarCuentas()
  const padres = new Set(todas.map(c => c.id_cuenta_padre).filter(Boolean))
  opcionesCuenta.value = todas
    .filter(c => !padres.has(c.id_cuenta))
    .map(c => ({ label: `${c.codigo} · ${c.nombre}`, value: c.id_cuenta }))
  opcionesFiltradas.value = opcionesCuenta.value
}

async function cargarAsientos() {
  cargando.value = true
  try {
    asientos.value = await listarAsientos()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los asientos: ' + e.message
    })
  } finally {
    cargando.value = false
  }
}

function cargarEdicion(a) {
  editandoId.value = a.id_asiento
  form.value = {
    fecha: a.fecha,
    tipo: a.tipo || 'Diario',
    descripcion: a.descripcion || '',
    justificacion: '',
    lineas: a.detalle_asiento.map(d => ({
      cuenta: opcionesCuenta.value.find(o => o.value === d.id_cuenta) || {
        label: `${d.catalogo_cuentas.codigo} · ${d.catalogo_cuentas.nombre}`,
        value: d.id_cuenta
      },
      debe: d.debe ? Number(d.debe) : null,
      haber: d.haber ? Number(d.haber) : null
    }))
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicion() {
  editandoId.value = null
  form.value = formVacio()
}

async function guardar() {
  const lineas = form.value.lineas.filter(
    l => l.cuenta || num(l.debe) || num(l.haber)
  )
  if (
    lineas.length < 2 ||
    lineas.some(l => !l.cuenta || (!num(l.debe) && !num(l.haber)))
  ) {
    $q.notify({
      type: 'warning',
      message: 'Cada línea necesita cuenta y un monto en debe o haber'
    })
    return
  }
  const detalles = lineas.map(l => ({
    id_cuenta: l.cuenta.value,
    debe: num(l.debe),
    haber: num(l.haber)
  }))

  guardando.value = true
  try {
    if (editandoId.value) {
      await modificarAsiento({
        id: editandoId.value,
        fecha: form.value.fecha,
        descripcion: form.value.descripcion,
        tipo: form.value.tipo,
        detalles,
        justificacion: form.value.justificacion
      })
      $q.notify({
        type: 'positive',
        message: `Asiento #${editandoId.value} corregido y registrado en bitácora`
      })
      cancelarEdicion()
    } else {
      const id = await registrarAsiento({
        fecha: form.value.fecha,
        descripcion: form.value.descripcion,
        tipo: form.value.tipo,
        detalles
      })
      $q.notify({ type: 'positive', message: `Asiento #${id} registrado` })
      form.value = formVacio()
    }
    await cargarAsientos()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  try {
    await cargarCuentas()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el catálogo: ' + e.message
    })
  }
  await cargarAsientos()
})
</script>
