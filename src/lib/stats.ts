import { sum } from './enrich'
import type { EnrichedItem, Order, Refund } from './model'
import { rateFor, type Settings } from './settings'

export interface Kpis {
  spend: number
  orders: number
  items: number
  avgOrder: number
  medianOrder: number
  shipping: number
  discounts: number
  tax: number
  refunded: number
  refundedOrders: number
  refundRate: number
  firstOrder: string | null
  lastOrder: string | null
  activeMonths: number
  spendPerMonth: number
  biggestOrder: Order | null
}

export function computeKpis(orders: Order[]): Kpis {
  const spend = sum(orders, (o) => o.amount)
  const amounts = orders.map((o) => o.amount).sort((a, b) => a - b)
  const refundedOrders = orders.filter((o) => o.refunded > 0)
  const dates = orders.map((o) => o.date).sort()
  const first = dates[0] ?? null
  const last = dates[dates.length - 1] ?? null
  const activeMonths = first && last ? monthsBetween(first, last) : 0

  return {
    spend,
    orders: orders.length,
    items: sum(orders, (o) => o.itemCount),
    avgOrder: orders.length ? spend / orders.length : 0,
    medianOrder: median(amounts),
    shipping: sum(orders, (o) => o.shipping),
    discounts: sum(orders, (o) => o.discount),
    tax: sum(orders, (o) => o.tax),
    refunded: sum(refundedOrders, (o) => o.refunded),
    refundedOrders: refundedOrders.length,
    refundRate: orders.length ? refundedOrders.length / orders.length : 0,
    firstOrder: first,
    lastOrder: last,
    activeMonths,
    spendPerMonth: activeMonths ? spend / activeMonths : spend,
    biggestOrder: orders.reduce<Order | null>((best, o) => (!best || o.amount > best.amount ? o : best), null),
  }
}

export interface Bucket {
  key: string
  label: string
  amount: number
  orders: number
  items: number
}

/** Monthly spend with empty months filled in, so the chart shows real gaps. */
export function monthlySeries(orders: Order[]): Bucket[] {
  const map = new Map<string, Bucket>()
  for (const o of orders) {
    const key = o.date.slice(0, 7)
    const b = map.get(key) ?? { key, label: key, amount: 0, orders: 0, items: 0 }
    b.amount += o.amount
    b.orders += 1
    b.items += o.itemCount
    map.set(key, b)
  }
  const keys = [...map.keys()].sort()
  if (!keys.length) return []
  const out: Bucket[] = []
  const cursor = new Date(`${keys[0]}-01T00:00:00Z`)
  const end = new Date(`${keys[keys.length - 1]}-01T00:00:00Z`)
  while (cursor <= end) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`
    out.push(map.get(key) ?? { key, label: key, amount: 0, orders: 0, items: 0 })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return out
}

export function yearlySeries(orders: Order[]): Bucket[] {
  const map = new Map<string, Bucket>()
  for (const o of orders) {
    const key = o.date.slice(0, 4)
    const b = map.get(key) ?? { key, label: key, amount: 0, orders: 0, items: 0 }
    b.amount += o.amount
    b.orders += 1
    b.items += o.itemCount
    map.set(key, b)
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key))
}

export interface CategoryStat {
  category: string
  amount: number
  items: number
  orders: number
  share: number
}

export function byCategory(items: EnrichedItem[]): CategoryStat[] {
  const map = new Map<string, { amount: number; items: number; orders: Set<string> }>()
  for (const i of items) {
    const e = map.get(i.category) ?? { amount: 0, items: 0, orders: new Set<string>() }
    e.amount += i.amount
    e.items += i.quantity
    e.orders.add(i.orderId)
    map.set(i.category, e)
  }
  const total = sum([...map.values()], (e) => e.amount) || 1
  return [...map.entries()]
    .map(([category, e]) => ({
      category,
      amount: e.amount,
      items: e.items,
      orders: e.orders.size,
      share: e.amount / total,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export interface ProductStat {
  asin: string
  name: string
  category: string
  amount: number
  quantity: number
  purchases: number
  firstDate: string
  lastDate: string
  marketplace: string
}

/** Groups items by ASIN — the only reliable product identity across years. */
export function byProduct(items: EnrichedItem[]): ProductStat[] {
  const map = new Map<string, ProductStat>()
  for (const i of items) {
    const key = i.asin || i.name.toLowerCase()
    const e = map.get(key)
    if (!e) {
      map.set(key, {
        asin: i.asin,
        name: i.name,
        category: i.category,
        amount: i.amount,
        quantity: i.quantity,
        purchases: 1,
        firstDate: i.orderDate,
        lastDate: i.orderDate,
        marketplace: i.marketplace,
      })
      continue
    }
    e.amount += i.amount
    e.quantity += i.quantity
    e.purchases += 1
    if (i.orderDate < e.firstDate) e.firstDate = i.orderDate
    if (i.orderDate > e.lastDate) e.lastDate = i.orderDate
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount)
}

export interface Histogram {
  label: string
  value: number
  count: number
}

export function byWeekday(orders: Order[], locale: string): Histogram[] {
  const names = weekdayNames(locale)
  const acc = names.map((label) => ({ label, value: 0, count: 0 }))
  for (const o of orders) {
    const d = new Date(o.date).getDay()
    acc[d].value += o.amount
    acc[d].count += 1
  }
  // Weeks start on Monday for every locale this app realistically sees.
  return [...acc.slice(1), acc[0]]
}

export function byHour(orders: Order[]): Histogram[] {
  const acc = Array.from({ length: 24 }, (_, h) => ({ label: `${String(h).padStart(2, '0')}`, value: 0, count: 0 }))
  for (const o of orders) {
    const h = new Date(o.date).getHours()
    acc[h].value += o.amount
    acc[h].count += 1
  }
  return acc
}

export const PRICE_BUCKETS = [0, 5, 10, 20, 50, 100, 250, 500, 1000]

export function priceHistogram(items: EnrichedItem[]): Histogram[] {
  const acc = PRICE_BUCKETS.map((low, idx) => {
    const high = PRICE_BUCKETS[idx + 1]
    return { label: high ? `${low}–${high}` : `${low}+`, value: 0, count: 0 }
  })
  for (const i of items) {
    const per = i.quantity ? i.amount / i.quantity : i.amount
    let idx = PRICE_BUCKETS.findIndex((low, k) => {
      const high = PRICE_BUCKETS[k + 1]
      return high ? per >= low && per < high : per >= low
    })
    if (idx < 0) idx = acc.length - 1
    acc[idx].count += 1
    acc[idx].value += i.amount
  }
  return acc
}

export function groupBy<T>(list: T[], key: (item: T) => string | null): Histogram[] {
  const map = new Map<string, { value: number; count: number }>()
  for (const item of list) {
    const k = key(item)
    if (!k) continue
    const e = map.get(k) ?? { value: 0, count: 0 }
    e.count += 1
    map.set(k, e)
  }
  return [...map.entries()].map(([label, e]) => ({ label, ...e })).sort((a, b) => b.count - a.count)
}

export function marketplaceBreakdown(orders: Order[]): Histogram[] {
  const map = new Map<string, { value: number; count: number }>()
  for (const o of orders) {
    const e = map.get(o.marketplace) ?? { value: 0, count: 0 }
    e.value += o.amount
    e.count += 1
    map.set(o.marketplace, e)
  }
  return [...map.entries()].map(([label, e]) => ({ label, ...e })).sort((a, b) => b.value - a.value)
}

export function paymentBreakdown(orders: Order[]): Histogram[] {
  const map = new Map<string, { value: number; count: number }>()
  for (const o of orders) {
    const label = o.paymentMethod ?? 'Unknown'
    const e = map.get(label) ?? { value: 0, count: 0 }
    e.value += o.amount
    e.count += 1
    map.set(label, e)
  }
  return [...map.entries()].map(([label, e]) => ({ label, ...e })).sort((a, b) => b.value - a.value)
}

export interface ShipLag {
  average: number | null
  median: number | null
  sameDay: number
  measured: number
}

/** Digital items ship instantly, so they are left out of the delivery-speed view. */
export function shipLag(items: EnrichedItem[]): ShipLag {
  const lags = items
    .filter((i) => i.channel === 'retail')
    .map((i) => i.shipLagDays)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b)
  if (!lags.length) return { average: null, median: null, sameDay: 0, measured: 0 }
  return {
    average: lags.reduce((a, b) => a + b, 0) / lags.length,
    median: median(lags),
    sameDay: lags.filter((v) => v < 1).length,
    measured: lags.length,
  }
}

export interface RefundStat {
  amount: number
  count: number
  byReason: Histogram[]
}

export function refundStats(refunds: Refund[], settings: Settings): RefundStat {
  return {
    amount: sum(refunds, (r) => r.amount * rateFor(settings, r.currency)),
    count: refunds.length,
    byReason: groupBy(refunds, (r) => r.reason ?? 'Unknown'),
  }
}

/** Cumulative spend, useful for showing the lifetime curve. */
export function cumulative(series: Bucket[]): Array<Bucket & { total: number }> {
  let running = 0
  return series.map((b) => {
    running += b.amount
    return { ...b, total: running }
  })
}

export function median(sorted: number[]): number {
  if (!sorted.length) return 0
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function monthsBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso)
  const b = new Date(toIso)
  return Math.max(1, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1)
}

function weekdayNames(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  // 2024-01-07 is a Sunday, which keeps index 0 aligned with Date#getDay.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 7 + i))))
}
