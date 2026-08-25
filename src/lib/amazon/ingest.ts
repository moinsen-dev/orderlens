import { unzip } from 'fflate'
import { parseCsv } from '../csv'
import { emptyDataset, type Dataset, type SourceInfo } from '../model'
import { detectKind } from './detect'
import { parseDigitalOrders } from './digital'
import { parseCartHistory, parseRefunds, parseReturnRequests } from './misc'
import { parseOrderHistory } from './orderHistory'

export interface NamedFile {
  name: string
  text: string
}

const decoder = new TextDecoder('utf-8')

/** Expand any dropped .zip into its CSV members; pass CSVs through untouched. */
export async function expandFiles(files: File[], onProgress?: (msg: string) => void): Promise<NamedFile[]> {
  const out: NamedFile[] = []
  for (const file of files) {
    const isZip = /\.zip$/i.test(file.name)
    if (!isZip) {
      if (!/\.(csv|txt)$/i.test(file.name)) continue
      onProgress?.(`Reading ${file.name}`)
      out.push({ name: file.name, text: await file.text() })
      continue
    }
    onProgress?.(`Unpacking ${file.name}`)
    const buf = new Uint8Array(await file.arrayBuffer())
    const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
      unzip(
        buf,
        // Skip the bulky, useless-for-analytics members (invoice PDFs, delivery photos).
        { filter: (f) => /\.csv$/i.test(f.name) && !f.name.includes('__MACOSX') },
        (err, data) => (err ? reject(err) : resolve(data)),
      )
    })
    for (const [path, bytes] of Object.entries(entries)) {
      out.push({ name: path.split('/').pop() || path, text: decoder.decode(bytes) })
    }
  }
  return out
}

/** Parse every recognised CSV into one dataset, merging with what is already loaded. */
export function buildDataset(files: NamedFile[], previous?: Dataset): Dataset {
  const ds = previous ? { ...previous, sources: [...previous.sources] } : emptyDataset()
  const items = [...ds.items]
  const refunds = [...ds.refunds]
  const returns = [...ds.returns]
  const cart = [...ds.cart]
  const sources: SourceInfo[] = []

  for (const file of files) {
    const { headers, rows } = parseCsv(file.text)
    const kind = detectKind(headers, file.name)
    const info: SourceInfo = { file: file.name, kind, rows: 0, skipped: 0, notes: [] }

    switch (kind) {
      case 'orderHistory': {
        const r = parseOrderHistory(rows)
        items.push(...r.items)
        info.rows = r.items.length
        info.skipped = r.skipped
        break
      }
      case 'digitalOrders': {
        const r = parseDigitalOrders(rows)
        items.push(...r.items)
        info.rows = r.items.length
        info.skipped = r.skipped
        break
      }
      case 'refunds': {
        const r = parseRefunds(rows)
        refunds.push(...r.refunds)
        info.rows = r.refunds.length
        info.skipped = r.skipped
        break
      }
      case 'returnRequests': {
        const r = parseReturnRequests(rows)
        returns.push(...r.returns)
        info.rows = r.returns.length
        info.skipped = r.skipped
        break
      }
      case 'cartHistory': {
        const r = parseCartHistory(rows)
        cart.push(...r.cart)
        info.rows = r.cart.length
        info.skipped = r.skipped
        break
      }
      default:
        info.notes.push('No known Amazon layout — ignored.')
    }
    sources.push(info)
  }

  return {
    items: dedupe(items, (i) => i.id),
    refunds: dedupe(refunds, (r) => `${r.orderId}|${r.date}|${r.amount}`),
    returns: dedupe(returns, (r) => `${r.orderId}|${r.asin}`),
    cart: dedupe(cart, (c) => `${c.asin}|${c.addedAt}`),
    sources: [...ds.sources, ...sources],
    importedAt: new Date().toISOString(),
  }
}

function dedupe<T>(list: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of list) {
    const k = key(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}
