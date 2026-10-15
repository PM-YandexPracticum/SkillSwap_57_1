import { describe, expect, it } from 'vitest'
import type { User } from '@/shared/types'
import { createRegisteredUser, isEmailTaken } from './register'

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
