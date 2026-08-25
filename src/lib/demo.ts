import type { Dataset, OrderItem, Refund } from './model'

/** Deterministic PRNG, so the demo dataset looks the same on every machine. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

const CATALOGUE: Array<[name: string, low: number, high: number]> = [
  ['Anker USB-C Ladekabel 2m, Nylon geflochten', 8, 22],
  ['Samsung microSD Speicherkarte 128GB', 12, 34],
  ['Logitech MX Master 3S Bluetooth Mouse', 79, 119],
  ['Dell UltraSharp 27" Monitor U2724D', 320, 549],
  ['Sony WH-1000XM5 Kopfhörer Noise Cancelling', 249, 379],
  ['Raspberry Pi 5 Starter Set 8GB', 89, 139],
  ['WD Blue SN580 NVMe SSD 1TB', 55, 99],
  ['Philips Hue LED-Lampe E27 White Ambiance', 18, 39],
  ['Brita Wasserkocher 1,7 L Edelstahl', 34, 59],
  ['WMF Profi Plus Pfanne 28 cm beschichtet', 42, 79],
  ['Zwilling Messer Santoku 18 cm', 55, 95],
  ['Swirl Müllbeutel 20 l, 4 x 15 Beutel', 6, 12],
  ['Vileda Wischmop Set mit Eimer', 22, 39],
  ['IKEA-kompatible Aufbewahrungsbox mit Deckel', 14, 28],
  ['Bosch Professional Akkuschrauber GSR 12V', 89, 149],
  ['Wera Schraubendreher Set 12-teilig', 32, 58],
  ['Gorilla Sekundenkleber Gel 3 g', 5, 11],
  ['Fischer Dübel Sortiment 200 Stück', 9, 18],
  ['Bio Kaffeebohnen Espresso 1 kg', 14, 26],
  ['Kamelur Trockenfrüchte Physalis 1 kg BIO', 18, 32],
  ['Alnatura Haferflocken Großblatt 500 g', 2, 5],
  ['Ritter Sport Schokolade Großpackung', 8, 16],
  ['Doppelherz Magnesium 400 Kapseln', 9, 19],
  ['Oral-B Aufsteckbürsten 8er Pack', 18, 34],
  ['Nivea Duschgel Vorratspack 6 x 250 ml', 9, 17],
  ['Der Sturm — Roman (Taschenbuch)', 9, 16],
  ['Clean Architecture (Gebundene Ausgabe)', 28, 45],
  ['GEO Magazin Jahresausgabe', 6, 12],
  ['Nike Laufschuh Revolution 7 Herren', 45, 89],
  ['Levi’s 511 Jeans Slim Fit', 55, 99],
  ['Falke Socken 5er Pack', 18, 34],
  ['Fahrradschloss Abus Bordo 6000', 55, 109],
  ['Deuter Rucksack Futura 30 Liter', 89, 149],
  ['Petzl Stirnlampe Actik Core', 42, 69],
  ['LEGO Technic Bagger 42121', 32, 59],
  ['Ravensburger Puzzle 1000 Teile', 11, 22],
  ['Nintendo Switch Pro Controller', 55, 79],
  ['PlayStation 5 DualSense Controller', 59, 89],
  ['Canon EF 50mm f/1.8 STM Objektiv', 99, 149],
  ['Manfrotto Stativ Befree Advanced', 129, 219],
  ['Rode Mikrofon VideoMic GO II', 79, 119],
  ['Motoröl 10W-40 vollsynthetisch 5 L', 28, 49],
  ['Bosch Scheibenwischer Aerotwin 600 mm', 18, 34],
  ['Shoei Motorradhelm Visier klar', 39, 69],
  ['Compo Blumenerde 40 Liter', 9, 18],
  ['Gardena Gartenschlauch 20 m', 32, 59],
  ['Weber Grillkohle Briketts 8 kg', 14, 26],
  ['Josera Katzenfutter Trockenfutter 10 kg', 34, 59],
  ['Trixie Kratzbaum 120 cm', 45, 89],
  ['Leitz Ordner A4 breit 10er Pack', 22, 38],
  ['Stabilo Boss Textmarker 8er Set', 8, 15],
  ['Fender Gitarrensaiten Nickel 010', 8, 16],
  ['Yamaha Stimmgerät clip-on', 15, 29],
]

const MARKETPLACES = ['Amazon.de', 'Amazon.de', 'Amazon.de', 'Amazon.de', 'Amazon.co.uk']
const PAYMENTS = ['Visa - 0027', 'Visa - 0019', 'Gift Certificate/Card and Visa - 0027', 'Mastercard - 4411']
const SHIPPING_OPTIONS = ['premium-de', 'std-de-dom-dp', 'scheduled-houdini', 'nominated-day-de']

/**
 * Builds a plausible, entirely synthetic order history so the app can be tried
 * out (and screenshotted for the README) without anyone's real export.
 */
export function demoDataset(years = 8, ordersPerYear = 42): Dataset {
  const rand = rng(20260825)
  const items: OrderItem[] = []
  const refunds: Refund[] = []
  const thisYear = new Date().getFullYear()

  for (let y = thisYear - years + 1; y <= thisYear; y++) {
    // Spending grows slowly over the years, with a strong November/December bump.
    const growth = 1 + (y - (thisYear - years + 1)) * 0.07
    const count = Math.round(ordersPerYear * growth)
    for (let n = 0; n < count; n++) {
      const month = pickMonth(rand)
      const day = 1 + Math.floor(rand() * 27)
      const hour = 7 + Math.floor(rand() * 15)
      const date = new Date(Date.UTC(y, month, day, hour, Math.floor(rand() * 60)))
      if (date.getTime() > Date.now()) continue

      const orderId = `${300 + Math.floor(rand() * 6)}-${digits(rand, 7)}-${digits(rand, 7)}`
      const marketplace = MARKETPLACES[Math.floor(rand() * MARKETPLACES.length)]
      const currency = marketplace.includes('co.uk') ? 'GBP' : 'EUR'
      const lines = 1 + (rand() < 0.25 ? 1 : 0) + (rand() < 0.08 ? 1 : 0)
      const cancelled = rand() < 0.012
      const shipDate = cancelled
        ? null
        : new Date(date.getTime() + (0.3 + rand() * 3.2) * 86_400_000).toISOString()
      const payment = PAYMENTS[Math.floor(rand() * PAYMENTS.length)]
      let orderTotal = 0

      for (let l = 0; l < lines; l++) {
        const pick = Math.floor(rand() * CATALOGUE.length)
        const [name, low, high] = CATALOGUE[pick]
        const quantity = rand() < 0.12 ? 2 : 1
        const gross = round(low + rand() * (high - low)) * quantity
        const tax = round((gross / 1.19) * 0.19)
        const net = round(gross - tax)
        const discount = rand() < 0.15 ? -round(gross * (0.05 + rand() * 0.2)) : 0
        const shipping = rand() < 0.1 ? round(2.99 + rand() * 4) : 0
        const total = round(gross + discount + shipping)
        orderTotal += total

        items.push({
          id: `${orderId}#${l}`,
          orderId,
          // Stable per product, so the demo shows real repeat purchases.
          asin: asinFor(pick),
          name,
          quantity,
          unitPrice: round(net / quantity),
          unitTax: round(tax / quantity),
          discount,
          shipping,
          total,
          currency,
          orderDate: date.toISOString(),
          shipDate,
          status: cancelled ? 'Cancelled' : 'Closed',
          cancelled,
          condition: 'New',
          marketplace,
          paymentMethod: payment,
          shippingOption: SHIPPING_OPTIONS[Math.floor(rand() * SHIPPING_OPTIONS.length)],
          carrier: 'AMZN_DE(DE0000000000)',
          seller: null,
          gift: rand() < 0.03,
          channel: 'retail',
          sourceCategory: null,
        })
      }

      if (!cancelled && rand() < 0.05) {
        const refundDate = new Date(date.getTime() + (2 + rand() * 20) * 86_400_000)
        refunds.push({
          orderId,
          date: refundDate.toISOString(),
          createdAt: refundDate.toISOString(),
          amount: round(orderTotal * (rand() < 0.7 ? 1 : 0.5)),
          currency,
          quantity: 1,
          reason: rand() < 0.6 ? 'Customer return' : 'Item defective',
          status: 'Completed',
          marketplace,
        })
      }
    }
  }

  // A handful of digital purchases, so the digital channel is represented too.
  const digitalTitles = ['Kindle Edition: Die Kunst des klaren Denkens', 'Audible Hörbuch: Sapiens', 'Prime Video Leihfilm']
  for (let n = 0; n < 40; n++) {
    const y = thisYear - Math.floor(rand() * years)
    const date = new Date(Date.UTC(y, Math.floor(rand() * 12), 1 + Math.floor(rand() * 27), 20))
    if (date.getTime() > Date.now()) continue
    const orderId = `D01-${digits(rand, 7)}-${digits(rand, 7)}`
    const gross = round(2.99 + rand() * 22)
    const title = Math.floor(rand() * digitalTitles.length)
    items.push({
      id: `${orderId}#d0`,
      orderId,
      asin: asinFor(CATALOGUE.length + title),
      name: digitalTitles[title],
      quantity: 1,
      unitPrice: round(gross / 1.07),
      unitTax: round(gross - gross / 1.07),
      discount: 0,
      shipping: 0,
      total: gross,
      currency: 'EUR',
      orderDate: date.toISOString(),
      shipDate: date.toISOString(),
      status: 'SUCCESS',
      cancelled: false,
      condition: 'Digital',
      marketplace: 'www.amazon.de',
      paymentMethod: 'Visa - 0027',
      shippingOption: null,
      carrier: null,
      seller: 'Amazon Media EU Sarl',
      gift: false,
      channel: 'digital',
      sourceCategory: null,
    })
  }

  return {
    items,
    refunds,
    returns: [],
    cart: [],
    sources: [{ file: 'demo-data (synthetic)', kind: 'orderHistory', rows: items.length, skipped: 0, notes: ['Generated sample data — not a real export.'] }],
    importedAt: new Date().toISOString(),
  }
}

const round = (v: number) => Math.round(v * 100) / 100

const asinFor = (index: number) => `B0${(index + 1).toString(36).toUpperCase().padStart(8, 'D')}`

const digits = (rand: () => number, n: number) =>
  Array.from({ length: n }, () => Math.floor(rand() * 10)).join('')

/** November and December carry roughly twice the weight of an average month. */
function pickMonth(rand: () => number): number {
  const weights = [1, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1, 1.1, 1.9, 2.1]
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return 11
}
