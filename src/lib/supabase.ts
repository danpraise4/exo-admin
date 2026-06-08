import { createClient } from '@supabase/supabase-js'
import type { AppDisplayState, AppSettingsRow } from '../types/appSettings'
import type { AssetRow } from '../types/asset'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url, anonKey)

export async function fetchAssets(): Promise<AssetRow[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('id')

  if (error) throw error
  return (data ?? []) as AssetRow[]
}

export async function updateAsset(
  id: number,
  payload: ReturnType<typeof import('../types/asset').formToPayload>,
) {
  const { error } = await supabase.from('assets').update(payload).eq('id', id)
  if (error) throw error
}

export async function createAsset(
  payload: ReturnType<typeof import('../types/asset').formToPayload>,
) {
  const { error } = await supabase.from('assets').insert(payload)
  if (error) throw error
}

export async function deleteAsset(id: number) {
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) throw error
}

export async function fetchAppSettings(): Promise<AppSettingsRow> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error

  return (data ?? { id: 1, state: 'A' }) as AppSettingsRow
}

export async function updateAppState(state: AppDisplayState) {
  const { error } = await supabase
    .from('app_settings')
    .update({ state })
    .eq('id', 1)

  if (error) throw error
}
