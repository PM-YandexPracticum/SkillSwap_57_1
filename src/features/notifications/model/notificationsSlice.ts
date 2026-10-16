import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { fetchNotifications } from '@/api/notifications'
import type { LoadingStatus } from '@/store/types'
import type { RootState } from '@/store'
import type { AppNotification } from '@/shared/types'

// Реэкспорт типа — чтобы потребители могли импортировать его из фичи
export type { AppNotification }

export type NotificationsState = {
  items: AppNotification[]
  status: LoadingStatus
  error: string | null
}

const initialState: NotificationsState = {
  items: [],
  status: 'idle',
  error: null,
}

/**
 * Загружает моковые уведомления.
 *
 * Повторный dispatch разрешён из статусов `idle` и `failed`:
 * - `idle` — первая загрузка;
 * - `failed` — повторная попытка после сетевой ошибки (кнопка «Повторить»).
 *
 * Из `loading` и `succeeded` повторный dispatch пропускается.
 */
export const loadNotifications = createAsyncThunk<AppNotification[], void, { state: RootState }>(
  'notifications/loadNotifications',
  async () => fetchNotifications(),
  {
    condition: (_arg, { getState }) => {
      const status = getState().notifications.status
      return status === 'idle' || status === 'failed'
    },
  },
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /** Помечает переданные уведомления пользователя просмотренными */
    markNotificationsRead(
      state,
      action: PayloadAction<{ userId: string; ids: string[] }>,
    ) {
      const { userId, ids } = action.payload
      const target = new Set(ids)
      state.items.forEach((item) => {
        if (item.userId === userId && target.has(item.id)) {
          item.isRead = true
        }
      })
    },
    /** Помечает все новые уведомления пользователя просмотренными */
    markAllNotificationsRead(state, action: PayloadAction<{ userId: string }>) {
      const { userId } = action.payload
      state.items.forEach((item) => {
        if (item.userId === userId) {
          item.isRead = true
        }
      })
    },
    /** Удаляет только просмотренные уведомления указанного пользователя */
    clearReadNotifications(state, action: PayloadAction<{ userId: string }>) {
      const { userId } = action.payload
      state.items = state.items.filter((item) => item.userId !== userId || !item.isRead)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось загрузить уведомления'
      })
  },
})

export const notificationsReducer = notificationsSlice.reducer
export const { markNotificationsRead, markAllNotificationsRead, clearReadNotifications } =
  notificationsSlice.actions

// ─── Селекторы ────────────────────────────────────────────

export const selectNotifications = (state: RootState) => state.notifications.items

const selectUserNotifications = (state: RootState, userId: string) =>
  state.notifications.items.filter((item) => item.userId === userId)

/** Новые (непросмотренные) уведомления указанного пользователя */
export const selectNewNotifications = (state: RootState, userId: string) =>
  selectUserNotifications(state, userId).filter((item) => !item.isRead)

/** Просмотренные уведомления указанного пользователя */
export const selectReadNotifications = (state: RootState, userId: string) =>
  selectUserNotifications(state, userId).filter((item) => item.isRead)

/** Количество новых уведомлений указанного пользователя */
export const selectNewNotificationsCount = (state: RootState, userId: string): number =>
  selectNewNotifications(state, userId).length
