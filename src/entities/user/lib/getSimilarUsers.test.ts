import { describe, it, expect } from 'vitest'
import { getSimilarUsers } from './getSimilarUsers'
import type { Skill, User } from '@/shared/types'

const createUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  name: 'Иван',
  email: 'ivan@mail.ru',
  password: 'Baraban2024',
  avatarUrl: '/images/avatars/u1.jpg',
  birthDate: '1992-03-15',
  gender: 'male',
  cityId: 'saint-petersburg',
  about: 'Привет! Люблю ритм, кофе по утрам и людей, которые не боятся пробовать новое',
  learnSubcategoryIds: ['time-management', 'yoga-meditation', 'spanish', 'photography'],
  teachSkillId: 's1',
  likesCount: 128,
  createdAt: '2025-08-02T10:15:00.000Z',
  ...overrides,
})

const createSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: 's1',
  title: 'Игра на барабанах',
  description: 'Играю на барабанах 10 лет. Научу основам техники и любимым ритмам.',
  categoryId: 'creative',
  subcategoryId: 'music-sound',
  images: ['/images/skills/s1-1.jpg'],
  createdAt: '2025-08-02T10:15:00.000Z',
  ...overrides,
})

const skills: Skill[] = [
  createSkill({ id: 's1', categoryId: 'creative', subcategoryId: 'music-sound' }),
  createSkill({ id: 's2', categoryId: 'languages', subcategoryId: 'english' }),
  createSkill({ id: 's3', categoryId: 'business', subcategoryId: 'entrepreneurship' }),
  createSkill({ id: 's7', categoryId: 'creative', subcategoryId: 'music-sound' }),
  createSkill({ id: 's8', categoryId: 'creative', subcategoryId: 'music-sound' }),
  createSkill({ id: 's19', categoryId: 'creative', subcategoryId: 'video-editing' }),
  createSkill({ id: 's26', categoryId: 'creative', subcategoryId: 'photography' }),
  createSkill({ id: 's30', categoryId: 'business', subcategoryId: 'time-management' }),
  createSkill({ id: 's34', categoryId: 'creative', subcategoryId: 'drawing' }),
]

const users: User[] = [
  createUser({ id: 'u1', teachSkillId: 's1' }),
  createUser({ id: 'u2', teachSkillId: 's2' }),
  createUser({ id: 'u3', teachSkillId: 's3' }),
  createUser({ id: 'u7', teachSkillId: 's7' }),
  createUser({ id: 'u8', teachSkillId: 's8' }),
  createUser({ id: 'u19', teachSkillId: 's19' }),
  createUser({ id: 'u26', teachSkillId: 's26' }),
  createUser({ id: 'u30', teachSkillId: 's30' }),
  createUser({ id: 'u34', teachSkillId: 's34' }),
]

describe('getSimilarUsers', () => {
  describe('базовое поведение', () => {
    it('возвращает пользователей из той же категории, что и целевой скилл', () => {
      const result = getSimilarUsers(users, skills, 's1')

      expect(result.map((u) => u.id)).toEqual(['u1', 'u7', 'u8', 'u19', 'u26', 'u34'])
    })

    it('включает владельца самого целевого скилла', () => {
      const result = getSimilarUsers(users, skills, 's1')

      expect(result.some((u) => u.id === 'u1')).toBe(true)
    })

    it('возвращает пользователей другой категории, если запросить их скилл', () => {
      const result = getSimilarUsers(users, skills, 's3')

      expect(result.map((u) => u.id)).toEqual(['u3', 'u30'])
    })

    it('сохраняет порядок пользователей из исходного массива', () => {
      const reordered: User[] = [
        createUser({ id: 'u34', teachSkillId: 's34' }),
        createUser({ id: 'u1', teachSkillId: 's1' }),
        createUser({ id: 'u7', teachSkillId: 's7' }),
      ]

      expect(getSimilarUsers(reordered, skills, 's1').map((u) => u.id)).toEqual(['u34', 'u1', 'u7'])
    })
  })

  describe('краевые случаи', () => {
    it('возвращает пустой массив, если целевой скилл не найден', () => {
      expect(getSimilarUsers(users, skills, 'unknown')).toEqual([])
    })

    it('возвращает пустой массив для пустого массива пользователей', () => {
      expect(getSimilarUsers([], skills, 's1')).toEqual([])
    })

    it('возвращает пустой массив для пустого массива скиллов', () => {
      expect(getSimilarUsers(users, [], 's1')).toEqual([])
    })

    it('возвращает пустой массив, если в категории нет пользователей', () => {
      const lonelySkills: Skill[] = [
        createSkill({ id: 's1', categoryId: 'creative' }),
        createSkill({ id: 's99', categoryId: undefined }),
      ]
      const someUsers: User[] = [createUser({ id: 'u1', teachSkillId: 's1' })]

      expect(getSimilarUsers(someUsers, lonelySkills, 's99')).toEqual([])
    })

    it('не включает пользователей с teachSkillId из другой категории', () => {
      const result = getSimilarUsers(users, skills, 's1')

      expect(result.some((u) => u.id === 'u2')).toBe(false)
      expect(result.some((u) => u.id === 'u3')).toBe(false)
      expect(result.some((u) => u.id === 'u30')).toBe(false)
    })

    it('игнорирует пользователей с teachSkillId = null', () => {
      const usersWithNull = [
        ...users,
        createUser({ id: 'u-null', teachSkillId: null as unknown as string }),
      ]

      const result = getSimilarUsers(usersWithNull, skills, 's1')

      expect(result.some((u) => u.id === 'u-null')).toBe(false)
    })

    it('игнорирует пользователей с teachSkillId = undefined', () => {
      const usersWithUndefined = [
        ...users,
        createUser({ id: 'u-undef', teachSkillId: undefined as unknown as string }),
      ]

      const result = getSimilarUsers(usersWithUndefined, skills, 's1')

      expect(result.some((u) => u.id === 'u-undef')).toBe(false)
    })

    it('игнорирует пользователей с несуществующим teachSkillId', () => {
      const usersWithGhost = [...users, createUser({ id: 'u-ghost', teachSkillId: 's-not-exists' })]

      const result = getSimilarUsers(usersWithGhost, skills, 's1')

      expect(result.some((u) => u.id === 'u-ghost')).toBe(false)
    })
  })

  describe('логика категорий', () => {
    it('находит все скиллы категории, а не только тот же subcategoryId', () => {
      const result = getSimilarUsers(users, skills, 's1')

      expect(result.map((u) => u.id)).toContain('u19')
      expect(result.map((u) => u.id)).toContain('u26')
      expect(result.map((u) => u.id)).toContain('u34')
    })

    it('не смешивает категории с похожими названиями', () => {
      const languagesResult = getSimilarUsers(users, skills, 's2')
      const businessResult = getSimilarUsers(users, skills, 's3')

      expect(languagesResult.map((u) => u.id)).toEqual(['u2'])
      expect(businessResult.map((u) => u.id)).toEqual(['u3', 'u30'])
    })

    it('возвращает нескольких пользователей одной категории, если их несколько', () => {
      const moreUsers = [...users, createUser({ id: 'u-extra', teachSkillId: 's7' })]

      const result = getSimilarUsers(moreUsers, skills, 's1')

      expect(result.map((u) => u.id)).toContain('u-extra')
      expect(result).toHaveLength(7)
    })
  })

  describe('иммутабельность и ссылки', () => {
    it('не мутирует входные массивы', () => {
      const usersSnapshot = users.map((u) => ({ ...u }))
      const skillsSnapshot = skills.map((s) => ({ ...s }))

      getSimilarUsers(users, skills, 's1')

      expect(users).toEqual(usersSnapshot)
      expect(skills).toEqual(skillsSnapshot)
    })

    it('возвращает ссылки на исходные объекты пользователей, а не копии', () => {
      const target = users.find((u) => u.id === 'u1')!
      const result = getSimilarUsers(users, skills, 's1')

      expect(result.find((u) => u.id === 'u1')).toBe(target)
    })
  })

  describe('интеграция с реальными фикстурами', () => {
    const realSkills: Skill[] = [
      {
        id: 's1',
        title: 'Игра на барабанах',
        description: '...',
        categoryId: 'creative',
        subcategoryId: 'music-sound',
        images: [],
        createdAt: '2025-08-02T10:15:00.000Z',
      },
      {
        id: 's2',
        title: 'Английский язык',
        description: '...',
        categoryId: 'languages',
        subcategoryId: 'english',
        images: [],
        createdAt: '2026-05-30T12:28:00.000Z',
      },
      {
        id: 's7',
        title: 'Игра на барабанах',
        description: '...',
        categoryId: 'creative',
        subcategoryId: 'music-sound',
        images: [],
        createdAt: '2025-07-09T14:53:00.000Z',
      },
      {
        id: 's30',
        title: 'Тайм-менеджмент',
        description: '...',
        categoryId: 'business',
        subcategoryId: 'time-management',
        images: [],
        createdAt: '2025-09-20T04:08:00.000Z',
      },
    ]

    const realUsers: User[] = [
      createUser({ id: 'u1', name: 'Иван', teachSkillId: 's1' }),
      createUser({ id: 'u2', name: 'Анна', teachSkillId: 's2' }),
      createUser({ id: 'u7', name: 'Виктория', teachSkillId: 's7' }),
      createUser({ id: 'u30', name: 'Егор', teachSkillId: 's30' }),
    ]

    it('для s1 (creative) находит u1 и u7, но не u2 (languages) и не u30 (business)', () => {
      const result = getSimilarUsers(realUsers, realSkills, 's1')

      expect(result.map((u) => u.id)).toEqual(['u1', 'u7'])
    })

    it('для s30 (business) находит только u30', () => {
      const result = getSimilarUsers(realUsers, realSkills, 's30')

      expect(result.map((u) => u.id)).toEqual(['u30'])
    })

    it('для s2 (languages) находит только u2', () => {
      const result = getSimilarUsers(realUsers, realSkills, 's2')

      expect(result.map((u) => u.id)).toEqual(['u2'])
    })
  })
})
