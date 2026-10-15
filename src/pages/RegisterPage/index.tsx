import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterStepOne } from '@/widgets/RegisterStepOne'
import { RegisterStepTwo } from '@/widgets/RegisterStepTwo'
import type { RegisterStepTwoData } from '@/widgets/RegisterStepTwo/RegisterStepTwo'
import { RegisterStepThree } from '@/widgets/RegisterStepThree'
import type { RegisterStepThreeData } from '@/widgets/RegisterStepThree/RegisterStepThree'
import { AuthPanel } from '@/widgets/AuthPanel'
import { StepProgress } from '@/shared/ui/StepProgress'
import LampImg from '@/shared/assets/illustrations/login.svg?react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addUser, loadUsers, selectUsers } from '@/entities/user/model/usersSlice'
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

  const [step, setStep] = useState<Step>(1)
  const [account, setAccount] = useState<RegisterAccount | null>(null)
  const [profile, setProfile] = useState<RegisterStepTwoData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleStepThree = async (data: RegisterStepThreeData) => {
    if (!account || !profile || isSubmitting) return
    setIsSubmitting(true)

    try {
      const [avatarUrl, images] = await Promise.all([
        profile.avatarFile ? fileToDataUrl(profile.avatarFile) : Promise.resolve(null),
        Promise.all(data.images.map(fileToDataUrl)),
      ])

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

      dispatch(addUser(user))
      dispatch(addSkill(skill))
      saveRegistered(user, skill)
      dispatch(login(user.id))
      navigate(ROUTES.HOME)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Шаги не размонтируются, а скрываются — так при «Назад» введённые данные сохраняются
  return (
    <main>
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
    </main>
  )
}
