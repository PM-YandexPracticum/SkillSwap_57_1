import styles from './Spinner.module.css'

/*
Применение в коде:
      <Spinner/>
*/

type SpinnerProps = {
  className?: string
}

export const Spinner = ({className }: SpinnerProps) => {
  const classes = [styles.loader, className].filter(Boolean).join(' ')

  return <div className={classes} />
}
