import type { Store } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { setFavorites } from './favoritesSlice'

const FAVORITES_KEY = LOCAL_STORAGE_KEYS.FAVORITES

/** Читает избранное указанного пользователя; при повреждённых данных возвращает [] */
export function readFavoritesForUser(userId: string | null): string[] {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return []
    const list = (parsed as Record<string, unknown>)[userId]
    if (!Array.isArray(list)) return []
    return list.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

/** Сохраняет избранное пользователя, не затирая данные остальных */
export function writeFavoritesForUser(userId: string, ids: readonly string[]): void {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    const map: Record<string, string[]> = {}
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        for (const [key, value] of Object.entries(parsed)) {
          if (Array.isArray(value) && value.every((x) => typeof x === 'string')) {
            map[key] = value as string[]
          }
        }
      }
    }
    map[userId] = [...ids]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(map))
  } catch (error) {
    console.error('Не удалось сохранить избранное', error)
  }
}

const arraysEqual = (a: readonly string[], b: readonly string[]): boolean => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Фабрика синхронизации избранного со срезом auth.
 * Возвращённую функцию нужно один раз вызвать при старте и подписать на store.subscribe.
 *
 * Логика:
 *  - при смене auth.userId — читаем сохранённый список пользователя и заменяем state;
 *  - при изменении favorites.ids для того же пользователя — сохраняем в localStorage;
 *  - если пользователь не авторизован, state.favorites.ids принудительно пустой.
 */
export function createFavoritesSync(store: Store<RootState>): () => void {
  let lastUserId: string | null = null
  let lastIds: readonly string[] = []
  let initialized = false

  return function sync(): void {
    const state = store.getState()
    const userId = state.auth.userId
    const currentIds = state.favorites.ids

    const userChanged = !initialized || userId !== lastUserId
    if (userChanged) {
      const savedIds = readFavoritesForUser(userId)
      initialized = true
      lastUserId = userId
      lastIds = savedIds
      if (!arraysEqual(currentIds, savedIds)) {
        store.dispatch(setFavorites(savedIds))
      }
      return
    }

    if (!userId) {
      if (currentIds.length > 0) {
        store.dispatch(setFavorites([]))
      }
      return
    }

    if (currentIds !== lastIds) {
      writeFavoritesForUser(userId, currentIds)
      lastIds = currentIds
    }
  }
}
