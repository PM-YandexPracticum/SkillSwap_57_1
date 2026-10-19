import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppNotification } from '@/shared/types'
import { NotificationsPanel } from './NotificationsPanel'

const localIso = (day: number, hour = 12) => new Date(2026, 9, day, hour, 0).toISOString()

const newNotifications: AppNotification[] = [
  {
    id: 'n1',
    userId: 'u1',
    text: 'Новая заявка на обмен',
    description: 'Анна хочет научиться игре на барабанах',
    createdAt: localIso(16, 8),
    isRead: false,
  },
  {
    id: 'n2',
    userId: 'u1',
    text: 'Заявка принята',
    description: 'Максим принял ваш обмен по английскому языку',
    createdAt: localIso(15),
    isRead: false,
  },
]

const readNotifications: AppNotification[] = [
  {
    id: 'n3',
    userId: 'u1',
    text: 'Обмен завершён',
    description: 'Сессия с Илоной по игре на барабанах завершена',
    createdAt: localIso(12),
    isRead: true,
  },
]

const renderPanel = (props: Partial<React.ComponentProps<typeof NotificationsPanel>> = {}) => {
  const handlers = { onReadAll: vi.fn(), onClearRead: vi.fn(), onNavigate: vi.fn() }
  render(
    <NotificationsPanel
      newNotifications={newNotifications}
      readNotifications={readNotifications}
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

describe('NotificationsPanel', () => {
  // подменяем только Date, чтобы userEvent и таймеры работали как обычно
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 16, 15, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('показывает оба раздела и уведомления из пропсов', () => {
    renderPanel()

    const newSection = screen.getByRole('region', { name: 'Новые уведомления' })
    const readSection = screen.getByRole('region', { name: 'Просмотренные' })

    expect(within(newSection).getByText('Новая заявка на обмен')).toBeInTheDocument()
    expect(
      within(newSection).getByText('Анна хочет научиться игре на барабанах'),
    ).toBeInTheDocument()
    expect(within(newSection).getByText('Заявка принята')).toBeInTheDocument()
    expect(within(readSection).getByText('Обмен завершён')).toBeInTheDocument()
    expect(
      within(readSection).getByText('Сессия с Илоной по игре на барабанах завершена'),
    ).toBeInTheDocument()
  })

  it('показывает даты: «сегодня», «вчера» и число с месяцем', () => {
    renderPanel()

    expect(screen.getByText('сегодня')).toBeInTheDocument()
    expect(screen.getByText('вчера')).toBeInTheDocument()
    expect(screen.getByText('12 октября')).toBeInTheDocument()
  })

  it('кнопка «Перейти» есть только у новых уведомлений и передаёт id', async () => {
    const { onNavigate } = renderPanel()

    const buttons = screen.getAllByRole('button', { name: 'Перейти' })
    expect(buttons).toHaveLength(newNotifications.length)

    const readSection = screen.getByRole('region', { name: 'Просмотренные' })
    expect(within(readSection).queryByRole('button', { name: 'Перейти' })).not.toBeInTheDocument()

    await userEvent.click(buttons[1])
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith('n2')
  })

  it('«Прочитать все» и «Очистить» вызывают свои обработчики', async () => {
    const { onReadAll, onClearRead } = renderPanel()

    await userEvent.click(screen.getByRole('button', { name: 'Прочитать все' }))
    expect(onReadAll).toHaveBeenCalledTimes(1)
    expect(onClearRead).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Очистить' }))
    expect(onClearRead).toHaveBeenCalledTimes(1)
    expect(onReadAll).toHaveBeenCalledTimes(1)
  })

  it('для пустого списка новых показывает сообщение и скрывает «Прочитать все»', () => {
    renderPanel({ newNotifications: [] })

    expect(screen.getByText('Новых уведомлений нет')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Прочитать все' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Перейти' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Очистить' })).toBeInTheDocument()
  })

  it('для пустого списка просмотренных показывает сообщение и скрывает «Очистить»', () => {
    renderPanel({ readNotifications: [] })

    expect(screen.getByText('Просмотренных уведомлений нет')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Прочитать все' })).toBeInTheDocument()
  })

  it('когда оба списка пусты, показывает оба сообщения и ни одной кнопки', () => {
    renderPanel({ newNotifications: [], readNotifications: [] })

    expect(screen.getByText('Новых уведомлений нет')).toBeInTheDocument()
    expect(screen.getByText('Просмотренных уведомлений нет')).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
