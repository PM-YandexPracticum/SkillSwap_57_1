import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/store'
import { RegisterStepTwo } from './RegisterStepTwo'

const categories = [
  {
    id: 'business',
    name: 'Бизнес и карьера',
    subcategories: [{ id: 'marketing', name: 'Маркетинг', categoryId: 'business' }],
  },
  {
    id: 'creative',
    name: 'Творчество и искусство',
    subcategories: [{ id: 'drawing', name: 'Рисование', categoryId: 'creative' }],
  },
]

function setup() {
  const store = createAppStore()
  store.dispatch({ type: 'categories/loadCategories/fulfilled', payload: categories })
  store.dispatch({
    type: 'cities/loadCities/fulfilled',
    payload: [{ id: 'moscow', name: 'Москва' }],
  })
  const onNext = vi.fn()
  const onBack = vi.fn()
  const result = render(
    <Provider store={store}>
      <RegisterStepTwo onNext={onNext} onBack={onBack} />
    </Provider>,
  )
  return { ...result, onNext, onBack, user: userEvent.setup() }
}

function selectButton(label: string) {
  const parent = screen.getByText(label).parentElement
  if (!parent) throw new Error(`Не найден контейнер: ${label}`)
  return within(parent).getByRole('button')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('RegisterStepTwo', () => {
  it('отключает подкатегорию до выбора категории и сбрасывает её при смене', async () => {
    const { user, onNext } = setup()
    const label = 'Подкатегория навыка, которому хотите научиться'
    expect(selectButton(label)).toBeDisabled()
    await user.click(selectButton('Категория навыка, которому хотите научиться'))
    await user.click(screen.getByRole('option', { name: 'Бизнес и карьера' }))
    expect(selectButton(label)).toBeEnabled()
    await user.click(selectButton(label))
    await user.click(screen.getByRole('option', { name: 'Маркетинг' }))
    await user.click(selectButton('Категория навыка, которому хотите научиться'))
    await user.click(screen.getByRole('option', { name: 'Творчество и искусство' }))
    expect(selectButton(label)).toHaveTextContent('Выберите подкатегорию')
    await user.click(selectButton(label))
    expect(screen.queryByRole('option', { name: 'Маркетинг' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'Рисование' }))
    await user.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'creative', subcategoryId: 'drawing' }),
    )
  })

  it('передаёт имя, значения справочников и null вместо отсутствующего аватара', async () => {
    const { user, onNext } = setup()
    await user.type(screen.getByLabelText('Имя'), 'Мария')
    await user.click(selectButton('Пол'))
    await user.click(screen.getByRole('option', { name: 'Женский' }))
    await user.click(selectButton('Город'))
    await user.click(screen.getByRole('option', { name: 'Москва' }))
    await user.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onNext).toHaveBeenCalledWith({
      name: 'Мария',
      birthDate: '',
      gender: 'female',
      cityId: 'moscow',
      categoryId: '',
      subcategoryId: '',
      avatarFile: null,
    })
  })

  it('получает дату из готового DatePicker в формате YYYY-MM-DD', async () => {
    vi.setSystemTime(new Date(2026, 9, 13))
    const { user, onNext } = setup()
    await user.click(screen.getByText('ДД.ММ.ГГГГ'))
    const firstDay = screen.getAllByRole('button').find((button) => button.textContent === '1')
    if (!firstDay) throw new Error('День календаря не найден')
    await user.click(firstDay)
    await user.click(screen.getByRole('button', { name: 'Выбрать' }))
    await user.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ birthDate: '2026-10-01' }))
  })

  it('вызывает только onBack при нажатии Назад', async () => {
    const { user, onBack, onNext } = setup()
    await user.click(screen.getByRole('button', { name: 'Назад' }))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onNext).not.toHaveBeenCalled()
  })

  it('показывает предпросмотр, передаёт File и освобождает временные адреса', async () => {
    const createObjectURL = vi
      .fn()
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', Object.assign(class extends URL {}, { createObjectURL, revokeObjectURL }))
    const { container, user, onNext, unmount } = setup()
    const input = container.querySelector('input[type="file"]')
    if (!input) throw new Error('Поле загрузки не найдено')
    const first = new File(['first'], 'first.png', { type: 'image/png' })
    const second = new File(['second'], 'second.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [first] } })
    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:first')
    fireEvent.change(input, { target: { files: [second] } })
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first')
    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:second')
    await user.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ avatarFile: second }))
    unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second')
  })
})
