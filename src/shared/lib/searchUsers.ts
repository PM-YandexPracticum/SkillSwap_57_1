import type { Skill, User } from '@/shared/types'

/**
 * Ищет пользователей, у которых название навыка «Может научить» содержит запрос.
 *
 * Правила:
 * - сравнение по подстроке, без учёта регистра;
 * - пробелы по краям запроса обрезаются;
 * - пустой запрос (или только пробелы) возвращает всех пользователей;
 * - пользователи с неизвестным `teachSkillId` не подходят.
 *
 * Функция не изменяет входные массивы и сохраняет порядок пользователей.
 *
 * @param users пользователи каталога
 * @param skills навыки для разрешения `teachSkillId` → `title`
 * @param query строка поиска
 * @returns новый массив подходящих пользователей
 */
export function searchUsers(users: User[], skills: Skill[], query: string): User[] {
  const normalized = query.trim().toLowerCase()

  if (normalized === '') return [...users]

  const skillsById = new Map(skills.map((skill) => [skill.id, skill]))

  return users.filter((user) => {
    const skill = skillsById.get(user.teachSkillId)
    if (!skill) return false
    return skill.title.toLowerCase().includes(normalized)
  })
}
