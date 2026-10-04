/**
 * Возвращает количество полных лет на сегодняшнюю дату.
 * Учитывает, был ли уже день рождения в этом году.
 *
 * @param birthDate дата рождения в формате ISO YYYY-MM-DD
 */
export function getAge(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number)

  const today = new Date()
  let age = today.getFullYear() - year

  const birthdayPassed =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day)

  if (!birthdayPassed) {
    age -= 1
  }

  return age
}

/**
 * Возвращает возраст со склонённым словом: «21 год», «34 года», «25 лет».
 *
 * @param age количество полных лет
 */
export function formatAge(age: number): string {
  const lastTwoDigits = age % 100
  const lastDigit = age % 10

  let word: string

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    word = 'лет'
  } else if (lastDigit === 1) {
    word = 'год'
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    word = 'года'
  } else {
    word = 'лет'
  }

  return `${age} ${word}`
}
