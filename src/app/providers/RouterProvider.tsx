import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ROUTES } from '@/shared/lib/constants'

// Lazy-загрузка страниц — каждая страница грузится только при переходе на неё
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const SkillPage = lazy(() => import('@/pages/SkillPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const CreateSkillPage = lazy(() => import('@/pages/CreateSkillPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ServerErrorPage = lazy(() => import('@/pages/ServerErrorPage'))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Загрузка...</div>}>
        <Routes>
          <Route path={ROUTES.SKILLS} element={<CategoryPage />} />
          <Route path={ROUTES.HOME} element={<CatalogPage />} />
          <Route path={ROUTES.SKILL} element={<SkillPage />} />
          <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<LoginPage />} />

          {/* Защищённые маршруты — добавь PrivateRoute обёртку */}
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.CREATE} element={<CreateSkillPage />} />

          <Route path={ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
