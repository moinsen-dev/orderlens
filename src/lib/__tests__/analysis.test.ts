import { describe, expect, it } from 'vitest'
import { defaultCategoryConfig, makeCategoriser } from '../categories'
import { demoDataset } from '../demo'
import { buildOrders, enrichItems } from '../enrich'
import { applyFilters, defaultFilters } from '../filters'
import { defaultSettings } from '../settings'
import { byCategory, byProduct, computeKpis, monthlySeries } from '../stats'

const settings = { ...defaultSettings(), locale: 'en-GB' }
const dataset = demoDataset(4, 20)
const items = enrichItems(dataset, makeCategoriser(defaultCategoryConfig()), settings)
const orders = buildOrders(items, dataset, settings)

describe('enrich + buildOrders', () => {
  it('groups line items into orders without losing money', () => {
    const itemTotal = items.reduce((s, i) => s + i.amount, 0)
    const orderTotal = orders.reduce((s, o) => s + o.amount, 0)
    expect(orderTotal).toBeCloseTo(itemTotal, 6)
  })

  it('sorts newest first and derives calendar buckets', () => {
    expect(orders[0].date >= orders[orders.length - 1].date).toBe(true)
    expect(items[0].month).toMatch(/^\d{4}-\d{2}$/)
  })

  it('converts foreign currencies into the display currency', () => {
    const gbp = items.find((i) => i.currency === 'GBP')
    if (gbp) expect(gbp.amount).toBeCloseTo(gbp.total * settings.rates.GBP, 6)
  })
})

describe('applyFilters', () => {
  it('excludes cancelled orders unless asked', () => {
    const base = applyFilters(orders, defaultFilters())
    expect(base.every((o) => !o.cancelled)).toBe(true)
    const withCancelled = applyFilters(orders, { ...defaultFilters(), includeCancelled: true })
    expect(withCancelled.length).toBeGreaterThanOrEqual(base.length)
  })

  it('respects the date range', () => {
    const year = new Date().getFullYear() - 1
    const ranged = applyFilters(orders, { ...defaultFilters(), from: `${year}-01-01`, to: `${year}-12-31` })
    expect(ranged.every((o) => o.date.slice(0, 4) === String(year))).toBe(true)
  })

  it('filters by amount and by category', () => {
    const big = applyFilters(orders, { ...defaultFilters(), minAmount: 100 })
    expect(big.every((o) => o.amount >= 100)).toBe(true)

    const category = byCategory(items)[0].category
    const inCategory = applyFilters(orders, { ...defaultFilters(), categories: [category] })
    expect(inCategory.every((o) => o.categories.includes(category))).toBe(true)
  })

  it('searches product names and order ids', () => {
    const needle = orders[0].items[0].name.split(' ')[0].toLowerCase()
    const found = applyFilters(orders, { ...defaultFilters(), search: needle })
    expect(found.length).toBeGreaterThan(0)
    expect(applyFilters(orders, { ...defaultFilters(), search: orders[0].id })).toHaveLength(1)
  })
})

describe('stats', () => {
  const active = applyFilters(orders, defaultFilters())

  it('computes consistent KPIs', () => {
    const k = computeKpis(active)
    expect(k.orders).toBe(active.length)
    expect(k.spend).toBeCloseTo(active.reduce((s, o) => s + o.amount, 0), 6)
    expect(k.avgOrder).toBeCloseTo(k.spend / k.orders, 6)
    expect(k.firstOrder! <= k.lastOrder!).toBe(true)
  })

  it('fills gaps in the monthly series', () => {
    const series = monthlySeries(active)
    for (let i = 1; i < series.length; i++) {
      const prev = new Date(`${series[i - 1].key}-01T00:00:00Z`)
      prev.setUTCMonth(prev.getUTCMonth() + 1)
      expect(series[i].key).toBe(`${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}`)
    }
  })

  it('category shares add up to one', () => {
    const cats = byCategory(items)
    expect(cats.reduce((s, c) => s + c.share, 0)).toBeCloseTo(1, 6)
  })

  it('groups products by ASIN', () => {
    const products = byProduct(items)
    expect(products.length).toBeLessThanOrEqual(items.length)
    expect(products.reduce((s, p) => s + p.purchases, 0)).toBe(items.length)
  })
})
