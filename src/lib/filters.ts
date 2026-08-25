import type { Channel, EnrichedItem, Order } from './model'

export interface Filters {
  search: string
  /** Inclusive YYYY-MM-DD bounds. */
  from: string | null
  to: string | null
  categories: string[]
  marketplaces: string[]
  channels: Channel[]
  minAmount: number | null
  maxAmount: number | null
  refundedOnly: boolean
  giftsOnly: boolean
  includeCancelled: boolean
}

export const defaultFilters = (): Filters => ({
  search: '',
  from: null,
  to: null,
  categories: [],
  marketplaces: [],
  channels: [],
  minAmount: null,
  maxAmount: null,
  refundedOnly: false,
  giftsOnly: false,
  includeCancelled: false,
})

export const isFilterActive = (f: Filters): boolean => {
  const d = defaultFilters()
  return (
    f.search !== d.search ||
    f.from !== d.from ||
    f.to !== d.to ||
    f.categories.length > 0 ||
    f.marketplaces.length > 0 ||
    f.channels.length > 0 ||
    f.minAmount !== null ||
    f.maxAmount !== null ||
    f.refundedOnly ||
    f.giftsOnly ||
    f.includeCancelled !== d.includeCancelled
  )
}

/**
 * Filters at the order level, because amount and refund predicates are only
 * meaningful for a whole order. Item-level predicates (search, category) keep
 * an order when at least one of its items matches.
 */
export function applyFilters(orders: Order[], f: Filters): Order[] {
  const needle = f.search.trim().toLowerCase()
  const categories = new Set(f.categories)
  const marketplaces = new Set(f.marketplaces)
  const channels = new Set<Channel>(f.channels)
  const from = f.from ? new Date(`${f.from}T00:00:00`).getTime() : null
  const to = f.to ? new Date(`${f.to}T23:59:59.999`).getTime() : null

  return orders.filter((order) => {
    if (!f.includeCancelled && order.cancelled) return false
    if (channels.size && !channels.has(order.channel)) return false
    if (marketplaces.size && !marketplaces.has(order.marketplace)) return false
    if (f.refundedOnly && order.refunded <= 0) return false

    const time = new Date(order.date).getTime()
    if (from !== null && time < from) return false
    if (to !== null && time > to) return false

    if (f.minAmount !== null && order.amount < f.minAmount) return false
    if (f.maxAmount !== null && order.amount > f.maxAmount) return false

    if (categories.size && !order.categories.some((c) => categories.has(c))) return false
    if (f.giftsOnly && !order.items.some((i) => i.gift)) return false

    if (needle) {
      const hit =
        order.id.toLowerCase().includes(needle) ||
        order.items.some(
          (i) => i.name.toLowerCase().includes(needle) || i.asin.toLowerCase() === needle,
        )
      if (!hit) return false
    }
    return true
  })
}

/** The line items of the filtered orders, narrowed further by item-level predicates. */
export function itemsOf(orders: Order[], f: Filters): EnrichedItem[] {
  const needle = f.search.trim().toLowerCase()
  const categories = new Set(f.categories)
  const out: EnrichedItem[] = []
  for (const order of orders) {
    for (const item of order.items) {
      if (categories.size && !categories.has(item.category)) continue
      if (f.giftsOnly && !item.gift) continue
      if (needle && !(item.name.toLowerCase().includes(needle) || item.asin.toLowerCase() === needle || item.orderId.toLowerCase().includes(needle)))
        continue
      out.push(item)
    }
  }
  return out
}

export type DatePreset = 'all' | 'ytd' | 'last12' | 'thisYear' | 'lastYear' | 'last30' | 'last90'

export function presetRange(preset: DatePreset): { from: string | null; to: string | null } {
  const now = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  switch (preset) {
    case 'ytd':
    case 'thisYear':
      return { from: `${now.getFullYear()}-01-01`, to: iso(now) }
    case 'lastYear':
      return { from: `${now.getFullYear() - 1}-01-01`, to: `${now.getFullYear() - 1}-12-31` }
    case 'last12': {
      const d = new Date(now)
      d.setFullYear(d.getFullYear() - 1)
      return { from: iso(d), to: iso(now) }
    }
    case 'last30': {
      const d = new Date(now.getTime() - 30 * 86_400_000)
      return { from: iso(d), to: iso(now) }
    }
    case 'last90': {
      const d = new Date(now.getTime() - 90 * 86_400_000)
      return { from: iso(d), to: iso(now) }
    }
    default:
      return { from: null, to: null }
  }
}
