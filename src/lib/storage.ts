import { del, get, set } from 'idb-keyval'
import type { CategoryConfig } from './categories'
import { defaultCategoryConfig } from './categories'
import type { Dataset } from './model'
import { defaultSettings, type Settings } from './settings'

const DATASET_KEY = 'orderlens:dataset:v1'
const SETTINGS_KEY = 'orderlens:settings:v1'
const CATEGORIES_KEY = 'orderlens:categories:v1'

/**
 * Everything lives in the browser: the dataset in IndexedDB (it can be a few MB),
 * settings and category rules in localStorage so they survive a data reset.
 */
export const loadDataset = (): Promise<Dataset | undefined> => get<Dataset>(DATASET_KEY)
export const saveDataset = (dataset: Dataset): Promise<void> => set(DATASET_KEY, dataset)
export const clearDataset = (): Promise<void> => del(DATASET_KEY)

export function loadSettings(): Settings {
  return { ...defaultSettings(), ...readJson<Partial<Settings>>(SETTINGS_KEY, {}) }
}

export const saveSettings = (settings: Settings): void => writeJson(SETTINGS_KEY, settings)

export function loadCategories(): CategoryConfig {
  const stored = readJson<Partial<CategoryConfig> | null>(CATEGORIES_KEY, null)
  if (!stored?.rules?.length) return defaultCategoryConfig()
  return { rules: stored.rules, overrides: stored.overrides ?? {} }
}

export const saveCategories = (config: CategoryConfig): void => writeJson(CATEGORIES_KEY, config)

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private-mode browsers reject writes; the app still works for this session.
  }
}
