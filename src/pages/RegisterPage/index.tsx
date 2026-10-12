import { RegisterStepOne } from '@/widgets/RegisterStepOne'
import { StepProgress } from '@/shared/ui/StepProgress'
import LampImg from '@/shared/assets/illustrations/login.svg?react'
import { AuthPanel } from '@/widgets/AuthPanel'

export default function RegisterPage() {
  return (
    <main>
      <StepProgress totalSteps={3} currentStep={1} />
      <AuthPanel
        illustration={<LampImg />}
        title={'Добро пожаловать в SkillSwap!'}
        text={'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми'}
      >
        <RegisterStepOne onNext={(data) => console.log(data)} />
      </AuthPanel>
    </main>
  )
}
