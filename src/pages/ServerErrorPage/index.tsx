import { ErrorBlock } from '@/widgets/ErrorBlock'

export default function ServerErrorPage() {
  return (
    <main>
      <ErrorBlock code={500} />
    </main>
  )
}
