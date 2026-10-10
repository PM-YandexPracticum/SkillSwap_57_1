import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCategories } from '@/api/categories'
import { fetchCities } from '@/api/cities'
import { fetchSkills } from '@/api/skills'
import { fetchUsers } from '@/api/users'
import {
  loadCategories,
  selectCategories,
  selectCategoriesStatus,
} from '@/entities/category/model/categoriesSlice'
import { loadCities, selectCities, selectCitiesError, selectCitiesStatus } from '@/entities/city/model/citiesSlice'
import { loadSkills, selectSkills, selectSkillsStatus } from '@/entities/skill/model/skillsSlice'
import { loadUsers, selectUsers, selectUsersStatus } from '@/entities/user/model/usersSlice'
import { createAppStore } from './index'

const fixtures = vi.hoisted(() => ({
  user: {
    id: 'u1',
    name: 'Иван',
    email: 'ivan@mail.ru',
    password: 'secret',
    avatarUrl: null,
    birthDate: '1992-03-15',
    gender: 'male',
    cityId: 'moscow',
    about: '',
    learnSubcategoryIds: ['yoga'],
    teachSkillId: 's1',
    likesCount: 1,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  skill: {
    id: 's1',
    title: 'Игра на барабанах',
    description: 'Основы техники',
    categoryId: 'creative',
    subcategoryId: 'music-sound',
    images: [],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  category: {
    id: 'creative',
    name: 'Творчество и искусство',
    subcategories: [{ id: 'music-sound', name: 'Музыка и звук', categoryId: 'creative' }],
  },
  city: { id: 'moscow', name: 'Москва' },
}))

vi.mock('@/api/users', () => ({ fetchUsers: vi.fn(async () => [fixtures.user]) }))
vi.mock('@/api/skills', () => ({ fetchSkills: vi.fn(async () => [fixtures.skill]) }))
vi.mock('@/api/categories', () => ({ fetchCategories: vi.fn(async () => [fixtures.category]) }))
vi.mock('@/api/cities', () => ({ fetchCities: vi.fn(async () => [fixtures.city]) }))

/** Повторяет каждый dispatch дважды — как повторный вызов при старте приложения */
const loadCatalogTwice = (store: ReturnType<typeof createAppStore>) =>
  Promise.all([
    store.dispatch(loadUsers()),
    store.dispatch(loadUsers()),
    store.dispatch(loadSkills()),
    store.dispatch(loadSkills()),
    store.dispatch(loadCategories()),
    store.dispatch(loadCategories()),
    store.dispatch(loadCities()),
    store.dispatch(loadCities()),
  ])

describe('store каталога', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('до загрузки все срезы пустые', () => {
    const state = createAppStore().getState()

    expect(selectUsers(state)).toEqual([])
    expect(selectUsersStatus(state)).toBe('idle')
    expect(selectSkills(state)).toEqual([])
    expect(selectCategories(state)).toEqual([])
    expect(selectCities(state)).toEqual([])
  })

  it('повторный dispatch не повторяет запросы к public/db', async () => {
    await loadCatalogTwice(createAppStore())

    expect(fetchUsers).toHaveBeenCalledTimes(1)
    expect(fetchSkills).toHaveBeenCalledTimes(1)
    expect(fetchCategories).toHaveBeenCalledTimes(1)
    expect(fetchCities).toHaveBeenCalledTimes(1)
  })

  it('успешная загрузка складывает данные в состояние', async () => {
    const store = createAppStore()

    await loadCatalogTwice(store)
    const state = store.getState()

    expect(selectUsers(state)).toEqual([fixtures.user])
    expect(selectUsersStatus(state)).toBe('succeeded')
    expect(selectSkills(state)).toEqual([fixtures.skill])
    expect(selectSkillsStatus(state)).toBe('succeeded')
    expect(selectCategories(state)).toEqual([fixtures.category])
    expect(selectCategoriesStatus(state)).toBe('succeeded')
    expect(selectCities(state)).toEqual([fixtures.city])
    expect(selectCitiesStatus(state)).toBe('succeeded')
  })

  it('ошибка загрузки переводит срез в failed и сохраняет сообщение', async () => {
    vi.mocked(fetchCities).mockRejectedValueOnce(new Error('Сеть недоступна'))
    const store = createAppStore()

    await store.dispatch(loadCities())

    expect(selectCitiesStatus(store.getState())).toBe('failed')
    expect(selectCitiesError(store.getState())).toBe('Сеть недоступна')
  })
})
