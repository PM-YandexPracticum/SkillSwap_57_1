import type { Gender, User } from '@/shared/types'
import { fileToDataUrl } from '@/shared/lib/fileToDataUrl'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { readList } from '@/shared/lib/storage'

/** Значения формы профиля — редактируемый набор полей пользователя. */
export type ProfileFormValues = {
  email: string
  name: string
  birthDate: string
  gender: Gender
  cityId: string
  about: string
  avatarUrl: string | null
}

export type ProfileFieldErrors = Partial<Record<'email' | 'name', string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Преобразует пользователя из store в значения формы. */
export const userToForm = (user: User): ProfileFormValues => ({
  email: user.email,
  name: user.name,
  birthDate: user.birthDate,
  gender: user.gender,
  cityId: user.cityId,
  about: user.about,
  avatarUrl: user.avatarUrl,
})

/**
 * Проверяет обязательные поля и уникальность email.
 * Свой email (по currentUserId) не считается занятым.
 */
export function validateProfile(
  values: ProfileFormValues,
  users: User[],
  currentUserId: string,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}
  const email = values.email.trim().toLowerCase()

  if (!email) {
    errors.email = 'Введите email'
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Введите корректную почту'
  } else {
    const isTaken = users.some(
      (user) =>
        user.id !== currentUserId &&
        user.email.trim().toLowerCase() === email,
    )
    if (isTaken) {
      errors.email = 'Email уже используется'
    }
  }

  if (!values.name.trim()) {
    errors.name = 'Введите имя'
  }

  return errors
}

/**
 * Обновляет существующего пользователя в localStorage (REGISTERED_USERS).
 *
 * - Если пользователь с таким id уже сохранён (например, зарегистрирован через
 *   форму регистрации), запись заменяется.
 * - Если такого id в localStorage ещё нет (пользователь из моков), запись
 *   добавляется — так при следующей загрузке мок-версия будет перекрыта.
 * - Остальные записи в REGISTERED_USERS сохраняются.
 *
 * Фотография: если передан файл — кодируется через fileToDataUrl и заменяет
 * avatarUrl; если файл не выбран — используется текущее значение avatarUrl.
 *
 * Бросает ошибку, если сохранить в localStorage не удалось — вызывающая
 * страница покажет пользователю сообщение об ошибке.
 */
export async function persistUserProfile(
  user: User,
  values: ProfileFormValues,
  file: File | null,
): Promise<User> {
  const avatarUrl = file ? await fileToDataUrl(file) : values.avatarUrl

  const updatedUser: User = {
    ...user,
    email: values.email.trim(),
    name: values.name.trim(),
    birthDate: values.birthDate,
    gender: values.gender,
    cityId: values.cityId,
    about: values.about,
    avatarUrl,
  }

  const { REGISTERED_USERS } = LOCAL_STORAGE_KEYS
  const savedUsers = readList<User>(REGISTERED_USERS)
  const index = savedUsers.findIndex((entry) => entry.id === updatedUser.id)

  if (index >= 0) {
    savedUsers[index] = updatedUser
  } else {
    savedUsers.push(updatedUser)
  }

  // Если setItem бросит (например, переполнение), ошибка уйдёт в вызывающий код.
  localStorage.setItem(REGISTERED_USERS, JSON.stringify(savedUsers))

  return updatedUser
}
