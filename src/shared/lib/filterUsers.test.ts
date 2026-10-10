import { describe, expect, it } from 'vitest'
import type { Filters, Skill, User } from '@/shared/types'
import { filterUsers } from './filterUsers'

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

function makeSkill(id: string, subcategoryId: string): Skill {
  return {
    id,
    title: `Навык ${id}`,
    description: '',
    categoryId: 'creative',
    subcategoryId,
    images: [],
    createdAt: '2025-01-01T00:00:00.000Z',
  }
}

function makeFilters(overrides: Partial<Filters> = {}): Filters {
  return {
    mode: 'all',
    subcategoryIds: [],
    gender: 'any',
    cityIds: [],
    ...overrides,
  }
}

function cloneFixtures<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const ids = (users: User[]): string[] => users.map((user) => user.id)

const skills: Skill[] = [makeSkill('s-yoga', 'yoga'), makeSkill('s-guitar', 'guitar')]

const users: User[] = [
  // хочет научиться йоге и может научить йоге
  makeUser({
    id: 'u1',
    gender: 'male',
    cityId: 'moscow',
    learnSubcategoryIds: ['yoga'],
    teachSkillId: 's-yoga',
  }),
  // хочет научиться гитаре и может научить гитаре
  makeUser({
    id: 'u2',
    gender: 'female',
    cityId: 'saint-petersburg',
    learnSubcategoryIds: ['guitar'],
    teachSkillId: 's-guitar',
  }),
  // ничего не хочет изучать, может научить йоге
  makeUser({
    id: 'u3',
    gender: 'male',
    cityId: 'saint-petersburg',
    learnSubcategoryIds: [],
    teachSkillId: 's-yoga',
  }),
  // хочет научиться йоге и гитаре, но ещё не выбрал навык для преподавания
  makeUser({
    id: 'u4',
    gender: 'female',
    cityId: 'moscow',
    learnSubcategoryIds: ['yoga', 'guitar'],
    teachSkillId: '',
  }),
  // хочет научиться йоге, но ссылается на навык, которого нет в списке
  makeUser({
    id: 'u5',
    gender: 'unspecified',
    cityId: 'kazan',
    learnSubcategoryIds: ['yoga'],
    teachSkillId: 's-unknown',
  }),
]

describe('filterUsers', () => {
  it('по умолчанию возвращает всех пользователей в исходном порядке', () => {
    const result = filterUsers(users, skills, makeFilters())

    expect(result).not.toBe(users)
    expect(ids(result)).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
  })

  it('оставляет только мужчин при gender: male', () => {
    expect(ids(filterUsers(users, skills, makeFilters({ gender: 'male' })))).toEqual(['u1', 'u3'])
  })

  it('оставляет только женщин при gender: female', () => {
    expect(ids(filterUsers(users, skills, makeFilters({ gender: 'female' })))).toEqual(['u2', 'u4'])
  })

  it('фильтрует по одному городу', () => {
    const result = filterUsers(users, skills, makeFilters({ cityIds: ['saint-petersburg'] }))

    expect(ids(result)).toEqual(['u2', 'u3'])
  })

  it('фильтрует по нескольким городам по «или»', () => {
    const result = filterUsers(users, skills, makeFilters({ cityIds: ['moscow', 'kazan'] }))

    expect(ids(result)).toEqual(['u1', 'u4', 'u5'])
  })

  it('режим learn оставляет тех, кто хочет научиться выбранным навыкам', () => {
    const filters = makeFilters({ mode: 'learn', subcategoryIds: ['yoga'] })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u1', 'u4', 'u5'])
  })

  it('режим teach оставляет тех, кто может научить выбранным навыкам', () => {
    const filters = makeFilters({ mode: 'teach', subcategoryIds: ['yoga'] })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u1', 'u3'])
  })

  it('режим all оставляет и тех, кто хочет научиться, и тех, кто может научить', () => {
    const filters = makeFilters({ mode: 'all', subcategoryIds: ['yoga'] })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u1', 'u3', 'u4', 'u5'])
  })

  it('несколько выбранных навыков складываются по «или»', () => {
    const filters = makeFilters({ mode: 'teach', subcategoryIds: ['yoga', 'guitar'] })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u1', 'u2', 'u3'])
  })

  it('режим learn без выбранных навыков возвращает всех', () => {
    const filters = makeFilters({ mode: 'learn', subcategoryIds: [] })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
  })

  it('режим teach без выбранных навыков возвращает всех', () => {
    const filters = makeFilters({ mode: 'teach', subcategoryIds: [] })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
  })

  it('сочетает режим, навыки, пол и город одновременно', () => {
    const filters = makeFilters({
      mode: 'teach',
      subcategoryIds: ['guitar'],
      gender: 'female',
      cityIds: ['saint-petersburg', 'moscow'],
    })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u2'])
  })

  it('пересекает группы фильтров по «и»', () => {
    const filters = makeFilters({
      mode: 'all',
      subcategoryIds: ['yoga'],
      gender: 'male',
      cityIds: ['moscow'],
    })

    expect(ids(filterUsers(users, skills, filters))).toEqual(['u1'])
  })

  it('не изменяет входные массивы', () => {
    const usersBefore = cloneFixtures(users)
    const skillsBefore = cloneFixtures(skills)
    const filters = makeFilters({
      mode: 'all',
      subcategoryIds: ['yoga'],
      gender: 'female',
      cityIds: ['moscow'],
    })
    const filtersBefore = cloneFixtures(filters)

    filterUsers(users, skills, filters)

    expect(users).toEqual(usersBefore)
    expect(skills).toEqual(skillsBefore)
    expect(filters).toEqual(filtersBefore)
  })

  it('возвращает пустой массив, когда пользователей нет', () => {
    const filters = makeFilters({ mode: 'learn', subcategoryIds: ['yoga'] })

    expect(filterUsers([], skills, filters)).toEqual([])
  })
})
