import { ChevronRight, ExternalLink, Gift, Undo2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { day, money, productUrl, truncate } from '../lib/format'
import type { Order } from '../lib/model'
import { useStore } from '../state/store'
import { Badge } from './ui'

type SortKey = 'date' | 'amount' | 'items'
const PAGE = 50

export function OrdersTable({ orders }: { orders: Order[] }) {
  const { settings, colors } = useStore()
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' })
  const [limit, setLimit] = useState(PAGE)
  const [open, setOpen] = useState<Set<string>>(new Set())

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...orders].sort((a, b) => {
      if (sort.key === 'date') return a.date.localeCompare(b.date) * dir
      if (sort.key === 'amount') return (a.amount - b.amount) * dir
      return (a.itemCount - b.itemCount) * dir
    })
  }, [orders, sort])

  const toggleSort = (key: SortKey) =>
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }))

  const toggleOpen = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const m = (v: number) => money(v, settings.displayCurrency, settings.locale)
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '')

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-b" style={{ borderColor: 'var(--color-line)' }}>
            <tr>
              <th className="th w-8" />
              <th className="th cursor-pointer select-none" onClick={() => toggleSort('date')}>
                Date{arrow('date')}
              </th>
              <th className="th">Items</th>
              <th className="th">Categories</th>
              <th className="th">Marketplace</th>
              <th className="th cursor-pointer text-right select-none" onClick={() => toggleSort('items')}>
                Qty{arrow('items')}
              </th>
              <th className="th cursor-pointer text-right select-none" onClick={() => toggleSort('amount')}>
                Total{arrow('amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, limit).map((order) => {
              const expanded = open.has(order.id)
              return [
                <tr
                  key={order.id}
                  className="cursor-pointer border-b transition hover:bg-[var(--color-canvas)]"
                  style={{ borderColor: 'var(--color-line)' }}
                  onClick={() => toggleOpen(order.id)}
                >
                  <td className="td">
                    <ChevronRight className={`size-4 transition ${expanded ? 'rotate-90' : ''}`} />
                  </td>
                  <td className="td whitespace-nowrap">
                    <div className="font-medium">{day(order.date, settings.locale)}</div>
                    <div className="muted font-mono text-[11px]">{order.id}</div>
                  </td>
                  <td className="td max-w-[380px]">
                    <div className="clamp-2">{order.items.map((i) => i.name).join(' · ')}</div>
                  </td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      {order.categories.slice(0, 2).map((c) => (
                        <Badge key={c} color={colors[c]}>
                          {c}
                        </Badge>
                      ))}
                      {order.categories.length > 2 && <Badge>+{order.categories.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="td whitespace-nowrap">
                    <span className="muted text-xs">{order.marketplace}</span>
                    <div className="mt-1 flex gap-1">
                      {order.cancelled && <Badge color="#ef4444">cancelled</Badge>}
                      {order.refunded > 0 && (
                        <Badge color="#0ea5e9">
                          <Undo2 className="size-3" />
                          {m(order.refunded)}
                        </Badge>
                      )}
                      {order.items.some((i) => i.gift) && (
                        <Badge color="#ec4899">
                          <Gift className="size-3" />
                          gift
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="td text-right tabular-nums">{order.itemCount}</td>
                  <td className="td text-right font-semibold tabular-nums">{m(order.amount)}</td>
                </tr>,
                expanded && (
                  <tr key={`${order.id}-detail`} className="border-b" style={{ borderColor: 'var(--color-line)' }}>
                    <td />
                    <td colSpan={6} className="px-3 pt-1 pb-4">
                      <div className="rounded-lg border" style={{ borderColor: 'var(--color-line)' }}>
                        <table className="w-full">
                          <tbody>
                            {order.items.map((item) => {
                              const url = productUrl(item.asin, item.marketplace)
                              return (
                                <tr key={item.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-line)' }}>
                                  <td className="td">
                                    <div className="font-medium">{truncate(item.name, 90)}</div>
                                    <div className="muted mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                                      {item.asin && (
                                        url ? (
                                          <a
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="inline-flex items-center gap-1 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {item.asin}
                                            <ExternalLink className="size-3" />
                                          </a>
                                        ) : (
                                          <span>{item.asin}</span>
                                        )
                                      )}
                                      <Badge color={colors[item.category]}>{item.category}</Badge>
                                      {item.condition && item.condition !== 'New' && <span>{item.condition}</span>}
                                      {item.shipDate && <span>shipped {day(item.shipDate, settings.locale)}</span>}
                                      {item.shippingOption && <span>{item.shippingOption}</span>}
                                    </div>
                                  </td>
                                  <td className="td w-16 text-right tabular-nums">×{item.quantity}</td>
                                  <td className="td w-32 text-right tabular-nums">
                                    {m(item.amount)}
                                    {item.discount < 0 && (
                                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                        {m(item.discount)}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="muted mt-2 flex flex-wrap gap-4 text-[11px]">
                        {order.paymentMethod && <span>Paid with {order.paymentMethod}</span>}
                        {order.shipping > 0 && <span>Shipping {m(order.shipping)}</span>}
                        {order.tax > 0 && <span>Tax {m(order.tax)}</span>}
                        {order.currency !== settings.displayCurrency && (
                          <span>Originally in {order.currency}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              ]
            })}
          </tbody>
        </table>
      </div>

      {limit < sorted.length && (
        <div className="border-t p-3 text-center" style={{ borderColor: 'var(--color-line)' }}>
          <button type="button" className="btn" onClick={() => setLimit((v) => v + PAGE * 4)}>
            Show more ({(sorted.length - limit).toLocaleString()} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
