import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import BellIcon from "@/shared/assets/icons/bell.svg?react";

type SwapRequestSuccessModalProps = {
  onClose: () => void;
}

export const SwapRequestSuccessModal = ({ onClose }: SwapRequestSuccessModalProps) => {
  return (
    <Modal
      title="Вы предложили обмен"
      text="Теперь дождитесь подтверждения. Вам придёт уведомление"
      onClose={onClose}
      icon={<BellIcon />}
    >
      <Button variant="primary" onClick={onClose} fullWidth>
        Готово
      </Button>
    </Modal>
  )
}
