import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type FavoritesState = {
  /** Id пользователей в избранном текущего авторизованного пользователя */
  ids: string[]
}

// initialState.ids не читается из localStorage:
// хранение по пользователям и синхронизация с auth.userId живут в favoritesStorage.ts
const initialState: FavoritesState = {
  ids: [],
}

const favoritesSlice = createSlice({
  name: 'favorites', // ← было 'favourites', исправлено по AC #171
  initialState,
  reducers: {
    /** Добавляет или убирает пользователя из избранного текущего пользователя */
    toggleFavorite(state, action: PayloadAction<string>) {
      const userId = action.payload
      if (state.ids.includes(userId)) {
        state.ids = state.ids.filter((id) => id !== userId)
      } else {
        state.ids.push(userId)
      }
    },
    /** Полностью заменяет список — используется при смене авторизованного пользователя */
    setFavorites(state, action: PayloadAction<string[]>) {
      state.ids = action.payload
    },
  },
})

export const { toggleFavorite, setFavorites } = favoritesSlice.actions
export const favoritesReducer = favoritesSlice.reducer

export const selectFavoriteIds = (state: RootState): string[] => state.favorites.ids

export const selectIsFavorite = (state: RootState, userId: string): boolean =>
  selectFavoriteIds(state).includes(userId)

export const selectFavoriteUsers = createSelector(
  [(state: RootState) => state.users.items, selectFavoriteIds],
  (users, favoriteIds) => users.filter((user) => favoriteIds.includes(user.id)),
)

export const selectLikesCount = (state: RootState, userId: string): number => {
  const user = state.users.items.find((item) => item.id === userId)
  if (!user) return 0
  return user.likesCount + (selectIsFavorite(state, userId) ? 1 : 0)
}
