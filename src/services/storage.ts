const STORAGE_KEYS = {
  GROUPS: 'partnerz_groups',
  EXPENSES: 'partnerz_expenses',
  SETTLEMENTS: 'partnerz_settlements',
} as const

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

function getItem<T>(key: StorageKey): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  return JSON.parse(raw) as T[]
}

function setItem<T>(key: StorageKey, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export { STORAGE_KEYS, getItem, setItem }
