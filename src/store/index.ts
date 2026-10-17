import { configureStore } from '@reduxjs/toolkit'
import { categoriesReducer } from '@/entities/category/model/categoriesSlice'
import { citiesReducer } from '@/entities/city/model/citiesSlice'
import { skillsReducer } from '@/entities/skill/model/skillsSlice'
import { usersReducer } from '@/entities/user/model/usersSlice'
import { filtersReducer } from '@/features/filters/model/filtersSlice'
import { favoritesReducer } from '@/features/favorites/model/favoritesSlice'
import { createFavoritesSync } from '@/features/favorites/model/favoritesStorage'
import { authReducer } from '@/features/auth/model/authSlice.ts'
import { clearAuthUserId, saveAuthUserId } from '@/features/auth/model/authUtils.ts'
import { notificationsReducer } from '@/features/notifications'
import { requestsReducer } from '@/entities/request/model/requestsSlice'

/** Собирает store приложения; отдельная функция даёт тестам чистый store */
export const createAppStore = () =>
  configureStore({
    reducer: {
      users: usersReducer,
      skills: skillsReducer,
      categories: categoriesReducer,
      cities: citiesReducer,
      filters: filtersReducer,
      favorites: favoritesReducer,
      auth: authReducer,
      notifications: notificationsReducer,
      requests: requestsReducer,
    },
  })

export const store = createAppStore()

// --- избранное (per-user) ---
// В localStorage лежит { [userId]: string[] }. Синк подписан на store:
// при смене auth.userId подгружаем список пользователя (или очищаем),
// при изменении списка — сохраняем под ключом текущего пользователя.
const syncFavorites = createFavoritesSync(store)
syncFavorites()
store.subscribe(syncFavorites)

// --- auth.userId ---
let previousUserId = store.getState().auth.userId

store.subscribe(() => {
  const currentUserId = store.getState().auth.userId

  if (currentUserId === previousUserId) return
  previousUserId = currentUserId
  if (currentUserId) saveAuthUserId(currentUserId)
  if (!currentUserId) clearAuthUserId()
})

let previousRequests = store.getState().requests.items

store.subscribe(() => {
  const currentRequests = store.getState().requests.items

  if (currentRequests === previousRequests) {
    return
  }

  previousRequests = currentRequests

  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REQUESTS, JSON.stringify(currentRequests))
  } catch (error) {
    console.error('Не удалось сохранить заявки в localStorage', error)
  }
})

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
