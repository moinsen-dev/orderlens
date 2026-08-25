import Papa from 'papaparse'

export type Row = Record<string, string>

const NA = new Set(['not applicable', 'not available', 'n/a', '', '-', 'none'])

/** Amazon exports are UTF-8 with BOM and occasionally quote-wrap their headers. */
export function parseCsv(text: string): { headers: string[]; rows: Row[] } {
  const clean = text.replace(/^\uFEFF/, '')
  const res = Papa.parse<Row>(clean, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(),
  })
  const headers = (res.meta.fields ?? []).map((h) => h.trim())
  return { headers, rows: res.data.filter((r) => r && Object.keys(r).length > 0) }
}

/** Trimmed cell value, with Amazon's placeholder strings normalised away. */
export function str(row: Row, ...keys: string[]): string | null {
  for (const key of keys) {
    const raw = row[key]
    if (raw == null) continue
    const v = repairMojibake(String(raw).trim())
    if (v && !NA.has(v.toLowerCase())) return v
  }
  return null
}

/**
 * Older rows in Amazon's export carry double-encoded text (a u-umlaut arriving
 * as two Latin-1 characters): UTF-8 bytes that were once read as Latin-1 and
 * re-encoded. Only the affected runs are re-decoded, so genuine non-Latin-1
 * characters elsewhere in the same string survive untouched.
 */
export function repairMojibake(input: string): string {
  if (!MOJIBAKE.test(input)) return input
  return input.replace(MOJIBAKE_ALL, (run) => {
    try {
      const bytes = Uint8Array.from([...run].map((c) => c.charCodeAt(0)))
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
      return run
    }
  })
}

const MOJIBAKE = /(?:[\u00C2-\u00C5][\u0080-\u00BF])+/
const MOJIBAKE_ALL = new RegExp(MOJIBAKE.source, 'g')

/**
 * Amazon writes money in several shapes across export generations:
 * `1,016.38`, `EUR 12.99`, `'-18'` (apostrophe-wrapped negatives), `12,99` (de-DE).
 */
export function num(row: Row, ...keys: string[]): number {
  for (const key of keys) {
    const raw = row[key]
    if (raw == null) continue
    const v = parseNumber(String(raw))
    if (v !== null) return v
  }
  return 0
}

export function parseNumber(input: string): number | null {
  let s = input.trim()
  if (!s || NA.has(s.toLowerCase())) return null
  s = s.replace(/['’"]/g, '').replace(/[A-Za-z$€£¥]/g, '').replace(/\s/g, '').trim()
  if (!s) return null
  const negative = /^\(.*\)$/.test(s)
  if (negative) s = s.slice(1, -1)
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma > -1 && lastDot > -1) {
    // Both separators present: the rightmost one is the decimal separator.
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (lastComma > -1) {
    // A lone comma is a decimal separator only when it is not a thousands group.
    s = /,\d{3}$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.')
  }
  const v = Number(s)
  if (Number.isNaN(v)) return null
  return negative ? -v : v
}

/** Returns an ISO timestamp, or null when the cell holds no parsable date. */
export function date(row: Row, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = str(row, key)
    if (!v) continue
    const iso = toIso(v)
    if (iso) return iso
  }
  return null
}

export function toIso(value: string): string | null {
  const v = value.trim()
  // Explicit day-only shapes first: handing them to `new Date` would parse them
  // in local time and shift the calendar day for anyone east of UTC.
  const us = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (us) {
    const year = Number(us[3]) < 100 ? 2000 + Number(us[3]) : Number(us[3])
    return isoUtc(year, Number(us[1]) - 1, Number(us[2]))
  }
  const de = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (de) return isoUtc(Number(de[3]), Number(de[2]) - 1, Number(de[1]))

  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function isoUtc(year: number, monthIndex: number, day: number): string | null {
  const d = new Date(Date.UTC(year, monthIndex, day))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function bool(row: Row, ...keys: string[]): boolean {
  const v = str(row, ...keys)
  if (!v) return false
  return ['yes', 'true', 'y', '1'].includes(v.toLowerCase())
}

/** Case/whitespace-insensitive header lookup, so locale-shifted exports still match. */
export function normaliseRow(row: Row): Row {
  const out: Row = {}
  for (const [k, v] of Object.entries(row)) out[k.trim()] = typeof v === 'string' ? v : String(v ?? '')
  return out
}
