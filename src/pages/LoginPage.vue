<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card flat bordered style="width: 380px; max-width: 95vw">
          <q-card-section class="bg-primary text-white text-center">
            <q-icon name="hive" size="48px" />
            <div class="text-h6">Sistema Contable Apícola</div>
          </q-card-section>
          <q-form @submit.prevent="entrar">
            <q-card-section class="q-gutter-md">
              <q-input
                v-model="email"
                type="email"
                label="Correo"
                outlined
                dense
                :rules="[v => !!v || 'Requerido']"
              />
              <q-input
                v-model="password"
                :type="ver ? 'text' : 'password'"
                label="Contraseña"
                outlined
                dense
                :rules="[v => !!v || 'Requerida']"
              >
                <template #append>
                  <q-icon
                    :name="ver ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="ver = !ver"
                  />
                </template>
              </q-input>
              <q-btn
                label="Ingresar"
                type="submit"
                color="primary"
                class="full-width"
                no-caps
                :loading="cargando"
              />
            </q-card-section>
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { login } from '../services/auth'

const $q = useQuasar()
const router = useRouter()
const email = ref('')
const password = ref('')
const ver = ref(false)
const cargando = ref(false)

async function entrar() {
  cargando.value = true
  try {
    await login(email.value.trim(), password.value)
    router.replace('/')
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    cargando.value = false
  }
}
</script>
