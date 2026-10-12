import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'

/** Читает текущий токен я из localStorage */
export function getAuthUserId(): string | null {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)
  } catch {
    return null
  }
}

/** Сохраняет mock-токен в localStorage */
export function saveAuthUserId(id: string): void {
  localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, id)
}

/** Удаляет пользователя из localStorage (logout) */
export function clearAuthUserId(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER)
}
