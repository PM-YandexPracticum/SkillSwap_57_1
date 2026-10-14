import type { User } from '@/shared/types'
import { FiltersSidebar } from '@/widgets/FiltersSidebar'
import { SkillCard } from '@/widgets/SkillCard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import { selectCities } from '@/entities/city/model/citiesSlice'
import { selectSkills } from '@/entities/skill/model/skillsSlice'
import { selectFilters, setFilters } from '@/features/filters/model/filtersSlice'
import { selectFavoriteUsers } from '@/features/favorites/model/favoritesSlice'
import { filterUsers } from '@/shared/lib/filterUsers'
import { useUserCardProps } from '@/features/user-card'
import styles from './FavoritesPage.module.css'

type FavoriteCardProps = {
  user: User
}

/** Локальная обёртка: правило хуков не разрешает вызывать хук внутри .map() */
function FavoriteCard({ user }: FavoriteCardProps) {
  return <SkillCard {...useUserCardProps(user)} />
}

export default function FavoritesPage() {
  const dispatch = useAppDispatch()

  const favoriteUsers = useAppSelector(selectFavoriteUsers)
  const skills = useAppSelector(selectSkills)
  const categories = useAppSelector(selectCategories)
  const cities = useAppSelector(selectCities)
  const filters = useAppSelector(selectFilters)

  const users = filterUsers(favoriteUsers, skills, filters)

  return (
    <div className={styles.page}>
      <FiltersSidebar
        categories={categories}
        cities={cities}
        value={filters}
        onChange={(next) => dispatch(setFilters(next))}
      />

      <main className={styles.content}>
        <h1 className={styles.title}>Избранное</h1>

        {users.length === 0 ? (
          <p className={styles.empty}>В избранном пока ничего нет</p>
        ) : (
          <div className={styles.grid}>
            {users.map((user) => (
              <FavoriteCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
