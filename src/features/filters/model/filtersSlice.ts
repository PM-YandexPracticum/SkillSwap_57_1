import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Filters } from '@/shared/types'
import type { RootState } from '@/store'

export type FiltersState = {
  filters: Filters
  search: string
}

/** Значения фильтров по умолчанию: режим «Всё», пол «any», пустые списки */
export const defaultFilters: Filters = {
  mode: 'all',
  subcategoryIds: [],
  gender: 'any',
  cityIds: [],
}

const initialState: FiltersState = {
  filters: defaultFilters,
  search: '',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    /** Заменяет выбранные фильтры целиком */
    setFilters(state, action: PayloadAction<Filters>) {
      state.filters = action.payload
    },
    /** Сбрасывает фильтры каталога; строка поиска живёт отдельно и не очищается */
    resetFilters(state) {
      state.filters = defaultFilters
    },
    /** Меняет строку поиска; сама логика поиска живёт вне хранилища */
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
  },
})

export const { setFilters, resetFilters, setSearch } = filtersSlice.actions
export const filtersReducer = filtersSlice.reducer

export const selectFilters = (state: RootState) => state.filters.filters
export const selectSearch = (state: RootState) => state.filters.search
