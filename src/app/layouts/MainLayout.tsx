import { Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/widgets/Header'
import { Footer } from '@/widgets/Footer'
import { CategoryList } from '@/widgets/CategoryList'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import styles from './Layout.module.css'
import { selectCurrentUser } from '@/entities/user/model/usersSlice'
import { logout } from '@/features/auth/model/authSlice'
import { selectSearch, setSearch } from '@/features/filters/model/filtersSlice'
import { ROUTES } from '@/shared/lib/constants'
import { AuthRequiredModal } from '@/widgets/AuthRequiredModal'

export const MainLayout = () => {
  const categories = useAppSelector(selectCategories)
  const user = useAppSelector(selectCurrentUser)
  const search = useAppSelector(selectSearch)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logout())
    navigate(ROUTES.HOME)
  }

  const handleSearchChange = (value: string) => {
    dispatch(setSearch(value))
    if (location.pathname !== ROUTES.HOME) {
      navigate(ROUTES.HOME)
    }
  }

  return (
    <div className={styles.layout}>
      <AuthRequiredModal />
      <Header
        user={user}
        onLogout={handleLogout}
        skillsPanel={<CategoryList categories={categories} />}
        searchValue={search}
        onSearchChange={handleSearchChange}
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
