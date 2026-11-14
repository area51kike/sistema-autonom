import { supabase } from './supabase'

export async function listarBitacora({ limite = 300, modulo = null } = {}) {
  let q = supabase
    .from('bitacora')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limite)
  if (modulo) q = q.eq('modulo', modulo)
  const { data, error } = await q
  if (error) throw error
  return data
}
