/** Читает массив из localStorage; при отсутствии или битых данных — пустой массив */
export function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

/** Добавляет элемент в массив в localStorage; false — если не удалось (например, переполнение) */
export function appendToList<T>(key: string, item: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify([...readList<T>(key), item]))
    return true
  } catch {
    return false
  }
}
