// ─── Category ────────────────────────────────────────────
export interface Subcategory {
  id: string
  name: string
  categoryId: string
}

export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

// ─── City ────────────────────────────────────────────────
export interface City {
  id: string
  name: string
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
  likesCount: number // сортировка «Популярное»
  createdAt: string // ISO, дата создания аккаунта, сортировка «Новое»
}

// ─── Skill ───────────────────────────────────────────────
// Навык, которому пользователь может научить. У каждого пользователя ровно один,
// связь через authorId. «Хочет научиться» хранится в User.learnSubcategoryIds.
export interface Skill {
  id: string
  title: string
  description: string
  categoryId: string
  subcategoryId: string
  images: string[]
  authorId: string
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

// ─── Notification ────────────────────────────────────────
export interface Notification {
  id: string
  requestId: string
  title: string // «Олег принял ваш обмен»
  text: string
  isRead: boolean
  createdAt: string // ISO
}

// ─── Auth ────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null // аватар в шапке
  token: string
}
