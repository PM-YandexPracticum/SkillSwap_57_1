import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterStepOne } from '@/widgets/RegisterStepOne'
import { RegisterStepTwo } from '@/widgets/RegisterStepTwo'
import type { RegisterStepTwoData } from '@/widgets/RegisterStepTwo/RegisterStepTwo'
import { RegisterStepThree } from '@/widgets/RegisterStepThree'
import type { RegisterStepThreeData } from '@/widgets/RegisterStepThree/RegisterStepThree'
import { SkillOfferModal } from '@/widgets/SkillOfferModal'
import { RegistrationSuccessModal } from '@/widgets/RegistrationSuccessModal'
import { selectCategories } from '@/entities/category/model/categoriesSlice'
import { AuthPanel } from '@/widgets/AuthPanel'
import { StepProgress } from '@/shared/ui/StepProgress'
import LampImg from '@/shared/assets/illustrations/login.svg?react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addUser,
  loadUsers,
  selectUsers,
} from '@/entities/user/model/usersSlice'
import { addSkill, loadSkills } from '@/entities/skill/model/skillsSlice'
import { login } from '@/features/auth/model/authSlice'
import {
  createRegisteredUser,
  isEmailTaken,
  saveRegistered,
  type RegisterAccount,
} from '@/features/auth/lib/register'
import { fileToDataUrl } from '@/shared/lib/fileToDataUrl'
import { ROUTES } from '@/shared/lib/constants'

type Step = 1 | 2 | 3

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const users = useAppSelector(selectUsers)
  const categories = useAppSelector(selectCategories)

  const [step, setStep] = useState<Step>(1)
  const [account, setAccount] = useState<RegisterAccount | null>(null)
  const [profile, setProfile] = useState<RegisterStepTwoData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modal, setModal] = useState<'none' | 'offer' | 'success'>('none')
  const [offer, setOffer] = useState<{
    data: RegisterStepThreeData
    images: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Ref блокирует повторное нажатие сразу, ещё до следующего рендера.
  const operationInProgress = useRef(false)

  const category = categories.find((item) => item.id === offer?.data.categoryId)
  const subcategory = category?.subcategories.find(
    (item) => item.id === offer?.data.subcategoryId,
  )

  // Пользователи нужны для проверки email, навыки — чтобы новый навык не потерялся при загрузке
  useEffect(() => {
    void dispatch(loadUsers())
    void dispatch(loadSkills())
  }, [dispatch])

  const handleStepOne = (data: RegisterAccount) => {
    setAccount(data)
    setStep(2)
  }

  const handleStepTwo = (data: RegisterStepTwoData) => {
    setProfile(data)
    setStep(3)
  }

  // На этом этапе только готовим предпросмотр — аккаунт ещё не создаётся.
  const handleStepThree = async (data: RegisterStepThreeData) => {
    if (!account || !profile || operationInProgress.current) return
    operationInProgress.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      const images = await Promise.all(data.images.map(fileToDataUrl))
      setOffer({ data, images })
      setModal('offer')
    } catch {
      setError('Не удалось подготовить изображения. Попробуйте ещё раз.')
    } finally {
      operationInProgress.current = false
      setIsSubmitting(false)
    }
  }

  const closeOffer = () => {
    if (operationInProgress.current) return
    setModal('none')
    setStep(3)
  }

  const handleConfirm = async () => {
    if (!account || !profile || !offer || operationInProgress.current) return
    operationInProgress.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      const avatarUrl = profile.avatarFile
        ? await fileToDataUrl(profile.avatarFile)
        : null
      const { data, images } = offer

      const { user, skill } = createRegisteredUser(
        account,
        {
          name: profile.name,
          birthDate: profile.birthDate,
          gender: profile.gender,
          cityId: profile.cityId,
          subcategoryId: profile.subcategoryId,
          avatarUrl,
        },
        {
          title: data.title,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          description: data.description,
          images,
        },
      )

      saveRegistered(user, skill)
      dispatch(addUser(user))
      dispatch(addSkill(skill))
      dispatch(login(user.id))
      setModal('success')
    } catch {
      setModal('none')
      setError('Не удалось завершить регистрацию. Попробуйте ещё раз.')
    } finally {
      operationInProgress.current = false
      setIsSubmitting(false)
    }
  }

  const finishRegistration = () => {
    setModal('none')
    navigate(ROUTES.HOME)
  }

  // Шаги не размонтируются, а скрываются — так при «Назад» введённые данные сохраняются
  return (
    <main>
      {error && <p role="alert">{error}</p>}
      {isSubmitting && <p role="status">Подождите…</p>}
      <div hidden={step !== 1}>
        <StepProgress totalSteps={3} currentStep={1} />
        <AuthPanel
          illustration={<LampImg />}
          title="Добро пожаловать в SkillSwap!"
          text="Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми"
        >
          <RegisterStepOne
            onNext={handleStepOne}
            isEmailTaken={(email) => isEmailTaken(users, email)}
          />
        </AuthPanel>
      </div>

      <div hidden={step !== 2}>
        <RegisterStepTwo onBack={() => setStep(1)} onNext={handleStepTwo} />
      </div>

      <div hidden={step !== 3}>
        <RegisterStepThree
          onBack={() => setStep(2)}
          onNext={(data) => void handleStepThree(data)}
        />
      </div>
      {offer && (
        <SkillOfferModal
          isOpen={modal === 'offer'}
          onClose={closeOffer}
          onEdit={closeOffer}
          onConfirm={() => void handleConfirm()}
          skillDetails={{
            name: offer.data.title,
            category: category?.name ?? '',
            subcategory: subcategory?.name ?? '',
            description: offer.data.description,
            images: offer.images,
          }}
        />
      )}

      <RegistrationSuccessModal
        isOpen={modal === 'success'}
        onDone={finishRegistration}
        onClose={finishRegistration}
      />
    </main>
  )
}
