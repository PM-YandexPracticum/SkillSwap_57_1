import { FC, useEffect, useState } from 'react'
import styles from './RegisterStepOne.module.css'
import { Button } from '@/shared/ui/Button'
import AppleIcon from '@/shared/assets/icons/apple.svg?react'
import GoogleIcon from '@/shared/assets/icons/google.svg?react'
import { Divider } from '@/shared/ui/Divider'
import { Input } from '@/shared/ui/Input'
import { PasswordInput } from '@/shared/ui/PasswordInput'

type TRegisterStepOneProps = {
  onNext: (data: { email: string; password: string }) => void
  emailError?: string
  /** Проверка, занят ли email; если вернёт true — показываем ошибку и дальше не пускаем */
  isEmailTaken?: (email: string) => boolean
}

export const RegisterStepOne: FC<TRegisterStepOneProps> = ({
  onNext,
  emailError,
  isEmailTaken,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hintText, setHintText] = useState('Пароль должен содержать не менее 8 знаков')
  const [localEmailError, setEmailError] = useState(emailError)
  const [passwordError, setPasswordError] = useState(false)

  useEffect(() => {
    setEmailError(emailError)
  }, [emailError])

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  const handlePasswordInput = (data: string) => {
    setPassword(data)
    if (data.length >= 8) setHintText('Надёжный')
    else setHintText('Пароль должен содержать не менее 8 знаков')
    setPasswordError(false)
  }
  const handleEmailInput = (data: string) => {
    setEmailError('')
    setEmail(data)
  }

  const handleContinue = () => {
    if (!validateEmail(email) || password.length < 8) {
      if (!validateEmail(email)) setEmailError('Введите корректную почту')
      if (password.length < 8) setPasswordError(true)
      return
    }
    if (isEmailTaken?.(email)) {
      setEmailError('Email уже используется')
      return
    }
    onNext({ email, password })
  }

  return (
    <div className={styles.container}>
      <div className={styles.smallContainer}>
        <Button
          iconLeft={<GoogleIcon />}
          fullWidth
          variant={'tertiary'}
          className={styles.mediaButton}
        >
          Продолжить с&nbsp;Google
        </Button>
        <Button
          iconLeft={<AppleIcon />}
          fullWidth
          variant={'tertiary'}
          className={styles.mediaButton}
        >
          Продолжить с&nbsp;Apple
        </Button>
      </div>
      <Divider>или</Divider>
      <div className={styles.smallContainer}>
        <Input
          value={email}
          onChange={handleEmailInput}
          placeholder={'Введите email'}
          type={'email'}
          label={'Email'}
          error={localEmailError}
        />
        <PasswordInput
          value={password}
          onChange={handlePasswordInput}
          placeholder={'Придумайте надёжный пароль'}
          label={'Пароль'}
          error={passwordError ? hintText : undefined}
          hint={hintText}
          className={styles.passwordInput}
        />
      </div>
      <Button fullWidth className={styles.continueButton} onClick={handleContinue}>
        Далее
      </Button>
    </div>
  )
}
