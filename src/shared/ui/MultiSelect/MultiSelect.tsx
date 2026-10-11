import React, { FC, useEffect, useId, useRef, useState } from 'react'
import styles from './MultiSelect.module.css'
import ArrowIcon from '@/shared/assets/icons/chevron.svg?react'
import { Popover } from '@/shared/ui/Popover'
import { Checkbox } from '@/shared/ui/Checkbox'

type TOption = { value: string; label: string }

type TMultiSelectProps = {
  options: TOption[] // Массив опций
  value: string[] // Текущие выбранные значения
  onChange: (value: string[]) => void // Функция для передачи выбранных опции в родителя
  label?: string // Заголовок
  placeholder?: string // Плейсхолдер для показа текста, если значение нее выбрано
  className?: string
  maxHeight?: string // Максимальная высота выпадающего списка ('100px', '20vw' и т.п.) если опций очень много
}

export const MultiSelect: FC<TMultiSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder,
  className,
  maxHeight,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const id = useId()
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    const selectedIndex = options.findIndex((option) => value.includes(option.value))
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }
  const handleClose = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const handleSelect = (optionValue: string) => {
    const next = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue]
    onChange(next)
  }

  const plugText = value.length ? `Выбрано: ${value.length}` : placeholder

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || options.length === 0) return

    optionRefs.current[activeIndex]?.focus()
  }, [isOpen, activeIndex, options.length])

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

    setActiveIndex(nextIndex)
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
    >
      <span className={!value.length ? styles.placeholder : ''}>{plugText}</span>
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
          className={`${styles.selectPlug} ${!value.length ? styles.placeholder : ''}`}
          onClick={handleToggle}
        >
          {plugText}
        </div>
        <ul
          className={styles.list}
          role="listbox"
          aria-labelledby={id}
          aria-multiselectable="true"
          id={`${id}-list`}
          style={{ maxHeight: maxHeight }}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              tabIndex={index === activeIndex ? 0 : -1}
              className={styles.listItem}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(event) => handleArrowsMove(event, index)}
              role="option"
              aria-selected={value.includes(option.value)}
            >
              <span onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  label={option.label}
                  checked={value.includes(option.value)}
                  onChange={() => handleSelect(option.value)}
                />
              </span>
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  )
}
