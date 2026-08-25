import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  Lightbulb,
  Settings as SettingsIcon,
  Upload,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { FilterBar } from './components/FilterBar'
import { Spinner } from './components/ui'
import { useStore, type ViewId } from './state/store'
import { CategoriesView } from './views/CategoriesView'
import { DashboardView } from './views/DashboardView'
import { ImportView } from './views/ImportView'
import { InsightsView } from './views/InsightsView'
import { OrdersView } from './views/OrdersView'
import { SettingsView } from './views/SettingsView'

const NAV: Array<{ id: ViewId; label: string; icon: ComponentType<{ className?: string }>; needsData?: boolean }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, needsData: true },
  { id: 'orders', label: 'Orders', icon: BarChart3, needsData: true },
  { id: 'categories', label: 'Categories', icon: FolderTree, needsData: true },
  { id: 'insights', label: 'Insights', icon: Lightbulb, needsData: true },
  { id: 'import', label: 'Import', icon: Upload },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

const WITH_FILTERS: ViewId[] = ['dashboard', 'orders', 'categories', 'insights']

export default function App() {
  const { ready, hasData, view, setView } = useStore()

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Loading your data…" />
      </div>
    )
  }

  const active = hasData ? view : view === 'settings' ? view : 'import'

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside
        className="shrink-0 border-b bg-[var(--color-surface)] lg:h-screen lg:w-56 lg:border-r lg:border-b-0"
        style={{ borderColor: 'var(--color-line)' }}
      >
        <div className="flex items-center gap-2 px-4 py-4">
          <Logo />
          <div>
            <p className="text-sm leading-tight font-semibold">OrderLens</p>
            <p className="muted text-[11px] leading-tight">Amazon order analytics</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:overflow-visible">
          {NAV.map((item) => {
            const disabled = item.needsData && !hasData
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => setView(item.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  active === item.id ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'hover:bg-[var(--color-canvas)]'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <p className="muted hidden px-4 py-3 text-[11px] leading-relaxed lg:block">
          Runs fully offline in your browser. Your export never leaves this device.
        </p>
      </aside>

      <main className="min-w-0 flex-1 p-4 lg:h-screen lg:overflow-y-auto lg:p-6">
        {hasData && WITH_FILTERS.includes(active) && <FilterBar />}
        {active === 'dashboard' && <DashboardView />}
        {active === 'orders' && <OrdersView />}
        {active === 'categories' && <CategoriesView />}
        {active === 'insights' && <InsightsView />}
        {active === 'import' && <ImportView />}
        {active === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--color-ink)" />
      <circle cx="14" cy="14" r="7" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
      <path d="M19.5 19.5 L26 26" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M10 15.5 L12.5 12.5 L15 14.5 L18 10"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
