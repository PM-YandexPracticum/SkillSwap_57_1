import styles from './FilterChip.module.css'
import { IconButton } from '@/shared/ui/IconButton'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
/*
Применение в коде:

  <FilterChip label="Английский" onRemove={() => removeFilter('english')} />

*/

type FilterChipProps = {
  label: string
  onRemove: () => void
  className?: string
}

export const FilterChip = ({
  label,
  onRemove,
  className,
}: FilterChipProps) => {
  const containerClasses = [styles.container, className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <span className={styles.labelText}>{label}</span>
      <IconButton label={'Удалить фильтр'} onClick={onRemove} icon={<CloseIcon/>} />
    </div>
  )
}
