import { useMemo, useState } from 'react'
import { FiltersSidebar } from '@/widgets/FiltersSidebar'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectUsers, selectCurrentUser } from '@/entities/user/model/usersSlice'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import { selectCities } from '@/entities/city/model/citiesSlice'
import { selectSkills } from '@/entities/skill/model/skillsSlice'
import { selectFilters, selectSearch, setFilters } from '@/features/filters/model/filtersSlice'
import { countActiveFilters } from '@/features/filters/lib/filterChips'
import { filterUsers } from '@/shared/lib/filterUsers'
import { searchUsers } from '@/shared/lib/searchUsers'
import { getHomeSections, sortByNewest, sortByPopularity } from '@/entities/user/lib/homeSections'
import { UserSection } from './ui/UserSection'
import { FilterResults } from './ui/FilterResults'
import styles from './CatalogPage.module.css'

type ExpandedSection = 'popular' | 'newest' | null

export default function CatalogPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
  const currentUser = useAppSelector(selectCurrentUser)
  const skills = useAppSelector(selectSkills)
  const categories = useAppSelector(selectCategories)
  const cities = useAppSelector(selectCities)
  const filters = useAppSelector(selectFilters)
  const search = useAppSelector(selectSearch)

  const [expanded, setExpanded] = useState<ExpandedSection>(null)

  // Мемоизируем цепочку — иначе useInfiniteList будет сбрасываться на каждом рендере.
  const otherUsers = useMemo(
    () => users.filter((user) => user.id !== currentUser?.id),
    [users, currentUser?.id],
  )

  const sections = useMemo(() => getHomeSections(otherUsers), [otherUsers])
  const popularUsers = useMemo(() => sortByPopularity(otherUsers), [otherUsers])
  const newestUsers = useMemo(() => sortByNewest(otherUsers), [otherUsers])

  const hasFilters = countActiveFilters(filters) > 0
  const hasSearch = search.trim() !== ''
  const showResults = hasFilters || hasSearch

  const filteredUsers = useMemo(
    () => filterUsers(otherUsers, skills, filters),
    [otherUsers, skills, filters],
  )
  const resultUsers = useMemo(
    () => (hasSearch ? searchUsers(filteredUsers, skills, search) : filteredUsers),
    [filteredUsers, skills, search, hasSearch],
  )

  return (
    <div className={styles.page}>
      <FiltersSidebar
        categories={categories}
        cities={cities}
        value={filters}
        onChange={(next) => dispatch(setFilters(next))}
      />

      <main className={styles.content}>
        {showResults ? (
          <FilterResults users={resultUsers} />
        ) : (
          <>
            {expanded === 'popular' && (
              <UserSection
                title="Популярное"
                users={popularUsers}
                onShowAll={() => setExpanded(null)}
                showAllLabel="Свернуть"
                paginate
              />
            )}
            {expanded === 'newest' && (
              <UserSection
                title="Новое"
                users={newestUsers}
                onShowAll={() => setExpanded(null)}
                showAllLabel="Свернуть"
                paginate
              />
            )}
            {expanded === null && (
              <>
                <UserSection
                  title="Популярное"
                  users={sections.popular}
                  onShowAll={() => setExpanded('popular')}
                />
                <UserSection
                  title="Новое"
                  users={sections.newest}
                  onShowAll={() => setExpanded('newest')}
                />
                <UserSection title="Рекомендуем" users={sections.recommended} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
