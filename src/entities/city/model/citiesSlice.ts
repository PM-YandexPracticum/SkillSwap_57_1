import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchCities } from '@/api/cities'
import type { LoadingStatus } from '@/store/types'
import type { RootState } from '@/store'
import type { City } from './types'

export type CitiesState = {
  items: City[]
  status: LoadingStatus
  error: string | null
}

const initialState: CitiesState = {
  items: [],
  status: 'idle',
  error: null,
}

/** Загружает города один раз: повторный dispatch при уже начатой загрузке пропускается */
export const loadCities = createAsyncThunk<City[], void, { state: RootState }>(
  'cities/loadCities',
  async () => fetchCities(),
  {
    condition: (_arg, { getState }) => getState().cities.status === 'idle',
  },
)

const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCities.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadCities.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(loadCities.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось загрузить города'
      })
  },
})

export const citiesReducer = citiesSlice.reducer

export const selectCities = (state: RootState) => state.cities.items
export const selectCitiesStatus = (state: RootState) => state.cities.status
export const selectCitiesError = (state: RootState) => state.cities.error
