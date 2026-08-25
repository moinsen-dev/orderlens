import type { SourceKind } from '../model'

const has = (headers: string[], ...names: string[]) =>
  names.some((n) => headers.some((h) => h.toLowerCase() === n.toLowerCase()))

/**
 * Classify a CSV by its header signature rather than its file name — Amazon
 * localises file names, and users rename files when they unzip by hand.
 */
export function detectKind(headers: string[], fileName = ''): SourceKind {
  const f = fileName.toLowerCase()

  if (has(headers, 'Date Added to Cart')) return 'cartHistory'
  if (has(headers, 'Return Reason Code')) return 'returnRequests'
  if (has(headers, 'Refund Amount') && has(headers, 'Order ID')) return 'refunds'
  if (has(headers, 'Digital Order Item ID') || (has(headers, 'Marketplace') && has(headers, 'Price Currency Code')))
    return 'digitalOrders'

  const hasProduct = has(headers, 'Product Name', 'Title')
  const hasMoney = has(headers, 'Total Amount', 'Total Owed', 'Item Total', 'Unit Price', 'Purchase Price Per Unit')
  if (has(headers, 'Order ID') && hasProduct && hasMoney) return 'orderHistory'

  // Last resort: trust the file name for the two formats we care most about.
  if (f.includes('order history') || f.includes('orderhistory')) return 'orderHistory'
  if (f.includes('digital')) return 'digitalOrders'
  return 'unknown'
}

export const kindLabel: Record<SourceKind, string> = {
  orderHistory: 'Order history',
  digitalOrders: 'Digital orders',
  refunds: 'Refunds',
  returnRequests: 'Return requests',
  cartHistory: 'Cart history',
  unknown: 'Not recognised',
}
