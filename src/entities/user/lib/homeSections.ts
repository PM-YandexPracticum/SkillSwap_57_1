import type { User } from '@/shared/types'

/** Пользователи по убыванию лайков (новый массив) */
export const sortByPopularity = (users: User[]): User[] =>
  [...users].sort((a, b) => b.likesCount - a.likesCount)

/** Пользователи от новых к старым (новый массив) */
export const sortByNewest = (users: User[]): User[] =>
  [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export type HomeSections = {
  popular: User[]
  newest: User[]
  recommended: User[]
}

/** Раскладывает пользователей по секциям главной без повторов */
export function getHomeSections(users: User[], size = 3): HomeSections {
  const popular = sortByPopularity(users).slice(0, size)
  const shown = new Set(popular.map((user) => user.id))

  const newest = sortByNewest(users.filter((user) => !shown.has(user.id))).slice(0, size)
  newest.forEach((user) => shown.add(user.id))

  const recommended = users.filter((user) => !shown.has(user.id))

  return { popular, newest, recommended }
}
