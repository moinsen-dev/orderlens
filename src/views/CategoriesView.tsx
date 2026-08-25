import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { HorizontalBars } from '../components/charts'
import { Badge, Bar, Card, Empty, Toggle } from '../components/ui'
import { PALETTE, UNCATEGORISED, defaultRules, type CategoryRule } from '../lib/categories'
import { money, percent, truncate } from '../lib/format'
import { byCategory, byProduct } from '../lib/stats'
import { useStore } from '../state/store'

export function CategoriesView() {
  const { items, settings, categories, setCategories, colors, assignCategory, setFilters, setView, facets } =
    useStore()
  const stats = useMemo(() => byCategory(items), [items])
  const uncategorised = useMemo(
    () => byProduct(items.filter((i) => i.category === UNCATEGORISED)).slice(0, 60),
    [items],
  )
  const m = (v: number) => money(v, settings.displayCurrency, settings.locale)

  const update = (rules: CategoryRule[]) => setCategories({ ...categories, rules })

  const move = (idx: number, delta: number) => {
    const next = [...categories.rules]
    const target = idx + delta
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    update(next)
  }

  const patch = (id: string, change: Partial<CategoryRule>) =>
    update(categories.rules.map((r) => (r.id === id ? { ...r, ...change } : r)))

  const addRule = () =>
    update([
      ...categories.rules,
      {
        id: `custom-${Date.now().toString(36)}`,
        name: 'New category',
        color: PALETTE[categories.rules.length % PALETTE.length],
        keywords: [],
        enabled: true,
      },
    ])

  const drillDown = (category: string) => {
    setFilters({ categories: [category] })
    setView('orders')
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Spend by category" subtitle="Click a row to inspect its orders">
          {stats.length ? (
            <ul className="grid grid-cols-1 gap-3">
              {stats.map((c) => (
                <li key={c.category}>
                  <button
                    type="button"
                    className="grid grid-cols-1 w-full cursor-pointer gap-1.5 rounded-lg px-1 py-1 text-left hover:bg-[var(--color-canvas)]"
                    onClick={() => drillDown(c.category)}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <Badge color={colors[c.category]}>{c.category}</Badge>
                      <span className="tabular-nums">
                        {m(c.amount)}{' '}
                        <span className="muted text-xs">
                          ({percent(c.share, settings.locale)} · {c.items} items · {c.orders} orders)
                        </span>
                      </span>
                    </div>
                    <Bar value={c.share} color={colors[c.category]} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No items in the current selection" />
          )}
        </Card>

        <Card title="Items per category" subtitle="Counting line items, not money">
          <HorizontalBars
            data={stats.slice(0, 14).map((c) => ({ label: c.category, value: c.amount, count: c.items }))}
            mode="count"
            color="#3b82f6"
          />
        </Card>
      </div>

      <Card
        title="Category rules"
        subtitle="Product names are matched against these keywords, top to bottom — the first match wins."
        action={
          <div className="flex gap-2">
            <button type="button" className="btn text-xs" onClick={addRule}>
              <Plus className="size-3.5" />
              Add rule
            </button>
            <button
              type="button"
              className="btn text-xs"
              onClick={() => setCategories({ ...categories, rules: defaultRules() })}
              title="Restore the built-in rule set"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        }
      >
        <ul className="grid grid-cols-1 gap-2">
          {categories.rules.map((rule, idx) => (
            <li
              key={rule.id}
              className="grid grid-cols-1 gap-2 rounded-lg border p-3"
              style={{ borderColor: 'var(--color-line)' }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={rule.color}
                  onChange={(e) => patch(rule.id, { color: e.target.value })}
                  className="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
                  aria-label={`Colour for ${rule.name}`}
                />
                <input
                  className="input max-w-[240px] flex-1"
                  value={rule.name}
                  onChange={(e) => patch(rule.id, { name: e.target.value })}
                  aria-label="Category name"
                />
                {rule.channel && <Badge>channel: {rule.channel}</Badge>}
                <span className="muted text-xs tabular-nums">
                  {stats.find((s) => s.category === rule.name)?.items ?? 0} items
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Toggle label="" checked={rule.enabled} onChange={(v) => patch(rule.id, { enabled: v })} />
                  <button type="button" className="btn btn-ghost px-2" onClick={() => move(idx, -1)} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" className="btn btn-ghost px-2" onClick={() => move(idx, 1)} aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost px-2 text-rose-500"
                    onClick={() => update(categories.rules.filter((r) => r.id !== rule.id))}
                    aria-label="Delete rule"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <KeywordEditor rule={rule} onChange={(keywords) => patch(rule.id, { keywords })} />
            </li>
          ))}
        </ul>
      </Card>

      <Card
        title="Uncategorised products"
        subtitle={
          uncategorised.length
            ? 'Assign a category directly — the choice is stored per ASIN and beats every rule.'
            : 'Everything in the current selection matched a rule.'
        }
      >
        {uncategorised.length ? (
          <ul className="grid grid-cols-1 gap-1.5">
            {uncategorised.map((p) => (
              <li
                key={p.asin || p.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                style={{ borderColor: 'var(--color-line)' }}
              >
                <span className="min-w-[240px] flex-1 text-sm">{truncate(p.name, 80)}</span>
                <span className="muted text-xs tabular-nums">
                  {p.purchases}× · {m(p.amount)}
                </span>
                <select
                  className="input max-w-[220px]"
                  value=""
                  onChange={(e) => e.target.value && assignCategory(p.asin, e.target.value)}
                  disabled={!p.asin}
                >
                  <option value="">Assign to…</option>
                  {[...new Set([...categories.rules.map((r) => r.name), ...facets.categories])]
                    .filter((c) => c !== UNCATEGORISED)
                    .sort()
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Nothing left to sort" hint="Add keywords to a rule to keep it that way for future imports." />
        )}
        {Object.keys(categories.overrides).length > 0 && (
          <p className="muted mt-3 text-xs">
            {Object.keys(categories.overrides).length} manual assignment(s) active.{' '}
            <button
              type="button"
              className="underline"
              onClick={() => setCategories({ ...categories, overrides: {} })}
            >
              Clear them
            </button>
          </p>
        )}
      </Card>
    </div>
  )
}

function KeywordEditor({ rule, onChange }: { rule: CategoryRule; onChange: (keywords: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .filter((s) => !rule.keywords.includes(s))
    if (parts.length) onChange([...rule.keywords, ...parts])
    setDraft('')
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {rule.keywords.map((k) => (
        <button
          key={k}
          type="button"
          className="chip"
          onClick={() => onChange(rule.keywords.filter((v) => v !== k))}
          title="Remove keyword"
        >
          {k} ×
        </button>
      ))}
      <input
        className="input max-w-[220px] py-1 text-xs"
        placeholder="add keyword, comma separated"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
      />
    </div>
  )
}
