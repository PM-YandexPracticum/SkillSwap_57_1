import styles from './Header.module.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { User } from '@/shared/types'
import { Logo } from '@/shared/ui/Logo'
import { ROUTES } from '@/shared/lib/constants'
import { Button } from '@/shared/ui/Button'
import Chevron from '@/shared/assets/icons/chevron.svg?react'
import Moon from '@/shared/assets/icons/moon.svg?react'
import Heart from '@/shared/assets/icons/heart.svg?react'
import Bell from '@/shared/assets/icons/bell.svg?react'
import Close from '@/shared/assets/icons/close.svg?react'
import LogoutIcon from '@/shared/assets/icons/logout.svg?react'
import { SearchInput } from '@/shared/ui/SearchInput'
import { type ReactNode, useState } from 'react'
import { Avatar } from '@/shared/ui/Avatar'
import { IconButton } from '@/shared/ui/IconButton'
import { Popover } from '@/shared/ui/Popover'
import { TextLink } from '@/shared/ui/TextLink'

type HeaderProps = {
  user?: User
  variant?: 'default' | 'auth'
  skillsPanel?: ReactNode
  onLogout?: () => void
}

export const Header = ({ user, variant = 'default', skillsPanel, onLogout }: HeaderProps) => {
  const [value, setValue] = useState('')
  const [isSkillsOpen, setIsSkillsOpen] = useState(false)
  const [isUserMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  if (variant === 'auth') {
    return (
      <header className={styles.headerAuth}>
        <NavLink to={ROUTES.HOME} className={styles.logo}>
          <Logo />
        </NavLink>
        <Button variant="tertiary" iconRight={<Close />} onClick={() => navigate(ROUTES.HOME)}>
          Закрыть
        </Button>
      </header>
    )
  }

  const skillsButton = (
    <Button
      iconRight={
        <Chevron className={`${styles.chevron} ${isSkillsOpen ? styles.chevronOpen : ''}`} />
      }
      variant="link"
      className={styles.colorText}
      onClick={() => setIsSkillsOpen((open) => !open)}
    >
      Все&nbsp;навыки
    </Button>
  )

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to={ROUTES.HOME} className={styles.logo}>
          <Logo />
        </NavLink>
        <div className={styles.navText}>
          <Button variant="link" className={styles.colorText}>
            О&nbsp;проекте
          </Button>
          {skillsPanel ? (
            <Popover
              trigger={skillsButton}
              open={isSkillsOpen}
              onClose={() => setIsSkillsOpen(false)}
              rootClassName={styles.popoverRoot}
              className={styles.categoriesContainer}
            >
              {skillsPanel}
            </Popover>
          ) : (
            skillsButton
          )}
        </div>
      </nav>
      <search>
        <SearchInput
          value={value}
          onChange={setValue}
          onClear={() => setValue('')}
          placeholder="Искать навык"
        />
      </search>
      {!user && (
        <div className={styles.rightHeader}>
          <IconButton label="Переключить тему" icon={<Moon />} />
          <div className={styles.buttons}>
            <Button variant="secondary" onClick={() => navigate(ROUTES.LOGIN)}>
              Войти
            </Button>
            <Button onClick={() => navigate(ROUTES.REGISTER)}>Зарегистрироваться</Button>
          </div>
        </div>
      )}

      {user && (
        <div className={`${styles.rightHeader} ${styles.rightHeaderWithUser}`}>
          <div className={styles.svgButtons}>
            <IconButton label={'Переключить тему'} icon={<Moon />} />
            <IconButton label={'Уведомления'} icon={<Bell />} />
            <IconButton
              label={'Перейти в избранное'}
              icon={<Heart />}
              onClick={() => navigate(ROUTES.FAVORITES)}
            />
          </div>

          <div>
            <Popover
              className={styles.profilePopover}
              align={'right'}
              trigger={
                <button onClick={() => setUserMenuOpen(!isUserMenuOpen)} className={styles.user}>
                  <h4 className={styles.userText}>{user.name}</h4>
                  <Avatar src={user.avatarUrl} alt="Пользователь" size="s" />
                </button>
              }
              open={isUserMenuOpen}
              onClose={() => setUserMenuOpen(!isUserMenuOpen)}
            >
              <span onClick={() => setUserMenuOpen(!isUserMenuOpen)}>
                <TextLink variant={'default'} to={ROUTES.PROFILE} className={styles.profileButtons}>
                  Личный&nbsp;кабинет
                </TextLink>
              </span>
              <Button
                variant={'link'}
                onClick={() => {
                  setUserMenuOpen(!isUserMenuOpen)
                  if (onLogout) {
                    onLogout()
                  }
                }}
                iconRight={<LogoutIcon />}
                className={styles.profileButtons}
              >
                Выйти из&nbsp;аккаунта
              </Button>
            </Popover>
          </div>
        </div>
      )}
    </header>
  )
}
