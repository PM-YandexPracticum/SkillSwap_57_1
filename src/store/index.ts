import { configureStore } from '@reduxjs/toolkit'
import { categoriesReducer } from '@/entities/category/model/categoriesSlice'
import { citiesReducer } from '@/entities/city/model/citiesSlice'
import { skillsReducer } from '@/entities/skill/model/skillsSlice'
import { usersReducer } from '@/entities/user/model/usersSlice'
import { filtersReducer } from '@/features/filters/model/filtersSlice'

/** Собирает store приложения; отдельная функция даёт тестам чистый store */
export const createAppStore = () =>
  configureStore({
    reducer: {
      users: usersReducer,
      skills: skillsReducer,
      categories: categoriesReducer,
      cities: citiesReducer,
      filters: filtersReducer,
    },
  })

export const store = createAppStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
