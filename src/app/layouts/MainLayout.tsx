import { Suspense } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Header } from '@/widgets/Header'
import { Footer } from '@/widgets/Footer'
import { CategoryList } from '@/widgets/CategoryList'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import styles from './Layout.module.css'
import { selectCurrentUser } from '@/entities/user/model/usersSlice'
import { logout } from '@/features/auth/model/authSlice'
import { ROUTES } from '@/shared/lib/constants'

export const MainLayout = () => {
  const categories = useAppSelector(selectCategories)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(logout())
    navigate(ROUTES.HOME)
  }

  return (
    <div className={styles.layout}>
      <Header
        user={user}
        onLogout={handleLogout}
        skillsPanel={<CategoryList categories={categories} />}
      />
      <div className={styles.content}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
