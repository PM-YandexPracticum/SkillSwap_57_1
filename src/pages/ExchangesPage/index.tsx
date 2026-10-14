import { ProfileMenu } from '@/widgets/ProfileMenu'
import styles from './ExchangesPage.module.css'

// TODO: реализовать страницу ExchangesPage

export default function ExchangesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <ProfileMenu />
        <section className={styles.card}>
          <h1>ExchangesPage</h1>
          <p>Страница в разработке</p>
        </section>
      </div>
    </main>
  )
}
