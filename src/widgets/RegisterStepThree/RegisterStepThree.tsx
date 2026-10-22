import { FC, useState, useEffect } from 'react'
import styles from './RegisterStepThree.module.css'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Select } from '@/shared/ui/Select'
import { StepProgress } from '@/shared/ui/StepProgress'
import { AuthPanel } from '../AuthPanel'
import { useAppSelector } from '@/store/hooks'
import RegisterStepThreeIllustration from '@/shared/assets/illustrations/register-skill.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import { ImageUpload } from '@/shared/ui/ImageUpload'

export type RegisterStepThreeData = {
  title: string
  categoryId: string
  subcategoryId: string
  description: string
  images: File[]
}

type TRegisterStepThreeProps = {
  initialData?: RegisterStepThreeData
  onDraftChange?: (data: RegisterStepThreeData) => void
  onBack: () => void
  onNext: (data: RegisterStepThreeData) => void
}

export const RegisterStepThree: FC<TRegisterStepThreeProps> = ({
  onBack,
  initialData,
  onDraftChange,
  onNext,
}) => {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '')
  const [subcategoryId, setSubcategoryId] = useState(initialData?.subcategoryId ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [images, setImages] = useState<File[]>(initialData?.images ?? [])

  const [titleError, setTitleError] = useState<string | undefined>()
  const [categoryIdError, setCategoryIdError] = useState<string | undefined>()
  const [subcategoryIdError, setSubcategoryIdError] = useState<string | undefined>()
  const [descriptionError, setDescriptionError] = useState<string | undefined>()

  const categories = useAppSelector((state) => state.categories.items)
  const selectedCategory = categories.find((c) => c.id === categoryId)
  const subcategories = selectedCategory?.subcategories || []

  useEffect(() => {
    onDraftChange?.({ title, categoryId, subcategoryId, description, images })
  }, [title, categoryId, subcategoryId, description, images, onDraftChange])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (titleError) setTitleError(undefined)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value)
    setSubcategoryId('')
    setSubcategoryIdError(undefined)
    if (categoryIdError) setCategoryIdError(undefined)
  }

  const handleSubcategoryChange = (value: string) => {
    setSubcategoryId(value)
    if (subcategoryIdError) setSubcategoryIdError(undefined)
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    if (descriptionError) setDescriptionError(undefined)
  }

  const handleImagesUpload = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const isValidType = ['image/jpeg', 'image/png'].includes(file.type)
      const isValidSize = file.size <= 2 * 1024 * 1024
      return isValidType && isValidSize
    })

    setImages((prev) => [...prev, ...validFiles])
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    if (validate()) {
      onNext({ title, categoryId, subcategoryId, description, images })
    }
  }

  const validate = (): boolean => {
    let isValid = true

    if (title.trim().length < 3) {
      setTitleError('Минимум 3 символа')
      isValid = false
    } else if (title.length > 50) {
      setTitleError('Максимум 50 символов')
      isValid = false
    } else {
      setTitleError(undefined)
    }

    if (!categoryId) {
      setCategoryIdError('Выберите категорию')
      isValid = false
    } else {
      setCategoryIdError(undefined)
    }

    if (!subcategoryId) {
      setSubcategoryIdError('Выберите подкатегорию')
      isValid = false
    } else {
      setSubcategoryIdError(undefined)
    }

    if (description.trim().length === 0) {
      setDescriptionError('Добавьте описание')
      isValid = false
    } else if (description.length > 500) {
      setDescriptionError('Максимум 500 символов')
      isValid = false
    } else {
      setDescriptionError(undefined)
    }

    return isValid
  }

  const illustration = <RegisterStepThreeIllustration />

  return (
    <div className={styles.container}>
      <StepProgress totalSteps={3} currentStep={3} />

      <AuthPanel
        illustration={illustration}
        title="Укажите, чем вы готовы поделиться"
        text="Так другие люди смогут увидеть ваши предложения и предложить вам обмен!"
      >
        <div className={styles.form}>
          <Input
            label="Название навыка"
            placeholder="Введите название вашего навыка"
            value={title}
            onChange={handleTitleChange}
            error={titleError}
          />

          <div className={styles.selectWrapper}>
            <Select
              label="Категория навыка"
              placeholder="Выберите категорию навыка"
              options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
              value={categoryId}
              onChange={handleCategoryChange}
            />
            {categoryIdError && <span className={styles.errorMessage}>{categoryIdError}</span>}
          </div>

          <div className={styles.selectWrapper}>
            <Select
              label="Подкатегория навыка"
              placeholder="Выберите подкатегорию навыка"
              options={subcategories.map((sub) => ({ value: sub.id, label: sub.name }))}
              value={subcategoryId}
              onChange={handleSubcategoryChange}
              disabled={!categoryId}
            />
            {subcategoryIdError && (
              <span className={styles.errorMessage}>{subcategoryIdError}</span>
            )}
          </div>

          <Textarea
            label="Описание"
            placeholder="Коротко опишите, чему можете научить"
            value={description}
            onChange={handleDescriptionChange}
            error={descriptionError}
            maxLength={500}
          />

          <div className={styles.uploadSection}>
            <ImageUpload onChange={handleImagesUpload} />

            {images.length > 0 && (
              <ul className={styles.imageList}>
                {images.map((file, index) => (
                  <li key={index} className={styles.imageItem}>
                    <span className={styles.imageName}>{file.name}</span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveImage(index)}
                      aria-label={`Удалить изображение ${file.name}`}
                    >
                      <CloseIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.buttons}>
          <Button variant="secondary" onClick={onBack} fullWidth>
            Назад
          </Button>
          <Button variant="primary" onClick={handleContinue} fullWidth>
            Продолжить
          </Button>
        </div>
      </AuthPanel>
    </div>
  )
}
