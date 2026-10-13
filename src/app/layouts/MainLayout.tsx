import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/widgets/Header'
import { Footer } from '@/widgets/Footer'
import { CategoryList } from '@/widgets/CategoryList'
import { useAppSelector } from '@/store/hooks'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import styles from './Layout.module.css'

export const MainLayout = () => {
  const categories = useAppSelector(selectCategories)

  return (
    <div className={styles.layout}>
      <Header skillsPanel={<CategoryList categories={categories} />} />
      <div className={styles.content}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
