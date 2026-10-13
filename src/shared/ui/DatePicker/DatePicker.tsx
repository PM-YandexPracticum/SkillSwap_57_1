import { FC, useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { Formatters } from 'react-day-picker'
import { ru } from 'react-day-picker/locale'
import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import { Button } from '../Button'
import { Popover } from '../Popover'
import styles from './DatePicker.module.css'

const pad = (value: number): string => String(value).padStart(2, '0')

const parseDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

const formatValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long' })
const weekdayName = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
const formatters: Partial<Formatters> = {
  formatMonthDropdown: (month) => capitalize(monthName.format(month)),
  formatWeekdayName: (weekday) => capitalize(weekdayName.format(weekday)),
}

const calendarClassNames = {
  root: styles.calendar,
  month_caption: styles.caption,
  caption_label: styles.captionLabel,
  dropdowns: styles.dropdowns,
  dropdown_root: styles.dropdownRoot,
  dropdown: styles.dropdown,
  months_dropdown: styles.dropdown,
  years_dropdown: styles.dropdown,
  chevron: styles.chevron,
  month_grid: styles.grid,
  weekday: styles.weekday,
  day: styles.day,
  day_button: styles.dayButton,
  outside: styles.outside,
  selected: styles.selected,
  disabled: styles.disabled,
}

type TDatePickerProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  className?: string
}

export const DatePicker: FC<TDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>()

  const selected = value ? parseDate(value) : undefined
  const today = new Date()
  const startMonth = new Date(1940, 0)

  const handleOpen = () => {
    setDate(selected)
    setIsOpen(true)
  }

  const handleClose = () => setIsOpen(false)

  const handleApply = () => {
    if (date) onChange(formatValue(date))
    handleClose()
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const trigger = (
    <button
      type="button"
      className={`${styles.field} ${error ? styles.error : ''}`}
      onClick={handleOpen}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      <span className={selected ? '' : styles.placeholder}>
        {selected ? selected.toLocaleDateString('ru-RU') : placeholder}
      </span>
      <CalendarIcon className={styles.icon} />
    </button>
  )

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <p className={styles.label}>{label}</p>}
      <Popover trigger={trigger} open={isOpen} onClose={handleClose}>
        <div className={styles.panel}>
          <DayPicker
            mode="single"
            locale={ru}
            weekStartsOn={1}
            hideNavigation
            fixedWeeks
            showOutsideDays
            captionLayout="dropdown"
            defaultMonth={selected}
            startMonth={startMonth}
            disabled={{ after: today }}
            selected={date}
            onSelect={setDate}
            formatters={formatters}
            classNames={calendarClassNames}
          />
          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleClose}>
              Отменить
            </Button>
            <Button onClick={handleApply}>Выбрать</Button>
          </div>
        </div>
      </Popover>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}
