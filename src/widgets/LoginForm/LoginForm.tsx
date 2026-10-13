import { FC, FormEvent, useState } from 'react'
import styles from './LoginForm.module.css'
import { Button } from '@/shared/ui/Button'
import AppleIcon from '@/shared/assets/icons/apple.svg?react'
import GoogleIcon from '@/shared/assets/icons/google.svg?react'
import { Divider } from '@/shared/ui/Divider'
import { Input } from '@/shared/ui/Input'
import { PasswordInput } from '@/shared/ui/PasswordInput'

type TLoginFormProps = {
  onSubmit: (data: { email: string; password: string }) => void
  emailError?: string
  passwordError?: string
}

export const LoginForm: FC<TLoginFormProps> = ({ onSubmit, emailError, passwordError }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localEmailError, setLocalEmailError] = useState('')
  const [localPasswordError, setLocalPasswordError] = useState('')
  // Внешнюю ошибку показываем после отправки и прячем, пока пользователь правит поля
  const [showExternalError, setShowExternalError] = useState(false)

  const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleEmailInput = (data: string) => {
    setLocalEmailError('')
    setShowExternalError(false)
    setEmail(data)
  }

  const handlePasswordInput = (data: string) => {
    setLocalPasswordError('')
    setShowExternalError(false)
    setPassword(data)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const isEmailValid = validateEmail(email)
    if (!isEmailValid) setLocalEmailError('Введите корректную почту')
    if (!password) setLocalPasswordError('Введите пароль')
    if (isEmailValid && password) {
      setShowExternalError(true)
      onSubmit({ email, password })
    }
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit} noValidate>
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
          error={localEmailError || (showExternalError ? emailError : undefined)}
        />
        <PasswordInput
          value={password}
          onChange={handlePasswordInput}
          placeholder={'Введите пароль'}
          label={'Пароль'}
          error={localPasswordError || (showExternalError ? passwordError : undefined)}
          className={styles.passwordInput}
        />
      </div>
      <Button fullWidth type={'submit'} className={styles.loginButton}>
        Войти
      </Button>
    </form>
  )
}
