import { useAppSelector } from '@/store/hooks.ts'
import { selectAuthUserId } from '@/features/auth/model/authSlice.ts'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants.ts'




export const RequireAuth = () => {

  const userId = useAppSelector(selectAuthUserId)
  const location = useLocation()

  if (!userId) {
   return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet/>

}
