import type { ComponentType, SVGProps } from 'react'
import type { Category, TCategoryId } from '@/shared/types'
import BusinessIcon from '../../shared/assets/icons/categories/business.svg?react'
import CreativeIcon from '../../shared/assets/icons/categories/creative.svg?react'
import LanguagesIcon from '../../shared/assets/icons/categories/languages.svg?react'
import EducationIcon from '../../shared/assets/icons/categories/education.svg?react'
import HomeIcon from '../../shared/assets/icons/categories/home.svg?react'
import HealthIcon from '../../shared/assets/icons/categories/health.svg?react'
import styles from './CategoryList.module.css'

type CategoryListProps = {
  categories: Category[]
  className?: string
}

const categoryColumns: TCategoryId[][] = [
  ['business', 'languages', 'home'],
  ['creative', 'education', 'health'],
]

const categoryIcons: Record<TCategoryId, ComponentType<SVGProps<SVGSVGElement>>> = {
  business: BusinessIcon,
  creative: CreativeIcon,
  languages: LanguagesIcon,
  education: EducationIcon,
  home: HomeIcon,
  health: HealthIcon,
}

export const CategoryList = ({ categories, className }: CategoryListProps) => {
  function renderCategoryIcon(categoryId: TCategoryId) {
    const Icon = categoryIcons[categoryId]

    return (
      <span className={`${styles.iconCircle} ${styles[categoryId]}`} aria-hidden="true">
        <Icon className={styles.icon} focusable="false" />
      </span>
    )
  }

  return (
    <div className={[styles.grid, className].filter(Boolean).join(' ')}>
      {categoryColumns.map((column, columnIndex) => (
        <ul className={styles.column} key={columnIndex}>
          {column.map((categoryId) => {
            const category = categories.find((item) => item.id === categoryId)
            if (!category) return null

            return (
              <li className={styles.category} key={categoryId}>
                {renderCategoryIcon(categoryId)}
                <div className={styles.content}>
                  <h2 className={styles.title}>{category.name}</h2>
                  <ul className={styles.subcategories}>
                    {category.subcategories.map((subcategory) => (
                      <li className={styles.subcategory} key={subcategory.id}>
                        {subcategory.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ul>
      ))}
    </div>
  )
}
