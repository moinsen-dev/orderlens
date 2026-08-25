const currencyCache = new Map<string, Intl.NumberFormat>()

export function money(value: number, currency: string, locale: string, compact = false): string {
  const key = `${locale}|${currency}|${compact}`
  let fmt = currencyCache.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : 2,
      minimumFractionDigits: compact ? 0 : 2,
    })
    currencyCache.set(key, fmt)
  }
  return fmt.format(value)
}

export const number = (value: number, locale: string): string => new Intl.NumberFormat(locale).format(value)

export const percent = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value)

export function day(iso: string | null, locale: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso))
}

export function dayTime(iso: string | null, locale: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function monthLabel(key: string, locale: string): string {
  const [y, m] = key.split('-')
  return new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' }).format(
    new Date(Number(y), Number(m) - 1, 1),
  )
}

/** Amazon product titles run long; truncate on a word boundary where possible. */
export function truncate(text: string, max = 70): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

/** Deep-links back to the product page on the marketplace the item came from. */
export function productUrl(asin: string, marketplace: string): string | null {
  if (!asin) return null
  const m = marketplace.toLowerCase()
  const domain = m.includes('co.uk')
    ? 'amazon.co.uk'
    : m.includes('.fr')
      ? 'amazon.fr'
      : m.includes('.it')
        ? 'amazon.it'
        : m.includes('.es')
          ? 'amazon.es'
          : m.includes('.ca')
            ? 'amazon.ca'
            : m.includes('.jp')
              ? 'amazon.co.jp'
              : m.includes('.de') || m.includes('audible.de')
                ? 'amazon.de'
                : 'amazon.com'
  return `https://www.${domain}/dp/${asin}`
}
