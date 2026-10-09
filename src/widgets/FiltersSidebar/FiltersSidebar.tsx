import { FC, useState } from "react";
import { Button } from '@/shared/ui/Button';
import { RadioGroup } from "@/shared/ui/RadioGroup";
import { Category, City } from "@/shared/types";
import styles from './FiltersSidebar.module.css';

export type Filters = {
  mode: 'all' | 'learn' | 'teach'
  subcategoryIds: string[]
  gender: 'any' | 'male' | 'female'
  cityIds: string[]
}

interface FiltersSidebarProps {
  categories: Category[];
  cities: City[];
  value: Filters;
  onChange: (filters: Filters) => void;
  className?: string;
}

const defaultFilters: Filters = {
  mode: 'all',
  subcategoryIds: [],
  gender: 'any',
  cityIds: []
}

const countActiveFilters = (filters: Filters): number => {
  let count = 0
  if (filters.mode !== 'all') count++
  if (filters.subcategoryIds.length > 0) count++
  if (filters.gender !== 'any') count++
  if (filters.cityIds.length > 0) count++
  return count
}

export const FiltersSidebar: FC<FiltersSidebarProps> = ({
  categories,
  cities,
  value,
  onChange,
  className
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAllCities, setShowAllCities] = useState(false);

  const activeCount = countActiveFilters(value);

  const handleModeChange = (mode: string) => {
    onChange({ ...value, mode: mode as Filters['mode'] })
  }

  const handleReset = () => {
    onChange(defaultFilters)
  }

  return (
    <aside className={`${styles.sidebar} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Фильтры
          {activeCount > 0 && <span className={styles.counter}> ({activeCount})</span>}
        </h2>
        {activeCount > 0 && (
          <Button variant="link" onClick={handleReset}>
            Сбросить ×
          </Button>
        )}
      </div>

      <div className={styles.section}>
        <RadioGroup
          name="mode"
          value={value.mode}
          onChange={handleModeChange}
          options={[
            { value: 'all', label: 'Всё' },
            { value: 'learn', label: 'Хочу научиться' },
            { value: 'teach', label: 'Могу научить' }
          ]}
        />
      </div>
    </aside>
  )
}
