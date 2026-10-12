import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'

type FavoritesState = {
  ids: string[]
}

function readFavouriteIds(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES)

    if (!saved) {
      return []
    }

    const parsed: unknown = JSON.parse(saved)

    if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
      return parsed
    }

    return []
  } catch {
    return []
  }
}

const initialState: FavoritesState = {
  ids: readFavouriteIds(),
}

const FavoritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const userId = action.payload
      if (state.ids.includes(userId)) {
        state.ids = state.ids.filter((id) => id !== userId)
      } else {
        state.ids.push(userId)
      }
    },
  },
})

export const { toggleFavorite } = FavoritesSlice.actions
export const favoritesReducer = FavoritesSlice.reducer
export const selectFavoriteIds = (state: RootState) => state.favorites.ids
export const selectIsFavorite = (state: RootState, userId: string): boolean =>
  selectFavoriteIds(state).includes(userId)
export const selectFavoriteUsers = createSelector(
  [(state: RootState) => state.users.items, selectFavoriteIds],
  (users, favoriteIds) => users.filter((user) => favoriteIds.includes(user.id)),
)
export const selectLikesCount = (state: RootState, userId: string): number => {
  const user = state.users.items.find((item) => item.id === userId)

  if (!user) {
    return 0
  }

  return user.likesCount + (selectIsFavorite(state, userId) ? 1 : 0)
}
