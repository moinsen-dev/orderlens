import type { ReactNode } from 'react'

export function Card({
  title,
  subtitle,
  action,
  className = '',
  children,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {subtitle && <p className="muted mt-0.5 text-xs">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Kpi({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string
  hint?: ReactNode
  tone?: 'default' | 'accent' | 'positive' | 'negative'
}) {
  const toneClass =
    tone === 'accent'
      ? 'text-[var(--color-accent)]'
      : tone === 'positive'
        ? 'text-emerald-600 dark:text-emerald-400'
        : tone === 'negative'
          ? 'text-rose-600 dark:text-rose-400'
          : ''
  return (
    <div className="card">
      <p className="muted text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      {hint && <p className="muted mt-1 text-xs">{hint}</p>}
    </div>
  )
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center"
      style={{ borderColor: 'var(--color-line)' }}>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="muted max-w-md text-xs">{hint}</p>}
      {action}
    </div>
  )
}

export function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: color ? `${color}1f` : 'var(--color-canvas)',
        color: color ?? 'var(--color-muted)',
      }}
    >
      {color && <span className="size-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-5 w-9 shrink-0 rounded-full transition"
        style={{ background: checked ? 'var(--color-accent)' : 'var(--color-line)' }}
      >
        <span
          className="absolute top-0.5 size-4 rounded-full bg-white transition-all"
          style={{ left: checked ? '1.125rem' : '0.125rem' }}
        />
      </button>
      {label}
    </label>
  )
}

export function Bar({ value, color = 'var(--color-accent)' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-line)' }}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(1, value * 100)}%`, background: color }} />
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
      {label}
    </div>
  )
}
