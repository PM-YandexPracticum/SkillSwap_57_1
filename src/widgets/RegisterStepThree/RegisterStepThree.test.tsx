import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RegisterStepThree, type RegisterStepThreeData } from './RegisterStepThree'

vi.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      categories: {
        items: [
          { id: 'creative', name: 'Творчество', subcategories: [{ id: 'music', name: 'Музыка' }] },
          { id: 'home', name: 'Дом', subcategories: [{ id: 'cooking', name: 'Кулинария' }] },
        ],
      },
    }),
}))
vi.mock('@/widgets/AuthPanel', () => ({
  AuthPanel: ({ children }: { children: import('react').ReactNode }) => children,
}))
vi.mock('@/shared/ui/Select', () => ({
  Select: ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
  }) => (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Выберите</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}))

afterEach(cleanup)
const initialData = (): RegisterStepThreeData => ({
  title: 'Гитара',
  categoryId: 'creative',
  subcategoryId: 'music',
  description: 'Учу играть',
  images: [new File(['image'], 'skill.png', { type: 'image/png' })],
})

describe('черновик третьего шага', () => {
  it('не сбрасывает восстановленную подкатегорию при монтировании', () => {
    const onNext = vi.fn()
    render(<RegisterStepThree initialData={initialData()} onBack={vi.fn()} onNext={onNext} />)
    expect((screen.getByLabelText('Подкатегория навыка') as HTMLSelectElement).value).toBe('music')
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ subcategoryId: 'music', images: [expect.any(File)] }),
    )
  })

  it('сбрасывает подкатегорию при выборе другой категории', () => {
    const onDraftChange = vi.fn()
    render(
      <RegisterStepThree
        initialData={initialData()}
        onDraftChange={onDraftChange}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Категория навыка'), { target: { value: 'home' } })
    expect(onDraftChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryId: 'home', subcategoryId: '' }),
    )
  })

  it('передаёт изменения и удаление восстановленного файла без нажатия Продолжить', () => {
    const onDraftChange = vi.fn()
    render(
      <RegisterStepThree
        initialData={initialData()}
        onDraftChange={onDraftChange}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Описание'), {
      target: { value: 'Незавершённый текст' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Удалить изображение skill.png' }))
    expect(onDraftChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ description: 'Незавершённый текст', images: [] }),
    )
  })
})
