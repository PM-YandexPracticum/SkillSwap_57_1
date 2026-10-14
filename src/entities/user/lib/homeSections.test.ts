import { describe, expect, it } from 'vitest'
import type { User } from '@/shared/types'
import { getHomeSections, sortByNewest, sortByPopularity } from './homeSections'

const makeUser = (id: string, likesCount: number, createdAt: string): User => ({
  id,
  name: id,
  email: `${id}@mail.ru`,
  password: '123',
  avatarUrl: null,
  birthDate: '1990-01-01',
  gender: 'male',
  cityId: 'moscow',
  about: '',
  learnSubcategoryIds: [],
  teachSkillId: 's1',
  likesCount,
  createdAt,
})

const users = [
  makeUser('a', 10, '2025-01-01T00:00:00.000Z'),
  makeUser('b', 50, '2025-03-01T00:00:00.000Z'),
  makeUser('c', 30, '2025-05-01T00:00:00.000Z'),
  makeUser('d', 20, '2025-02-01T00:00:00.000Z'),
  makeUser('e', 40, '2025-04-01T00:00:00.000Z'),
]

describe('sortByPopularity', () => {
  it('сортирует по убыванию лайков и не меняет исходный массив', () => {
    const snapshot = [...users]
    expect(sortByPopularity(users).map((u) => u.id)).toEqual(['b', 'e', 'c', 'd', 'a'])
    expect(users).toEqual(snapshot)
  })
})

describe('sortByNewest', () => {
  it('сортирует от новых к старым', () => {
    expect(sortByNewest(users).map((u) => u.id)).toEqual(['c', 'e', 'b', 'd', 'a'])
  })
})

describe('getHomeSections', () => {
  it('раскладывает пользователей без повторов', () => {
    const { popular, newest, recommended } = getHomeSections(users, 2)
    expect(popular.map((u) => u.id)).toEqual(['b', 'e'])
    expect(newest.map((u) => u.id)).toEqual(['c', 'd'])
    expect(recommended.map((u) => u.id)).toEqual(['a'])
  })

  it('работает с пустым списком', () => {
    expect(getHomeSections([])).toEqual({ popular: [], newest: [], recommended: [] })
  })
})
