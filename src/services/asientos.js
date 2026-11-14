import { supabase } from './supabase'

// detalles: [{ id_cuenta, debe, haber }]
export async function registrarAsiento({ fecha, descripcion, tipo, detalles }) {
  const { data, error } = await supabase.rpc('registrar_asiento', {
    p_fecha: fecha,
    p_descripcion: descripcion,
    p_tipo: tipo,
    p_detalles: detalles
  })
  if (error) throw error
  return data
}

export async function modificarAsiento({
  id,
  fecha,
  descripcion,
  tipo,
  detalles,
  justificacion
}) {
  const { error } = await supabase.rpc('modificar_asiento', {
    p_id: id,
    p_fecha: fecha,
    p_descripcion: descripcion,
    p_tipo: tipo,
    p_detalles: detalles,
    p_justificacion: justificacion
  })
  if (error) throw error
}

export async function listarAsientos(limite = 30, tipo = null) {
  let consulta = supabase
    .from('asiento_contable')
    .select(
      'id_asiento, fecha, descripcion, tipo, detalle_asiento(id_detalle, id_cuenta, debe, haber, catalogo_cuentas(codigo, nombre))'
    )
    .order('fecha', { ascending: false })
    .order('id_asiento', { ascending: false })
    .limit(limite)
  if (tipo) consulta = consulta.eq('tipo', tipo)
  const { data, error } = await consulta
  if (error) throw error
  return data
}
