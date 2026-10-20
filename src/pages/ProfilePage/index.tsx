import { FormEvent, useEffect, useRef, useState } from 'react'
import { ProfileMenu } from '@/widgets/ProfileMenu'
import { AvatarUpload } from '@/shared/ui/AvatarUpload'
import { Button } from '@/shared/ui/Button'
import { DatePicker } from '@/shared/ui/DatePicker'
import { IconButton } from '@/shared/ui/IconButton'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Spinner } from '@/shared/ui/Spinner'
import { Textarea } from '@/shared/ui/Textarea'
import PencilIcon from '@/shared/assets/icons/pencil.svg?react'
import { selectCities } from '@/entities/city/model/citiesSlice'
import {
  selectCurrentUser,
  selectUsers,
  selectUsersStatus,
  updateUser,
} from '@/entities/user/model/usersSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { Gender } from '@/shared/types'
import {
  type ProfileFieldErrors,
  type ProfileFormValues,
  persistUserProfile,
  userToForm,
  validateProfile,
} from './lib/saveProfile'
import styles from './ProfilePage.module.css'

const GENDER_OPTIONS = [
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
  { value: 'unspecified', label: 'Не указан' },
]

const EMAIL_FIELD_ID = 'profile-email'
const NAME_FIELD_ID = 'profile-name'
const ABOUT_FIELD_ID = 'profile-about'

type EditingField = 'email' | 'name' | 'about' | null

export default function ProfilePage() {
  const dispatch = useAppDispatch()

  const cities = useAppSelector(selectCities)
  const user = useAppSelector(selectCurrentUser)
  const users = useAppSelector(selectUsers)
  const status = useAppSelector(selectUsersStatus)

  const [form, setForm] = useState<ProfileFormValues | null>(null)
  const [initialForm, setInitialForm] = useState<ProfileFormValues | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [editingField, setEditingField] = useState<EditingField>(null)
  const [errors, setErrors] = useState<ProfileFieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Ссылка на текущий blob-URL предпросмотра, чтобы освободить память при замене/размонтировании
  const previewBlobRef = useRef<string | null>(null)

  // Синхронизация формы с текущим пользователем из store
  useEffect(() => {
    if (!user) return
    const next = userToForm(user)
    setForm(next)
    setInitialForm(next)
    setErrors({})
    setPhoto(null)
    setEditingField(null)
    setSaveError(null)
    setSuccessMessage(null)
    // user.id меняется при выходе/входе — этого достаточно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Освобождаем blob-URL при уходе со страницы
  useEffect(() => {
    return () => {
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current)
        previewBlobRef.current = null
      }
    }
  }, [])

  const cityOptions = cities.map((city) => ({ value: city.id, label: city.name }))

  const setField = <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K],
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    if (successMessage) setSuccessMessage(null)
    if (errors[key as keyof ProfileFieldErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const handlePhotoChange = (file: File) => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current)
    }
    const previewUrl = URL.createObjectURL(file)
    previewBlobRef.current = previewUrl
    setPhoto(file)
    setField('avatarUrl', previewUrl)
  }

  const handleEditClick = (field: Exclude<EditingField, null>) => {
    setEditingField(field)
    // Фокус переводим после того, как поле станет редактируемым
    requestAnimationFrame(() => {
      const id =
        field === 'email'
          ? EMAIL_FIELD_ID
          : field === 'name'
            ? NAME_FIELD_ID
            : ABOUT_FIELD_ID
      const node = document.getElementById(id) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null
      node?.focus()
    })
  }

  const isDirty =
    form !== null &&
    initialForm !== null &&
    JSON.stringify(form) !== JSON.stringify(initialForm)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !form || isSaving) return

    const validationErrors = validateProfile(form, users, user.id)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSaveError(null)
      setSuccessMessage(null)
      return
    }

    setErrors({})
    setSaveError(null)
    setSuccessMessage(null)
    setIsSaving(true)

    try {
      const updatedUser = await persistUserProfile(user, form, photo)

      dispatch(updateUser(updatedUser))

      // После сохранения фиксируем новое исходное состояние:
      // карандаши снова в режиме чтения, «Сохранить» снова неактивна.
      const savedForm = userToForm(updatedUser)
      setForm(savedForm)
      setInitialForm(savedForm)
      setEditingField(null)
      setPhoto(null)
      if (previewBlobRef.current) {
        // Предпросмотр больше не нужен — теперь показываем сохранённый avatarUrl
        URL.revokeObjectURL(previewBlobRef.current)
        previewBlobRef.current = null
      }
      setSuccessMessage('Изменения сохранены')
    } catch (error) {
      // Значения формы не сбрасываются, чтобы пользователь мог повторить попытку
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить изменения. Попробуйте ещё раз.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isLoading = status === 'idle' || status === 'loading'

  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <ProfileMenu />
        <section className={styles.card}>
          {form ? (
            <div className={styles.content}>
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {successMessage && (
                  <p className={styles.successMessage} role="status">
                    {successMessage}
                  </p>
                )}
                {saveError && (
                  <p className={styles.errorMessage} role="alert">
                    {saveError}
                  </p>
                )}

                <Input
                  id={EMAIL_FIELD_ID}
                  value={form.email}
                  onChange={(value) => setField('email', value)}
                  placeholder="Введите email"
                  type="email"
                  label="Почта"
                  error={errors.email}
                  readOnly={editingField !== 'email'}
                  rightElementInteractive
                  rightElement={
                    <IconButton
                      icon={<PencilIcon />}
                      label="Редактировать почту"
                      onClick={() => handleEditClick('email')}
                    />
                  }
                />

                <Button variant="link" className={styles.changePassword}>
                  Изменить пароль
                </Button>

                <Input
                  id={NAME_FIELD_ID}
                  value={form.name}
                  onChange={(value) => setField('name', value)}
                  placeholder="Введите имя"
                  label="Имя"
                  error={errors.name}
                  readOnly={editingField !== 'name'}
                  rightElementInteractive
                  rightElement={
                    <IconButton
                      icon={<PencilIcon />}
                      label="Редактировать имя"
                      onClick={() => handleEditClick('name')}
                    />
                  }
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
                  id={ABOUT_FIELD_ID}
                  value={form.about}
                  onChange={(value) => setField('about', value)}
                  label="О себе"
                  rows={4}
                  readOnly={editingField !== 'about'}
                  rightElementInteractive
                  rightElement={
                    <IconButton
                      icon={<PencilIcon />}
                      label="Редактировать информацию о себе"
                      onClick={() => handleEditClick('about')}
                    />
                  }
                />

                <Button
                  type="submit"
                  fullWidth
                  className={styles.saveButton}
                  disabled={!isDirty || isSaving}
                >
                  {isSaving ? 'Сохранение…' : 'Сохранить'}
                </Button>
              </form>

              <AvatarUpload
                src={form.avatarUrl}
                onChange={handlePhotoChange}
                size="l"
                uploadLabel="Изменить фотографию"
              />
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
