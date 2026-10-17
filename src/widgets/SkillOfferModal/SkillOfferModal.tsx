import { Modal } from '@/shared/ui/Modal'
import { SkillDetails } from '@/widgets/SkillDetails'
import { Button } from '@/shared/ui/Button'
import Pencil from '@/shared/assets/icons/pencil.svg?react'
import styles from './SkillOfferModal.module.css'

type SkillOfferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onConfirm: () => void;
  skillDetails: {
    name: string;
    category: string;
    subcategory: string;
    description: string;
    images: string[];
  }
}

export function SkillOfferModal({
  isOpen,
  onClose,
  onEdit,
  onConfirm,
  skillDetails }: SkillOfferModalProps) {

  if (isOpen) {
    return (
      <Modal
        title={'Ваше предложение'}
        text={'Пожалуйста, проверьте и подтвердите правильность данных'}
        onClose={onClose}
        className={styles.modal}
      >
        <SkillDetails
          title={skillDetails.name}
          categoryName={skillDetails.category}
          subcategoryName={skillDetails.subcategory}
          description={skillDetails.description}
          images={skillDetails.images}
          showGalleryControls={false}
          actions={
            <div className={styles.buttons}>
              <Button variant="secondary" onClick={onEdit} iconRight={<Pencil />} fullWidth={true}>
                Редактировать
              </Button>
              <Button onClick={onConfirm} fullWidth={true}>
                Готово
              </Button>
            </div>
          }
          className={styles.content}
        />
      </Modal>
    )
  }

}
