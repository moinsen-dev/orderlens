import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { buildDataset, expandFiles } from '../lib/amazon/ingest'
import {
  categoryColors,
  defaultCategoryConfig,
  makeCategoriser,
  type CategoryConfig,
} from '../lib/categories'
import { demoDataset } from '../lib/demo'
import { buildOrders, enrichItems } from '../lib/enrich'
import { applyFilters, defaultFilters, itemsOf, type Filters } from '../lib/filters'
import { emptyDataset, type Dataset, type EnrichedItem, type Order } from '../lib/model'
import { defaultSettings, type Settings } from '../lib/settings'
import * as storage from '../lib/storage'

export type ViewId = 'dashboard' | 'orders' | 'categories' | 'insights' | 'import' | 'settings'

interface StoreValue {
  ready: boolean
  busy: string | null
  error: string | null
  dataset: Dataset
  hasData: boolean
  settings: Settings
  categories: CategoryConfig
  colors: Record<string, string>
  filters: Filters
  view: ViewId
  /** All items, unfiltered. */
  allItems: EnrichedItem[]
  allOrders: Order[]
  orders: Order[]
  items: EnrichedItem[]
  /** Distinct values available for the filter controls. */
  facets: { categories: string[]; marketplaces: string[] }
  setView: (view: ViewId) => void
  setFilters: (update: Partial<Filters>) => void
  resetFilters: () => void
  setSettings: (update: Partial<Settings>) => void
  setCategories: (config: CategoryConfig) => void
  assignCategory: (asin: string, category: string) => void
  importFiles: (files: File[]) => Promise<void>
  loadDemo: () => Promise<void>
  clearData: () => Promise<void>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataset, setDataset] = useState<Dataset>(emptyDataset)
  const [settings, setSettingsState] = useState<Settings>(defaultSettings)
  const [categories, setCategoriesState] = useState<CategoryConfig>(defaultCategoryConfig)
  const [filters, setFiltersState] = useState<Filters>(defaultFilters)
  const [view, setView] = useState<ViewId>('import')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const stored = await storage.loadDataset().catch(() => undefined)
      if (cancelled) return
      setSettingsState(storage.loadSettings())
      setCategoriesState(storage.loadCategories())
      if (stored?.items?.length) {
        setDataset(stored)
        setView('dashboard')
      }
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const dark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.classList.toggle('dark', dark)
    }
    apply()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme])

  const setSettings = useCallback((update: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...update }
      storage.saveSettings(next)
      return next
    })
  }, [])

  const setCategories = useCallback((config: CategoryConfig) => {
    storage.saveCategories(config)
    setCategoriesState(config)
  }, [])

  const assignCategory = useCallback((asin: string, category: string) => {
    setCategoriesState((prev) => {
      const overrides = { ...prev.overrides }
      if (category) overrides[asin] = category
      else delete overrides[asin]
      const next = { ...prev, overrides }
      storage.saveCategories(next)
      return next
    })
  }, [])

  const setFilters = useCallback((update: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...update }))
  }, [])

  const resetFilters = useCallback(() => setFiltersState(defaultFilters()), [])

  const commit = useCallback(async (next: Dataset) => {
    setDataset(next)
    await storage.saveDataset(next).catch(() => setError('Could not persist to IndexedDB — data is kept for this session only.'))
  }, [])

  const importFiles = useCallback(
    async (files: File[]) => {
      setError(null)
      setBusy('Reading files…')
      try {
        const expanded = await expandFiles(files, setBusy)
        if (!expanded.length) throw new Error('No CSV files found in the selection.')
        setBusy(`Parsing ${expanded.length} file${expanded.length === 1 ? '' : 's'}…`)
        const next = buildDataset(expanded, dataset.items.length ? dataset : undefined)
        if (!next.items.length) throw new Error('Files parsed, but no order rows were recognised.')
        await commit(next)
        setView('dashboard')
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusy(null)
      }
    },
    [commit, dataset],
  )

  const loadDemo = useCallback(async () => {
    setBusy('Generating sample data…')
    setError(null)
    await commit(demoDataset())
    setBusy(null)
    setView('dashboard')
  }, [commit])

  const clearData = useCallback(async () => {
    await storage.clearDataset()
    setDataset(emptyDataset())
    setFiltersState(defaultFilters())
    setView('import')
  }, [])

  const categoriser = useMemo(() => makeCategoriser(categories), [categories])

  const allItems = useMemo(
    () => enrichItems(dataset, categoriser, settings),
    [dataset, categoriser, settings],
  )

  const allOrders = useMemo(() => buildOrders(allItems, dataset, settings), [allItems, dataset, settings])

  const effectiveFilters = useMemo<Filters>(
    () => ({ ...filters, includeCancelled: filters.includeCancelled || settings.includeCancelled }),
    [filters, settings.includeCancelled],
  )

  const orders = useMemo(() => applyFilters(allOrders, effectiveFilters), [allOrders, effectiveFilters])
  const items = useMemo(() => itemsOf(orders, effectiveFilters), [orders, effectiveFilters])

  const facets = useMemo(
    () => ({
      categories: [...new Set(allItems.map((i) => i.category))].sort(),
      marketplaces: [...new Set(allOrders.map((o) => o.marketplace))].sort(),
    }),
    [allItems, allOrders],
  )

  const colors = useMemo(() => categoryColors(categories.rules), [categories.rules])

  const value: StoreValue = {
    ready,
    busy,
    error,
    dataset,
    hasData: dataset.items.length > 0,
    settings,
    categories,
    colors,
    filters,
    view,
    allItems,
    allOrders,
    orders,
    items,
    facets,
    setView,
    setFilters,
    resetFilters,
    setSettings,
    setCategories,
    assignCategory,
    importFiles,
    loadDemo,
    clearData,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// The provider and its hook belong together; splitting them across files to satisfy
// react-refresh would buy nothing but an extra import.
// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
