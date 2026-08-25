import { bool, date, num, str, type Row } from '../csv'
import type { OrderItem } from '../model'

const currencyForSite = (site: string | null): string => {
  const s = (site ?? '').toLowerCase()
  if (s.includes('.co.uk') || s.includes('uk')) return 'GBP'
  if (s.includes('.com') && !s.includes('.com.')) return 'USD'
  if (s.includes('.ca')) return 'CAD'
  if (s.includes('.jp')) return 'JPY'
  if (s.includes('.au')) return 'AUD'
  if (s.includes('.in')) return 'INR'
  return 'EUR'
}

/**
 * Parses the retail order history. Column names differ between export
 * generations (EU "Order History.csv", US "Retail.OrderHistory.N.csv" and the
 * legacy "Order History Report"), so every field is looked up through aliases.
 */
export function parseOrderHistory(rows: Row[]): { items: OrderItem[]; skipped: number } {
  const items: OrderItem[] = []
  let skipped = 0
  const perOrder = new Map<string, number>()

  for (const row of rows) {
    const orderId = str(row, 'Order ID', 'Order Id', 'OrderID')
    const orderDate = date(row, 'Order Date', 'Order Placed Date')
    const name = str(row, 'Product Name', 'Title', 'Item Name')
    if (!orderId || !orderDate) {
      skipped++
      continue
    }

    const seq = perOrder.get(orderId) ?? 0
    perOrder.set(orderId, seq + 1)

    const quantity = Math.max(1, num(row, 'Original Quantity', 'Quantity', 'Quantity Ordered', 'Item Quantity') || 1)
    const unitPrice = num(row, 'Unit Price', 'Purchase Price Per Unit', 'Per Unit Price')
    const unitTax = num(row, 'Unit Price Tax', 'Item Subtotal Tax')
    const discount = -Math.abs(num(row, 'Total Discounts', 'Item Promotion Discount', 'Total Promotions'))
    const shipping = num(row, 'Shipping Charge', 'Shipping Charge Amount')
    const site = str(row, 'Website', 'Marketplace', 'Ordering Website', 'Order Website')

    const declaredTotal = num(row, 'Total Amount', 'Total Owed', 'Item Total', 'Item Net Total')
    // `Total Amount` already contains tax, shipping and discounts. Only compute
    // a substitute when the export does not ship a total column at all.
    const total = declaredTotal || (unitPrice + unitTax) * quantity + shipping + discount

    const status = str(row, 'Order Status', 'Shipment Status') ?? 'Unknown'
    const currency = str(row, 'Currency', 'Currency Code', 'Base Currency Code') ?? currencyForSite(site)

    items.push({
      id: `${orderId}#${seq}`,
      orderId,
      asin: str(row, 'ASIN', 'ASIN/ISBN', 'ASIN/ISBN Number') ?? '',
      name: name ?? 'Unknown item',
      quantity,
      unitPrice,
      unitTax,
      discount,
      shipping,
      total,
      currency,
      orderDate,
      shipDate: date(row, 'Ship Date', 'Shipment Date', 'Shipping Date'),
      status,
      cancelled: /cancel/i.test(status),
      condition: str(row, 'Product Condition', 'Condition'),
      marketplace: site ?? 'Amazon',
      paymentMethod: str(row, 'Payment Method Type', 'Payment Instrument Type', 'Payment Method'),
      shippingOption: str(row, 'Shipping Option', 'Shipment Service Level'),
      carrier: str(row, 'Carrier Name & Tracking Number', 'Carrier Name', 'Carrier'),
      seller: str(row, 'Seller', 'Seller Name'),
      gift: !!str(row, 'Gift Message', 'Gift Recipient Contact') || bool(row, 'Gift Wrapped', 'Gift'),
      channel: 'retail',
      sourceCategory: str(row, 'Category'),
    })
  }

  return { items, skipped }
}
