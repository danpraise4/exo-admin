import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AppDisplayState, AppSettingsRow } from '../types/appSettings'
import type { AssetRow } from '../types/asset'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase credentials.',
    )
  }
  if (!client) {
    client = createClient(url!, anonKey!)
  }
  return client
}

export async function fetchAssets(): Promise<AssetRow[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('assets')
    .select('*, asset_pendings(*)')
    .order('id')

  if (!error) {
    return (data ?? []) as AssetRow[]
  }

  // Fallback when migration not applied yet (no asset_pendings table/relation).
  if (/asset_pendings|relationship/i.test(error.message)) {
    const fallback = await supabase.from('assets').select('*').order('id')
    if (fallback.error) throw fallback.error
    return ((fallback.data ?? []) as AssetRow[]).map((row) => ({
      ...row,
      asset_pendings: [],
    }))
  }

  throw error
}

export async function updateAsset(
  id: number,
  payload: ReturnType<typeof import('../types/asset').formToPayload>,
) {
  const { error } = await getSupabase().from('assets').update(payload).eq('id', id)
  if (error) throw error
}

export async function createAsset(
  payload: ReturnType<typeof import('../types/asset').formToPayload>,
) {
  const { error } = await getSupabase().from('assets').insert(payload)
  if (error) throw error
}

export async function deleteAsset(id: number) {
  const { error } = await getSupabase().from('assets').delete().eq('id', id)
  if (error) throw error
}

export async function fetchAppSettings(): Promise<AppSettingsRow> {
  const { data, error } = await getSupabase()
    .from('app_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error

  return (data ?? { id: 1, state: 'A' }) as AppSettingsRow
}

export async function updateAppState(state: AppDisplayState) {
  const { error } = await getSupabase()
    .from('app_settings')
    .update({ state })
    .eq('id', 1)

  if (error) throw error
}
