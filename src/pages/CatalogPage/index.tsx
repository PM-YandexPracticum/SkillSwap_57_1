import { useState } from 'react'
import { FiltersSidebar } from '@/widgets/FiltersSidebar'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectUsers, selectCurrentUser } from '@/entities/user/model/usersSlice'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import { selectCities } from '@/entities/city/model/citiesSlice'
import { selectSkills } from '@/entities/skill/model/skillsSlice'
import { selectFilters, setFilters } from '@/features/filters/model/filtersSlice'
import { countActiveFilters } from '@/features/filters/lib/filterChips'
import { filterUsers } from '@/shared/lib/filterUsers'
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
  const [expanded, setExpanded] = useState<ExpandedSection>(null)

  const otherUsers = users.filter((user) => user.id !== currentUser?.id)
  const sections = getHomeSections(otherUsers)

  const hasFilters = countActiveFilters(filters) > 0
  const filteredUsers = filterUsers(otherUsers, skills, filters)

  return (
    <div className={styles.page}>
      <FiltersSidebar
        categories={categories}
        cities={cities}
        value={filters}
        onChange={(next) => dispatch(setFilters(next))}
      />

      <main className={styles.content}>
        {hasFilters ? (
          <FilterResults users={filteredUsers} />
        ) : (
          <>
            {expanded === 'popular' && (
              <UserSection
                title="Популярное"
                users={sortByPopularity(otherUsers)}
                onShowAll={() => setExpanded(null)}
                showAllLabel="Свернуть"
              />
            )}
            {expanded === 'newest' && (
              <UserSection
                title="Новое"
                users={sortByNewest(otherUsers)}
                onShowAll={() => setExpanded(null)}
                showAllLabel="Свернуть"
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
