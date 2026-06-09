import type { AssetPendingRow } from '../types/pending'
import { getSupabase } from './supabase'

export async function fetchPendingsForAsset(assetId: number): Promise<AssetPendingRow[]> {
  const { data, error } = await getSupabase()
    .from('asset_pendings')
    .select('*')
    .eq('asset_id', assetId)
    .order('id')

  if (error) throw error
  return (data ?? []) as AssetPendingRow[]
}

export async function createPending(
  assetId: number,
  amountUsd: number,
  source: string,
): Promise<void> {
  const { error } = await getSupabase().from('asset_pendings').insert({
    asset_id: assetId,
    amount_usd: amountUsd,
    source,
  })

  if (error) throw error
}

export async function updatePending(
  pendingId: number,
  amountUsd: number,
  source: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from('asset_pendings')
    .update({ amount_usd: amountUsd, source })
    .eq('id', pendingId)

  if (error) throw error
}

export async function deletePending(pendingId: number): Promise<void> {
  const { error } = await getSupabase().from('asset_pendings').delete().eq('id', pendingId)
  if (error) throw error
}
