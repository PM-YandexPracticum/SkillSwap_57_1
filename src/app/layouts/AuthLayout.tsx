import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/widgets/Header'
import styles from './Layout.module.css'

export const AuthLayout = () => (
  <div className={styles.layout}>
    <Header variant="auth" />
    <div className={styles.content}>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  </div>
)
