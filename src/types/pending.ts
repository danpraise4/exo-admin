export type AssetPendingRow = {
  id: number
  asset_id: number
  amount_usd: number
  source: string
  created_at?: string
}

export type PendingForm = {
  amount_usd: string
  source: string
}
