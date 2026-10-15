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

/** Сохраняет нового пользователя и навык; если картинки не влезли в localStorage — без них */
export function saveRegistered(user: User, skill: Skill): void {
  const { REGISTERED_USERS, REGISTERED_SKILLS } = LOCAL_STORAGE_KEYS

  if (!appendToList(REGISTERED_USERS, user)) {
    appendToList(REGISTERED_USERS, { ...user, avatarUrl: null })
  }
  if (!appendToList(REGISTERED_SKILLS, skill)) {
    appendToList(REGISTERED_SKILLS, { ...skill, images: [] })
  }
}
