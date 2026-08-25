import { ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import { HistogramChart } from '../components/charts'
import { Badge, Card, Empty, Kpi } from '../components/ui'
import { day, money, number, percent, productUrl, truncate } from '../lib/format'
import {
  byHour,
  byProduct,
  byWeekday,
  computeKpis,
  groupBy,
  marketplaceBreakdown,
  paymentBreakdown,
  priceHistogram,
  refundStats,
  shipLag,
} from '../lib/stats'
import { useStore } from '../state/store'

export function InsightsView() {
  const { orders, items, dataset, settings, colors } = useStore()
  const { locale, displayCurrency: cur } = settings
  const m = (v: number) => money(v, cur, locale)

  const kpis = useMemo(() => computeKpis(orders), [orders])
  const products = useMemo(() => byProduct(items), [items])
  const repeats = useMemo(() => products.filter((p) => p.purchases > 1).sort((a, b) => b.purchases - a.purchases), [products])
  const weekdays = useMemo(() => byWeekday(orders, locale), [orders, locale])
  const hours = useMemo(() => byHour(orders), [orders])
  const prices = useMemo(() => priceHistogram(items), [items])
  const markets = useMemo(() => marketplaceBreakdown(orders), [orders])
  const payments = useMemo(() => paymentBreakdown(orders), [orders])
  const lag = useMemo(() => shipLag(items), [items])
  const refunds = useMemo(() => refundStats(dataset.refunds, settings), [dataset.refunds, settings])
  const conditions = useMemo(() => groupBy(items, (i) => i.condition), [items])
  const biggest = useMemo(() => [...orders].sort((a, b) => b.amount - a.amount).slice(0, 8), [orders])

  if (!orders.length) return <Empty title="No data in the current selection" />

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Distinct products"
          value={number(products.length, locale)}
          hint={`${number(repeats.length, locale)} bought more than once`}
        />
        <Kpi
          label="Ships within"
          value={lag.median === null ? '—' : `${lag.median.toFixed(1)} days`}
          hint={
            lag.measured
              ? `${percent(lag.sameDay / lag.measured, locale)} within a day · ${number(lag.measured, locale)} shipments`
              : 'no ship dates in data'
          }
        />
        <Kpi
          label="Busiest weekday"
          value={weekdays.reduce((best, d) => (d.count > best.count ? d : best), weekdays[0]).label}
          hint={`${number(Math.max(...weekdays.map((d) => d.count)), locale)} orders`}
        />
        <Kpi
          label="Refunds"
          value={m(refunds.amount)}
          hint={`${number(refunds.count, locale)} records · ${percent(kpis.refundRate, locale)} of orders`}
          tone="positive"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="When do you order?" subtitle="Orders per weekday">
          <HistogramChart data={weekdays} mode="count" color="#3b82f6" />
        </Card>
        <Card title="Time of day" subtitle="Orders per hour, local time of the export">
          <HistogramChart data={hours} mode="count" color="#8b5cf6" />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Price distribution" subtitle="Line items grouped by price per unit">
          <HistogramChart data={prices} mode="count" color="#14b8a6" />
        </Card>
        <Card title="Where and how you paid">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BreakdownList title="Marketplace" rows={markets.map((r) => ({ label: r.label, value: m(r.value), count: r.count }))} />
            <BreakdownList
              title="Payment method"
              rows={payments.slice(0, 6).map((r) => ({ label: r.label, value: m(r.value), count: r.count }))}
            />
          </div>
          {conditions.length > 1 && (
            <div className="mt-4">
              <BreakdownList
                title="Condition"
                rows={conditions.map((r) => ({ label: r.label, value: '', count: r.count }))}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Top products by spend" subtitle="Grouped by ASIN across the whole selection">
          <ProductList products={products.slice(0, 15)} />
        </Card>
        <Card title="Bought again and again" subtitle="Your repeat purchases, most frequent first">
          {repeats.length ? (
            <ProductList products={repeats.slice(0, 15)} showPurchases />
          ) : (
            <Empty title="No repeat purchases in this selection" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Biggest orders">
          <ul className="grid grid-cols-1 gap-2">
            {biggest.map((o) => (
              <li key={o.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{truncate(o.items[0]?.name ?? o.id, 60)}</span>
                  <span className="muted text-xs">
                    {day(o.date, locale)} · {o.itemCount} items · {o.marketplace}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">{m(o.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Returns and refunds" subtitle="From the refund and return files of your export">
          {refunds.byReason.length ? (
            <BreakdownList
              title="Reason"
              rows={refunds.byReason.slice(0, 8).map((r) => ({ label: r.label, value: '', count: r.count }))}
            />
          ) : (
            <Empty
              title="No refund data loaded"
              hint="Import Refund Details.csv from your archive to see this section."
            />
          )}
          {dataset.returns.length > 0 && (
            <div className="mt-4">
              <BreakdownList
                title="Return requests"
                rows={groupBy(dataset.returns, (r) => r.reason)
                  .slice(0, 6)
                  .map((r) => ({ label: r.label, value: '', count: r.count }))}
              />
            </div>
          )}
        </Card>
      </div>

      {dataset.cart.length > 0 && (
        <Card
          title="Still sitting in your cart"
          subtitle={`${dataset.cart.length} saved items from Cart History.csv`}
        >
          <ul className="grid grid-cols-1 gap-1.5">
            {dataset.cart.slice(0, 12).map((c) => {
              const url = productUrl(c.asin, 'amazon.de')
              return (
                <li key={`${c.asin}-${c.addedAt}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{truncate(c.name, 80)}</span>
                  <span className="muted shrink-0 text-xs">{day(c.addedAt, locale)}</span>
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer noopener" className="muted shrink-0 hover:text-inherit">
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <Card title="Lifetime" subtitle="Everything in the current selection">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="First order" value={day(kpis.firstOrder, locale)} />
          <Fact label="Latest order" value={day(kpis.lastOrder, locale)} />
          <Fact label="Active months" value={number(kpis.activeMonths, locale)} />
          <Fact label="Categories touched" value={number(new Set(items.map((i) => i.category)).size, locale)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...new Set(items.map((i) => i.category))].sort().map((c) => (
            <Badge key={c} color={colors[c]}>
              {c}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ProductList({
  products,
  showPurchases = false,
}: {
  products: ReturnType<typeof byProduct>
  showPurchases?: boolean
}) {
  const { settings, colors } = useStore()
  const m = (v: number) => money(v, settings.displayCurrency, settings.locale)
  return (
    <ol className="grid grid-cols-1 gap-2">
      {products.map((p, idx) => {
        const url = productUrl(p.asin, p.marketplace)
        return (
          <li key={p.asin || p.name} className="flex items-start gap-3 text-sm">
            <span className="muted w-5 shrink-0 text-right text-xs tabular-nums">{idx + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block">{truncate(p.name, 68)}</span>
              <span className="muted mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                <Badge color={colors[p.category]}>{p.category}</Badge>
                <span>
                  {p.purchases}× · last {day(p.lastDate, settings.locale)}
                </span>
                {url && (
                  <a href={url} target="_blank" rel="noreferrer noopener" className="hover:underline">
                    {p.asin}
                  </a>
                )}
              </span>
            </span>
            <span className="shrink-0 text-right font-medium tabular-nums">
              {showPurchases ? `${p.purchases}×` : m(p.amount)}
              {showPurchases && <span className="muted block text-[11px]">{m(p.amount)}</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function BreakdownList({
  title,
  rows,
}: {
  title: string
  rows: Array<{ label: string; value: string; count: number }>
}) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div>
      <p className="muted mb-2 text-xs font-semibold tracking-wide uppercase">{title}</p>
      <ul className="grid grid-cols-1 gap-2">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-1 gap-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate">{r.label}</span>
              <span className="muted shrink-0 tabular-nums">
                {r.value && `${r.value} · `}
                {r.count}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-line)' }}>
              <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, background: 'var(--color-accent)' }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="muted text-xs">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
    </div>
  )
}
