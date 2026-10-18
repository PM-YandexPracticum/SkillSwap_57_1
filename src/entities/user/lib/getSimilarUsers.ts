import { Skill, User } from '@/shared/types'

/**
 * Возвращает пользователей, преподающих скиллы из той же категории,
 * что и скилл с переданным `skillId`.
 *
 * Логика:
 * 1. Находим целевой скилл по `skillId`.
 * 2. Если не нашли — возвращаем [].
 * 3. Собираем id всех скиллов с тем же `categoryId`.
 * 4. Возвращаем пользователей, чей `teachSkillId` входит в этот набор.
 */
export function getSimilarUsers(users: User[], skills: Skill[], skillId: string): User[] {
  const targetSkill = skills.find((skill) => skill.id === skillId)

  if (!targetSkill) {
    return []
  }

  const similarSkillIds = new Set(
    skills.filter((skill) => skill.categoryId === targetSkill.categoryId).map((skill) => skill.id),
  )

  return users.filter((user) => user.teachSkillId != null && similarSkillIds.has(user.teachSkillId))
}
