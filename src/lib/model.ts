/** Domain model. Everything downstream (filters, stats, views) speaks these types. */

export type Channel = 'retail' | 'digital'

/** One line item of one order — the atom of every analysis in this app. */
export interface OrderItem {
  /** Stable synthetic id: `${orderId}#${index}`. */
  id: string
  orderId: string
  asin: string
  name: string
  quantity: number
  /** Net price per unit, as exported. */
  unitPrice: number
  /** Tax per unit, as exported. */
  unitTax: number
  /** Discounts for this line (negative or zero). */
  discount: number
  /** Shipping charge attributed to this line. */
  shipping: number
  /** Gross amount actually paid for this line, incl. tax/shipping/discounts. */
  total: number
  currency: string
  /** ISO timestamp. */
  orderDate: string
  shipDate: string | null
  status: string
  cancelled: boolean
  condition: string | null
  marketplace: string
  paymentMethod: string | null
  shippingOption: string | null
  carrier: string | null
  seller: string | null
  gift: boolean
  channel: Channel
  /** Category as delivered by the export, if the format carries one. */
  sourceCategory: string | null
}

/** Line item plus everything derived at load time. */
export interface EnrichedItem extends OrderItem {
  category: string
  /** How the category was determined. */
  categorySource: 'override' | 'rule' | 'export' | 'fallback'
  year: number
  month: string // YYYY-MM
  /** 0 = Sunday. */
  weekday: number
  hour: number
  /** Whole days between order and shipment, null when unknown. */
  shipLagDays: number | null
  /** Gross amount converted into the display currency. */
  amount: number
}

/** Line items of one order id, aggregated. */
export interface Order {
  id: string
  date: string
  marketplace: string
  currency: string
  channel: Channel
  cancelled: boolean
  paymentMethod: string | null
  items: EnrichedItem[]
  itemCount: number
  /** Sum of item amounts in display currency. */
  amount: number
  shipping: number
  discount: number
  tax: number
  refunded: number
  categories: string[]
}

export interface Refund {
  orderId: string
  date: string | null
  createdAt: string | null
  amount: number
  currency: string
  quantity: number
  reason: string | null
  status: string | null
  marketplace: string | null
}

export interface ReturnRequest {
  orderId: string
  asin: string
  name: string
  reason: string | null
  method: string | null
}

export interface CartEntry {
  asin: string
  name: string
  addedAt: string
  quantity: number
  source: string | null
  list: string | null
}

export type SourceKind =
  | 'orderHistory'
  | 'digitalOrders'
  | 'refunds'
  | 'returnRequests'
  | 'cartHistory'
  | 'unknown'

export interface SourceInfo {
  file: string
  kind: SourceKind
  rows: number
  /** Rows dropped because they carried no usable order data. */
  skipped: number
  notes: string[]
}

export interface Dataset {
  items: OrderItem[]
  refunds: Refund[]
  returns: ReturnRequest[]
  cart: CartEntry[]
  sources: SourceInfo[]
  importedAt: string
}

export const emptyDataset = (): Dataset => ({
  items: [],
  refunds: [],
  returns: [],
  cart: [],
  sources: [],
  importedAt: new Date().toISOString(),
})
