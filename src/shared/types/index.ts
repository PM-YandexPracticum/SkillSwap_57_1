// ─── Category ────────────────────────────────────────────

export type TCategoryId = 'business' | 'creative' | 'languages' | 'education' | 'health' | 'home'
export interface Subcategory {
  id: string
  name: string
  categoryId: TCategoryId
}

export interface Category {
  id: TCategoryId
  name: string
  subcategories: Subcategory[]
}

// ─── City ────────────────────────────────────────────────
export interface City {
  id: string
  name: string
}

// ─── Filters ─────────────────────────────────────────────
// Фильтры каталога: режим показывает, по какой связи искать навыки,
// `subcategoryIds`, `gender` и `cityIds` — выбранные значения соответствующих блоков.

export type Filters = {
  mode: 'all' | 'learn' | 'teach'
  subcategoryIds: string[]
  gender: 'any' | 'male' | 'female'
  cityIds: string[]
}

// ─── User ────────────────────────────────────────────────
export type Gender = 'male' | 'female' | 'unspecified'

export interface User {
  id: string
  name: string
  email: string
  password: string // только для моков
  avatarUrl: string | null // null — иконка по умолчанию
  birthDate: string // ISO, YYYY-MM-DD
  gender: Gender
  cityId: string
  about: string
  learnSubcategoryIds: string[] // «Хочет научиться»
  teachSkillId: string // «Может научить», id навыка из skills.json
  likesCount: number // сортировка «Популярное»
  createdAt: string // ISO, дата создания аккаунта, сортировка «Новое»
}

// ─── Skill ───────────────────────────────────────────────
// Навык, которому пользователь может научить. У каждого пользователя ровно один,
// связь через User.teachSkillId. «Хочет научиться» хранится в User.learnSubcategoryIds.

export interface Skill {
  id: string
  title: string
  description: string
  categoryId: TCategoryId
  subcategoryId: string
  images: string[]
  createdAt: string // ISO
}

// ─── Request ─────────────────────────────────────────────
export type RequestStatus = 'pending' | 'accepted' | 'rejected'

export interface SwapRequest {
  id: string
  skillId: string
  fromUserId: string
  toUserId: string
  status: RequestStatus
  createdAt: string // ISO
}

// ─── AppNotification ─────────────────────────────────────
// Уведомление конкретного пользователя о событиях по заявкам на обмен.
// Создаётся моком/действием, отображается в панели уведомлений в шапке.

export interface AppNotification {
  id: string
  /** id пользователя-получателя */
  userId: string
  /** Основной текст уведомления */
  text: string
  /** Пояснение к уведомлению */
  description: string
  /** Дата создания в ISO-формате, например 2026-10-16T08:30:00.000Z */
  createdAt: string
  /** Просмотрено ли уведомление */
  isRead: boolean
}
