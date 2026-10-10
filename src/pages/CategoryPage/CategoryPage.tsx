import { useEffect, useState } from 'react'
import { fetchCategories } from '@/api/categories'
import type { Category } from '@/shared/types'
import { CategoryList } from '@/widgets/CategoryList'
import styles from './CategoryPage.module.css'

export const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      try {
        const data = await fetchCategories(controller.signal)
        if (!controller.signal.aborted) setCategories(data)
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error ? loadError.message : 'Не удалось загрузить категории',
          )
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadCategories()
    return () => controller.abort()
  }, [])

  return (
    <main className={styles.page}>
      <h1 className="visually-hidden">Все навыки</h1>
      <div className={styles.card}>
        {isLoading && <p role="status">Загрузка категорий…</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {!isLoading && !error && <CategoryList categories={categories} />}
      </div>
    </main>
  )
}

export default CategoryPage
