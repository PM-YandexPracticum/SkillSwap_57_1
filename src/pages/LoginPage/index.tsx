import { useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '@/widgets/LoginForm'
import { AuthPanel } from '@/widgets/AuthPanel'
import LampImg from '@/shared/assets/illustrations/login.svg?react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/shared/lib/constants'
import { findUserIdByCredentials } from '@/shared/lib/findUserIdByCredentials'
import { selectUsers } from '@/entities/user/model/usersSlice'
import { login, selectAuthError } from '@/features/auth/model/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const users = useAppSelector(selectUsers)
  const authError = useAppSelector(selectAuthError)
  const location = useLocation()
  const from = location.state?.from?.pathname ?? ROUTES.HOME

  const handleSubmit = (data: { email: string; password: string }) => {
    const userId = findUserIdByCredentials(users, data)
    dispatch(login(userId))
    if (userId) {
      navigate(from, {replace: true})
    }
  }

  return (
    <main>
      <AuthPanel
        illustration={<LampImg />}
        title={'Добро пожаловать в SkillSwap!'}
        text={'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми'}
      >
        <LoginForm onSubmit={handleSubmit} passwordError={authError ?? undefined} />
      </AuthPanel>
    </main>
  )
}
