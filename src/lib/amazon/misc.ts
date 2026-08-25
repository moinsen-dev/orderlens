import { date, num, str, type Row } from '../csv'
import type { CartEntry, Refund, ReturnRequest } from '../model'

export function parseRefunds(rows: Row[]): { refunds: Refund[]; skipped: number } {
  const refunds: Refund[] = []
  let skipped = 0
  for (const row of rows) {
    const orderId = str(row, 'Order ID')
    const amount = num(row, 'Refund Amount', 'Amount Refunded')
    if (!orderId) {
      skipped++
      continue
    }
    refunds.push({
      orderId,
      date: date(row, 'Refund Date', 'Creation Date', 'Request Date'),
      createdAt: date(row, 'Creation Date', 'Request Date'),
      amount,
      currency: str(row, 'Currency', 'Currency Code') ?? 'EUR',
      quantity: num(row, 'Quantity') || 1,
      reason: str(row, 'Reversal Reason', 'Return Reason', 'Reason'),
      status: str(row, 'Refund Status', 'Reversal Status', 'Payment Status'),
      marketplace: str(row, 'Website', 'Marketplace'),
    })
  }
  return { refunds, skipped }
}

export function parseReturnRequests(rows: Row[]): { returns: ReturnRequest[]; skipped: number } {
  const returns: ReturnRequest[] = []
  let skipped = 0
  for (const row of rows) {
    const orderId = str(row, 'Order ID')
    if (!orderId) {
      skipped++
      continue
    }
    returns.push({
      orderId,
      asin: str(row, 'ASIN', 'ASIN/ISBN') ?? '',
      name: str(row, 'Product Name', 'Title') ?? '',
      reason: str(row, 'Return Reason Code', 'Return Reason'),
      method: str(row, 'Return Shipping Method'),
    })
  }
  return { returns, skipped }
}

export function parseCartHistory(rows: Row[]): { cart: CartEntry[]; skipped: number } {
  const cart: CartEntry[] = []
  let skipped = 0
  for (const row of rows) {
    const addedAt = date(row, 'Date Added to Cart')
    if (!addedAt) {
      skipped++
      continue
    }
    cart.push({
      asin: str(row, 'ASIN') ?? '',
      // The export appends a boilerplate suffix to every cart product name.
      name: (str(row, 'Product Name') ?? '').replace(/\s*\[Product name associated with ASIN\]\s*$/i, ''),
      addedAt,
      quantity: num(row, 'Order Quantity') || 1,
      source: str(row, 'Cart Source'),
      list: str(row, 'Cart List'),
    })
  }
  return { cart, skipped }
}
