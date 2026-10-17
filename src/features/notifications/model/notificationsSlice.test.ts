import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/store'
import type { RootState } from '@/store'
import { fetchNotifications } from '@/api/notifications'
import {
  clearReadNotifications,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  notificationsReducer,
  selectNewNotifications,
  selectNewNotificationsCount,
  selectNotifications,
  selectReadNotifications,
  type AppNotification,
} from './notificationsSlice'

vi.mock('@/api/notifications', () => ({
  fetchNotifications: vi.fn(),
}))

const u1New: AppNotification = {
  id: 'n1',
  userId: 'u1',
  text: 'Новая заявка на обмен',
  description: 'Анна хочет научиться игре на барабанах',
  createdAt: '2026-10-16T08:30:00.000Z',
  isRead: false,
}
const u1New2: AppNotification = {
  id: 'n2',
  userId: 'u1',
  text: 'Заявка принята',
  description: 'Максим принял ваш обмен',
  createdAt: '2026-10-15T14:12:00.000Z',
  isRead: false,
}
const u1Read: AppNotification = {
  id: 'n3',
  userId: 'u1',
  text: 'Обмен завершён',
  description: 'Сессия завершена',
  createdAt: '2026-10-12T19:05:00.000Z',
  isRead: true,
}
const u2New: AppNotification = {
  id: 'n4',
  userId: 'u2',
  text: 'Новая заявка на обмен',
  description: 'Иван хочет научиться английскому',
  createdAt: '2026-10-16T09:15:00.000Z',
  isRead: false,
}
const u2Read: AppNotification = {
  id: 'n5',
  userId: 'u2',
  text: 'Заявка отклонена',
  description: 'Дарья отклонила ваш обмен',
  createdAt: '2026-10-14T11:40:00.000Z',
  isRead: true,
}

const items = [u1New, u1New2, u1Read, u2New, u2Read]

describe('notificationsReducer', () => {
  it('начальное состояние пустое', () => {
    const state = notificationsReducer(undefined, { type: 'unknown' })
    expect(state).toEqual({ items: [], status: 'idle', error: null })
  })

  it('markNotificationsRead помечает только переданные уведомления указанного пользователя', () => {
    const state = notificationsReducer(
      { items, status: 'succeeded', error: null },
      markNotificationsRead({ userId: 'u1', ids: ['n1'] }),
    )

    expect(state.items.find((n) => n.id === 'n1')?.isRead).toBe(true)
    // не переданное уведомление того же пользователя остаётся новым
    expect(state.items.find((n) => n.id === 'n2')?.isRead).toBe(false)
    // чужое уведомление не затронуто
    expect(state.items.find((n) => n.id === 'n4')?.isRead).toBe(false)
  })

  it('markNotificationsRead не трогает уведомления другого пользователя с совпадающими id', () => {
    const state = notificationsReducer(
      { items, status: 'succeeded', error: null },
      markNotificationsRead({ userId: 'u1', ids: ['n4'] }),
    )
    expect(state.items.find((n) => n.id === 'n4')?.isRead).toBe(false)
  })

  it('markAllNotificationsRead помечает все уведомления только указанного пользователя', () => {
    const state = notificationsReducer(
      { items, status: 'succeeded', error: null },
      markAllNotificationsRead({ userId: 'u1' }),
    )

    const u1 = state.items.filter((n) => n.userId === 'u1')
    const u2 = state.items.filter((n) => n.userId === 'u2')
    expect(u1.every((n) => n.isRead)).toBe(true)
    expect(u2.find((n) => n.id === 'n4')?.isRead).toBe(false)
  })

  it('clearReadNotifications удаляет только просмотренные уведомления пользователя', () => {
    const state = notificationsReducer(
      { items, status: 'succeeded', error: null },
      clearReadNotifications({ userId: 'u1' }),
    )

    const u1Ids = state.items.filter((n) => n.userId === 'u1').map((n) => n.id)
    expect(u1Ids).toEqual(['n1', 'n2']) // n3 (прочитанное) удалено, новые остались
    // уведомления u2 не затронуты
    expect(state.items.filter((n) => n.userId === 'u2')).toHaveLength(2)
  })
})

const makeState = (list: AppNotification[]): RootState => {
  const base = createAppStore().getState()
  return {
    ...base,
    notifications: { items: list, status: 'succeeded', error: null },
  }
}

describe('notifications selectors', () => {
  const state = makeState(items)

  it('selectNotifications возвращает все уведомления', () => {
    expect(selectNotifications(state)).toHaveLength(5)
  })

  it('selectNewNotifications возвращает только новые уведомления указанного пользователя', () => {
    expect(selectNewNotifications(state, 'u1').map((n) => n.id)).toEqual(['n1', 'n2'])
    expect(selectNewNotifications(state, 'u2').map((n) => n.id)).toEqual(['n4'])
  })

  it('selectReadNotifications возвращает только просмотренные указанного пользователя', () => {
    expect(selectReadNotifications(state, 'u1').map((n) => n.id)).toEqual(['n3'])
    expect(selectReadNotifications(state, 'u2').map((n) => n.id)).toEqual(['n5'])
  })

  it('selectNewNotificationsCount считает новые уведомления указанного пользователя', () => {
    expect(selectNewNotificationsCount(state, 'u1')).toBe(2)
    expect(selectNewNotificationsCount(state, 'u2')).toBe(1)
    expect(selectNewNotificationsCount(state, 'u3')).toBe(0)
  })

  it('уведомления одного пользователя не попадают в выборку другого', () => {
    const u1Ids = new Set(selectNewNotifications(state, 'u1').map((n) => n.id))
    const u2Ids = selectNewNotifications(state, 'u2').map((n) => n.id)
    u2Ids.forEach((id) => expect(u1Ids.has(id)).toBe(false))
  })
})

describe('loadNotifications — повторная загрузка после ошибки', () => {
  const mockedFetch = vi.mocked(fetchNotifications)

  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it('первый dispatch из idle запускает запрос', async () => {
    mockedFetch.mockResolvedValueOnce([u1New])
    const store = createAppStore()

    await store.dispatch(loadNotifications())

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(store.getState().notifications.status).toBe('succeeded')
  })

  it('повторный dispatch из succeeded не запускает запрос заново', async () => {
    mockedFetch.mockResolvedValueOnce([u1New])
    const store = createAppStore()

    await store.dispatch(loadNotifications())
    await store.dispatch(loadNotifications())

    expect(mockedFetch).toHaveBeenCalledTimes(1)
  })

  it('повторный dispatch из failed запускает запрос заново', async () => {
    // первая попытка падает
    mockedFetch.mockRejectedValueOnce(new Error('Сеть недоступна'))
    // вторая — успешна
    mockedFetch.mockResolvedValueOnce([u1New, u1New2])

    const store = createAppStore()

    await store.dispatch(loadNotifications())
    expect(store.getState().notifications.status).toBe('failed')
    expect(mockedFetch).toHaveBeenCalledTimes(1)

    // ключевая проверка: после ошибки retry разрешён
    await store.dispatch(loadNotifications())

    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(store.getState().notifications.status).toBe('succeeded')
    expect(store.getState().notifications.items).toHaveLength(2)
    expect(store.getState().notifications.error).toBeNull()
  })

  it('повторный dispatch во время loading не запускает второй запрос', async () => {
    let resolveFetch: (value: AppNotification[]) => void = () => {}
    mockedFetch.mockImplementationOnce(
      () =>
        new Promise<AppNotification[]>((resolve) => {
          resolveFetch = resolve
        }),
    )

    const store = createAppStore()

    const first = store.dispatch(loadNotifications())
    // пока первый запрос ещё не завершён — статус loading
    expect(store.getState().notifications.status).toBe('loading')

    await store.dispatch(loadNotifications())
    expect(mockedFetch).toHaveBeenCalledTimes(1)

    resolveFetch([u1New])
    await first
  })
})
