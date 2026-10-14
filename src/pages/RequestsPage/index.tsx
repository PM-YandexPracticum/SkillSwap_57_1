import { ProfileMenu } from '@/widgets/ProfileMenu'
import styles from './RequestsPage.module.css'

// TODO: реализовать страницу RequestsPage

export default function RequestsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <ProfileMenu />
        <section className={styles.card}>
          <h1>RequestsPage</h1>
          <p>Страница в разработке</p>
        </section>
      </div>
    </main>
  )
}
