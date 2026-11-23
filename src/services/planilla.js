import { supabase } from './supabase'

export async function procesarPlanilla({
  nombre,
  tipoPersonal,
  salarioBase,
  dias,
  bonos,
  fecha,
  descuentoDeuda
}) {
  const { data, error } = await supabase.rpc('registrar_planilla', {
    p_nombre: nombre,
    p_tipo: tipoPersonal,
    p_salario_base: salarioBase,
    p_dias: dias,
    p_bonos: bonos || 0,
    p_fecha: fecha,
    p_descuento: descuentoDeuda || 0
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
export async function obtenerDeuda(nombre) {
  const { data, error } = await supabase
    .from('deudas_empleados')
    .select('id_deuda, concepto, monto, abonado, fecha')
    .ilike('nombre_empleado', nombre.trim())
    .eq('estado', 'pendiente')
  if (error) throw error
  const items = (data || []).map(d => ({
    ...d,
    saldo: Number(d.monto) - Number(d.abonado)
  }))
  return { items, total: items.reduce((t, d) => t + d.saldo, 0) }
}
