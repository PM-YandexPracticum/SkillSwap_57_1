import { configureStore } from '@reduxjs/toolkit'
import { categoriesReducer } from '@/entities/category/model/categoriesSlice'
import { citiesReducer } from '@/entities/city/model/citiesSlice'
import { skillsReducer } from '@/entities/skill/model/skillsSlice'
import { usersReducer } from '@/entities/user/model/usersSlice'
import { filtersReducer } from '@/features/filters/model/filtersSlice'
import { favoritesReducer } from '@/features/favorites/model/favoritesSlice'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { authReducer } from '@/features/auth/model/authSlice.ts'

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
    },
  })

export const store = createAppStore()

let previousFavoriteIds = store.getState().favorites.ids

store.subscribe(() => {
  const currentFavoriteIds = store.getState().favorites.ids

  if (currentFavoriteIds === previousFavoriteIds) {
    return
  }

  previousFavoriteIds = currentFavoriteIds

  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(currentFavoriteIds))
  } catch (error) {
    console.error('Не удалось сохранить избранное', error)
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
