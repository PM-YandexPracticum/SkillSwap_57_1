import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/widgets/Header'
import { Footer } from '@/widgets/Footer'
import styles from './Layout.module.css'

export const MainLayout = () => (
  <div className={styles.layout}>
    <Header />
    <div className={styles.content}>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
    <Footer />
  </div>
)
