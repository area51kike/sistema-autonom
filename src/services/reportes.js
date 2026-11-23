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
