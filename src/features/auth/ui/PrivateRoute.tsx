import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectAuthUserId } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/shared/lib/constants'

/** Пропускает на вложенные маршруты только авторизованного пользователя */
export const PrivateRoute = () => {
  const userId = useAppSelector(selectAuthUserId)
  const location = useLocation()

  if (!userId) {
    // state.from читает LoginPage — после входа вернёт на исходный URL (AC #175)
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}
