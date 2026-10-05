import { FC } from 'react'
import styles from './StepProgress.module.css'

type TStepsProgress = {
  totalSteps: number;
  currentStep: number
}

export const StepProgress: FC<TStepsProgress> = ({totalSteps, currentStep }) => (
  <div className={styles.container}>
    <h2>Шаг {currentStep} из {totalSteps}</h2>

    <div className={styles.dots}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <span key={index} className={`${styles.dot} ${index < currentStep ? styles.active : ''}`} />
      ))}
    </div>
  </div>
)
