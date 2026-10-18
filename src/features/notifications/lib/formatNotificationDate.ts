const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const MS_IN_DAY = 24 * 60 * 60 * 1000

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/**
 * Дата уведомления для отображения: «сегодня», «вчера» или «23 мая».
 * Сравнение идёт по календарным дням в часовом поясе пользователя.
 */
export const formatNotificationDate = (iso: string, now: Date = new Date()): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / MS_IN_DAY)

  if (diffDays === 0) return 'сегодня'
  if (diffDays === 1) return 'вчера'

  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}
