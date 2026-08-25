# OrderLens

**Turn the CSV pile Amazon hands you into an order history you can actually read.**
Drop your export in, get spending over time, categories, repeat purchases, refunds and a
filterable order table. Everything runs in your browser — no server, no upload, no account.

[![CI](https://github.com/moinsen-dev/orderlens/actions/workflows/ci.yml/badge.svg)](https://github.com/moinsen-dev/orderlens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Why

Amazon will give you your data, but it arrives as a folder of wide CSVs with columns like
`Shipment Item Subtotal Tax` and no category anywhere. Answering "what did I spend on
electronics in 2023?" means a spreadsheet afternoon. OrderLens does it in a drag and drop.

## Privacy first, by construction

Your order history says a lot about you — what you read, what you take, who you buy for.
So nothing leaves your machine:

- The app is a static bundle. There is **no backend**, and no request is ever made to one.
- Parsing happens in the browser. Files are read via the File API, never uploaded.
- Data is cached in **IndexedDB** on your device so a reload doesn't lose your import, and
  a single button in Settings wipes it.
- No analytics, no telemetry, no fonts or scripts from a CDN.

You can verify this: `npm run build`, then serve `dist/` with your network cable pulled.

## Features

**Import**
- Drop the whole `Your Orders.zip` — CSVs are unpacked in-browser and classified by their
  column layout, not by file name (which is localised).
- Understands `Order History.csv`, `Retail.OrderHistory.*.csv`, the legacy order history
  report, `Digital Content Orders.csv`, `Refund Details.csv`, `Return Requests.csv` and
  `Cart History.csv`.
- Repairs the double-encoded product names ("KÃ¼chenmaschine") that older export rows carry.
- Re-importing merges instead of duplicating, so a fresh export just extends your history.
- No export at hand? **Try with sample data** generates a realistic synthetic history.

**Analyse**
- Dashboard: total spend, orders, spend per month, year-over-year, spend curve, category
  split, median/biggest order, shipping paid, discounts received, tax, refund rate.
- Orders: sortable, expandable table down to the line item, with a link back to the product
  page on the right marketplace.
- Categories: spend and item count per category, plus a rule editor.
- Insights: top products, repeat purchases, weekday and hour-of-day patterns, price
  distribution, marketplace and payment breakdowns, shipping speed, refund reasons, and the
  items still sitting in your cart.

**Filter** — full-text search over product names, ASIN and order id; date presets or a
custom range; category, marketplace and channel; min/max order total; refunded-only,
gifts-only, include-cancelled. Every number on every screen respects the filter.

**Categories** — Amazon exports no category for retail items, so OrderLens derives one from
keyword rules over product names (bilingual EN/DE out of the box). You can edit keywords,
reorder rules, add your own, or pin a single ASIN to a category. On a long, varied history
expect roughly a quarter of items to stay uncategorised — the rules are deliberately tuned
to leave an item alone rather than file it wrongly. The Categories screen lists what is left
sorted by spend, so the expensive ones are quick to assign.

**Export** — the filtered orders or line items back out as CSV, with a converted total in
your display currency.

**Multi-currency** — orders keep their original currency. Aggregates are converted with
rates you set in Settings (there is no rate API in an offline app), so cross-currency totals
are explicitly an estimate.

## Getting your data from Amazon

1. Amazon → **Account** → **Data and Privacy** → *Request your information*.
2. Pick **Your Orders**. The archive usually arrives by e-mail within a few hours.
3. Drop the ZIP into OrderLens.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # static bundle into dist/
npm run preview    # serve the built bundle
npm test           # vitest
npm run typecheck
npm run lint
```

Deploying is copying `dist/` anywhere that serves static files. The included
`pages.yml` workflow publishes to GitHub Pages on every push to `main`.

## How the numbers are computed

A few decisions worth knowing before you quote a figure:

| Question | Answer |
|---|---|
| What counts as "spend"? | `Total Amount` per line item — the money actually charged, including tax and shipping, after discounts. |
| Cancelled orders? | Excluded by default. Toggle in the filter bar or in Settings. |
| Refunds? | Shown separately, **not** subtracted from spend — an order you returned still shows what you paid. |
| Digital orders? | Included as their own channel. `Price Tax` is used as the gross total whenever it exceeds `Price`, which is how that export encodes tax-inclusive prices. |
| Foreign currencies? | Converted with your fixed rate per currency. Historic orders were placed at the rate of their day, so treat mixed-currency totals as approximate. |
| Shipping speed | Order date to ship date, kept fractional — rounding to whole days collapses most modern orders to zero. |

## Project layout

```
src/
  lib/
    amazon/      detect.ts, orderHistory.ts, digital.ts, misc.ts, ingest.ts
    csv.ts       CSV parsing plus Amazon's number, date and encoding quirks
    model.ts     OrderItem / Order / Dataset — the vocabulary everything else speaks
    categories.ts  keyword rule engine and the default rule set
    enrich.ts    derived fields and order grouping
    filters.ts   the filter predicate
    stats.ts     every aggregation the views render
    demo.ts      synthetic dataset generator
  components/    charts, filter bar, orders table, small UI primitives
  views/         Import, Dashboard, Orders, Categories, Insights, Settings
  state/store.tsx  one context: dataset, settings, rules, filters, derived data
```

Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, PapaParse, fflate, idb-keyval.

## Contributing

Yes please — especially category keywords and support for export layouts from other Amazon
locales. See [CONTRIBUTING.md](CONTRIBUTING.md). **Never attach a real export to an issue or
a PR**; anonymise the row that breaks things.

## Licence

[MIT](LICENSE).

Not affiliated with, endorsed by, or connected to Amazon.com, Inc. "Amazon" is a trademark
of its respective owner and is used here only to describe the data format this tool reads.
