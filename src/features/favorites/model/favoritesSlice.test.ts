import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/store'
import type { User } from '@/entities/user/model/types'
import { selectLikesCount, favoritesReducer, toggleFavorite } from './favoritesSlice'

//Тесты редьюсера
describe('favoritesReducer', () => {
  it('добавляет пользователя в избранное', () => {
    const result = favoritesReducer({ ids: [] }, toggleFavorite('user-1'))

    expect(result.ids).toEqual(['user-1'])
  })

  it('убирает пользователя из избранного', () => {
    const result = favoritesReducer({ ids: ['user-1', 'user-2'] }, toggleFavorite('user-1'))
    expect(result.ids).toEqual(['user-2'])
  })

  it('после двух переключений возвращает исходный список', () => {
    const initialState = { ids: ['user-2'] }

    const afterAdding = favoritesReducer(initialState, toggleFavorite('user-1'))

    const afterRemoving = favoritesReducer(afterAdding, toggleFavorite('user-1'))

    expect(afterRemoving.ids).toEqual(['user-2'])
  })
})

//Tест selectLikesCount
const user = {
  id: 'user-1',
  likesCount: 10,
} as User

const initialState = createAppStore().getState()

const state = {
  ...initialState,
  users: {
    ...initialState.users,
    items: [user],
    status: 'succeeded' as const,
    error: null,
  },
  favorites: {
    ids: [] as string[],
  },
}

describe('selectLikesCount', () => {
  it('возвращает исходное количество лайков, если пользователь не в избранном', () => {
    expect(selectLikesCount(state, 'user-1')).toBe(10)
  })

  it('прибавляет один лайк, если пользователь в избранном', () => {
    const stateWithFavorite = {
      ...state,
      favorites: {
        ids: ['user-1'],
      },
    }

    expect(selectLikesCount(stateWithFavorite, 'user-1')).toBe(11)
  })
})
