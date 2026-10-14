import { useState } from 'react'
import type { User } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import { selectCities } from '@/entities/city/model/citiesSlice'
import { selectFilters, setFilters } from '@/features/filters/model/filtersSlice'
import { getFilterChips } from '@/features/filters/lib/filterChips'
import { sortByNewest, sortByPopularity } from '@/entities/user/lib/homeSections'
import { UserCardItem } from './UserCardItem'
import styles from '../CatalogPage.module.css'

type SortOrder = 'newest' | 'popular'

type FilterResultsProps = {
  users: User[]
}

export function FilterResults({ users }: FilterResultsProps) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectFilters)
  const categories = useAppSelector(selectCategories)
  const cities = useAppSelector(selectCities)
  const [sort, setSort] = useState<SortOrder>('newest')

  const chips = getFilterChips(filters, categories, cities)
  const sortedUsers = sort === 'newest' ? sortByNewest(users) : sortByPopularity(users)

  const toggleSort = () => setSort((prev) => (prev === 'newest' ? 'popular' : 'newest'))

  return (
    <section className={styles.section}>
      {chips.length > 0 && (
        <div className={styles.chips}>
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={styles.chip}
              onClick={() => dispatch(setFilters(chip.next))}
              aria-label={`Убрать фильтр «${chip.label}»`}
            >
              {chip.label}
              <CloseIcon className={styles.chipIcon} />
            </button>
          ))}
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2>Подходящие предложения: {users.length}</h2>
        <Button variant="secondary" onClick={toggleSort}>
          {sort === 'newest' ? 'Сначала новые' : 'Сначала популярные'}
        </Button>
      </div>

      {users.length === 0 ? (
        <p className={styles.empty}>Ничего не найдено</p>
      ) : (
        <div className={styles.grid}>
          {sortedUsers.map((user) => (
            <UserCardItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </section>
  )
}
