import styles from './Checkbox.module.css'

/*
Применение в коде:

  const [checked, setChecked] = useState(false)

  const handleAgreeChange = (value: boolean) => {
    setChecked(value)
  }

  return (
      <Checkbox label={'123'} checked={checked} onChange={handleAgreeChange} />
      )
*/

type CheckboxProps = {
  label: string
  checked: boolean
  category?: string
  indeterminate?: boolean
  onChange?: (value: boolean) => void
  className?: string
}

export const Checkbox = ({ label, checked, indeterminate, onChange, className, category='' }: CheckboxProps) => {
  const boxClasses = [styles.box, indeterminate && styles.indeterminate].filter(Boolean).join(' ')
  const labelClasses = [styles.label, className].filter(Boolean).join(' ')

  return (
    <label className={labelClasses}>
      <input
        type="checkbox"
        className={'visually-hidden'}
        name={category}
        value={label}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={boxClasses}></span>
      <span className={styles.labelText}>{label}</span>
    </label>
  )
}
