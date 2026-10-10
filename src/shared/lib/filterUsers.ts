import type { Filters, Skill, User } from '@/shared/types'

/**
 * Отбирает пользователей каталога по выбранным фильтрам.
 *
 * Правила отбора:
 * - `mode: 'learn'` — среди «Хочу научиться» пользователя есть хотя бы одна из выбранных подкатегорий;
 * - `mode: 'teach'` — навык пользователя (`teachSkillId`) относится к одной из выбранных подкатегорий;
 * - `mode: 'all'` — подходит любой из двух вариантов выше;
 * - без выбранных подкатегорий режим `learn`/`teach` никого не отсеивает;
 * - внутри `subcategoryIds` и `cityIds` значения работают по «или», а группы между собой — по «и».
 *
 * Функция не изменяет входные массивы и сохраняет порядок пользователей.
 *
 * @param users пользователи каталога
 * @param skills навыки, на которые пользователи ссылаются через `teachSkillId`
 * @param filters выбранные фильтры каталога
 * @returns новый массив пользователей, подходящих под фильтры
 */
export function filterUsers(users: User[], skills: Skill[], filters: Filters): User[] {
  const { mode, subcategoryIds, gender, cityIds } = filters

  const skillsById = new Map(skills.map((skill) => [skill.id, skill]))
  const selectedSubcategories = new Set(subcategoryIds)
  const selectedCities = new Set(cityIds)
  const filtersBySkills = selectedSubcategories.size > 0

  return users.filter((user) => {
    if (gender !== 'any' && user.gender !== gender) return false

    if (selectedCities.size > 0 && !selectedCities.has(user.cityId)) return false

    if (!filtersBySkills) return true

    const wantsToLearn =
      mode !== 'teach' &&
      user.learnSubcategoryIds.some((subcategoryId) => selectedSubcategories.has(subcategoryId))

    const taughtSkill = skillsById.get(user.teachSkillId)
    const canTeach =
      mode !== 'learn' &&
      taughtSkill !== undefined &&
      selectedSubcategories.has(taughtSkill.subcategoryId)

    return wantsToLearn || canTeach
  })
}
