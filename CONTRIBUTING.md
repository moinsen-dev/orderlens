# Contributing to OrderLens

Thanks for wanting to help. This is a small, focused tool and it stays that way — but there
is plenty of room in the places that need many pairs of eyes: category keywords, export
layouts from Amazon locales none of us can produce, and the analyses nobody thought of yet.

## The one hard rule

**Never put real order data in this repository, in an issue, or in a pull request.**

That includes CSV excerpts with real order ids or addresses, ZIP archives, and screenshots
that show product names you would rather not have indexed by a search engine. `private/` is
git-ignored for exactly this purpose — keep your own export there while you work.

When a specific row breaks the parser, anonymise it: replace the order id, the addresses and
the names, keep the shape of the columns. That is what the fixtures in
`src/lib/__tests__/parsing.test.ts` are.

## Getting set up

```bash
npm install
npm run dev
```

Before you open a PR:

```bash
npm run typecheck
npm run lint
npm test
```

All three run in CI on every pull request.

## Good first contributions

**Category keywords.** Roughly a quarter of items stay uncategorised on a long account history.
`src/lib/categories.ts` holds the rule list; adding keywords is a one-line change. Two things
to keep in mind:

- Rules are evaluated top to bottom and the *first* match wins, so narrow rules sit above
  broad ones. A keyword like `gaming` matches half the electronics catalogue — prefer
  `playstation`, `joy-con`, `gaming-stuhl`.
- Keywords are plain lower-cased substrings of the product name. `topf` also matches
  `Kochtopf`, which is usually what you want. Short words that hide inside unrelated ones
  need a **leading space**: `roller` would match `Controller`, `lack` would match `Black`,
  `deo` would match `Video`, `reis` would match `Preis`. Writing them as `" roller"` fixes
  that while still matching the word at the start of a title.
- A wrong category is worse than none. When in doubt, leave the item uncategorised.

**Export layouts.** Every Amazon locale and export generation names its columns slightly
differently. Support lives in the alias lists in `src/lib/amazon/orderHistory.ts` and its
siblings; add your column name to the right alias list and a fixture row to the tests.

**Analyses.** New charts and metrics go in `src/lib/stats.ts` (pure functions over
`EnrichedItem[]` / `Order[]`) and are rendered by a view. Keeping the maths out of the
components is what makes it testable.

## Conventions

- **No backend, ever.** A change that introduces a network request to anything other than
  the user's own browser storage will be declined. That constraint is the product.
- Analysis logic is pure and lives in `src/lib/`. Components render, they don't compute.
- New parsing behaviour comes with a test. Parsers are where the sharp edges are: Amazon
  writes money as `1,016.38`, as `'-18'`, and occasionally as `12,99`.
- Match the surrounding style. No new dependency without a concrete reason in the PR.
- Comments explain *why* something is unusual (a quirk in the export, a rounding decision),
  not what the next line does.

## Commits and pull requests

One self-contained change per PR, with a sentence on how you verified it. Screenshots for
anything visual — from the sample data, please (`Try with sample data` on the import screen),
not from your own orders.

## Code of conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
