import { FC } from 'react'
import styles from './ErrorBlock.module.css'
import ServerErrorImage from '@/shared/assets/illustrations/error-500.svg?react'
import NotFoundImage from '@/shared/assets/illustrations/error-404.svg?react'
import { Button } from '@/shared/ui/Button'
import { useNavigate } from 'react-router-dom'

type TErrorBlockProps = {
  code: 500 | 404
  className?: string
}

export const ErrorBlock: FC<TErrorBlockProps> = ({ code, className = '' }) => {
  const title = code === 500 ? 'На сервере произошла ошибка' : 'Страница не найдена'
  const paragraph =
    code === 500
      ? 'Попробуйте позже или вернитесь на главную страницу'
      : 'К сожалению, эта страница недоступна. Вернитесь на главную страницу или попробуйте позже'
  const image = code === 500 ? <ServerErrorImage /> : <NotFoundImage />
  const navigate = useNavigate()
  const goToMainPage = () => navigate('/')

  return (
    <div className={`${className} ${styles.container}`}>
      <div className={styles.imageContainer}>{image}</div>
      <div className={styles.textBlock}>
        <h2>{title}</h2>
        <p>{paragraph}</p>
      </div>
      <div className={styles.buttonsContainer}>
        <Button fullWidth variant={'secondary'}>
          Сообщить об ошибке
        </Button>
        <Button fullWidth onClick={goToMainPage}>
          На главную
        </Button>
      </div>
    </div>
  )
}
