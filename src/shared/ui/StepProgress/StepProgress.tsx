import { FC } from 'react'
import styles from './StepPreogress.module.css'

type TStepsProgress = {
  currentStep: number
}

export const StepProgress: FC<TStepsProgress> = ({ currentStep }) => (
  <div className={styles.container}>
    <h2>Шаг {currentStep} из 3</h2>

    <div className={styles.dots}>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className={`${styles.dot} ${index < currentStep ? styles.active : ''}`} />
      ))}
    </div>
  </div>
)
