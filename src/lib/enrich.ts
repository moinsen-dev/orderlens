import type { Categoriser } from './categories'
import type { Dataset, EnrichedItem, Order } from './model'
import { rateFor, type Settings } from './settings'

const DAY = 86_400_000

/** Adds derived fields (category, calendar buckets, converted amount) to every line item. */
export function enrichItems(dataset: Dataset, categorise: Categoriser, settings: Settings): EnrichedItem[] {
  return dataset.items.map((item) => {
    const { category, source } = categorise(item)
    const d = new Date(item.orderDate)
    // Kept fractional: rounding to whole days turns "ordered 10:00, shipped
    // 21:00" into a zero and makes the median collapse to 0 for most accounts.
    const shipLagDays = item.shipDate
      ? Math.round(Math.max(0, (new Date(item.shipDate).getTime() - d.getTime()) / DAY) * 100) / 100
      : null

    return {
      ...item,
      category,
      categorySource: source,
      year: d.getFullYear(),
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      weekday: d.getDay(),
      hour: d.getHours(),
      shipLagDays,
      amount: item.total * rateFor(settings, item.currency),
    }
  })
}

/** Groups line items into orders and folds refunds onto them. */
export function buildOrders(items: EnrichedItem[], dataset: Dataset, settings: Settings): Order[] {
  const refundByOrder = new Map<string, number>()
  for (const r of dataset.refunds) {
    const value = r.amount * rateFor(settings, r.currency)
    refundByOrder.set(r.orderId, (refundByOrder.get(r.orderId) ?? 0) + value)
  }

  const byId = new Map<string, EnrichedItem[]>()
  for (const item of items) {
    const list = byId.get(item.orderId)
    if (list) list.push(item)
    else byId.set(item.orderId, [item])
  }

  const orders: Order[] = []
  for (const [id, list] of byId) {
    const first = list[0]
    orders.push({
      id,
      date: list.reduce((min, i) => (i.orderDate < min ? i.orderDate : min), first.orderDate),
      marketplace: first.marketplace,
      currency: first.currency,
      channel: first.channel,
      cancelled: list.every((i) => i.cancelled),
      paymentMethod: first.paymentMethod,
      items: list,
      itemCount: list.reduce((n, i) => n + i.quantity, 0),
      amount: sum(list, (i) => i.amount),
      shipping: sum(list, (i) => i.shipping * rate(i, settings)),
      discount: sum(list, (i) => i.discount * rate(i, settings)),
      tax: sum(list, (i) => i.unitTax * i.quantity * rate(i, settings)),
      refunded: refundByOrder.get(id) ?? 0,
      categories: [...new Set(list.map((i) => i.category))],
    })
  }

  return orders.sort((a, b) => b.date.localeCompare(a.date))
}

const rate = (item: EnrichedItem, settings: Settings) => rateFor(settings, item.currency)

export function sum<T>(list: readonly T[], pick: (item: T) => number): number {
  let total = 0
  for (const item of list) total += pick(item)
  return total
}
