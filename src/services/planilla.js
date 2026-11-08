import { supabase } from './supabase'

export async function procesarPlanilla({
  nombre,
  tipoPersonal,
  salarioBase,
  dias,
  bonos,
  fecha
}) {
  const { data, error } = await supabase.rpc('registrar_planilla', {
    p_nombre: nombre,
    p_tipo: tipoPersonal,
    p_salario_base: salarioBase,
    p_dias: dias,
    p_bonos: bonos || 0,
    p_fecha: fecha
  })
  if (error) throw error
  return data
}

export async function listarPlanillas(limite = 20) {
  const { data, error } = await supabase
    .from('planilla')
    .select('*')
    .order('id_planilla', { ascending: false })
    .limit(limite)
  if (error) throw error
  return data
}
