import { vi } from 'vitest'

vi.mock('@/shared/ui/AvatarUpload', () => ({
  AvatarUpload: ({
    src,
    onChange,
  }: {
    src: string | null
    onChange: (file: File | null) => void
  }) => (
    <>
      <label>
        Аватар
        <input
          type="file"
          aria-label="Аватар"
          onChange={(event) => onChange(event.currentTarget.files?.[0] ?? null)}
        />
      </label>
      {src && <img src={src} alt="Предпросмотр аватара" />}
    </>
  ),
}))

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { RegisterStepTwo, type RegisterStepTwoDraft } from './RegisterStepTwo'

const dispatch = vi.fn()
const state = {
  categories: {
    items: [
      {
        id: 'creative',
        name: 'Творчество',
        subcategories: [{ id: 'music', name: 'Музыка', categoryId: 'creative' }],
      },
    ],
    error: null,
  },
  cities: { items: [{ id: 'c1', name: 'Москва' }], error: null },
}
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (value: unknown) => unknown) => selector(state),
}))

beforeEach(() => {
  const NativeURL = globalThis.URL
  vi.stubGlobal(
    'URL',
    class extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:restored-avatar')
      static revokeObjectURL = vi.fn()
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const restoredProfile = (): RegisterStepTwoDraft => ({
  name: 'Анна',
  birthDate: '1995-05-10',
  gender: 'female',
  cityId: 'c1',
  categoryId: 'creative',
  subcategoryId: 'music',
  avatarFile: new File(['avatar'], 'avatar.png', { type: 'image/png' }),
})

describe('черновик второго шага', () => {
  it('восстанавливает профиль, выбранные значения и предпросмотр аватара', () => {
    const onNext = vi.fn()
    render(<RegisterStepTwo initialData={restoredProfile()} onBack={vi.fn()} onNext={onNext} />)
    expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('Анна')
    expect(screen.getByText('Женский')).toBeTruthy()
    expect(screen.getByText('Москва')).toBeTruthy()
    expect(screen.getByText('Музыка')).toBeTruthy()
    expect(screen.getByAltText('Предпросмотр аватара').getAttribute('src')).toBe(
      'blob:restored-avatar',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Анна',
        subcategoryId: 'music',
        avatarFile: expect.any(File),
      }),
    )
  })
  it('сохраняет частичное изменение имени, сохраняя остальные поля и аватар', () => {
    const onDraftChange = vi.fn()
    render(
      <RegisterStepTwo
        initialData={restoredProfile()}
        onDraftChange={onDraftChange}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Новое имя' } })
    expect(onDraftChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: 'Новое имя',
        categoryId: 'creative',
        avatarFile: expect.any(File),
      }),
    )
  })
})
