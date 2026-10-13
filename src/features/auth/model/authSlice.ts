import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { getAuthUserId } from './authUtils'
import { RootState } from '@/store'

interface AuthState {
  userId: string | null
  error: string | null
}

const initialState: AuthState = {
  userId: getAuthUserId(),
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<string | null>) {
      state.error = null
      if (!action.payload) {
        state.error =
          'Email или пароль введён неверно. Пожалуйста проверьте правильность введённых данных'
        return
      }
      state.userId = action.payload
    },
    logout(state) {
      state.userId = null
      state.error = null
    },
  },
})

export const authReducer = authSlice.reducer
export const { login, logout } = authSlice.actions

export const selectAuthUserId = (state: RootState) => state.auth.userId
export const selectAuthError = (state: RootState) => state.auth.error
