import { describe, expect, it } from 'vitest'
import reducer, { closeAuthModal, openAuthModal } from '@/features/auth/model/authSlice.ts'
import { getAuthUserId } from '@/features/auth/model/authUtils.ts'

describe('authSliceReducers', () => {
  it('открывает модалку', () => {
    const initialState = {
      userId: getAuthUserId(),
      error: null,
      isAuthModalOpen: false,
    }
    const result = reducer(initialState, openAuthModal())

    expect(result.isAuthModalOpen).toBe(true)
  })

  it('закрывает модалку', () => {
    const initialState = {
      userId: getAuthUserId(),
      error: null,
      isAuthModalOpen: true,
    }
    const result = reducer(initialState, closeAuthModal())

    expect(result.isAuthModalOpen).toBe(false)
  })
})
