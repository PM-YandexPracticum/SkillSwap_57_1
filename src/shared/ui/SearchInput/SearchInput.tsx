import { FC, useRef } from 'react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import SearchIcon from '@/shared/assets/icons/search.svg?react'
import { Input } from '@/shared/ui/Input'
import styles from './SearchInput.module.css'

export type TSearchInputProps = {
  /** Текущее значение запроса */
  value: string
  /** Обработчик ввода текста */
  onChange: (value: string) => void
  /** Обработчик очистки поля */
  onClear: () => void
  /** Подсказка, отображаемая в пустом поле */
  placeholder: string
  className?: string
}

export const SearchInput: FC<TSearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClear = () => {
    onClear()
    containerRef.current?.querySelector('input')?.focus()
  }

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <SearchIcon className={styles.searchIcon} aria-hidden="true" />
      <Input
        variant="borderless"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.field}
      />
      {value !== '' && (
        <button
          type="button"
          className={styles.clearButton}
          aria-label="Очистить поиск"
          onClick={handleClear}
          onMouseDown={(event) => event.preventDefault()}
        >
          <CloseIcon className={styles.clearIcon} />
        </button>
      )}
    </div>
  )
}
