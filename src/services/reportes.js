import { supabase } from './supabase'

export async function obtenerSaldos({ desde = null, hasta = null, ajustes = null } = {}) {
  const { data, error } = await supabase.rpc('saldos_cuentas_v2', {
    p_desde: desde,
    p_hasta: hasta,
    p_ajustes: ajustes
  })
  if (error) throw error
  return data.map(r => ({
    ...r,
    debe: Number(r.debe),
    haber: Number(r.haber),
    saldo: Number(r.saldo)
  }))
}
export async function obtenerMovimientos({ idCuenta, desde = null, hasta = null }) {
  let consulta = supabase
    .from('detalle_asiento')
    .select(
      'id_detalle, debe, haber, asiento_contable!inner(id_asiento, fecha, descripcion, tipo)'
    )
    .eq('id_cuenta', idCuenta)

  if (desde) consulta = consulta.gte('asiento_contable.fecha', desde)
  if (hasta) consulta = consulta.lte('asiento_contable.fecha', hasta)

  const { data, error } = await consulta
  if (error) throw error

  return data
    .map(r => ({
      id_detalle: r.id_detalle,
      fecha: r.asiento_contable.fecha,
      numero: r.asiento_contable.id_asiento,
      concepto: r.asiento_contable.descripcion,
      tipo: r.asiento_contable.tipo,
      debe: Number(r.debe || 0),
      haber: Number(r.haber || 0)
    }))
    .sort(
      (a, b) =>
        a.fecha.localeCompare(b.fecha) ||
        a.numero - b.numero ||
        a.id_detalle - b.id_detalle
    )
}
