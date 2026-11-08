import { supabase } from './supabase'

export async function obtenerSaldos({ desde = null, hasta = null } = {}) {
  const { data, error } = await supabase.rpc('saldos_cuentas', {
    p_desde: desde,
    p_hasta: hasta
  })
  if (error) throw error
  return data.map(r => ({
    ...r,
    debe: Number(r.debe),
    haber: Number(r.haber),
    saldo: Number(r.saldo)
  }))
}
