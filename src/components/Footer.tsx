import { ArrowUpRight } from 'lucide-react'
import { site } from '../config/site'
import { useStore } from '../state/store'

/**
 * Present on every screen: § 5 DDG wants the imprint permanently available and
 * reachable in at most two clicks.
 */
export function Footer() {
  const { setView } = useStore()
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-xs"
      style={{ borderColor: 'var(--color-line)' }}
    >
      <span className="muted">
        © {year} {site.operator.company || site.operator.name || site.links.websiteLabel}
      </span>

      <button type="button" className="hover:underline" onClick={() => setView('imprint')}>
        Impressum
      </button>
      <button type="button" className="hover:underline" onClick={() => setView('privacy')}>
        Datenschutz
      </button>

      <a
        className="hover:underline"
        href={site.links.repository}
        target="_blank"
        rel="noreferrer noopener"
      >
        Source
      </a>
      <span className="muted">MIT</span>

      <a
        className="muted ml-auto inline-flex items-center gap-1 hover:underline"
        href={site.links.website}
        target="_blank"
        rel="noreferrer noopener"
      >
        Built by {site.links.websiteLabel}
        <ArrowUpRight className="size-3" />
      </a>
    </footer>
  )
}

/**
 * The house ad in the sidebar. Deliberately quiet: one line of text and a link,
 * no image, no colour block — this is a tool people trust with their orders.
 */
export function SidebarPromo() {
  return (
    <a
      href={site.links.website}
      target="_blank"
      rel="noreferrer noopener"
      className="group mx-2 mb-3 block rounded-lg border p-3 transition hover:bg-[var(--color-canvas)]"
      style={{ borderColor: 'var(--color-line)' }}
    >
      <span className="muted block text-[11px] leading-relaxed">
        A Moinsen project. We build software that respects the people using it.
      </span>
      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]">
        {site.links.websiteLabel}
        <ArrowUpRight className="size-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  )
}
