# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- First release: import of `Your Orders.zip` and the individual CSVs, with layout detection
  by column signature.
- Dashboard, orders table, category view with an editable rule engine, and an insights view.
- Global filters (search, date range, category, marketplace, channel, amount, refunded,
  gifts, cancelled) applied consistently across every screen.
- CSV export of the filtered orders and line items.
- Client-side persistence in IndexedDB, plus a synthetic sample dataset for trying the app
  without a real export.
