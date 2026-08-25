/**
 * Everything about *who runs this deployment*. It is deliberately the only
 * place with operator data: a fork that publishes its own instance must fill
 * this in with its own details, because the legal pages are generated from it.
 *
 * Leave a field empty and the legal pages say so instead of inventing content.
 */

export interface Operator {
  /** Natural or legal person responsible for the site (§ 5 DDG). */
  name: string
  /** Legal form / trading name, if the operator is not a private individual. */
  company?: string
  /** A postal address that can receive court documents — no P.O. box. */
  street: string
  postalCode: string
  city: string
  country: string
  email: string
  /** § 5 DDG wants a second, equally fast means of contact next to e-mail. */
  phone?: string
  /** § 27a UStG, if one has been issued. */
  vatId?: string
  /** Commercial register entry, if the operator is a registered company. */
  register?: string
  /** § 18 (2) MStV — only relevant for journalistic/editorial content. */
  responsibleForContent?: string
  /** Supervisory authority for data protection complaints, if known. */
  supervisoryAuthority?: string
}

export interface SiteConfig {
  name: string
  tagline: string
  /** The deployment this legal text applies to. */
  domain: string
  operator: Operator
  links: {
    website: string
    websiteLabel: string
    repository: string
  }
  hosting: {
    provider: string
    address: string
    privacyPolicy: string
  }
  /** Last substantive change to the legal texts, shown on the pages. */
  legalUpdated: string
}

export const site: SiteConfig = {
  name: 'OrderLens',
  tagline: 'Amazon order analytics',
  domain: 'orderlens.moinsen.dev',

  // ── Fill this in before publishing your own deployment ──────────────────
  operator: {
    name: 'Ulrich Diedrichsen',
    street: 'Kippingstraße 27',
    postalCode: '20144',
    city: 'Hamburg',
    country: 'Deutschland',
    email: 'business@moinsen.dev',
    vatId: 'DE299425124',
    supervisoryAuthority:
      'der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit (HmbBfDI)',
  },
  // ───────────────────────────────────────────────────────────────────────

  links: {
    website: 'https://www.moinsen.dev',
    websiteLabel: 'moinsen.dev',
    repository: 'https://github.com/moinsen-dev/orderlens',
  },

  hosting: {
    provider: 'Cloudflare, Inc.',
    address: '101 Townsend St., San Francisco, CA 94107, USA',
    privacyPolicy: 'https://www.cloudflare.com/privacypolicy/',
  },

  legalUpdated: '2026-08-25',
}

/** True once the operator data needed for a valid Impressum is present. */
export const hasOperatorDetails = (o: Operator = site.operator): boolean =>
  Boolean(o.name && o.street && o.postalCode && o.city && o.email)
