import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pbrpdexzxgzhlbeilqmk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_7X60zTMoqKtlygIGGMdTVw_8WTuRev4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
