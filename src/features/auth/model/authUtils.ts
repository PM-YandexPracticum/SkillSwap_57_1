import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'

/** Читает текущий id из localStorage */
export function getAuthUserId(): string | null {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)
  } catch {
    return null
  }
}

/** Сохраняет id в localStorage */
export function saveAuthUserId(id: string): void {
  localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, id)
}

/** Удаляет id из localStorage (logout) */
export function clearAuthUserId(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER)
}
