import { RegisterStepOne } from '@/widgets/RegisterStepOne'
import { StepProgress } from '@/shared/ui/StepProgress'

export default function RegisterPage() {
  return (
    <main>
      <StepProgress totalSteps={3} currentStep={1}/>
      <RegisterStepOne onNext={(data) => console.log(data)} />
    </main>
  )
}
