import { LoginForm } from '@/widgets/LoginForm'
import LampImg from '@/shared/assets/illustrations/login.svg?react'
import { AuthPanel } from '@/widgets/AuthPanel'

export default function LoginPage() {
  return (
    <main>
      <AuthPanel
        illustration={<LampImg />}
        title={'Добро пожаловать в SkillSwap!'}
        text={'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми'}
      >
        <LoginForm onSubmit={(data) => console.log(data)} />
      </AuthPanel>
    </main>
  )
}
