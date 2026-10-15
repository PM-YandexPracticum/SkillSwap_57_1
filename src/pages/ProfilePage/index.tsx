import { FormEvent, useEffect, useState } from 'react'
import { ProfileMenu } from '@/widgets/ProfileMenu'
import { AvatarUpload } from '@/shared/ui/AvatarUpload'
import { Button } from '@/shared/ui/Button'
import { DatePicker } from '@/shared/ui/DatePicker'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Spinner } from '@/shared/ui/Spinner'
import { Textarea } from '@/shared/ui/Textarea'
import { selectCities } from '@/entities/city/model/citiesSlice'
import { selectCurrentUser, selectUsersStatus } from '@/entities/user/model/usersSlice'
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

export default function ProfilePage() {
  const cities = useAppSelector(selectCities)
  const user = useAppSelector(selectCurrentUser)
  const status = useAppSelector(selectUsersStatus)

  const [form, setForm] = useState<TProfileForm | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)

  // Форму заполняем, когда данные текущего пользователя пришли из store
  useEffect(() => {
    if (!user) return
    setForm({
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      gender: user.gender,
      cityId: user.cityId,
      about: user.about,
      avatarUrl: user.avatarUrl,
    })
  }, [user])

  // Освобождаем blob-ссылку превью: при замене фотографии и при уходе со страницы
  useEffect(() => {
    const previewUrl = form?.avatarUrl
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [form?.avatarUrl])

  const cityOptions = cities.map((city) => ({ value: city.id, label: city.name }))

  const setField = <K extends keyof TProfileForm>(key: K, value: TProfileForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
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
    if (form) handleSave(form, photo)
  }

  const isLoading = status === 'idle' || status === 'loading'

  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <ProfileMenu />
        <section className={styles.card}>
          {form ? (
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
          ) : isLoading ? (
            <Spinner className={styles.loading} />
          ) : (
            <p className={styles.error} role="alert">
              Не удалось загрузить данные профиля
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
