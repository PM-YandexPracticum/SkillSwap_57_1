import { describe, expect, it } from 'vitest'
import { formatNotificationDate } from './formatNotificationDate'

// Все даты создаются в локальном часовом поясе, как и сравнение в самой функции
const NOW = new Date(2026, 9, 16, 15, 0)
const iso = (...args: [number, number, number, number?, number?]) =>
  new Date(args[0], args[1], args[2], args[3] ?? 12, args[4] ?? 0).toISOString()

describe('formatNotificationDate', () => {
  it('возвращает «сегодня» для даты текущего дня', () => {
    expect(formatNotificationDate(iso(2026, 9, 16, 0, 5), NOW)).toBe('сегодня')
    expect(formatNotificationDate(iso(2026, 9, 16, 23, 59), NOW)).toBe('сегодня')
  })

  it('возвращает «вчера» для даты предыдущего дня, даже если прошло меньше суток', () => {
    expect(formatNotificationDate(iso(2026, 9, 15, 23, 50), new Date(2026, 9, 16, 0, 10))).toBe(
      'вчера',
    )
    expect(formatNotificationDate(iso(2026, 9, 15, 8, 0), NOW)).toBe('вчера')
  })

  it('возвращает число и месяц в родительном падеже для более ранних дат', () => {
    expect(formatNotificationDate(iso(2026, 9, 14), NOW)).toBe('14 октября')
    expect(formatNotificationDate(iso(2026, 4, 23), NOW)).toBe('23 мая')
    expect(formatNotificationDate(iso(2026, 0, 1), NOW)).toBe('1 января')
    expect(formatNotificationDate(iso(2025, 11, 31), NOW)).toBe('31 декабря')
  })

  it('работает на границе месяцев и года', () => {
    expect(formatNotificationDate(iso(2026, 8, 30), new Date(2026, 9, 1, 9, 0))).toBe('вчера')
    expect(formatNotificationDate(iso(2025, 11, 31), new Date(2026, 0, 1, 9, 0))).toBe('вчера')
  })

  it('для даты в будущем показывает число и месяц', () => {
    expect(formatNotificationDate(iso(2026, 9, 20), NOW)).toBe('20 октября')
  })

  it('возвращает пустую строку для некорректной даты', () => {
    expect(formatNotificationDate('не дата', NOW)).toBe('')
  })
})
