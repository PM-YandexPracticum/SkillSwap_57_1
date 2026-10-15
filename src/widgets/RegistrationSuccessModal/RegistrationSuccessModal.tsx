import { FC } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import CheckCircle from "@/shared/assets/icons/check-circle.svg?react";

export type RegistrationSuccessModalProps = {
  isOpen: boolean;
  onDone: () => void;
  onClose: () => void;
}

export const RegistrationSuccessModal: FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onDone,
  onClose,
}) => {

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title="Ваше предложение создано"
      text="Теперь вы можете предложить обмен"
      icon={<CheckCircle />}
      onClose={onClose}
    >
      <Button
        variant="primary"
        onClick={onDone}
        fullWidth
      >
        Готово
      </Button>
    </Modal>
  )
}
