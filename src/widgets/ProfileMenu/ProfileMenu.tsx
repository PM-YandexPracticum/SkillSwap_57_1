import { MenuItem } from '@/shared/ui/MenuItem'
import { ROUTES } from '@/shared/lib/constants'
import RequestIcon from '@/shared/assets/icons/envelope.svg?react'
import ChatIcon from '@/shared/assets/icons/chat.svg?react'
import HeartIcon from '@/shared/assets/icons/heart.svg?react'
import LightbulbIcon from '@/shared/assets/icons/lightbulb.svg?react'
import UserIcon from '@/shared/assets/icons/user.svg?react'
import styles from './ProfileMenu.module.css'

export const ProfileMenu = ({ className = '' }: { className?: string }) => (
  <nav className={`${styles.menu} ${className}`}>
    <MenuItem icon={<RequestIcon />} label="Заявки" to={ROUTES.PROFILE_REQUESTS} />
    <MenuItem icon={<ChatIcon />} label="Мои обмены" to={ROUTES.PROFILE_EXCHANGES} />
    <MenuItem icon={<HeartIcon />} label="Избранное" to={ROUTES.FAVORITES} />
    <MenuItem icon={<LightbulbIcon />} label="Мои навыки" to={ROUTES.PROFILE_SKILLS} />
    <MenuItem icon={<UserIcon />} label="Личные данные" to={ROUTES.PROFILE} />
  </nav>
)
