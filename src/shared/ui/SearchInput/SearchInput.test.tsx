import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from './SearchInput'

function renderSearchInput(props?: Partial<Parameters<typeof SearchInput>[0]>) {
  const defaults = {
    value: '',
    onChange: vi.fn(),
    onClear: vi.fn(),
    placeholder: 'Искать навык',
  }

  return render(<SearchInput {...defaults} {...props} />)
}

describe('SearchInput', () => {
  it('рендерит поле с плейсхолдером и иконкой поиска', () => {
    renderSearchInput()

    expect(screen.getByPlaceholderText('Искать навык')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('передаёт введённый текст через onChange', () => {
    const onChange = vi.fn()
    renderSearchInput({ onChange })

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'фото' } })

    expect(onChange).toHaveBeenCalledWith('фото')
  })

  it('не показывает крестик при пустом значении', () => {
    renderSearchInput({ value: '' })

    expect(screen.queryByRole('button', { name: 'Очистить поиск' })).not.toBeInTheDocument()
  })

  it('показывает крестик, когда значение не пустое', () => {
    renderSearchInput({ value: 'дизайн' })

    expect(screen.getByRole('button', { name: 'Очистить поиск' })).toBeInTheDocument()
  })

  it('при нажатии на крестик вызывает onClear и сохраняет фокус в поле', async () => {
    const onClear = vi.fn()
    renderSearchInput({ value: 'дизайн', onClear })

    const input = screen.getByRole('textbox')
    input.focus()

    await userEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(input)
  })
})
