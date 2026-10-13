import { generatePath, useNavigate } from 'react-router-dom'
import type { User } from '@/shared/types'
import { SkillCard } from '@/widgets/SkillCard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getUserCardData } from '@/entities/user/lib/getUserCardData'
import { selectSkills } from '@/entities/skill/model/skillsSlice'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import { selectCities } from '@/entities/city/model/citiesSlice'
import {
  selectIsFavorite,
  selectLikesCount,
  toggleFavorite,
} from '@/features/favorites/model/favoritesSlice'
import { ROUTES } from '@/shared/lib/constants'

type UserCardItemProps = {
  user: User
}

export function UserCardItem({ user }: UserCardItemProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const skills = useAppSelector(selectSkills)
  const categories = useAppSelector(selectCategories)
  const cities = useAppSelector(selectCities)
  const likesCount = useAppSelector((state) => selectLikesCount(state, user.id))
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, user.id))

  const card = getUserCardData(user, skills, categories, cities)

  return (
    <SkillCard
      avatarUrl={card.avatarUrl}
      name={card.name}
      city={card.city}
      age={card.age}
      teachTags={card.teachTags}
      learnTags={card.learnTags}
      likesCount={likesCount}
      isFavorite={isFavorite}
      onToggleFavorite={() => dispatch(toggleFavorite(user.id))}
      onDetails={() => navigate(generatePath(ROUTES.SKILL, { id: user.teachSkillId }))}
    />
  )
}
