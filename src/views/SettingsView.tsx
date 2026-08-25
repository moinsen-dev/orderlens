import { ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Card, Toggle } from '../components/ui'
import { defaultSettings, type ThemeMode } from '../lib/settings'
import { useStore } from '../state/store'

const CURRENCIES = ['EUR', 'GBP', 'USD', 'CHF', 'CAD', 'AUD', 'JPY', 'INR', 'PLN', 'SEK']
const THEMES: ThemeMode[] = ['system', 'light', 'dark']

export function SettingsView() {
  const { settings, setSettings, clearData, dataset, allItems } = useStore()
  const [confirming, setConfirming] = useState(false)

  const usedCurrencies = [...new Set(allItems.map((i) => i.currency))].sort()
  const foreign = usedCurrencies.filter((c) => c !== settings.displayCurrency)

  return (
    <div className="mx-auto grid grid-cols-1 max-w-3xl gap-4">
      <Card title="Display" subtitle="Formatting only — nothing here changes the underlying data.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="muted mb-1 block text-xs font-medium">Display currency</span>
            <select
              className="input"
              value={settings.displayCurrency}
              onChange={(e) => setSettings({ displayCurrency: e.target.value })}
            >
              {[...new Set([...CURRENCIES, ...usedCurrencies])].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="muted mb-1 block text-xs font-medium">Locale</span>
            <input
              className="input"
              value={settings.locale}
              onChange={(e) => setSettings({ locale: e.target.value })}
              placeholder="de-DE"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <span className="muted mb-1 block text-xs font-medium">Theme</span>
            <div className="flex gap-1.5">
              {THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${settings.theme === t ? 'chip-active' : ''}`}
                  onClick={() => setSettings({ theme: t })}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="self-end">
            <Toggle
              label="Count cancelled orders as spending"
              checked={settings.includeCancelled}
              onChange={(v) => setSettings({ includeCancelled: v })}
            />
          </div>
        </div>
      </Card>

      <Card
        title="Exchange rates"
        subtitle="This app has no network access, so foreign-currency orders are converted with rates you control."
      >
        {foreign.length === 0 ? (
          <p className="muted text-sm">
            All orders are already in {settings.displayCurrency} — no conversion needed.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {foreign.map((c) => (
              <label key={c} className="text-sm">
                <span className="muted mb-1 block text-xs font-medium">
                  1 {c} = ? {settings.displayCurrency}
                </span>
                <input
                  type="number"
                  step="0.0001"
                  className="input"
                  value={settings.rates[c] ?? 1}
                  onChange={(e) =>
                    setSettings({ rates: { ...settings.rates, [c]: Number(e.target.value) || 1 } })
                  }
                />
              </label>
            ))}
          </div>
        )}
        <p className="muted mt-3 text-xs">
          A single fixed rate per currency is an approximation — historic orders were placed at the rate of their
          day. Treat cross-currency totals as an estimate.
        </p>
      </Card>

      <Card title="Your data" subtitle={`${dataset.items.length.toLocaleString()} line items stored in this browser`}>
        <ul className="muted grid grid-cols-1 gap-1 text-xs">
          <li>Imported: {new Date(dataset.importedAt).toLocaleString(settings.locale)}</li>
          <li>Files: {dataset.sources.map((s) => s.file).join(', ') || '—'}</li>
          <li>Refund records: {dataset.refunds.length.toLocaleString()}</li>
          <li>Cart entries: {dataset.cart.length.toLocaleString()}</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {confirming ? (
            <>
              <button
                type="button"
                className="btn border-transparent bg-rose-600 text-white hover:brightness-110"
                onClick={() => void clearData()}
              >
                <Trash2 className="size-4" />
                Yes, delete everything
              </button>
              <button type="button" className="btn" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="btn" onClick={() => setConfirming(true)}>
              <Trash2 className="size-4" />
              Delete imported data
            </button>
          )}
          <button type="button" className="btn" onClick={() => setSettings(defaultSettings())}>
            Reset display settings
          </button>
        </div>
      </Card>

      <Card title="About">
        <p className="text-sm">
          <strong>OrderLens</strong> turns the CSV export Amazon hands you into something you can actually read.
          It runs entirely in your browser: no backend, no upload, no tracking.
        </p>
        <p className="muted mt-2 text-xs">
          Not affiliated with, endorsed by, or connected to Amazon.com, Inc. &quot;Amazon&quot; is a trademark of its
          respective owner and is used here only to describe the data format this tool reads.
        </p>
        <a
          className="btn mt-3"
          href="https://github.com/moinsen-dev/orderlens"
          target="_blank"
          rel="noreferrer noopener"
        >
          <ExternalLink className="size-4" />
          Source &amp; issues
        </a>
      </Card>
    </div>
  )
}
