import { supabase } from './supabase'

export async function listarColaboradores() {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

export async function crearColaborador({ nombre, tipoPersonal, salarioBase }) {
  const { data, error } = await supabase
    .from('colaboradores')
    .insert({
      nombre: nombre.trim(),
      tipo_personal: tipoPersonal,
      salario_base: salarioBase
    })
    .select()
    .single()
  if (error) {
    if (error.code === '23505')
      throw new Error('Ya existe un colaborador con ese nombre')
    throw error
  }
  return data
}

export async function asignarDeuda({ nombre, concepto, monto, fecha }) {
  const { data, error } = await supabase.rpc('asignar_deuda', {
    p_nombre: nombre,
    p_concepto: concepto || null,
    p_monto: monto,
    p_fecha: fecha
  })
  if (error) throw error
  return data
}
