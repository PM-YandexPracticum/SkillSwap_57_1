import { FC, useId, useState } from 'react'
import styles from './Select.module.css'
import ArrowIcon from '@/shared/assets/icons/chevron.svg?react'
import { Popover } from '../Popover/Popover'

type TOption = { value: string; label: string }

type TSelectProps = {
  options: TOption[] // Массив опций
  value: string // Текущее выбранное значение
  onChange: (value: string) => void // Функция для передачи выбранной опции в родителя
  label?: string // Заголовок
  placeholder?: string // Плэйсхолдер для показа текста, если значение нее выбрано
  className?: string
  maxHeight?: string // Максимальная высота выпадающего списка ('100px', '20vw' и т.п.) если опций очень много
}

export const Select: FC<TSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder,
  className,
  maxHeight,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedLabel = options.find((o) => o.value === value)?.label
  const handleToggle = () => setIsOpen((prev) => !prev)
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }
  const id = useId()
  const plugText = selectedLabel || placeholder
  const trigger = (
    <div
      className={`${styles.select} ${isOpen ? styles.open : ''}`}
      onClick={handleToggle}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      id={id}
      aria-controls={`${id}-list`}
      tabIndex={0}
    >
      <span className={!value ? styles.placeholder : ''}>{plugText}</span>
      <span className={`${styles.arrowImg} ${isOpen ? styles.open : ''}`}>
        <ArrowIcon />
      </span>
    </div>
  )

  return (
    <div className={`${className} ${styles.container}`}>
      {label && <p>{label}</p>}
      <Popover
        trigger={trigger}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className={`${styles.optionsContainer} ${isOpen ? styles.open : ''}`}
      >
        <div
          className={`${styles.selectPlug} ${!value ? styles.placeholder : ''}`}
          onClick={handleToggle}
        >
          {plugText}
        </div>
        <ul
          className={styles.list}
          role="listbox"
          id={`${id}-list`}
          aria-labelledby={id}
          style={{ maxHeight: maxHeight }}
        >
          {options.map((option, index) => (
            <li
              key={index}
              className={`${styles.listItem} ${value === option.value ? styles.active : ''}`}
              onClick={() => handleSelect(option.value || '')}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  )
}
