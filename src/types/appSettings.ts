export type AppDisplayState = 'A' | 'B' | 'C'

export type AppSettingsRow = {
  id: number
  state: AppDisplayState
  updated_at?: string
}

export const APP_STATE_OPTIONS: {
  value: AppDisplayState
  label: string
  description: string
}[] = [
  {
    value: 'A',
    label: 'State A — userA',
    description: 'Shows assets where user is userA or empty. Compact cards.',
  },
  {
    value: 'B',
    label: 'State B — userB',
    description: 'Shows assets where user is userB or empty. Compact cards.',
  },
  {
    value: 'C',
    label: 'State C — userA + view',
    description: 'Same assets as A, expanded card layout (useView) for all.',
  },
]
