import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatAge, getAge } from './age'

describe('getAge', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('возвращает полных лет, если день рождения уже был в этом году', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 11, 1)) // 1 декабря 2026

    expect(getAge('2000-10-15')).toBe(26)
  })

  it('возвращает на год меньше, если день рождения ещё не наступил', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 4)) // 4 октября 2026

    expect(getAge('2000-12-15')).toBe(25)
  })

  it('прибавляет год в сам день рождения', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 4)) // 4 октября 2026

    expect(getAge('2000-10-04')).toBe(26)
  })
})

describe('formatAge', () => {
  it.each([
    [0, '0 лет'],
    [1, '1 год'],
    [2, '2 года'],
    [5, '5 лет'],
    [11, '11 лет'],
    [12, '12 лет'],
    [14, '14 лет'],
    [21, '21 год'],
    [22, '22 года'],
    [25, '25 лет'],
    [101, '101 год'],
    [102, '102 года'],
    [104, '104 года'],
    [111, '111 лет'],
    [112, '112 лет'],
    [115, '115 лет'],
  ])('склоняет %i → %s', (age, expected) => {
    expect(formatAge(age)).toBe(expected)
  })
})
