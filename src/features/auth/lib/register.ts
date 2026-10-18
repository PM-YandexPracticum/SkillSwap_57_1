import type { Gender, Skill, TCategoryId, User } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { appendToList } from '@/shared/lib/storage'

export type RegisterAccount = { email: string; password: string }

export type RegisterProfile = {
  name: string
  birthDate: string
  gender: Gender
  cityId: string
  subcategoryId: string
  avatarUrl: string | null
}

export type RegisterSkill = {
  title: string
  categoryId: string
  subcategoryId: string
  description: string
  images: string[]
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

/** Есть ли пользователь с таким email (без учёта регистра и пробелов по краям) */
export function isEmailTaken(users: User[], email: string): boolean {
  const target = normalizeEmail(email)
  return users.some((user) => normalizeEmail(user.email) === target)
}

/** Собирает нового пользователя и его навык из данных трёх шагов */
export function createRegisteredUser(
  account: RegisterAccount,
  profile: RegisterProfile,
  skillData: RegisterSkill,
  now: Date = new Date(),
): { user: User; skill: Skill } {
  const stamp = now.getTime().toString(36)
  const createdAt = now.toISOString()

  const skill: Skill = {
    id: `s-${stamp}`,
    title: skillData.title.trim(),
    description: skillData.description.trim(),
    categoryId: skillData.categoryId as TCategoryId,
    subcategoryId: skillData.subcategoryId,
    images: skillData.images,
    createdAt,
  }

  const user: User = {
    id: `u-${stamp}`,
    name: profile.name.trim(),
    email: account.email.trim(),
    password: account.password,
    avatarUrl: profile.avatarUrl,
    birthDate: profile.birthDate,
    gender: profile.gender,
    cityId: profile.cityId,
    about: '',
    learnSubcategoryIds: [profile.subcategoryId],
    teachSkillId: skill.id,
    likesCount: 0,
    createdAt,
  }

  return { user, skill }
}

/** Сохраняет пару пользователь/навык; при нехватке места пробует запись без изображений. */
export function saveRegistered(user: User, skill: Skill): void {
  const { REGISTERED_USERS, REGISTERED_SKILLS } = LOCAL_STORAGE_KEYS
  const previousUsers = localStorage.getItem(REGISTERED_USERS)
  const previousSkills = localStorage.getItem(REGISTERED_SKILLS)

  try {
    const userSaved =
      appendToList(REGISTERED_USERS, user) ||
      appendToList(REGISTERED_USERS, { ...user, avatarUrl: null })
    if (!userSaved) throw new Error('Не удалось сохранить пользователя')

    const skillSaved =
      appendToList(REGISTERED_SKILLS, skill) ||
      appendToList(REGISTERED_SKILLS, { ...skill, images: [] })
    if (!skillSaved) throw new Error('Не удалось сохранить навык')
  } catch (error) {
    // Если вторая запись не удалась, не оставляем в хранилище неполный аккаунт.
    // Возвращаем прежние значения; исходная ошибка попадёт в обработчик страницы.
    try {
      if (previousUsers === null) localStorage.removeItem(REGISTERED_USERS)
      else localStorage.setItem(REGISTERED_USERS, previousUsers)
      if (previousSkills === null) localStorage.removeItem(REGISTERED_SKILLS)
      else localStorage.setItem(REGISTERED_SKILLS, previousSkills)
    } catch {
      // Хранилище может быть полностью недоступно. Успех всё равно не показываем.
    }
    throw error
  }
}
