import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchCategories } from '@/api/categories'
import type { LoadingStatus } from '@/store/types'
import type { RootState } from '@/store'
import type { Category } from './types'

export type CategoriesState = {
  items: Category[]
  status: LoadingStatus
  error: string | null
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
}

/** Загружает категории один раз: повторный dispatch при уже начатой загрузке пропускается */
export const loadCategories = createAsyncThunk<Category[], void, { state: RootState }>(
  'categories/loadCategories',
  async () => fetchCategories(),
  {
    condition: (_arg, { getState }) => getState().categories.status === 'idle',
  },
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось загрузить категории'
      })
  },
})

export const categoriesReducer = categoriesSlice.reducer

export const selectCategories = (state: RootState) => state.categories.items
export const selectCategoriesStatus = (state: RootState) => state.categories.status
export const selectCategoriesError = (state: RootState) => state.categories.error
