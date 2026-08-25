import type { EnrichedItem, Order } from './model'

function toCsv(rows: Array<Record<string, string | number>>): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: string | number) => {
    const s = String(v ?? '')
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
}

export function download(filename: string, content: string, type = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([`\uFEFF${content}`], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function itemsToCsv(items: EnrichedItem[], displayCurrency: string): string {
  return toCsv(
    items.map((i) => ({
      order_id: i.orderId,
      order_date: i.orderDate,
      ship_date: i.shipDate ?? '',
      asin: i.asin,
      product: i.name,
      category: i.category,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      unit_tax: i.unitTax,
      discount: i.discount,
      shipping: i.shipping,
      total_original: i.total,
      original_currency: i.currency,
      [`total_${displayCurrency.toLowerCase()}`]: round(i.amount),
      marketplace: i.marketplace,
      channel: i.channel,
      status: i.status,
      payment_method: i.paymentMethod ?? '',
    })),
  )
}

export function ordersToCsv(orders: Order[], displayCurrency: string): string {
  return toCsv(
    orders.map((o) => ({
      order_id: o.id,
      date: o.date,
      marketplace: o.marketplace,
      channel: o.channel,
      items: o.itemCount,
      categories: o.categories.join(' | '),
      [`total_${displayCurrency.toLowerCase()}`]: round(o.amount),
      shipping: round(o.shipping),
      discount: round(o.discount),
      tax: round(o.tax),
      refunded: round(o.refunded),
      cancelled: o.cancelled ? 'yes' : 'no',
      payment_method: o.paymentMethod ?? '',
    })),
  )
}

const round = (v: number) => Math.round(v * 100) / 100
