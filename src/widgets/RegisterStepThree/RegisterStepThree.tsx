import { FC, useState, useEffect } from "react";
import styles from './RegisterStepThree.module.css';
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Select } from "@/shared/ui/Select";
import { StepProgress } from "@/shared/ui/StepProgress";
import { AuthPanel } from "../AuthPanel";
import { useAppSelector } from "@/store/hooks";
import RegisterStepThreeIllustration from '@/shared/assets/illustrations/register-skill.svg?react';

export type RegisterStepThreeData = {
  title: string
  categoryId: string
  subcategoryId: string
  description: string
  images: File[]
};

type TRegisterStepThreeProps = {
  onBack: () => void
  onNext: (data: RegisterStepThreeData) => void
};

export const RegisterStepThree: FC<TRegisterStepThreeProps> = ({
  onBack,
  onNext
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const [titleError, setTitleError] = useState<string | undefined>();
  const [categoryIdError, setCategoryIdError] = useState<string | undefined>();
  const [subcategoryIdError, setSubcategoryIdError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<string | undefined>();

  const categories = useAppSelector(state => state.categories.items);
  const selectedCategory = categories.find(c => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  useEffect(() => {
    setSubcategoryId('');
    setSubcategoryIdError(undefined);
  }, [categoryId]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (titleError) setTitleError(undefined);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    if (categoryIdError) setCategoryIdError(undefined);
  };

  const handleSubcategoryChange = (value: string) => {
    setSubcategoryId(value);
    if (subcategoryIdError) setSubcategoryIdError(undefined);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (descriptionError) setDescriptionError(undefined);
  };

  const handleContinue = () => {
    onNext({title, categoryId, subcategoryId, description, images});
  };

  const illustration = <RegisterStepThreeIllustration />;

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

          <Select
            label="Категория навыка"
            placeholder="Выберите категорию навыка"
            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            value={categoryId}
            onChange={handleCategoryChange}
            error={categoryIdError}
          />

          <Select
            label="Подкатегория навыка"
            placeholder="Выберите подкатегорию навыка"
            options={subcategories.map(sub => ({ value: sub.id, label: sub.name }))}
            value={subcategoryId}
            onChange={handleSubcategoryChange}
            error={subcategoryIdError}
            disabled={!categoryId}
          />

          <Textarea
            label="Описание"
            placeholder="Коротко опишите, чему можете научить"
            value={description}
            onChange={handleDescriptionChange}
            error={descriptionError}
            maxLength={500}
          />

          <div className={styles.uploadSection}>
            <p className={styles.uploadLabel}>Перетащите или выберите изображения навыка</p>
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
