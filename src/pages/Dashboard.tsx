import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, logout } from '../lib/auth'
import {
  createAsset,
  deleteAsset,
  fetchAppSettings,
  fetchAssets,
  updateAppState,
  updateAsset,
} from '../lib/supabase'
import { APP_STATE_OPTIONS, type AppDisplayState } from '../types/appSettings'
import {
  assetToForm,
  formToPayload,
  type AssetForm,
  type AssetRow,
} from '../types/asset'

const emptyForm = (): AssetForm => ({
  assets_name: '',
  symbol: '',
  assets_balance: '0',
  last: '0',
  daily_change_percentage: '0',
  user: '',
  pending: '',
})

export default function Dashboard() {
  const navigate = useNavigate()
  const session = getSession()

  const [assets, setAssets] = useState<AssetRow[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<AssetForm>(emptyForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [appState, setAppState] = useState<AppDisplayState>('A')
  const [savingState, setSavingState] = useState(false)

  const loadAssets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchAssets()
      setAssets(rows)
      setSelectedId((current) => {
        if (current !== null && rows.some((row) => row.id === current)) {
          const asset = rows.find((row) => row.id === current)!
          setForm(assetToForm(asset))
          return current
        }
        if (rows.length === 0) {
          setForm(emptyForm())
          return null
        }
        setForm(assetToForm(rows[0]))
        return rows[0].id
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAppState = useCallback(async () => {
    try {
      const settings = await fetchAppSettings()
      setAppState(settings.state ?? 'A')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load app state')
    }
  }, [])

  useEffect(() => {
    void loadAssets()
    void loadAppState()
  }, [loadAssets, loadAppState])

  async function handleStateChange(nextState: AppDisplayState) {
    setSavingState(true)
    setMessage('')
    setError('')

    try {
      await updateAppState(nextState)
      setAppState(nextState)
      setMessage(`App state set to ${nextState}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update app state')
    } finally {
      setSavingState(false)
    }
  }

  function selectAsset(asset: AssetRow) {
    setSelectedId(asset.id)
    setForm(assetToForm(asset))
    setMessage('')
    setError('')
  }

  function updateField<K extends keyof AssetForm>(key: K, value: AssetForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (selectedId === null) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      await updateAsset(selectedId, formToPayload(form))
      setMessage('Asset updated successfully')
      await loadAssets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate() {
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await createAsset(formToPayload(form))
      setMessage('New asset created')
      await loadAssets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (selectedId === null) return
    if (!confirm('Delete this asset?')) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      await deleteAsset(selectedId)
      setSelectedId(null)
      setForm(emptyForm())
      setMessage('Asset deleted')
      await loadAssets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleNewAsset() {
    setSelectedId(null)
    setForm(emptyForm())
    setMessage('')
    setError('')
  }

  const totalBalance = assets.reduce((sum, a) => sum + (a.assets_balance || 0), 0)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Exodus Admin</h1>
          <p>Manage portfolio assets in Supabase</p>
        </div>
        <div className="header-actions">
          <span className="user-pill">{session?.email}</span>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="state-panel">
        <div className="panel-head">
          <h2>App display state</h2>
          <span className="state-pill">Current: {appState}</span>
        </div>
        <div className="state-options">
          {APP_STATE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`state-option ${appState === option.value ? 'active' : ''}`}
              onClick={() => handleStateChange(option.value)}
              disabled={savingState}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-card">
          <span>Total assets</span>
          <strong>{assets.length}</strong>
        </div>
        <div className="stat-card">
          <span>Portfolio value</span>
          <strong>${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="stat-card">
          <span>Pending transfers</span>
          <strong>{assets.filter((a) => (a.pending ?? 0) > 0).length}</strong>
        </div>
      </section>

      <div className="dashboard-grid">
        <aside className="asset-list-panel">
          <div className="panel-head">
            <h2>Assets</h2>
            <button type="button" className="btn-small" onClick={handleNewAsset}>
              + New
            </button>
          </div>

          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <ul className="asset-list">
              {assets.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    className={`asset-list-item ${selectedId === asset.id ? 'active' : ''}`}
                    onClick={() => selectAsset(asset)}
                  >
                    <span className="asset-symbol">{asset.symbol}</span>
                    <span className="asset-name">{asset.assets_name}</span>
                    <span className="asset-balance">
                      ${Number(asset.assets_balance).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="editor-panel">
          <div className="panel-head">
            <h2>{selectedId ? `Edit #${selectedId}` : 'New asset'}</h2>
          </div>

          <form onSubmit={handleSave} className="asset-form">
            <div className="form-grid">
              <label>
                Name
                <input
                  value={form.assets_name}
                  onChange={(e) => updateField('assets_name', e.target.value)}
                  required
                />
              </label>
              <label>
                Symbol
                <input
                  value={form.symbol}
                  onChange={(e) => updateField('symbol', e.target.value.toUpperCase())}
                  required
                />
              </label>
              <label>
                Balance (USD)
                <input
                  type="number"
                  step="0.01"
                  value={form.assets_balance}
                  onChange={(e) => updateField('assets_balance', e.target.value)}
                />
              </label>
              <label>
                Price (last)
                <input
                  type="number"
                  step="0.0001"
                  value={form.last}
                  onChange={(e) => updateField('last', e.target.value)}
                />
              </label>
              <label>
                Daily change %
                <input
                  type="number"
                  step="0.01"
                  value={form.daily_change_percentage}
                  onChange={(e) => updateField('daily_change_percentage', e.target.value)}
                />
              </label>
              <label>
                User
                <input
                  value={form.user}
                  onChange={(e) => updateField('user', e.target.value)}
                  placeholder="userA or empty for all"
                />
              </label>
              <label>
                Pending (USD)
                <input
                  type="number"
                  step="0.01"
                  value={form.pending}
                  onChange={(e) => updateField('pending', e.target.value)}
                  placeholder="0 = hidden in app"
                />
              </label>
            </div>

            {message && <p className="form-success">{message}</p>}
            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              {selectedId !== null ? (
                <>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCreate}
                  disabled={saving}
                >
                  {saving ? 'Creating…' : 'Create asset'}
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={loadAssets} disabled={saving}>
                Refresh
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
