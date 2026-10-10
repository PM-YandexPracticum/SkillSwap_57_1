import { describe, expect, it } from 'vitest'
import type { Filters } from '@/shared/types'
import {
  defaultFilters,
  filtersReducer,
  resetFilters,
  setFilters,
  setSearch,
} from './filtersSlice'

const selectedFilters: Filters = {
  mode: 'learn',
  subcategoryIds: ['yoga', 'guitar'],
  gender: 'female',
  cityIds: ['moscow', 'kazan'],
}

describe('filtersSlice', () => {
  it('начальное состояние: фильтры по умолчанию и пустая строка поиска', () => {
    const state = filtersReducer(undefined, { type: 'unknown' })

    expect(state).toEqual({
      filters: { mode: 'all', subcategoryIds: [], gender: 'any', cityIds: [] },
      search: '',
    })
  })

  it('setFilters сохраняет выбранные фильтры', () => {
    const state = filtersReducer(undefined, setFilters(selectedFilters))

    expect(state.filters).toEqual(selectedFilters)
  })

  it('setFilters не меняет строку поиска', () => {
    const withSearch = filtersReducer(undefined, setSearch('йога'))
    const state = filtersReducer(withSearch, setFilters(selectedFilters))

    expect(state.search).toBe('йога')
  })

  it('resetFilters возвращает значения по умолчанию', () => {
    const changed = filtersReducer(undefined, setFilters(selectedFilters))
    const state = filtersReducer(changed, resetFilters())

    expect(state.filters).toEqual(defaultFilters)
  })

  it('resetFilters не очищает строку поиска', () => {
    const withSearch = filtersReducer(undefined, setSearch('йога'))
    const state = filtersReducer(withSearch, resetFilters())

    expect(state.search).toBe('йога')
  })

  it('setSearch меняет строку поиска', () => {
    const state = filtersReducer(undefined, setSearch('барабаны'))

    expect(state.search).toBe('барабаны')
  })

  it('setSearch не меняет фильтры', () => {
    const changed = filtersReducer(undefined, setFilters(selectedFilters))
    const state = filtersReducer(changed, setSearch('барабаны'))

    expect(state.filters).toEqual(selectedFilters)
  })
})
