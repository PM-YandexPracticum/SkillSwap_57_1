import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { getAuthUserId } from './authUtils'
import { RootState } from '@/store'

interface AuthState {
  userId: string | null
  error: string | null
  isAuthModalOpen: boolean
}

const initialState: AuthState = {
  userId: getAuthUserId(),
  error: null,
  isAuthModalOpen: false
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
    openAuthModal(state) {
      state.isAuthModalOpen = true
    },
    closeAuthModal(state) {
      state.isAuthModalOpen = false
    }
  },
})

export const authReducer = authSlice.reducer
export const { login, logout, closeAuthModal, openAuthModal } = authSlice.actions

export const selectAuthUserId = (state: RootState) => state.auth.userId
export const selectAuthError = (state: RootState) => state.auth.error
export const selectIsAuthModalOpen = (state: RootState) => state.auth.isAuthModalOpen
export default authSlice.reducer
