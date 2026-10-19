import { useId } from 'react'
import LightbulbIcon from '@/shared/assets/icons/lightbulb.svg?react'
import type { AppNotification } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { formatNotificationDate } from '../../lib/formatNotificationDate'
import styles from './NotificationsPanel.module.css'

export type NotificationsPanelProps = {
  newNotifications: AppNotification[]
  readNotifications: AppNotification[]
  onReadAll: () => void
  onClearRead: () => void
  onNavigate: (notificationId: string) => void
  className?: string
}

type NotificationsSectionProps = {
  title: string
  emptyText: string
  notifications: AppNotification[]
  actionLabel: string
  onAction: () => void
  onNavigate?: (notificationId: string) => void
}

const NotificationsSection = ({
  title,
  emptyText,
  notifications,
  actionLabel,
  onAction,
  onNavigate,
}: NotificationsSectionProps) => {
  const titleId = useId()

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.sectionHeader}>
        <h3 id={titleId} className={styles.sectionTitle}>
          {title}
        </h3>
        {notifications.length > 0 && (
          <Button variant="link" onClick={() => onAction()}>
            {actionLabel}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ul className={styles.list}>
          {notifications.map((notification) => (
            <li key={notification.id} className={styles.item}>
              <div className={styles.row}>
                <span className={styles.icon} aria-hidden>
                  <LightbulbIcon />
                </span>

                <div className={styles.content}>
                  <p className={styles.text}>{notification.text}</p>
                  <p className={styles.description}>{notification.description}</p>
                </div>

                <time className={styles.date} dateTime={notification.createdAt}>
                  {formatNotificationDate(notification.createdAt)}
                </time>
              </div>

              {onNavigate && (
                <Button className={styles.navigate} onClick={() => onNavigate(notification.id)}>
                  Перейти
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export const NotificationsPanel = ({
  newNotifications,
  readNotifications,
  onReadAll,
  onClearRead,
  onNavigate,
  className,
}: NotificationsPanelProps) => (
  <div className={[styles.panel, className].filter(Boolean).join(' ')}>
    <NotificationsSection
      title="Новые уведомления"
      emptyText="Новых уведомлений нет"
      notifications={newNotifications}
      actionLabel="Прочитать все"
      onAction={onReadAll}
      onNavigate={onNavigate}
    />

    <NotificationsSection
      title="Просмотренные"
      emptyText="Просмотренных уведомлений нет"
      notifications={readNotifications}
      actionLabel="Очистить"
      onAction={onClearRead}
    />
  </div>
)
