import { useEffect, useState, type FormEvent } from 'react'
import {
  loadCategories,
  selectCategories,
  selectCategoriesError,
} from '@/entities/category/model/categoriesSlice'
import { loadCities, selectCities, selectCitiesError } from '@/entities/city/model/citiesSlice'
import ProfileIllustration from '@/shared/assets/illustrations/register-profile.svg?react'
import type { Gender, TCategoryId } from '@/shared/types'
import { AvatarUpload } from '@/shared/ui/AvatarUpload'
import { Button } from '@/shared/ui/Button'
import { DatePicker } from '@/shared/ui/DatePicker'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { StepProgress } from '@/shared/ui/StepProgress'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { AuthPanel } from '@/widgets/AuthPanel'
import styles from './RegisterStepTwo.module.css'

export type RegisterStepTwoData = {
  name: string
  birthDate: string
  gender: Gender
  cityId: string
  categoryId: TCategoryId | ''
  subcategoryId: string
  avatarFile: File | null
}

type RegisterStepTwoProps = {
  onBack: () => void
  onNext: (data: RegisterStepTwoData) => void
}

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'unspecified', label: 'Не указан' },
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
]

export function RegisterStepTwo({ onBack, onNext }: RegisterStepTwoProps) {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)
  const cities = useAppSelector(selectCities)
  const categoriesError = useAppSelector(selectCategoriesError)
  const citiesError = useAppSelector(selectCitiesError)

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [cityId, setCityId] = useState('')
  const [categoryId, setCategoryId] = useState<TCategoryId | ''>('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    void dispatch(loadCategories())
    void dispatch(loadCities())
  }, [dispatch])

  useEffect(() => {
    if (!avatarFile) return

    const previewUrl = URL.createObjectURL(avatarFile)
    setAvatarPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [avatarFile])

  const isFormComplete =
    name.trim() !== '' &&
    birthDate !== '' &&
    gender !== '' &&
    cityId !== '' &&
    categoryId !== '' &&
    subcategoryId !== ''

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
  const cityOptions = cities.map((city) => ({ value: city.id, label: city.name }))
  const selectedCategory = categories.find((category) => category.id === categoryId)
  const subcategoryOptions = (selectedCategory?.subcategories ?? []).map((subcategory) => ({
    value: subcategory.id,
    label: subcategory.name,
  }))

  const handleCategoryChange = (value: string) => {
    const category = categories.find((item) => item.id === value)
    setCategoryId(category?.id ?? '')
    setSubcategoryId('')
  }

  const handleGenderChange = (value: string) => {
    const option = genderOptions.find((item) => item.value === value)
    if (option) setGender(option.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !birthDate || !gender || !cityId || !categoryId || !subcategoryId) {
      return
    }

    onNext({
      name: name.trim(),
      birthDate,
      gender,
      cityId,
      categoryId,
      subcategoryId,
      avatarFile,
    })
  }

  return (
    <div className={styles.step}>
      <StepProgress currentStep={2} totalSteps={3} />
      <AuthPanel
        illustration={<ProfileIllustration />}
        title="Расскажите немного о себе"
        text="Это поможет другим людям лучше вас узнать, чтобы выбрать для обмена"
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.avatar}>
            <AvatarUpload src={avatarPreview} onChange={setAvatarFile} />
          </div>
          <div className={styles.fields}>
            <Input value={name} onChange={setName} label="Имя" placeholder="Введите ваше имя" />
            <div className={styles.row}>
              <DatePicker
                value={birthDate}
                onChange={setBirthDate}
                label="Дата рождения"
                placeholder="ДД.ММ.ГГГГ"
              />
              <Select
                options={genderOptions}
                value={gender}
                onChange={handleGenderChange}
                label="Пол"
                placeholder="Не указан"
              />
            </div>
            <Select
              options={cityOptions}
              value={cityId}
              onChange={setCityId}
              label="Город"
              placeholder="Не указан"
              maxHeight="240px"
            />
            {citiesError && (
              <p role="alert" className={styles.error}>
                {citiesError}
              </p>
            )}
            <Select
              options={categoryOptions}
              value={categoryId}
              onChange={handleCategoryChange}
              label="Категория навыка, которому хотите научиться"
              placeholder="Выберите категорию"
              maxHeight="240px"
            />
            <fieldset className={styles.subcategory} disabled={!categoryId}>
              <Select
                key={categoryId}
                options={subcategoryOptions}
                value={subcategoryId}
                onChange={setSubcategoryId}
                label="Подкатегория навыка, которому хотите научиться"
                placeholder="Выберите подкатегорию"
                maxHeight="240px"
              />
            </fieldset>
            {categoriesError && (
              <p role="alert" className={styles.error}>
                {categoriesError}
              </p>
            )}
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" type="button" onClick={onBack}>
              Назад
            </Button>
            {/*!Отключение кнопки пока форма не заполнена*/}
            <Button type="submit" disabled={!isFormComplete}>
              Продолжить
            </Button>
          </div>
        </form>
      </AuthPanel>
    </div>
  )
}
