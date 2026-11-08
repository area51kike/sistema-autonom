import { supabase } from './supabase'

export async function listarCuentas() {
  const { data, error } = await supabase
    .from('catalogo_cuentas')
    .select('id_cuenta, codigo, nombre, naturaleza, id_cuenta_padre')
    .order('codigo')
  if (error) throw error
  return data
}

export async function crearCuenta({ codigo, nombre, naturaleza, id_cuenta_padre }) {
  const { data, error } = await supabase
    .from('catalogo_cuentas')
    .insert({ codigo, nombre, naturaleza, id_cuenta_padre })
    .select()
    .single()
  if (error) throw error
  return data
}
