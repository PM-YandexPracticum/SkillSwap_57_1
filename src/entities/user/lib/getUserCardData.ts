import type { Category, City, Skill, TCategoryId, User } from '@/shared/types'
import { getAge } from '@/shared/lib/age'

export type CardTag = {
  id: string
  name: string
  categoryId: TCategoryId
}

export type UserCardData = {
  id: string
  name: string
  avatarUrl: string | null
  city: string
  age: number
  teachTags: CardTag[]
  learnTags: CardTag[]
  likesCount: number
}

/** Собирает данные пользователя для карточки SkillCard. Входные данные не меняет. */
export function getUserCardData(
  user: User,
  skills: Skill[],
  categories: Category[],
  cities: City[],
): UserCardData {
  const city = cities.find((item) => item.id === user.cityId)?.name ?? ''

  const skill = skills.find((item) => item.id === user.teachSkillId)
  const teachTags: CardTag[] = skill
    ? [{ id: skill.id, name: skill.title, categoryId: skill.categoryId }]
    : []

  const subcategories = categories.flatMap((category) => category.subcategories)
  const learnTags: CardTag[] = user.learnSubcategoryIds.flatMap((subcategoryId) => {
    const subcategory = subcategories.find((item) => item.id === subcategoryId)
    return subcategory
      ? [{ id: subcategory.id, name: subcategory.name, categoryId: subcategory.categoryId }]
      : []
  })

  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    city,
    age: getAge(user.birthDate),
    teachTags,
    learnTags,
    likesCount: user.likesCount,
  }
}
