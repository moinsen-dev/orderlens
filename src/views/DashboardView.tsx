import { useMemo } from 'react'
import { CategoryDonut, SpendOverTime, SpendPerYear } from '../components/charts'
import { OrdersTable } from '../components/OrdersTable'
import { Badge, Bar, Card, Empty, Kpi } from '../components/ui'
import { day, money, number, percent } from '../lib/format'
import { byCategory, computeKpis, monthlySeries, yearlySeries } from '../lib/stats'
import { useStore } from '../state/store'

export function DashboardView() {
  const { orders, items, settings, colors, setView } = useStore()
  const { displayCurrency: cur, locale } = settings

  const kpis = useMemo(() => computeKpis(orders), [orders])
  const months = useMemo(() => monthlySeries(orders), [orders])
  const years = useMemo(() => yearlySeries(orders), [orders])
  const categories = useMemo(() => byCategory(items), [items])

  const m = (v: number) => money(v, cur, locale)

  if (!orders.length) {
    return <Empty title="No orders match the current filters" hint="Widen the date range or clear the filters above." />
  }

  const thisYear = new Date().getFullYear()
  const current = years.find((y) => y.key === String(thisYear))
  const previous = years.find((y) => y.key === String(thisYear - 1))
  const yoy = current && previous && previous.amount > 0 ? current.amount / previous.amount - 1 : null

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total spend"
          value={m(kpis.spend)}
          tone="accent"
          hint={`${day(kpis.firstOrder, locale)} – ${day(kpis.lastOrder, locale)}`}
        />
        <Kpi
          label="Orders"
          value={number(kpis.orders, locale)}
          hint={`${number(kpis.items, locale)} items · ⌀ ${m(kpis.avgOrder)} per order`}
        />
        <Kpi
          label="Per month"
          value={m(kpis.spendPerMonth)}
          hint={`across ${number(kpis.activeMonths, locale)} months`}
        />
        <Kpi
          label={`${thisYear} vs ${thisYear - 1}`}
          value={yoy === null ? '—' : `${yoy > 0 ? '+' : ''}${percent(yoy, locale)}`}
          tone={yoy === null ? 'default' : yoy > 0 ? 'negative' : 'positive'}
          hint={current ? `${m(current.amount)} this year` : 'no orders this year'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-1 content-start gap-4 lg:col-span-2">
          <Card title="Spend over time" subtitle="Monthly totals in the display currency">
            <SpendOverTime data={months} height={300} />
          </Card>
          <Card title="Spend per year" subtitle="Bars: spend · line: number of orders">
            <SpendPerYear data={years} height={280} />
          </Card>
        </div>

        <div className="grid grid-cols-1 content-start gap-4">
          <Card title="Categories" subtitle={`${categories.length} in the current selection`}>
            <CategoryDonut data={categories} height={220} />
            <ul className="mt-3 grid grid-cols-1 gap-2">
              {categories.slice(0, 8).map((c) => (
                <li key={c.category} className="grid grid-cols-1 gap-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Badge color={colors[c.category]}>{c.category}</Badge>
                    <span className="shrink-0 tabular-nums">
                      {m(c.amount)} <span className="muted">({percent(c.share, locale)})</span>
                    </span>
                  </div>
                  <Bar value={c.share} color={colors[c.category]} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Money facts">
            <dl className="grid grid-cols-1 gap-2.5 text-sm">
              <Fact label="Median order" value={m(kpis.medianOrder)} />
              <Fact label="Biggest order" value={kpis.biggestOrder ? m(kpis.biggestOrder.amount) : '—'} />
              <Fact label="Shipping paid" value={m(kpis.shipping)} />
              <Fact label="Discounts received" value={m(Math.abs(kpis.discounts))} />
              <Fact label="Tax included" value={m(kpis.tax)} />
              <Fact
                label="Refunded"
                value={`${m(kpis.refunded)} · ${number(kpis.refundedOrders, locale)} orders`}
              />
              <Fact label="Refund rate" value={percent(kpis.refundRate, locale)} />
            </dl>
          </Card>
        </div>
      </div>

      <section>
        <header className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Latest orders</h2>
          <button type="button" className="btn btn-ghost text-xs" onClick={() => setView('orders')}>
            View all
          </button>
        </header>
        <OrdersTable orders={orders.slice(0, 10)} />
      </section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="muted text-xs">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
