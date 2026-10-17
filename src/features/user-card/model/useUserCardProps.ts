import { generatePath, useNavigate } from 'react-router-dom'
import type { User } from '@/shared/types'
import type { SkillCardProps } from '@/widgets/SkillCard'
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
import { useRequireAuth } from '@/features/auth/model/useRequireAuth'   // ← новое
import { ROUTES } from '@/shared/lib/constants'

/**
 * Возвращает готовый набор пропсов для SkillCard на основе пользователя.
 *
 * Собирает данные карточки, лайки, состояние избранного и колбэки
 * (переключение избранного, переход на страницу навыка).
 */
export function useUserCardProps(user: User): SkillCardProps {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const requireAuth = useRequireAuth()   // ← новое

  const skills = useAppSelector(selectSkills)
  const categories = useAppSelector(selectCategories)
  const cities = useAppSelector(selectCities)
  const likesCount = useAppSelector((state) => selectLikesCount(state, user.id))
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, user.id))

  const card = getUserCardData(user, skills, categories, cities)

  return {
    avatarUrl: card.avatarUrl,
    name: card.name,
    city: card.city,
    age: card.age,
    teachTags: card.teachTags,
    learnTags: card.learnTags,
    likesCount,
    isFavorite,
    // ↓ клик без авторизации открывает модалку вместо изменения state
    onToggleFavorite: () => requireAuth(() => dispatch(toggleFavorite(user.id))),
    onDetails: () => navigate(generatePath(ROUTES.SKILL, { id: user.teachSkillId })),
  }
}
