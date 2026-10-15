import { Navigate, Outlet } from 'react-router-dom'
import { selectAuthUserId } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/shared/lib/constants'

/** Пропускает на вложенные маршруты только авторизованного пользователя */
export const PrivateRoute = () => {
  const userId = useAppSelector(selectAuthUserId)

  if (!userId) return <Navigate to={ROUTES.LOGIN} replace />

  return <Outlet />
}
