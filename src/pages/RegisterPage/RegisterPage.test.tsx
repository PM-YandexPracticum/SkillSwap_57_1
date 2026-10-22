import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RegisterPage from './index'
import {
  createEmptyRegistrationDraft,
  type RegistrationDraft,
} from '@/features/auth/lib/registrationDraft'

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  navigate: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  fileToDataUrl: vi.fn(),
  readDraft: vi.fn(),
  writeDraft: vi.fn(),
  clearDraft: vi.fn(),
}))

vi.mock('@/features/auth/lib/registrationDraft', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth/lib/registrationDraft')>()
  return {
    ...actual,
    readRegistrationDraft: mocks.readDraft,
    saveRegistrationDraft: mocks.writeDraft,
    clearRegistrationDraft: mocks.clearDraft,
  }
})
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      users: { items: [] },
      categories: {
        items: [
          {
            id: 'creative',
            name: 'Творчество',
            subcategories: [{ id: 'music', name: 'Музыка' }],
          },
        ],
      },
    }),
}))
vi.mock('@/entities/user/model/usersSlice', () => ({
  selectUsers: (state: { users: { items: unknown[] } }) => state.users.items,
  loadUsers: () => ({ type: 'users/load' }),
  addUser: (payload: unknown) => ({ type: 'users/add', payload }),
}))
vi.mock('@/entities/skill/model/skillsSlice', () => ({
  loadSkills: () => ({ type: 'skills/load' }),
  addSkill: (payload: unknown) => ({ type: 'skills/add', payload }),
}))
vi.mock('@/entities/category/model/categoriesSlice', () => ({
  selectCategories: (state: { categories: { items: unknown[] } }) => state.categories.items,
}))
vi.mock('@/features/auth/model/authSlice', () => ({
  login: (payload: string) => ({ type: 'auth/login', payload }),
}))
vi.mock('@/features/auth/lib/register', () => ({
  createRegisteredUser: mocks.create,
  saveRegistered: mocks.save,
  isEmailTaken: () => false,
}))
vi.mock('@/shared/lib/fileToDataUrl', () => ({
  fileToDataUrl: mocks.fileToDataUrl,
}))
vi.mock('@/shared/lib/constants', () => ({ ROUTES: { HOME: '/' } }))
vi.mock('@/shared/assets/illustrations/login.svg?react', () => ({
  default: () => null,
}))
vi.mock('@/shared/ui/StepProgress', () => ({ StepProgress: () => null }))
vi.mock('@/widgets/AuthPanel', () => ({
  AuthPanel: ({ children }: { children: import('react').ReactNode }) => children,
}))
vi.mock('@/widgets/RegisterStepOne', () => ({
  RegisterStepOne: ({ onNext }: { onNext: (data: unknown) => void }) => (
    <button onClick={() => onNext({ email: 'new@mail.ru', password: 'Password123' })}>Шаг 1</button>
  ),
}))
vi.mock('@/widgets/RegisterStepTwo', () => ({
  RegisterStepTwo: ({ onNext }: { onNext: (data: unknown) => void }) => (
    <button
      onClick={() =>
        onNext({
          name: 'Анна',
          birthDate: '1995-05-10',
          gender: 'female',
          cityId: 'c1',
          categoryId: 'creative',
          subcategoryId: 'music',
          avatarFile: new File(['avatar'], 'avatar.png'),
        })
      }
    >
      Шаг 2
    </button>
  ),
}))
vi.mock('@/widgets/RegisterStepThree', () => ({
  RegisterStepThree: ({
    onNext,
    initialData,
    onDraftChange,
  }: {
    onNext: (data: unknown) => void
    initialData: RegistrationDraft['skill']
    onDraftChange: (data: RegistrationDraft['skill']) => void
  }) => (
    <div>
      <input
        aria-label="Описание навыка"
        defaultValue={initialData.description || 'Мой текст'}
        onChange={(event) => onDraftChange({ ...initialData, description: event.target.value })}
      />
      <span data-testid="restored-images">
        {initialData.images.map((file) => file.name).join(', ')}
      </span>
      <button
        onClick={() =>
          onNext({
            title: 'Гитара',
            categoryId: 'creative',
            subcategoryId: 'music',
            description: 'Мой текст',
            images: [new File(['image'], 'skill.png')],
          })
        }
      >
        Шаг 3
      </button>
    </div>
  ),
}))
vi.mock('@/widgets/SkillOfferModal', () => ({
  SkillOfferModal: ({
    isOpen,
    onEdit,
    onClose,
    onConfirm,
    skillDetails,
  }: {
    isOpen: boolean
    onEdit: () => void
    onClose: () => void
    onConfirm: () => void
    skillDetails: {
      name: string
      category: string
      subcategory: string
      images: string[]
    }
  }) =>
    isOpen ? (
      <section aria-label="Предложение">
        <p>
          {skillDetails.name} / {skillDetails.category} / {skillDetails.subcategory}
        </p>
        <img src={skillDetails.images[0]} alt="Предпросмотр" />
        <button onClick={onEdit}>Редактировать</button>
        <button onClick={onClose}>Закрыть предложение</button>
        <button onClick={onConfirm}>Подтвердить</button>
      </section>
    ) : null,
}))
vi.mock('@/widgets/RegistrationSuccessModal', () => ({
  RegistrationSuccessModal: ({
    isOpen,
    onDone,
    onClose,
  }: {
    isOpen: boolean
    onDone: () => void
    onClose: () => void
  }) =>
    isOpen ? (
      <section aria-label="Успех">
        <button onClick={onDone}>Готово</button>
        <button onClick={onClose}>Закрыть успех</button>
      </section>
    ) : null,
}))

async function openOffer() {
  render(<RegisterPage />)
  fireEvent.click(await screen.findByRole('button', { name: 'Шаг 1' }))
  fireEvent.click(screen.getByRole('button', { name: 'Шаг 2' }))
  fireEvent.click(screen.getByRole('button', { name: 'Шаг 3' }))
  await screen.findByRole('region', { name: 'Предложение' })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.readDraft.mockResolvedValue(null)
  mocks.writeDraft.mockResolvedValue(undefined)
  mocks.clearDraft.mockResolvedValue(undefined)
  mocks.create.mockReturnValue({
    user: { id: 'new-user' },
    skill: { id: 'new-skill' },
  })
  mocks.save.mockImplementation(() => undefined)
  mocks.fileToDataUrl.mockResolvedValue('data:image/png;base64,AAA')
})
afterEach(cleanup)

describe('регистрация с модальными окнами', () => {
  it('шаг 3 открывает предпросмотр с названиями, но не создаёт аккаунт', async () => {
    await openOffer()
    expect(screen.getByText('Гитара / Творчество / Музыка')).toBeTruthy()
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.save).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it.each(['Редактировать', 'Закрыть предложение'])(
    '%s возвращает к заполненному шагу 3',
    async (button) => {
      await openOffer()
      const input = screen.getByRole('textbox', { name: 'Описание навыка' })
      fireEvent.change(input, { target: { value: 'Изменённый текст' } })
      await act(async () => fireEvent.click(screen.getByRole('button', { name: button })))
      expect(screen.queryByRole('region', { name: 'Предложение' })).toBeNull()
      expect(screen.getByRole('textbox', { name: 'Описание навыка' })).toBe(input)
      expect((input as HTMLInputElement).value).toBe('Изменённый текст')
      expect(mocks.create).not.toHaveBeenCalled()
    },
  )

  it.each(['Готово', 'Закрыть успех'])(
    'после подтверждения показывает успех; %s переводит на главную',
    async (button) => {
      await openOffer()
      fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))
      await screen.findByRole('region', { name: 'Успех' })
      expect(mocks.save).toHaveBeenCalledTimes(1)
      expect(mocks.dispatch).toHaveBeenCalledWith({
        type: 'auth/login',
        payload: 'new-user',
      })
      expect(mocks.navigate).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole('button', { name: button }))
      expect(mocks.navigate).toHaveBeenCalledWith('/')
    },
  )

  it('повторное подтверждение во время обработки не создаёт второй аккаунт', async () => {
    await openOffer()
    let resolveAvatar!: (url: string) => void
    mocks.fileToDataUrl.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveAvatar = resolve
        }),
    )
    const button = screen.getByRole('button', { name: 'Подтвердить' })
    fireEvent.click(button)
    fireEvent.click(button)
    await act(async () => {
      resolveAvatar('avatar-url')
    })
    await screen.findByRole('region', { name: 'Успех' })
    expect(mocks.create).toHaveBeenCalledTimes(1)
    expect(mocks.save).toHaveBeenCalledTimes(1)
  })

  it('при ошибке создания показывает сообщение и не авторизует пользователя', async () => {
    await openOffer()
    mocks.create.mockImplementation(() => {
      throw new Error('Ошибка')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))
    await screen.findByRole('alert')
    expect(screen.queryByRole('region', { name: 'Успех' })).toBeNull()
    expect(mocks.save).not.toHaveBeenCalled()
    expect(mocks.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth/login' }))
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('при ошибке подготовки изображений не открывает предложение', async () => {
    mocks.fileToDataUrl.mockRejectedValue(new Error('Ошибка чтения'))
    render(<RegisterPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Шаг 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Шаг 2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Шаг 3' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.queryByRole('region', { name: 'Предложение' })).toBeNull()
    expect(mocks.create).not.toHaveBeenCalled()
  })
})

it('не добавляет аккаунт в store и не показывает успех при ошибке сохранения', async () => {
  await openOffer()
  mocks.save.mockImplementation(() => {
    throw new Error('Нет места')
  })
  fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))
  await screen.findByRole('alert')
  expect(screen.queryByRole('region', { name: 'Успех' })).toBeNull()
  expect(mocks.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'users/add' }))
  expect(mocks.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth/login' }))
})

describe('черновик регистрации', () => {
  it('ждёт восстановления перед монтированием пустых форм', async () => {
    let resolve!: (draft: RegistrationDraft | null) => void
    mocks.readDraft.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    render(<RegisterPage />)
    expect(screen.queryByRole('button', { name: 'Шаг 1' })).toBeNull()
    expect(mocks.writeDraft).not.toHaveBeenCalled()
    await act(async () => resolve(null))
    expect(await screen.findByRole('button', { name: 'Шаг 1' })).toBeTruthy()
  })

  it('восстанавливает шаг 3, незавершённый текст и файлы после пересоздания страницы', async () => {
    const saved = createEmptyRegistrationDraft()
    saved.step = 3
    saved.account = { email: 'new@mail.ru', password: 'Password123' }
    saved.profile = {
      ...saved.profile,
      name: 'Анна',
      gender: 'female',
      avatarFile: new File(['avatar'], 'avatar.png'),
    }
    saved.skill = {
      title: 'Гитара',
      categoryId: 'creative',
      subcategoryId: 'music',
      description: 'Черновик',
      images: [new File(['image'], 'skill.png')],
    }
    mocks.readDraft.mockResolvedValue(saved)
    const first = render(<RegisterPage />)
    const input = await screen.findByRole('textbox', { name: 'Описание навыка' })
    expect((input as HTMLInputElement).value).toBe('Черновик')
    expect(screen.getByTestId('restored-images').textContent).toBe('skill.png')
    fireEvent.change(input, { target: { value: 'Изменено до нажатия Продолжить' } })
    await waitFor(() => expect(mocks.writeDraft).toHaveBeenCalled())
    const lastSaved = mocks.writeDraft.mock.lastCall?.[0]
    expect(lastSaved.profile.avatarFile.name).toBe('avatar.png')
    first.unmount()
    mocks.readDraft.mockResolvedValue(lastSaved)
    render(<RegisterPage />)
    const restored = await screen.findByRole('textbox', { name: 'Описание навыка' })
    expect((restored as HTMLInputElement).value).toBe('Изменено до нажатия Продолжить')
    expect(screen.queryByRole('button', { name: 'Шаг 1' })).toBeNull()
  })

  it('очищает черновик после сохранения аккаунта', async () => {
    await openOffer()
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))
    await screen.findByRole('region', { name: 'Успех' })
    expect(mocks.clearDraft).toHaveBeenCalledTimes(1)
  })

  it('сохраняет черновик при неудачном создании аккаунта', async () => {
    await openOffer()
    mocks.save.mockImplementation(() => {
      throw new Error('Нет места')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))
    await screen.findByRole('alert')
    expect(mocks.clearDraft).not.toHaveBeenCalled()
  })

  it('показывает ошибку сохранения и оставляет форму доступной', async () => {
    mocks.writeDraft.mockRejectedValue(new Error('Хранилище недоступно'))
    render(<RegisterPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Шаг 1' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Шаг 2' })).toBeTruthy()
  })
})
