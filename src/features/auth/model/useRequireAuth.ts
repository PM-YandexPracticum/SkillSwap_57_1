import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { openAuthModal, selectAuthUserId } from './authSlice'

type AuthAction = () => void

export const useRequireAuth = () => {
  const userId = useAppSelector(selectAuthUserId)
  const dispatch = useAppDispatch()

  return (action: AuthAction) => {
    if (userId) {
      action()
    } else {
      dispatch(openAuthModal())
    }
  }
}

