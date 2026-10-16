import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/store'
import { login, logout } from '@/features/auth/model/authSlice'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { selectFavoriteIds, selectIsFavorite, toggleFavorite } from './favoritesSlice'
import {
  createFavoritesSync,
  readFavoritesForUser,
  writeFavoritesForUser,
} from './favoritesStorage'

const FAVORITES_KEY = LOCAL_STORAGE_KEYS.FAVORITES

function createMemoryStorage() {
  let mem: Record<string, string> = {}
  return {
    getItem: (key: string) => mem[key] ?? null,
    setItem: (key: string, value: string) => {
      mem[key] = value
    },
    removeItem: (key: string) => {
      delete mem[key]
    },
    clear: () => {
      mem = {}
    },
    key: (index: number) => Object.keys(mem)[index] ?? null,
    get length() {
      return Object.keys(mem).length
    },
  }
}

let storage: ReturnType<typeof createMemoryStorage>

beforeEach(() => {
  storage = createMemoryStorage()
  vi.stubGlobal('localStorage', storage)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Создаёт стор с подключённой синхронизацией избранного */
function createSyncedStore() {
  const store = createAppStore()
  const sync = createFavoritesSync(store)
  store.subscribe(sync)
  sync()
  return store
}

describe('favoritesStorage.readFavoritesForUser', () => {
  it('возвращает [] для null userId', () => {
    expect(readFavoritesForUser(null)).toEqual([])
  })

  it('возвращает [] при повреждённом JSON', () => {
    storage.setItem(FAVORITES_KEY, '{{{broken')
    expect(readFavoritesForUser('u1')).toEqual([])
  })

  it('возвращает [] для старого формата (массив)', () => {
    storage.setItem(FAVORITES_KEY, JSON.stringify(['u1', 'u2']))
    expect(readFavoritesForUser('u1')).toEqual([])
  })

  it('игнорирует нестроковые элементы', () => {
    storage.setItem(FAVORITES_KEY, JSON.stringify({ u1: ['ok', 42, null, 'fine'] }))
    expect(readFavoritesForUser('u1')).toEqual(['ok', 'fine'])
  })
})

describe('favoritesStorage.writeFavoritesForUser', () => {
  it('не затирает данные других пользователей', () => {
    storage.setItem(FAVORITES_KEY, JSON.stringify({ u1: ['a'], u2: ['b'] }))
    writeFavoritesForUser('u1', ['c'])

    const parsed = JSON.parse(storage.getItem(FAVORITES_KEY) as string)
    expect(parsed).toEqual({ u1: ['c'], u2: ['b'] })
  })
})

describe('favorites per-user sync', () => {
  it('без авторизации список избранного пуст', () => {
    const store = createSyncedStore()
    expect(selectFavoriteIds(store.getState())).toEqual([])
  })

  it('избранное сохраняется в localStorage под ключом пользователя', () => {
    const store = createSyncedStore()
    store.dispatch(login('u1'))
    store.dispatch(toggleFavorite('u3'))

    const parsed = JSON.parse(storage.getItem(FAVORITES_KEY) as string)
    expect(parsed).toEqual({ u1: ['u3'] })
  })

  it('избранное восстанавливается при повторном входе', () => {
    const store = createSyncedStore()
    store.dispatch(login('u1'))
    store.dispatch(toggleFavorite('u3'))
    expect(selectFavoriteIds(store.getState())).toEqual(['u3'])

    store.dispatch(logout())
    expect(selectFavoriteIds(store.getState())).toEqual([])

    store.dispatch(login('u1'))
    expect(selectFavoriteIds(store.getState())).toEqual(['u3'])
  })

  it('избранное разных пользователей не смешивается', () => {
    const store = createSyncedStore()

    store.dispatch(login('u1'))
    store.dispatch(toggleFavorite('u3'))
    store.dispatch(toggleFavorite('u4'))

    store.dispatch(logout())
    store.dispatch(login('u2'))
    store.dispatch(toggleFavorite('u5'))
    expect(selectFavoriteIds(store.getState())).toEqual(['u5'])

    store.dispatch(logout())
    store.dispatch(login('u1'))
    expect(selectFavoriteIds(store.getState())).toEqual(['u3', 'u4'])

    store.dispatch(logout())
    store.dispatch(login('u2'))
    expect(selectFavoriteIds(store.getState())).toEqual(['u5'])
  })

  it('selectIsFavorite не путает избранное разных пользователей', () => {
    const store = createSyncedStore()

    store.dispatch(login('u1'))
    store.dispatch(toggleFavorite('u5'))
    expect(selectIsFavorite(store.getState(), 'u5')).toBe(true)

    store.dispatch(logout())
    store.dispatch(login('u2'))
    expect(selectIsFavorite(store.getState(), 'u5')).toBe(false)
  })

  it('повреждённый localStorage не ломает приложение', () => {
    storage.setItem(FAVORITES_KEY, '{{{broken')
    const store = createSyncedStore()
    expect(() => {
      store.dispatch(login('u1'))
      store.dispatch(toggleFavorite('u3'))
    }).not.toThrow()

    expect(selectFavoriteIds(store.getState())).toEqual(['u3'])
  })

  it('устаревший формат в localStorage не ломает приложение', () => {
    storage.setItem(FAVORITES_KEY, JSON.stringify(['u1', 'u2']))
    const store = createSyncedStore()
    store.dispatch(login('u1'))
    expect(selectFavoriteIds(store.getState())).toEqual([])
  })
})
