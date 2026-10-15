import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import { ROUTES } from '@/shared/lib/constants'
import { MainLayout, AuthLayout } from '@/app/layouts'
import { PrivateRoute } from '@/features/auth/ui'

// Lazy-загрузка страниц — каждая страница грузится только при переходе на неё
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const SkillPage = lazy(() => import('@/pages/SkillPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const RequestsPage = lazy(() => import('@/pages/RequestsPage'))
const ExchangesPage = lazy(() => import('@/pages/ExchangesPage'))
const SkillsPage = lazy(() => import('@/pages/SkillsPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const CreateSkillPage = lazy(() => import('@/pages/CreateSkillPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ServerErrorPage = lazy(() => import('@/pages/ServerErrorPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<CatalogPage />} />
          <Route path={ROUTES.SKILLS} element={<CategoryPage />} />
          <Route path={ROUTES.SKILL} element={<SkillPage />} />
          <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />

          {/* Защищённые маршруты — доступны только авторизованному пользователю */}
          <Route element={<PrivateRoute />}>
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.PROFILE_REQUESTS} element={<RequestsPage />} />
            <Route path={ROUTES.PROFILE_EXCHANGES} element={<ExchangesPage />} />
            <Route path={ROUTES.PROFILE_SKILLS} element={<SkillsPage />} />
            <Route path={ROUTES.CREATE} element={<CreateSkillPage />} />
          </Route>

          <Route path={ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
