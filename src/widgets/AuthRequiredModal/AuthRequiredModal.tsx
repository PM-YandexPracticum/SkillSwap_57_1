import { Modal } from '@/shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts'
import { closeAuthModal, selectIsAuthModalOpen } from '@/features/auth/model/authSlice.ts'
import UserSvg from '@/shared/assets/icons/user.svg?react'
import { Button } from '@/shared/ui/Button'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants.ts'


export const AuthRequiredModal = () => {
  const isModalOpen = useAppSelector(selectIsAuthModalOpen)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const closeModal = () => {
    dispatch(closeAuthModal())
  }


  if (isModalOpen) {
    return (
      <Modal
        title={'Пожалуйста, войдите в аккаунт'}
        text={'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми'}
        onClose={closeModal}
        icon={<UserSvg />}
      >
        <Button variant={'secondary'} fullWidth={true} onClick={closeModal}>
          Отмена
        </Button>
        <Button
          fullWidth={true}
          onClick={() => {
            navigate(ROUTES.LOGIN, { state: { from: location }, replace: true })
            closeModal()
          }}
        >
          Войти
        </Button>
      </Modal>
    )
  }
}
