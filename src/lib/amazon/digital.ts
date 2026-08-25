import { date, num, str, type Row } from '../csv'
import type { OrderItem } from '../model'

/**
 * Digital orders (Kindle, Audible, Prime Video, apps). The export names its
 * money columns confusingly: `Price` is net and `Price Tax` carries the
 * tax-inclusive total whenever it is the larger of the two.
 */
export function parseDigitalOrders(rows: Row[]): { items: OrderItem[]; skipped: number } {
  const items: OrderItem[] = []
  let skipped = 0
  const perOrder = new Map<string, number>()

  for (const row of rows) {
    const orderId = str(row, 'Order ID', 'Digital Order Item ID')
    const orderDate = date(row, 'Order Date', 'Fulfilled Date', 'Delivery Date')
    if (!orderId || !orderDate) {
      skipped++
      continue
    }
    const seq = perOrder.get(orderId) ?? 0
    perOrder.set(orderId, seq + 1)

    const net = num(row, 'Price')
    const withTax = num(row, 'Price Tax')
    const gross = withTax >= net ? withTax : net + withTax
    const tax = Math.max(0, gross - net)
    const quantity = Math.max(1, num(row, 'Quantity Ordered', 'Original Quantity') || 1)
    const status = str(row, 'Order Status', 'Fullfilment Status') ?? 'Unknown'
    const marketplace = str(row, 'Marketplace', 'Website') ?? 'Amazon Digital'

    items.push({
      id: `${orderId}#d${seq}`,
      orderId,
      asin: str(row, 'ASIN') ?? '',
      name: str(row, 'Product Name', 'Title') ?? 'Unknown item',
      quantity,
      unitPrice: quantity ? net / quantity : net,
      unitTax: quantity ? tax / quantity : tax,
      discount: 0,
      shipping: 0,
      total: gross,
      currency: str(row, 'Price Currency Code', 'Base Currency Code', 'List Price Currency Code') ?? 'EUR',
      orderDate,
      shipDate: date(row, 'Delivery Date', 'Fulfilled Date'),
      status,
      cancelled: /cancel|fail/i.test(status),
      condition: 'Digital',
      marketplace,
      paymentMethod: str(row, 'Payment Information'),
      shippingOption: null,
      carrier: null,
      seller: str(row, 'Seller of Record', 'Publisher'),
      gift: !!str(row, 'Gift Email', 'Gift Message', 'Gift Customer Nickname'),
      channel: 'digital',
      sourceCategory: null,
    })
  }

  return { items, skipped }
}
