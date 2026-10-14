import type { Category, City, Filters } from '@/shared/types'

export type FilterChip = {
  id: string
  label: string
  /** Фильтры после снятия этого чипса */
  next: Filters
}

const MODE_LABELS = { learn: 'Хочу научиться', teach: 'Могу научить' } as const
const GENDER_LABELS = { male: 'Мужской', female: 'Женский' } as const

/** Сколько групп фильтров выбрано (как в счётчике «Фильтры (N)») */
export function countActiveFilters(filters: Filters): number {
  let count = 0
  if (filters.mode !== 'all') count++
  if (filters.subcategoryIds.length > 0) count++
  if (filters.gender !== 'any') count++
  if (filters.cityIds.length > 0) count++
  return count
}

/** Чипсы выбранных фильтров: режим, навыки, пол, города */
export function getFilterChips(
  filters: Filters,
  categories: Category[],
  cities: City[],
): FilterChip[] {
  const chips: FilterChip[] = []

  if (filters.mode !== 'all') {
    chips.push({
      id: 'mode',
      label: MODE_LABELS[filters.mode],
      next: { ...filters, mode: 'all' },
    })
  }

  const subcategoryNames = new Map(
    categories.flatMap((category) => category.subcategories).map((sub) => [sub.id, sub.name]),
  )
  filters.subcategoryIds.forEach((id) => {
    const name = subcategoryNames.get(id)
    if (!name) return
    chips.push({
      id: `sub-${id}`,
      label: name,
      next: { ...filters, subcategoryIds: filters.subcategoryIds.filter((x) => x !== id) },
    })
  })

  if (filters.gender !== 'any') {
    chips.push({
      id: 'gender',
      label: GENDER_LABELS[filters.gender],
      next: { ...filters, gender: 'any' },
    })
  }

  const cityNames = new Map(cities.map((city) => [city.id, city.name]))
  filters.cityIds.forEach((id) => {
    const name = cityNames.get(id)
    if (!name) return
    chips.push({
      id: `city-${id}`,
      label: name,
      next: { ...filters, cityIds: filters.cityIds.filter((x) => x !== id) },
    })
  })

  return chips
}
