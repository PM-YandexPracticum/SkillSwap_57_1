import { ProfileMenu } from '@/widgets/ProfileMenu'
import styles from './SkillsPage.module.css'

// TODO: реализовать страницу SkillsPage

export default function SkillsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <ProfileMenu />
        <section className={styles.card}>
          <h1>SkillsPage</h1>
          <p>Страница в разработке</p>
        </section>
      </div>
    </main>
  )
}
