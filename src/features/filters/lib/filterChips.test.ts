import { describe, expect, it } from 'vitest'
import type { Category, City, Filters } from '@/shared/types'
import { countActiveFilters, getFilterChips } from './filterChips'

const defaults: Filters = { mode: 'all', subcategoryIds: [], gender: 'any', cityIds: [] }

const categories: Category[] = [
  {
    id: 'languages',
    name: 'Иностранные языки',
    subcategories: [
      { id: 'english', name: 'Английский', categoryId: 'languages' },
      { id: 'spanish', name: 'Испанский', categoryId: 'languages' },
    ],
  },
]

const cities: City[] = [{ id: 'moscow', name: 'Москва' }]

describe('countActiveFilters', () => {
  it('0 для фильтров по умолчанию', () => {
    expect(countActiveFilters(defaults)).toBe(0)
  })

  it('считает группы, а не отдельные значения', () => {
    const filters: Filters = {
      mode: 'learn',
      subcategoryIds: ['english', 'spanish'],
      gender: 'male',
      cityIds: ['moscow'],
    }
    expect(countActiveFilters(filters)).toBe(4)
  })
})

describe('getFilterChips', () => {
  it('нет чипсов для фильтров по умолчанию', () => {
    expect(getFilterChips(defaults, categories, cities)).toEqual([])
  })

  it('создаёт чипсы с подписями', () => {
    const filters: Filters = {
      mode: 'teach',
      subcategoryIds: ['english'],
      gender: 'female',
      cityIds: ['moscow'],
    }
    const labels = getFilterChips(filters, categories, cities).map((chip) => chip.label)
    expect(labels).toEqual(['Могу научить', 'Английский', 'Женский', 'Москва'])
  })

  it('снятие чипса убирает только его фильтр', () => {
    const filters: Filters = { ...defaults, subcategoryIds: ['english', 'spanish'] }
    const [english] = getFilterChips(filters, categories, cities)
    expect(english.next.subcategoryIds).toEqual(['spanish'])
  })

  it('пропускает неизвестные id', () => {
    const filters: Filters = { ...defaults, subcategoryIds: ['unknown'], cityIds: ['unknown'] }
    expect(getFilterChips(filters, categories, cities)).toEqual([])
  })
})
