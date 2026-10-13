import { FormEvent, useState } from 'react'
import { ProfileMenu } from '@/widgets/ProfileMenu'
import { AvatarUpload } from '@/shared/ui/AvatarUpload'
import { Button } from '@/shared/ui/Button'
import { DatePicker } from '@/shared/ui/DatePicker'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { selectCities } from '@/entities/city/model/citiesSlice'
import { useAppSelector } from '@/store/hooks'
import type { Gender } from '@/shared/types'
import styles from './ProfilePage.module.css'

type TProfileForm = {
  email: string
  name: string
  birthDate: string
  gender: Gender
  cityId: string
  about: string
  avatarUrl: string | null
}

const GENDER_OPTIONS = [
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
  { value: 'unspecified', label: 'Не указан' },
]

// Тестовые данные пользователя — подключение текущего пользователя будет отдельной задачей
const TEST_USER: TProfileForm = {
  email: 'ivan@mail.ru',
  name: 'Иван',
  birthDate: '1992-03-15',
  gender: 'male',
  cityId: 'saint-petersburg',
  about: 'Привет! Люблю ритм, кофе по утрам и людей, которые не боятся пробовать новое',
  avatarUrl: '/images/avatars/u1.jpg',
}

export default function ProfilePage() {
  const cities = useAppSelector(selectCities)
  const [form, setForm] = useState<TProfileForm>(TEST_USER)
  const [photo, setPhoto] = useState<File | null>(null)

  const cityOptions = cities.map((city) => ({ value: city.id, label: city.name }))

  const setField = <K extends keyof TProfileForm>(key: K, value: TProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePhotoChange = (file: File) => {
    setPhoto(file)
    setField('avatarUrl', URL.createObjectURL(file))
  }

  // Сохранение профиля появится в следующей задаче
  const handleSave = (values: TProfileForm, avatar: File | null) => {
    console.log(values, avatar)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSave(form, photo)
  }

  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <ProfileMenu />
        <section className={styles.card}>
          <div className={styles.content}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <Input
                value={form.email}
                onChange={(value) => setField('email', value)}
                placeholder="Введите email"
                type="email"
                label="Почта"
              />
              <Button variant="link" className={styles.changePassword}>
                Изменить пароль
              </Button>
              <Input
                value={form.name}
                onChange={(value) => setField('name', value)}
                placeholder="Введите имя"
                label="Имя"
              />
              <div className={styles.dateRow}>
                <DatePicker
                  value={form.birthDate}
                  onChange={(value) => setField('birthDate', value)}
                  label="Дата рождения"
                  placeholder="дд.мм.гггг"
                />
                <Select
                  options={GENDER_OPTIONS}
                  value={form.gender}
                  onChange={(value) => setField('gender', value as Gender)}
                  label="Пол"
                  placeholder="Выберите пол"
                />
              </div>
              <Select
                options={cityOptions}
                value={form.cityId}
                onChange={(value) => setField('cityId', value)}
                label="Город"
                placeholder="Выберите город"
                maxHeight="240px"
              />
              <Textarea
                value={form.about}
                onChange={(value) => setField('about', value)}
                label="О себе"
                rows={4}
              />
              <Button type="submit" fullWidth className={styles.saveButton}>
                Сохранить
              </Button>
            </form>
            <AvatarUpload src={form.avatarUrl} onChange={handlePhotoChange} size="l" />
          </div>
        </section>
      </div>
    </main>
  )
}
