import { reactive, computed } from 'vue'
import { supabase } from './supabase'

export const sesion = reactive({ listo: false, user: null, perfil: null })
export const esAdmin = computed(() => sesion.perfil?.rol === 'admin')

let suscrito = false

async function cargarPerfil(user) {
  if (!user) {
    sesion.user = null
    sesion.perfil = null
    return
  }
  sesion.user = user
  const { data } = await supabase
    .from('perfil')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  sesion.perfil = data
}

export async function iniciarSesion() {
  const { data } = await supabase.auth.getSession()
  await cargarPerfil(data.session?.user)
  sesion.listo = true
  if (!suscrito) {
    suscrito = true
    supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === 'SIGNED_OUT') cargarPerfil(null)
    })
  }
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw new Error('Correo o contraseña incorrectos')
  await cargarPerfil(data.user)
  if (!sesion.perfil) {
    await supabase.auth.signOut()
    throw new Error('Usuario sin perfil asignado')
  }
}

export async function logout() {
  await supabase.auth.signOut()
  sesion.user = null
  sesion.perfil = null
}
