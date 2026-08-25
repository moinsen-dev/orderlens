export type ThemeMode = 'system' | 'light' | 'dark'

export interface Settings {
  /** Currency every aggregate is reported in. */
  displayCurrency: string
  /** `1 <key> = value <displayCurrency>`. Editable, because there is no rate API here. */
  rates: Record<string, number>
  /** Cancelled orders are excluded from spending by default. */
  includeCancelled: boolean
  locale: string
  theme: ThemeMode
}

export const defaultSettings = (): Settings => ({
  displayCurrency: 'EUR',
  rates: { EUR: 1, GBP: 1.17, USD: 0.92, CHF: 1.06, CAD: 0.68, AUD: 0.61, JPY: 0.0062, INR: 0.011, PLN: 0.23, SEK: 0.088 },
  includeCancelled: false,
  locale: typeof navigator !== 'undefined' ? navigator.language : 'en-GB',
  theme: 'system',
})

export const rateFor = (settings: Settings, currency: string): number => {
  if (currency === settings.displayCurrency) return 1
  return settings.rates[currency] ?? 1
}
