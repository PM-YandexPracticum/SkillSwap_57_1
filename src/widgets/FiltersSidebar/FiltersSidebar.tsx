import { FC, useState } from "react";
import { Button } from '@/shared/ui/Button';
import { RadioGroup } from "@/shared/ui/RadioGroup";
import { Checkbox } from "@/shared/ui/Checkbox";
import { Category, City } from "@/shared/types";
import styles from './FiltersSidebar.module.css';
import chevronIcon from '@/shared/assets/icons/chevron.svg';
import closeIcon from '@/shared/assets/icons/close.svg';

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
  const visibleCities = showAllCities ? cities : cities.slice(0, 5);

  const handleModeChange = (mode: string) => {
    onChange({ ...value, mode: mode as Filters['mode'] })
  }

  const handleGenderChange = (gender: string) => {
    onChange({ ...value, gender: gender as Filters['gender'] })
  }

  const handleSubcategoryToggle = (id: string) => {
    const newIds = value.subcategoryIds.includes(id)
      ? value.subcategoryIds.filter(x => x !== id)
      : [...value.subcategoryIds, id]
    onChange({ ...value, subcategoryIds: newIds })
  }

  const handleCategoryToggle = (category: Category) => {
    const subIds = category.subcategories.map(s => s.id)
    const allSelected = subIds.every(id => value.subcategoryIds.includes(id))
    const newIds = allSelected
      ? value.subcategoryIds.filter(id => !subIds.includes(id))
      : [...new Set([...value.subcategoryIds, ...subIds])]
    onChange({ ...value, subcategoryIds: newIds })
  }

  const handleCityToggle = (id: string) => {
    const newIds = value.cityIds.includes(id)
      ? value.cityIds.filter(x => x !== id)
      : [...value.cityIds, id]
    onChange({ ...value, cityIds: newIds })
  }

  const handleReset = () => {
    onChange(defaultFilters)
  }

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }))
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
            Сбросить
            <img src={closeIcon} alt="" className={styles.closeIcon} />
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

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Навыки</h3>
        {categories.map(category => {
          const isExpanded = expandedCategories[category.id] || false;
          const subIds = category.subcategories.map(s => s.id);
          const selectedCount = subIds.filter(id => value.subcategoryIds.includes(id)).length;
          const isChecked = selectedCount === subIds.length && subIds.length > 0;
          const isIndeterminate = selectedCount > 0 && selectedCount < subIds.length;

          return (
            <div key={category.id} className={styles.categoryBlock}>
              <div className={styles.categoryHeader}>
                <Checkbox
                  label={category.name}
                  checked={isChecked}
                  indeterminate={isIndeterminate}
                  onChange={() => handleCategoryToggle(category)}
                  category={category.id}
                />
                <button
                  className={styles.expandButton}
                  onClick={() => toggleCategoryExpand(category.id)}
                  type="button"
                  aria-expanded={isExpanded}
                >
                  <img
                    src={chevronIcon}
                    alt=""
                    className={`${styles.chevron} ${isExpanded ? styles.chevron_expanded : ''}`}
                  />
                </button>
              </div>

              {isExpanded && (
                <div className={styles.subcategories}>
                  {category.subcategories.map(sub => (
                    <Checkbox
                      key={sub.id}
                      label={sub.name}
                      checked={value.subcategoryIds.includes(sub.id)}
                      onChange={() => handleSubcategoryToggle(sub.id)}
                      category={category.id}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Пол автора</h3>
        <RadioGroup
          name="gender"
          value={value.gender}
          onChange={handleGenderChange}
          options={[
            { value: 'any', label: 'Не имеет значения' },
            { value: 'male', label: 'Мужской' },
            { value: 'female', label: 'Женский' }
          ]}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Город</h3>
        {visibleCities.map(city => (
          <Checkbox
            key={city.id}
            label={city.name}
            checked={value.cityIds.includes(city.id)}
            onChange={() => handleCityToggle(city.id)}
            category="city"
          />
        ))}
        <button
          className={styles.showAllButton}
          onClick={() => setShowAllCities(!showAllCities)}
          type="button"
        >
          {showAllCities ? 'Скрыть' : 'Все города'}
          <img
            src={chevronIcon}
            alt=""
            className={`${styles.chevron} ${showAllCities ? styles.chevron_expanded : ''}`}
            style={{ width: '16px', height: '16px', marginLeft: '4px' }}
          />
        </button>
      </div>
    </aside>
  )
}
