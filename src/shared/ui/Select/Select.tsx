import React, { FC, useEffect, useId, useRef, useState } from 'react'
import styles from './Select.module.css'
import ArrowIcon from '@/shared/assets/icons/chevron.svg?react'
import { Popover } from '../Popover/Popover'

type TOption = { value: string; label: string }

type TSelectProps = {
  options: TOption[] // Массив опций
  value: string // Текущее выбранное значение
  onChange: (value: string) => void // Функция для передачи выбранной опции в родителя
  label?: string // Заголовок
  placeholder?: string // Плейсхолдер для показа текста, если значение нее выбрано
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

  const handleToggle = () => setIsOpen(!isOpen)
  const handleClose = () => {
    setIsOpen(false)

    if (triggerRef.current) triggerRef.current.focus()
  }
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    handleClose()
  }
  const id = useId()
  const plugText = options.find((o) => o.value === value)?.label || placeholder

  const optionRefs = useRef<(HTMLLIElement | null)[]>([])
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const selectedIndex = options.findIndex((option) => option.value === value)
    const index = selectedIndex >= 0 ? selectedIndex : 0

    optionRefs.current[index]?.focus()
  }, [isOpen, options, value])

  const handleArrowsMove = (event: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    if (options.length === 0) return

    let nextIndex = index

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        nextIndex = (index + 1) % options.length
        break

      case 'ArrowUp':
        event.preventDefault()
        nextIndex = (index - 1 + options.length) % options.length
        break

      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break

      case 'End':
        event.preventDefault()
        nextIndex = options.length - 1
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        handleSelect(options[index].value)
        return

      default:
        return
    }

    optionRefs.current[nextIndex]?.focus()
  }

  const trigger = (
    <button
      ref={triggerRef}
      className={`${styles.select} ${isOpen ? styles.open : ''}`}
      onClick={handleToggle}
      type="button"
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
    </button>
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
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              tabIndex={0}
              className={`${styles.listItem} ${value === option.value ? styles.active : ''}`}
              onClick={() => handleSelect(option.value || '')}
              role="option"
              aria-selected={option.value === value}
              onKeyDown={(e) => handleArrowsMove(e, index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  )
}
