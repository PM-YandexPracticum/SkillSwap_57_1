import { FC, ReactNode } from 'react'
import styles from './AuthPanel.module.css'

type TAuthPanelProps = {
  illustration: ReactNode
  children: ReactNode
  title: string
  text: string
}
export const AuthPanel: FC<TAuthPanelProps> = ({ illustration, children, title, text }) => (
  <section className={styles.container}>
    <div className={styles.contentBox}>{children}</div>
    <aside className={`${styles.aside} ${styles.contentBox}`}>
      <div className={styles.imageContainer}>{illustration}</div>
      <h2 className={styles.title}>{title}</h2>
      <p>{text}</p>
    </aside>
  </section>
)
