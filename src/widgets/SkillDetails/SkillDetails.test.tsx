import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const carousel = vi.hoisted(() => {
  let selected = 0
  const listeners = new Map<string, Set<() => void>>()
  const emit = (event: string) => listeners.get(event)?.forEach((listener) => listener())
  const api = {
    selectedScrollSnap: () => selected,
    on: vi.fn((event: string, listener: () => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(listener)
    }),
    off: vi.fn((event: string, listener: () => void) => listeners.get(event)?.delete(listener)),
    reInit: vi.fn(() => {
      selected = 0
      emit('reInit')
    }),
    scrollTo: vi.fn((index: number) => {
      selected = index
      emit('select')
    }),
    scrollNext: vi.fn(() => {
      selected = (selected + 1) % 6
      emit('select')
    }),
    scrollPrev: vi.fn(() => {
      selected = (selected + 5) % 6
      emit('select')
    }),
  }
  return {
    api,
    ref: vi.fn(),
    selectFromDrag: (index: number) => {
      selected = index
      emit('select')
    },
    reset: () => {
      selected = 0
      listeners.clear()
    },
  }
})
vi.mock('embla-carousel-react', () => ({ default: () => [carousel.ref, carousel.api] }))
import { SkillDetails } from './SkillDetails'

const props = {
  title: 'Фото',
  categoryName: 'Творчество',
  subcategoryName: 'Фотография',
  description: 'Описание',
  images: ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg', '/5.jpg', '/6.jpg'],
}
beforeEach(() => {
  carousel.reset()
  vi.clearAllMocks()
})
afterEach(cleanup)

describe('SkillDetails — управление через Embla', () => {
  it('стрелки вызывают API, событие select обновляет оформление', () => {
    render(<SkillDetails {...props} showGalleryControls />)
    fireEvent.click(screen.getByRole('button', { name: 'Следующее изображение' }))
    expect(carousel.api.scrollNext).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Показать изображение 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Предыдущее изображение' }))
    expect(carousel.api.scrollPrev).toHaveBeenCalledOnce()
  })
  it('миниатюры выбирают правильные индексы, под +3 находится последняя картинка', () => {
    render(<SkillDetails {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Показать изображение 3' }))
    expect(carousel.api.scrollTo).toHaveBeenLastCalledWith(2)
    const badge = screen.getByRole('button', {
      name: 'Показать последнее изображение. Ещё изображений: 3',
    })
    expect(badge.querySelector('img')).toHaveAttribute('src', '/6.jpg')
    expect(badge).toHaveTextContent('+3')
    fireEvent.click(badge)
    expect(carousel.api.scrollTo).toHaveBeenLastCalledWith(5)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
  it('после свайпа событие Embla обновляет выбранную миниатюру', () => {
    render(<SkillDetails {...props} />)
    act(() => carousel.selectFromDrag(1))
    expect(screen.getByRole('button', { name: 'Показать изображение 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('новый массив с теми же URL не сбрасывает слайд; другой набор сбрасывает', () => {
    const { rerender } = render(<SkillDetails {...props} />)
    act(() => carousel.selectFromDrag(2))
    carousel.api.reInit.mockClear()
    rerender(<SkillDetails {...props} images={[...props.images]} />)
    expect(carousel.api.reInit).not.toHaveBeenCalled()
    rerender(<SkillDetails {...props} images={['/other.jpg']} />)
    expect(carousel.api.reInit).toHaveBeenCalledWith({ startIndex: 0 })
  })
  it('скрывает стрелки по умолчанию и при одной картинке, показывает заглушку без картинок', () => {
    const { rerender } = render(<SkillDetails {...props} />)
    expect(screen.queryByRole('button', { name: 'Следующее изображение' })).not.toBeInTheDocument()
    rerender(<SkillDetails {...props} images={['/1.jpg']} showGalleryControls />)
    expect(screen.queryByRole('button', { name: 'Следующее изображение' })).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    rerender(<SkillDetails {...props} images={[]} />)
    expect(screen.getByAltText('Нет изображения')).toHaveAttribute(
      'src',
      '/images/skills/placeholder.jpg',
    )
  })
  it('передаёт actions и удаляет подписки при размонтировании', () => {
    const { unmount } = render(<SkillDetails {...props} actions={<button>Готово</button>} />)
    expect(screen.getByRole('button', { name: 'Готово' })).toBeInTheDocument()
    unmount()
    expect(carousel.api.off).toHaveBeenCalledWith('select', expect.any(Function))
    expect(carousel.api.off).toHaveBeenCalledWith('reInit', expect.any(Function))
  })
})
