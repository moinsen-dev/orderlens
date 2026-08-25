import { Download } from 'lucide-react'
import { useMemo } from 'react'
import { OrdersTable } from '../components/OrdersTable'
import { Empty, Kpi } from '../components/ui'
import { download, itemsToCsv, ordersToCsv } from '../lib/exportData'
import { money, number } from '../lib/format'
import { computeKpis } from '../lib/stats'
import { useStore } from '../state/store'

export function OrdersView() {
  const { orders, items, settings } = useStore()
  const kpis = useMemo(() => computeKpis(orders), [orders])
  const m = (v: number) => money(v, settings.displayCurrency, settings.locale)
  const stamp = new Date().toISOString().slice(0, 10)

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Orders in view" value={number(kpis.orders, settings.locale)} />
        <Kpi label="Items" value={number(kpis.items, settings.locale)} />
        <Kpi label="Spend" value={m(kpis.spend)} tone="accent" />
        <Kpi label="Average order" value={m(kpis.avgOrder)} hint={`median ${m(kpis.medianOrder)}`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">All orders</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => download(`orderlens-orders-${stamp}.csv`, ordersToCsv(orders, settings.displayCurrency))}
          >
            <Download className="size-4" />
            Export orders
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => download(`orderlens-items-${stamp}.csv`, itemsToCsv(items, settings.displayCurrency))}
          >
            <Download className="size-4" />
            Export items
          </button>
        </div>
      </div>

      {orders.length ? (
        <OrdersTable orders={orders} />
      ) : (
        <Empty title="Nothing matches these filters" hint="Try a wider date range or clear the search." />
      )}
    </div>
  )
}
