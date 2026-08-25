import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { isFilterActive, presetRange, type DatePreset } from '../lib/filters'
import type { Channel } from '../lib/model'
import { useStore } from '../state/store'
import { Toggle } from './ui'

const PRESETS: Array<{ id: DatePreset; label: string }> = [
  { id: 'all', label: 'All time' },
  { id: 'thisYear', label: 'This year' },
  { id: 'lastYear', label: 'Last year' },
  { id: 'last12', label: 'Last 12 months' },
  { id: 'last90', label: 'Last 90 days' },
]

export function FilterBar() {
  const { filters, setFilters, resetFilters, facets, colors, orders, allOrders } = useStore()
  const [open, setOpen] = useState(false)
  const active = isFilterActive(filters)

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const applyPreset = (id: DatePreset) => setFilters(presetRange(id))
  const currentPreset = PRESETS.find((p) => {
    const r = presetRange(p.id)
    return r.from === filters.from && r.to === filters.to
  })?.id

  return (
    <div className="card sticky top-0 z-20 mb-4 p-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="muted pointer-events-none absolute top-2.5 left-3 size-4" />
          <input
            className="input pl-9"
            placeholder="Search product, ASIN or order id…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip ${currentPreset === p.id ? 'chip-active' : ''}`}
              onClick={() => applyPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button type="button" className="btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <SlidersHorizontal className="size-4" />
          More
          <ChevronDown className={`size-3.5 transition ${open ? 'rotate-180' : ''}`} />
        </button>

        {active && (
          <button type="button" className="btn btn-ghost" onClick={resetFilters} title="Reset all filters">
            <RotateCcw className="size-4" />
            Reset
          </button>
        )}

        <span className="muted ml-auto text-xs tabular-nums">
          {orders.length.toLocaleString()} of {allOrders.length.toLocaleString()} orders
        </span>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-4 border-t pt-3" style={{ borderColor: 'var(--color-line)' }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs">
              <span className="muted mb-1 block font-medium">From</span>
              <input
                type="date"
                className="input"
                value={filters.from ?? ''}
                onChange={(e) => setFilters({ from: e.target.value || null })}
              />
            </label>
            <label className="text-xs">
              <span className="muted mb-1 block font-medium">To</span>
              <input
                type="date"
                className="input"
                value={filters.to ?? ''}
                onChange={(e) => setFilters({ to: e.target.value || null })}
              />
            </label>
            <label className="text-xs">
              <span className="muted mb-1 block font-medium">Min order total</span>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={filters.minAmount ?? ''}
                onChange={(e) => setFilters({ minAmount: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </label>
            <label className="text-xs">
              <span className="muted mb-1 block font-medium">Max order total</span>
              <input
                type="number"
                className="input"
                placeholder="∞"
                value={filters.maxAmount ?? ''}
                onChange={(e) => setFilters({ maxAmount: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </label>
          </div>

          <div>
            <p className="muted mb-1.5 text-xs font-medium">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {facets.categories.map((c) => {
                const on = filters.categories.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${on ? 'chip-active' : ''}`}
                    style={on ? { background: colors[c] ?? 'var(--color-accent)' } : undefined}
                    onClick={() => setFilters({ categories: toggleIn(filters.categories, c) })}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="muted mb-1.5 text-xs font-medium">Marketplace</p>
              <div className="flex flex-wrap gap-1.5">
                {facets.marketplaces.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`chip ${filters.marketplaces.includes(m) ? 'chip-active' : ''}`}
                    onClick={() => setFilters({ marketplaces: toggleIn(filters.marketplaces, m) })}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="muted mb-1.5 text-xs font-medium">Channel</p>
              <div className="flex gap-1.5">
                {(['retail', 'digital'] as Channel[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${filters.channels.includes(c) ? 'chip-active' : ''}`}
                    onClick={() =>
                      setFilters({ channels: toggleIn(filters.channels, c) as Channel[] })
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 self-end">
              <Toggle
                label="Refunded only"
                checked={filters.refundedOnly}
                onChange={(v) => setFilters({ refundedOnly: v })}
              />
              <Toggle label="Gifts only" checked={filters.giftsOnly} onChange={(v) => setFilters({ giftsOnly: v })} />
              <Toggle
                label="Include cancelled"
                checked={filters.includeCancelled}
                onChange={(v) => setFilters({ includeCancelled: v })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
