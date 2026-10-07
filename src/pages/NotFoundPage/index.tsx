// TODO: реализовать страницу NotFoundPage

import { ErrorBlock } from '@/widgets/ErrorBlock'

export default function NotFoundPage() {
  return (
    <main>
      <h1>NotFoundPage</h1>
      <p>Страница в разработке</p>
      <ErrorBlock code={404}/>
    </main>
  )
}
