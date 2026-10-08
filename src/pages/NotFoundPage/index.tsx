import { ErrorBlock } from '@/widgets/ErrorBlock'

export default function NotFoundPage() {
  return (
    <main>
      <ErrorBlock code={404}/>
    </main>
  )
}
