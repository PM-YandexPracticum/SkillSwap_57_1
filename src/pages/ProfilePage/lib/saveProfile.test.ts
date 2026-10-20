import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { fileToDataUrl } from '@/shared/lib/fileToDataUrl'
import {
  persistUserProfile,
  userToForm,
  validateProfile,
  type ProfileFormValues,
} from './saveProfile'

vi.mock('@/shared/lib/fileToDataUrl', () => ({
  fileToDataUrl: vi.fn(),
}))

const baseUser: User = {
  id: 'u1',
  name: 'Иван',
  email: 'ivan@mail.ru',
  password: 'secret',
  avatarUrl: '/images/avatars/u1.jpg',
  birthDate: '1992-03-15',
  gender: 'male',
  cityId: 'moscow',
  about: 'Привет',
  learnSubcategoryIds: ['yoga'],
  teachSkillId: 's1',
  likesCount: 5,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const otherUser: User = {
  ...baseUser,
  id: 'u2',
  name: 'Анна',
  email: 'anna@mail.ru',
}

const baseForm: ProfileFormValues = userToForm(baseUser)

beforeEach(() => {
  localStorage.clear()
  vi.mocked(fileToDataUrl).mockReset()
})

describe('userToForm', () => {
  it('переносит редактируемые поля пользователя', () => {
    expect(baseForm).toEqual({
      email: 'ivan@mail.ru',
      name: 'Иван',
      birthDate: '1992-03-15',
      gender: 'male',
      cityId: 'moscow',
      about: 'Привет',
      avatarUrl: '/images/avatars/u1.jpg',
    })
  })
})

describe('validateProfile', () => {
  it('не возвращает ошибок для корректных данных', () => {
    expect(validateProfile(baseForm, [baseUser], 'u1')).toEqual({})
  })

  it('требует email', () => {
    expect(
      validateProfile({ ...baseForm, email: '   ' }, [baseUser], 'u1').email,
    ).toBeDefined()
  })

  it('требует корректный формат email', () => {
    expect(
      validateProfile({ ...baseForm, email: 'not-an-email' }, [baseUser], 'u1').email,
    ).toBeDefined()
  })

  it('собственный email не считается занятым (без учёта регистра)', () => {
    const errors = validateProfile(
      { ...baseForm, email: '  IVAN@Mail.RU ' },
      [baseUser],
      'u1',
    )
    expect(errors.email).toBeUndefined()
  })

  it('сообщает, если email занят другим пользователем', () => {
    const errors = validateProfile(
      { ...baseForm, email: 'anna@mail.ru' },
      [baseUser, otherUser],
      'u1',
    )
    expect(errors.email).toBe('Email уже используется')
  })

  it('требует имя', () => {
    expect(
      validateProfile({ ...baseForm, name: '   ' }, [baseUser], 'u1').name,
    ).toBeDefined()
  })
})

describe('persistUserProfile', () => {
  it('обновляет существующего пользователя, не теряя других', async () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.REGISTERED_USERS,
      JSON.stringify([otherUser]),
    )

    const updated = await persistUserProfile(
      baseUser,
      { ...baseForm, name: 'Иван Новый' },
      null,
    )

    expect(updated.id).toBe('u1')
    expect(updated.name).toBe('Иван Новый')

    const stored = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_USERS) as string,
    ) as User[]

    expect(stored).toHaveLength(2)
    expect(stored.find((u) => u.id === 'u1')?.name).toBe('Иван Новый')
    expect(stored.find((u) => u.id === 'u2')?.name).toBe('Анна')
  })

  it('создаёт запись, если пользователя ещё нет в registered (мок-пользователь)', async () => {
    const updated = await persistUserProfile(baseUser, baseForm, null)

    const stored = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.REGISTERED_USERS) as string,
    ) as User[]

    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe('u1')
    expect(updated.id).toBe('u1')
  })

  it('сохраняет новую фотографию через fileToDataUrl', async () => {
    vi.mocked(fileToDataUrl).mockResolvedValueOnce('data:image/png;base64,new')
    const file = new File(['x'], 'photo.png', { type: 'image/png' })

    const updated = await persistUserProfile(baseUser, baseForm, file)

    expect(updated.avatarUrl).toBe('data:image/png;base64,new')
    expect(fileToDataUrl).toHaveBeenCalledWith(file)
  })

  it('без выбранного файла оставляет прежнюю фотографию', async () => {
    const updated = await persistUserProfile(baseUser, baseForm, null)

    expect(updated.avatarUrl).toBe(baseUser.avatarUrl)
    expect(fileToDataUrl).not.toHaveBeenCalled()
  })

  it('не изменяет id, навык и остальные данные пользователя', async () => {
    const updated = await persistUserProfile(
      baseUser,
      { ...baseForm, name: 'Новое имя' },
      null,
    )

    expect(updated).toMatchObject({
      id: 'u1',
      name: 'Новое имя',
      learnSubcategoryIds: baseUser.learnSubcategoryIds,
      teachSkillId: baseUser.teachSkillId,
      likesCount: baseUser.likesCount,
      password: baseUser.password,
      createdAt: baseUser.createdAt,
    })
  })

  it('пробрасывает ошибку, если сохранить в localStorage не удалось', async () => {
    const originalSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Нет места')
    })

    await expect(persistUserProfile(baseUser, baseForm, null)).rejects.toThrow()

    Storage.prototype.setItem = originalSetItem
  })
})
