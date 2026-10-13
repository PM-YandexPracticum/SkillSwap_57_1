import { describe, it, expect } from 'vitest'
import { findUserIdByCredentials } from './findUserIdByCredentials'
import type { User } from '@/shared/types'

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  name: 'Иван',
  email: 'ivan@mail.ru',
  password: 'Baraban2024',
  avatarUrl: '/images/avatars/u1.jpg',
  birthDate: '1992-03-15',
  gender: 'male',
  cityId: 'saint-petersburg',
  about: '',
  learnSubcategoryIds: [],
  teachSkillId: 's1',
  likesCount: 0,
  createdAt: '2025-08-02T10:15:00.000Z',
  ...overrides,
})

describe('findUserIdByCredentials', () => {
  it('возвращает id при точном совпадении email и пароля', () => {
    const users = [
      makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' }),
      makeUser({ id: 'u2', email: 'anna@gmail.com', password: 'SwapAnna2026' }),
    ]

    expect(
      findUserIdByCredentials(users, {
        email: 'ivan@mail.ru',
        password: 'Baraban2024',
      }),
    ).toBe('u1')

    expect(
      findUserIdByCredentials(users, {
        email: 'anna@gmail.com',
        password: 'SwapAnna2026',
      }),
    ).toBe('u2')
  })

  it('игнорирует регистр email', () => {
    const users = [makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' })]

    expect(
      findUserIdByCredentials(users, {
        email: 'IVAN@MAIL.RU',
        password: 'Baraban2024',
      }),
    ).toBe('u1')

    expect(
      findUserIdByCredentials(users, {
        email: 'Ivan@Mail.Ru',
        password: 'Baraban2024',
      }),
    ).toBe('u1')
  })

  it('обрезает пробелы в email', () => {
    const users = [makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' })]

    expect(
      findUserIdByCredentials(users, {
        email: '  ivan@mail.ru  ',
        password: 'Baraban2024',
      }),
    ).toBe('u1')
  })

  it('обрезает пробелы и приводит к нижнему регистру email в самих пользователях', () => {
    const users = [makeUser({ id: 'u1', email: '  Ivan@Mail.RU  ', password: 'Baraban2024' })]

    expect(
      findUserIdByCredentials(users, {
        email: 'ivan@mail.ru',
        password: 'Baraban2024',
      }),
    ).toBe('u1')
  })

  it('пароль чувствителен к регистру', () => {
    const users = [makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' })]

    expect(
      findUserIdByCredentials(users, {
        email: 'ivan@mail.ru',
        password: 'baraban2024',
      }),
    ).toBeNull()

    expect(
      findUserIdByCredentials(users, {
        email: 'ivan@mail.ru',
        password: 'BARABAN2024',
      }),
    ).toBeNull()
  })

  it('возвращает null, если пароль не совпадает', () => {
    const users = [makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' })]

    expect(
      findUserIdByCredentials(users, {
        email: 'ivan@mail.ru',
        password: 'WrongPassword',
      }),
    ).toBeNull()
  })

  it('возвращает null, если email не найден', () => {
    const users = [makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' })]

    expect(
      findUserIdByCredentials(users, {
        email: 'nobody@mail.ru',
        password: 'Baraban2024',
      }),
    ).toBeNull()
  })

  it('возвращает null для пустого массива', () => {
    expect(
      findUserIdByCredentials([], {
        email: 'ivan@mail.ru',
        password: 'Baraban2024',
      }),
    ).toBeNull()
  })

  it('возвращает null для пустых email и пароля', () => {
    const users = [makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' })]

    expect(findUserIdByCredentials(users, { email: '', password: '' })).toBeNull()

    expect(findUserIdByCredentials(users, { email: '   ', password: '   ' })).toBeNull()
  })

  it('возвращает первого подходящего пользователя, если есть дубликаты', () => {
    const users = [
      makeUser({ id: 'u1', email: 'ivan@mail.ru', password: 'Baraban2024' }),
      makeUser({ id: 'u99', email: 'ivan@mail.ru', password: 'Baraban2024' }),
    ]

    expect(
      findUserIdByCredentials(users, {
        email: 'ivan@mail.ru',
        password: 'Baraban2024',
      }),
    ).toBe('u1')
  })

  it('не изменяет входной массив и объекты пользователей', () => {
    const users = [makeUser({ id: 'u1', email: '  Ivan@Mail.RU  ', password: 'Baraban2024' })]
    const snapshot = JSON.parse(JSON.stringify(users))

    findUserIdByCredentials(users, {
      email: '  IVAN@mail.ru  ',
      password: 'Baraban2024',
    })

    expect(users).toEqual(snapshot)
    expect(users[0].email).toBe('  Ivan@Mail.RU  ')
  })

  it('работает на реальных данных из users.json (u1 и u7)', () => {
    const users: User[] = [
      makeUser({
        id: 'u1',
        email: 'ivan@mail.ru',
        password: 'Baraban2024',
        name: 'Иван',
      }),
      makeUser({
        id: 'u7',
        email: 'viktoriya.kem@yandex.ru',
        password: 'SwapViktoriyakem2026',
        name: 'Виктория',
      }),
      makeUser({
        id: 'u9',
        email: 'viktoriya.sochi@mail.ru',
        password: 'SwapViktoriyasochi2026',
        name: 'Виктория',
      }),
    ]

    expect(
      findUserIdByCredentials(users, {
        email: 'ivan@mail.ru',
        password: 'Baraban2024',
      }),
    ).toBe('u1')

    expect(
      findUserIdByCredentials(users, {
        email: 'Viktoriya.Kem@Yandex.RU',
        password: 'SwapViktoriyakem2026',
      }),
    ).toBe('u7')

    // у двух Викторий разные email — пароль от одной не подходит к другой
    expect(
      findUserIdByCredentials(users, {
        email: 'viktoriya.sochi@mail.ru',
        password: 'SwapViktoriyakem2026',
      }),
    ).toBeNull()
  })
})
