import { ROUTES } from '@/shared/lib/constants'
import { Logo } from '@/shared/ui/Logo'
import { TextLink } from '@/shared/ui/TextLink'
import styles from './Footer.module.css'

const COLUMNS = [
  ['О проекте', 'Все навыки'],
  ['Контакты', 'Блог'],
  ['Политика конфиденциальности', 'Пользовательское соглашение'],
]

export const Footer = ({ className = '' }: { className?: string }) => (
  <footer className={`${styles.footer} ${className}`}>
    <Logo />
    <nav className={styles.links}>
      {COLUMNS.map((column) => (
        <ul key={column[0]} className={styles.column}>
          {column.map((label) => (
            <li key={label}>
              <TextLink variant="default" to={label === 'Все навыки' ? ROUTES.SKILLS : '#'}>
                {label}
              </TextLink>
            </li>
          ))}
        </ul>
      ))}
    </nav>
    <p className={styles.copyright}>SkillSwap — 2026</p>
  </footer>
)
