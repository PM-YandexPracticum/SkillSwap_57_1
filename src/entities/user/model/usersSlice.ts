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
 * Загружает пользователей один раз: повторный dispatch при уже начатой загрузке пропускается.
 * К моковым пользователям добавляются зарегистрированные (из localStorage).
 */
export const loadUsers = createAsyncThunk<User[], void, { state: RootState }>(
  'users/loadUsers',
  async () => [...(await fetchUsers()), ...readList<User>(LOCAL_STORAGE_KEYS.REGISTERED_USERS)],
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
export const { addUser } = usersSlice.actions

export const selectUsers = (state: RootState) => state.users.items
export const selectUsersStatus = (state: RootState) => state.users.status
export const selectUsersError = (state: RootState) => state.users.error
export const selectCurrentUser = (state: RootState): User | undefined => {
  const userId = state.auth.userId
  if (!userId) return undefined
  return state.users.items.find((user) => user.id === userId)
}
