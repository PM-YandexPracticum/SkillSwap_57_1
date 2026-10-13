import { User } from '@/shared/types'


/**
 * Ищет пользователя по переданным учётным данным и возращает его id.
 *
 * Функция не изменяет входные массивы и сохраняет порядок пользователей.
 *
 * @param users пользователи каталога
 * @param credentials учётные данные типа {email: string; password: string}
 * @returns id: string ?? null
 */
export function findUserIdByCredentials(
  users: User[],
  credentials: { email: string; password: string },
): string | null {
  const { email, password } = credentials
  const normalizedEmail = email.trim().toLowerCase()
  const id = users.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail && u.password === password,
  )?.id
  return id ?? null
}

