import { supabase } from './supabase'

export async function listarCuentas() {
  const { data, error } = await supabase
    .from('catalogo_cuentas')
    .select(
      'id_cuenta, codigo, nombre, naturaleza, id_cuenta_padre, descripcion, se_carga, se_abona'
    )
    .order('codigo')
  if (error) throw error
  return data
}

export async function crearCuenta({
  codigo,
  nombre,
  naturaleza,
  id_cuenta_padre,
  descripcion,
  se_carga = null,
  se_abona = null,
  justificacion = null
}) {
  const { data, error } = await supabase.rpc('crear_cuenta', {
    p_codigo: codigo,
    p_nombre: nombre,
    p_naturaleza: naturaleza,
    p_padre: id_cuenta_padre,
    p_descripcion: descripcion,
    p_se_carga: se_carga,
    p_se_abona: se_abona,
    p_justificacion: justificacion
  })
  if (error) throw error
  return data
}

export async function modificarCuenta({
  id,
  codigo,
  nombre,
  naturaleza,
  justificacion
}) {
  const { error } = await supabase.rpc('modificar_cuenta', {
    p_id: id,
    p_codigo: codigo,
    p_nombre: nombre,
    p_naturaleza: naturaleza,
    p_justificacion: justificacion
  })
  if (error) throw error
}

export async function eliminarCuenta({ id, justificacion }) {
  const { error } = await supabase.rpc('eliminar_cuenta', {
    p_id: id,
    p_justificacion: justificacion
  })
  if (error) throw error
}
