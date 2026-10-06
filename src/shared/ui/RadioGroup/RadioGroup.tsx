import styles from './RadioGroup.module.css'

/*
Применение в коде:

  const [mode, setMode] = useState('all')

<RadioGroup
  name="mode"
  value={mode}
  onChange={setMode}
  options={[
    { value: 'all', label: 'Всё' },
    { value: 'learn', label: 'Хочу научиться' },
    { value: 'teach', label: 'Могу научить' },
  ]}
/>
*/

type RadioGroupProps = {
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange?: (value: string) => void
  className?: string
}

export const RadioGroup = ({
  name,
  options,
  value,
  onChange,
  className,
}: RadioGroupProps) => {
  const containerClasses = [styles.container, className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {options.map((option, index) => (
        <label className={styles.label} key={`${option.value} - ${index + 1}`}>
          <input
            type="radio"
            className={'visually-hidden'}
            name={name}
            value={option.value}
            onChange={(e) => onChange?.(e.target.value)}
            checked={option.value === value}
          />
          <span className={styles.circle}></span>
          <span className={styles.labelText}>{option.label}</span>
        </label>
      ))}
    </div>
  )
}
