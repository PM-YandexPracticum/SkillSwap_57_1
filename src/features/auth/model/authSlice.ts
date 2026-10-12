import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { clearAuthUserId, getAuthUserId, saveAuthUserId } from './authUtils'

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
      saveAuthUserId(action.payload)
    },
    logout(state) {
      state.userId = null
      state.error = null
      clearAuthUserId()
    },
    clearAuthError(state) {state.error = null},
  },
})

export const authReducer = authSlice.reducer
export const { login, logout, clearAuthError } = authSlice.actions
