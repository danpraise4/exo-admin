import type { AssetPendingRow } from './pending'

export type AssetRow = {
  id: number
  created_at?: string
  assets_balance: number
  symbol: string
  last: number
  daily_change_percentage: number
  assets_name: string
  user: string | null
  asset_pendings?: AssetPendingRow[]
}

export type AssetForm = {
  assets_name: string
  symbol: string
  assets_balance: string
  last: string
  daily_change_percentage: string
  user: string
}

export function assetToForm(asset: AssetRow): AssetForm {
  return {
    assets_name: asset.assets_name ?? '',
    symbol: asset.symbol ?? '',
    assets_balance: String(asset.assets_balance ?? 0),
    last: String(asset.last ?? 0),
    daily_change_percentage: String(asset.daily_change_percentage ?? 0),
    user: asset.user ?? '',
  }
}

/** Only columns that exist on the Supabase `assets` table. */
export function formToPayload(form: AssetForm) {
  return {
    assets_name: form.assets_name.trim(),
    symbol: form.symbol.trim().toUpperCase(),
    assets_balance: Number(form.assets_balance) || 0,
    last: Number(form.last) || 0,
    daily_change_percentage: Number(form.daily_change_percentage) || 0,
    user: form.user.trim() || null,
  }
}
