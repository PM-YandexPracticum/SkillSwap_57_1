import type { AppNotification } from '@/features/notifications/model/notificationsSlice'

const BASE_URL = '/db'

export async function fetchNotifications(): Promise<AppNotification[]> {
  const response = await fetch(`${BASE_URL}/notifications.json`)
  if (!response.ok) throw new Error('Failed to fetch notifications')
  return response.json()
}
