import { describe, expect, it } from 'vitest'
import type { Category, City, Skill, User } from '@/shared/types'
import { getUserCardData } from './getUserCardData'
import usersJson from '../../../../public/db/users.json'
import skillsJson from '../../../../public/db/skills.json'
import categoriesJson from '../../../../public/db/categories.json'
import citiesJson from '../../../../public/db/cities.json'

const users = usersJson as User[]
const skills = skillsJson as Skill[]
const categories = categoriesJson as Category[]
const cities = citiesJson as City[]

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'test',
  name: 'Тест',
  email: 'test@mail.ru',
  password: 'Test2024',
  avatarUrl: null,
  birthDate: '1990-01-01',
  gender: 'male',
  cityId: 'moscow',
  about: '',
  learnSubcategoryIds: [],
  teachSkillId: 's1',
  likesCount: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('getUserCardData', () => {
  it('собирает данные для u1 из моков', () => {
    const u1 = users.find((user) => user.id === 'u1')!
    const data = getUserCardData(u1, skills, categories, cities)

    expect(data.id).toBe('u1')
    expect(data.name).toBe('Иван')
    expect(data.avatarUrl).toBe('/images/avatars/u1.jpg')
    expect(data.city).toBe('Санкт-Петербург')
    expect(data.age).toBeGreaterThan(0)
    expect(data.teachTags).toEqual([
      { id: 's1', name: 'Игра на барабанах', categoryId: 'creative' },
    ])
    expect(data.learnTags).toEqual([
      { id: 'time-management', name: 'Тайм-менеджмент', categoryId: 'business' },
      { id: 'yoga-meditation', name: 'Йога и медитация', categoryId: 'health' },
      { id: 'spanish', name: 'Испанский', categoryId: 'languages' },
      { id: 'photography', name: 'Фотография', categoryId: 'creative' },
    ])
    expect(data.likesCount).toBe(128)
  })

  it('возвращает пустую строку, если города нет', () => {
    const data = getUserCardData(makeUser({ cityId: 'unknown' }), skills, categories, cities)
    expect(data.city).toBe('')
  })

  it('возвращает пустой teachTags, если навыка нет', () => {
    const data = getUserCardData(makeUser({ teachSkillId: 'unknown' }), skills, categories, cities)
    expect(data.teachTags).toEqual([])
  })

  it('пропускает неизвестные подкатегории', () => {
    const user = makeUser({ learnSubcategoryIds: ['english', 'unknown', 'cooking'] })
    const data = getUserCardData(user, skills, categories, cities)
    expect(data.learnTags).toEqual([
      { id: 'english', name: 'Английский', categoryId: 'languages' },
      { id: 'cooking', name: 'Приготовление еды', categoryId: 'home' },
    ])
  })

  it('не меняет входные данные', () => {
    const user = makeUser({ learnSubcategoryIds: ['english'] })
    const snapshot = JSON.stringify({ user, skills, categories, cities })
    getUserCardData(user, skills, categories, cities)
    expect(JSON.stringify({ user, skills, categories, cities })).toBe(snapshot)
  })
})
