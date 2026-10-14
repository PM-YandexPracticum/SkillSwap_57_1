import { describe, expect, it } from 'vitest'
import type { Skill, User } from '@/shared/types'
import { searchUsers } from './searchUsers'

function makeUser(overrides: Partial<User> & Pick<User, 'id'>): User {
  return {
    name: `Пользователь ${overrides.id}`,
    email: `${overrides.id}@mail.ru`,
    password: 'secret',
    avatarUrl: null,
    birthDate: '1995-01-01',
    gender: 'unspecified',
    cityId: 'moscow',
    about: '',
    learnSubcategoryIds: [],
    teachSkillId: '',
    likesCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeSkill(id: string, title: string): Skill {
  return {
    id,
    title,
    description: '',
    categoryId: 'creative',
    subcategoryId: 'music-sound',
    images: [],
    createdAt: '2025-01-01T00:00:00.000Z',
  }
}

const ids = (list: User[]): string[] => list.map((user) => user.id)

const skills: Skill[] = [
  makeSkill('s1', 'Игра на барабанах'),
  makeSkill('s2', 'Английский язык'),
  makeSkill('s3', 'Бизнес-план'),
]

const users: User[] = [
  makeUser({ id: 'u1', teachSkillId: 's1' }),
  makeUser({ id: 'u2', teachSkillId: 's2' }),
  makeUser({ id: 'u3', teachSkillId: 's3' }),
  makeUser({ id: 'u4', teachSkillId: 's-unknown' }), // навыка нет
  makeUser({ id: 'u5', teachSkillId: 's1' }),
]

describe('searchUsers', () => {
  it('пустой запрос возвращает всех пользователей', () => {
    expect(ids(searchUsers(users, skills, ''))).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
  })

  it('запрос из одних пробелов возвращает всех', () => {
    expect(ids(searchUsers(users, skills, '   '))).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
  })

  it('находит по подстроке в названии навыка', () => {
    expect(ids(searchUsers(users, skills, 'бараб'))).toEqual(['u1', 'u5'])
  })

  it('не учитывает регистр', () => {
    expect(ids(searchUsers(users, skills, 'АНГЛИЙСКИЙ'))).toEqual(['u2'])
    expect(ids(searchUsers(users, skills, 'Игра На Барабанах'))).toEqual(['u1', 'u5'])
  })

  it('обрезает пробелы по краям запроса', () => {
    expect(ids(searchUsers(users, skills, '   бизнес   '))).toEqual(['u3'])
  })

  it('пропускает пользователей с неизвестным teachSkillId', () => {
    expect(ids(searchUsers(users, skills, 'игра'))).toEqual(['u1', 'u5'])
  })

  it('возвращает пустой массив, если совпадений нет', () => {
    expect(searchUsers(users, skills, 'что-то странное')).toEqual([])
  })

  it('возвращает новый массив, даже когда запрос пустой', () => {
    const result = searchUsers(users, skills, '')
    expect(result).not.toBe(users)
    expect(result).toEqual(users)
  })

  it('не изменяет входные массивы', () => {
    const usersSnapshot = JSON.parse(JSON.stringify(users))
    const skillsSnapshot = JSON.parse(JSON.stringify(skills))

    searchUsers(users, skills, 'бараб')

    expect(users).toEqual(usersSnapshot)
    expect(skills).toEqual(skillsSnapshot)
  })

  it('работает с пустыми массивами', () => {
    expect(searchUsers([], skills, 'бараб')).toEqual([])
    expect(searchUsers(users, [], 'бараб')).toEqual([])
  })
})
