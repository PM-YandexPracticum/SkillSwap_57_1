// TODO: реализовать страницу ServerErrorPage

import { ErrorBlock } from '@/widgets/ErrorBlock'

export default function ServerErrorPage() {
  return (
    <main>
      <h1>ServerErrorPage()</h1>
      <p>Страница в разработке</p>
      <ErrorBlock code={500} />
    </main>
  )
}
