import { afterEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { createRegisteredUser, isEmailTaken, saveRegistered } from './register'

const account = { email: 'new@mail.ru', password: 'Password123' }
const profile = {
  name: ' Анна ',
  birthDate: '1995-05-10',
  gender: 'female' as const,
  cityId: 'moscow',
  subcategoryId: 'english',
  avatarUrl: null,
}
const skillData = {
  title: ' Игра на гитаре ',
  categoryId: 'creative',
  subcategoryId: 'music-sound',
  description: 'Научу аккордам',
  images: ['data:image/png;base64,AAA'],
}
const now = new Date('2026-10-15T12:00:00.000Z')

describe('isEmailTaken', () => {
  const users = [{ email: 'ivan@mail.ru' }] as User[]

  it('находит занятый email', () => {
    expect(isEmailTaken(users, 'ivan@mail.ru')).toBe(true)
  })

  it('не учитывает регистр и пробелы по краям', () => {
    expect(isEmailTaken(users, '  IVAN@Mail.ru ')).toBe(true)
  })

  it('свободный email не занят', () => {
    expect(isEmailTaken(users, 'anna@mail.ru')).toBe(false)
  })
})

describe('createRegisteredUser', () => {
  const { user, skill } = createRegisteredUser(account, profile, skillData, now)

  it('связывает пользователя с новым навыком', () => {
    expect(user.teachSkillId).toBe(skill.id)
    expect(user.id).not.toBe(skill.id)
  })

  it('переносит данные шагов 1 и 2', () => {
    expect(user).toMatchObject({
      email: 'new@mail.ru',
      password: 'Password123',
      name: 'Анна',
      birthDate: '1995-05-10',
      gender: 'female',
      cityId: 'moscow',
      avatarUrl: null,
    })
  })

  it('«Хочет научиться» — подкатегория из шага 2', () => {
    expect(user.learnSubcategoryIds).toEqual(['english'])
  })

  it('новый пользователь без лайков, с датой создания', () => {
    expect(user.likesCount).toBe(0)
    expect(user.createdAt).toBe(now.toISOString())
  })

  it('навык собран из данных шага 3', () => {
    expect(skill).toMatchObject({
      title: 'Игра на гитаре',
      categoryId: 'creative',
      subcategoryId: 'music-sound',
      description: 'Научу аккордам',
      images: ['data:image/png;base64,AAA'],
      createdAt: now.toISOString(),
    })
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('saveRegistered', () => {
  it('сохраняет пользователя и его навык', () => {
    const { user, skill } = createRegisteredUser(
      account,
      profile,
      skillData,
      now,
    )
    saveRegistered(user, skill)
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_USERS)).toContain(
      user.id,
    )
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_SKILLS),
    ).toContain(skill.id)
  })

  it('сообщает об ошибке, если localStorage недоступен', () => {
    const { user, skill } = createRegisteredUser(
      account,
      profile,
      skillData,
      now,
    )
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Нет доступа')
    })
    expect(() => saveRegistered(user, skill)).toThrow()
  })

  it('откатывает запись пользователя, если навык сохранить не удалось', () => {
    const { user, skill } = createRegisteredUser(
      account,
      profile,
      skillData,
      now,
    )
    const originalSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === LOCAL_STORAGE_KEYS.REGISTERED_SKILLS)
        throw new Error('Нет места')
      originalSetItem.call(this, key, value)
    })
    expect(() => saveRegistered(user, skill)).toThrow()
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_USERS)).toBeNull()
  })
})

it('при нехватке места повторяет запись без изображений', () => {
  const { user, skill } = createRegisteredUser(account, profile, skillData, now)
  const originalSetItem = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
    this: Storage,
    key: string,
    value: string,
  ) {
    if (
      key === LOCAL_STORAGE_KEYS.REGISTERED_SKILLS &&
      value.includes('data:image')
    ) {
      throw new Error('Нет места для изображений')
    }
    originalSetItem.call(this, key, value)
  })
  saveRegistered(user, skill)
  expect(
    JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_SKILLS)!),
  ).toEqual([{ ...skill, images: [] }])
})
