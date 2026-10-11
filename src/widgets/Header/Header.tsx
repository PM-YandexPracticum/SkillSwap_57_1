import styles from './Header.module.css'
import { NavLink, useLocation } from 'react-router-dom'
import { User } from '@/shared/types'
import { Logo } from '@/shared/ui/Logo'
import { ROUTES } from '@/shared/lib/constants.ts'
import { Button } from '@/shared/ui/Button'
import Chevron from '@/shared/assets/icons/chevron.svg?react'
import Moon from '@/shared/assets/icons/moon.svg?react'
import Heart from '@/shared/assets/icons/heart.svg?react'
import Bell from '@/shared/assets/icons/bell.svg?react'
import Close from '@/shared/assets/icons/close.svg?react'
import { SearchInput } from '@/shared/ui/SearchInput'
import { useState } from 'react'
import { Popover } from '@/shared/ui/Popover'
import { CategoryList } from '@/widgets/CategoryList'
import { Avatar } from '@/shared/ui/Avatar'
import { IconButton } from '@/shared/ui/IconButton'

type HeaderProps = {
  user?: User
}

export const Header = ({ user }: HeaderProps) => {
  const [value, setValue] = useState('')
  const { pathname } = useLocation()
  const [categoryListIsOpen, setCategoryListIsOpen] = useState(false)
  const [notificationIsOpen, setNotificationIsOpen] = useState(false)


  if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER) {
    return (
      <header className={styles.headerAuth}>
        <NavLink to={ROUTES.HOME} className={styles.logo}>
          <Logo />
        </NavLink>
        <NavLink to={ROUTES.HOME}>
          <Button variant='tertiary' iconRight={<Close />}>
            Закрыть
          </Button>
        </NavLink>
      </header>
    )
  }

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
          <Popover
            trigger={
              <Button
                iconRight={<Chevron />}
                variant="link"
                className={styles.colorText}
                onClick={() => setCategoryListIsOpen((categoryListIsOpen) => !categoryListIsOpen)}
              >
                Все&nbsp;навыки
              </Button>
            }
            open={categoryListIsOpen}
            onClose={() => setCategoryListIsOpen(false)}
            className={styles.categoriesContainer}
            align="left"
          >
            <div>CatalogList</div>
            <CategoryList categories={[]} />
          </Popover>
        </div>
      </nav>
      <search className={styles.searchWrap}>
        <SearchInput
          value={value}
          onChange={setValue}
          onClear={() => setValue('')}
          placeholder="Искать навык"
          className={styles.search}
        />
      </search>
      {!user && (
        <div className={styles.rightHeader}>
          <IconButton label="Переключить тему" icon={<Moon />} />
          <div className={styles.buttons}>
            <NavLink to={ROUTES.LOGIN}>
              <Button variant="secondary">Войти</Button>
            </NavLink>
            <NavLink to={ROUTES.REGISTER}>
              <Button>Зарегистрироваться</Button>
            </NavLink>
          </div>
        </div>
      )}

      {user && (
        <div className={`${styles.rightHeader} ${styles.rightHeaderWithUser}`}>
          <div className={styles.svgButtons}>
            <IconButton label={'Переключить тему'} icon={<Moon />} />
            <Popover
              trigger={
                <IconButton
                  label={'Уведомления'}
                  onClick={() => setNotificationIsOpen((notificationIsOpen) => !notificationIsOpen)}
                  icon={<Bell />}
                />
              }
              open={notificationIsOpen}
              onClose={() => setNotificationIsOpen(false)}
              className={styles.notificationContainer}
              align="right"
            >
              <div>Notification</div>
            </Popover>
            <NavLink to={ROUTES.FAVORITES}>
              <IconButton label={'Перейти в избранное'} icon={<Heart />} />
            </NavLink>
          </div>

          <div>
            <NavLink to={ROUTES.PROFILE} className={styles.user}>
              <h4 className={styles.userText}>{user.name}</h4>
              <Avatar src={user.avatarUrl} alt="Пользователь" size="s" />
            </NavLink>
          </div>
        </div>
      )}
    </header>
  )
}
