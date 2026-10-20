import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { fetchUsers } from '@/api/users'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { readList } from '@/shared/lib/storage'
import type { LoadingStatus } from '@/store/types'
import type { RootState } from '@/store'
import type { User } from './types'

export type UsersState = {
  items: User[]
  status: LoadingStatus
  error: string | null
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
}

/**
 * Загружает пользователей один раз.
 *
 * Логика слияния моков и localStorage:
 *  - если id мок-пользователя уже есть в REGISTERED_USERS (например, его отредактировали
 *    на странице профиля), берём сохранённую версию, а мок-версию отбрасываем;
 *  - это гарантирует, что после перезагрузки страницы изменения из localStorage
 *    перекрывают исходные данные из public/db/users.json.
 */
export const loadUsers = createAsyncThunk<User[], void, { state: RootState }>(
  'users/loadUsers',
  async () => {
    const baseUsers = await fetchUsers()
    const registeredUsers = readList<User>(LOCAL_STORAGE_KEYS.REGISTERED_USERS)
    const registeredIds = new Set(registeredUsers.map((user) => user.id))
    const visibleBaseUsers = baseUsers.filter((user) => !registeredIds.has(user.id))
    return [...visibleBaseUsers, ...registeredUsers]
  },
  {
    condition: (_arg, { getState }) => getState().users.status === 'idle',
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<User>) {
      state.items.push(action.payload)
    },
    /**
     * Обновляет существующего пользователя по id, сохраняя остальные поля.
     * Никаких новых записей не создаёт.
     */
    updateUser(state, action: PayloadAction<User>) {
      const index = state.items.findIndex((user) => user.id === action.payload.id)
      if (index >= 0) {
        state.items[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось загрузить пользователей'
      })
  },
})

export const usersReducer = usersSlice.reducer
export const { addUser, updateUser } = usersSlice.actions

export const selectUsers = (state: RootState) => state.users.items
export const selectUsersStatus = (state: RootState) => state.users.status
export const selectUsersError = (state: RootState) => state.users.error
export const selectCurrentUser = (state: RootState): User | undefined => {
  const userId = state.auth.userId
  if (!userId) return undefined
  return state.users.items.find((user) => user.id === userId)
}
