import { describe, expect, it } from 'vitest'
import { parseNumber, parseCsv, repairMojibake, toIso } from '../csv'
import { detectKind } from '../amazon/detect'
import { parseOrderHistory } from '../amazon/orderHistory'
import { parseDigitalOrders } from '../amazon/digital'
import { parseRefunds } from '../amazon/misc'
import { defaultCategoryConfig, makeCategoriser, UNCATEGORISED } from '../categories'
import type { OrderItem } from '../model'

const ORDER_HISTORY = `\uFEFFASIN,"Billing Address","Carrier Name & Tracking Number",Currency,"Gift Message","Order Date","Order ID","Order Status","Original Quantity","Payment Method Type","Product Condition","Product Name","Ship Date","Shipment Item Subtotal","Shipping Charge","Shipping Option","Total Amount","Total Discounts","Unit Price","Unit Price Tax",Website
B0153A2W7K,"Some Street 1","DP_PAKET(JJD1)",EUR,"Not Available",2017-12-29T08:45:15Z,303-1491475-9993911,Closed,1,"Visa - 0027",New,"Krups XF552D Dampfgaraufsatz",2018-01-02T14:06:29Z,79.16,0,premium-de-collection,76.2,"'-18'",79.16,15.04,Amazon.de
B00TEST002,"Some Street 1","AMZN_DE(DE1)",EUR,"Not Available",2020-06-01T10:00:00Z,304-0000000-0000001,Closed,2,"Visa - 0019",New,"USB-C Ladekabel 2m",2020-06-02T10:00:00Z,"1,016.38",39.95,premium-de,"1,218.95",0,"1,016.38",162.62,Amazon.de
B00TEST003,"Some Street 1","Not Available",GBP,"Not Available",2011-02-20T09:00:00Z,203-0000000-0000002,Cancelled,1,"Not Available","Not Available","Cancelled thing","Not Available",0,0,"Not Applicable",21.5,0,21.5,0,Amazon.co.uk
`

const DIGITAL = `\uFEFFASIN,"Order Date","Order ID","Order Status","Product Name",Price,"Price Currency Code","Price Tax","Quantity Ordered",Marketplace,"Seller of Record","Digital Order Item ID"
B00KU7YXB0,2014-10-03T08:42:00Z,D01-1,SUCCESS,"Virtual Fireplace TV",0.86,EUR,0.99,1,www.amazon.de,"Amazon Media EU Sarl",item-1
B07813CQKV,2018-08-24T11:19:00Z,D01-2,SUCCESS,"Das Geheimnis der Anziehung",13.92,EUR,13.92,1,www.audible.de,"Audible GmbH",item-2
`

const REFUNDS = `\uFEFF"Creation Date",Currency,"Order ID","Refund Amount","Refund Date","Reversal Reason","Reversal Status",Quantity,Website
2024-08-15T08:06:04.747Z,EUR,304-9201738-3858759,59.99,2024-08-16T10:07:17.626Z,"Shipping address is undeliverable",Completed,1,Amazon.de
`

describe('parseNumber', () => {
  it('handles the shapes Amazon actually exports', () => {
    expect(parseNumber('79.16')).toBe(79.16)
    expect(parseNumber('1,016.38')).toBe(1016.38)
    expect(parseNumber("'-18'")).toBe(-18)
    expect(parseNumber('12,99')).toBe(12.99)
    expect(parseNumber('EUR 12.99')).toBe(12.99)
    expect(parseNumber('Not Applicable')).toBeNull()
    expect(parseNumber('')).toBeNull()
  })
})

describe('repairMojibake', () => {
  it('re-decodes the double-encoded text in older export rows', () => {
    expect(repairMojibake('KÃ¼chenmaschine')).toBe('Küchenmaschine')
    expect(repairMojibake('silber-weiÃ\u009f')).toBe('silber-weiß')
    expect(repairMojibake('Bose Â® SoundTouch')).toBe('Bose ® SoundTouch')
  })

  it('leaves correctly encoded text alone', () => {
    expect(repairMojibake('Küchenmaschine ✓ 2000 Watt')).toBe('Küchenmaschine ✓ 2000 Watt')
    expect(repairMojibake('plain ascii')).toBe('plain ascii')
  })
})

describe('toIso', () => {
  it('reads ISO, US and German date shapes', () => {
    expect(toIso('2020-06-01T10:00:00Z')).toBe('2020-06-01T10:00:00.000Z')
    expect(toIso('06/01/2020')?.slice(0, 10)).toBe('2020-06-01')
    expect(toIso('01.06.2020')?.slice(0, 10)).toBe('2020-06-01')
    expect(toIso('nonsense')).toBeNull()
  })
})

describe('detectKind', () => {
  it('classifies by header signature', () => {
    expect(detectKind(parseCsv(ORDER_HISTORY).headers)).toBe('orderHistory')
    expect(detectKind(parseCsv(DIGITAL).headers)).toBe('digitalOrders')
    expect(detectKind(parseCsv(REFUNDS).headers)).toBe('refunds')
    expect(detectKind(['Date Added to Cart', 'ASIN'])).toBe('cartHistory')
    expect(detectKind(['Something', 'Else'])).toBe('unknown')
  })
})

describe('parseOrderHistory', () => {
  const { items, skipped } = parseOrderHistory(parseCsv(ORDER_HISTORY).rows)

  it('keeps every row', () => {
    expect(items).toHaveLength(3)
    expect(skipped).toBe(0)
  })

  it('takes Total Amount as the money actually paid', () => {
    expect(items[0].total).toBe(76.2)
    expect(items[0].discount).toBe(-18)
    expect(items[1].total).toBe(1218.95)
    expect(items[1].shipping).toBe(39.95)
  })

  it('marks cancelled orders and derives the currency', () => {
    expect(items[2].cancelled).toBe(true)
    expect(items[2].currency).toBe('GBP')
    expect(items[0].cancelled).toBe(false)
  })

  it('gives every line a stable, unique id', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(3)
  })
})

describe('parseDigitalOrders', () => {
  const { items } = parseDigitalOrders(parseCsv(DIGITAL).rows)

  it('treats the larger of Price / Price Tax as the gross total', () => {
    expect(items[0].total).toBe(0.99)
    expect(items[1].total).toBe(13.92)
  })

  it('tags the digital channel', () => {
    expect(items.every((i) => i.channel === 'digital')).toBe(true)
  })
})

describe('parseRefunds', () => {
  it('reads amount, reason and dates', () => {
    const { refunds } = parseRefunds(parseCsv(REFUNDS).rows)
    expect(refunds).toHaveLength(1)
    expect(refunds[0].amount).toBe(59.99)
    expect(refunds[0].reason).toBe('Shipping address is undeliverable')
    expect(refunds[0].date?.slice(0, 10)).toBe('2024-08-16')
  })
})

describe('makeCategoriser', () => {
  const categorise = makeCategoriser(defaultCategoryConfig())
  const item = (over: Partial<OrderItem>): OrderItem => ({
    id: 'x', orderId: 'x', asin: 'B000', name: '', quantity: 1, unitPrice: 0, unitTax: 0, discount: 0,
    shipping: 0, total: 0, currency: 'EUR', orderDate: '2024-01-01T00:00:00Z', shipDate: null, status: 'Closed',
    cancelled: false, condition: 'New', marketplace: 'Amazon.de', paymentMethod: null, shippingOption: null,
    carrier: null, seller: null, gift: false, channel: 'retail', sourceCategory: null, ...over,
  })

  it('matches keywords in product names', () => {
    expect(categorise(item({ name: 'Anker USB-C Ladekabel 2m' })).category).toBe('Electronics & Computing')
    expect(categorise(item({ name: 'WMF Profi Pfanne 28 cm' })).category).toBe('Home & Kitchen')
    expect(categorise(item({ name: 'Bosch Akkuschrauber GSR 12V' })).category).toBe('Tools & DIY')
  })

  it('claims the whole digital channel', () => {
    expect(categorise(item({ name: 'Some Audiobook', channel: 'digital' })).category).toBe('Digital & Media')
  })

  it('falls back when nothing matches', () => {
    const res = categorise(item({ name: 'Völlig unbekanntes Produkt XYZ' }))
    expect(res.category).toBe(UNCATEGORISED)
    expect(res.source).toBe('fallback')
  })

  it('lets a per-ASIN override win', () => {
    const withOverride = makeCategoriser({ ...defaultCategoryConfig(), overrides: { B000: 'My bucket' } })
    const res = withOverride(item({ name: 'Anker USB-C Ladekabel' }))
    expect(res.category).toBe('My bucket')
    expect(res.source).toBe('override')
  })
})
