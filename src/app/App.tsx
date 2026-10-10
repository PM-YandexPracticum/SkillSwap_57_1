import { StoreProvider } from './providers/StoreProvider'
import { AppRouter } from './providers/RouterProvider'
import { CatalogLoader } from './providers/CatalogLoader'
import './styles/global.css'

export function App() {
  return (
    <StoreProvider>
      <CatalogLoader />
      <AppRouter />
    </StoreProvider>
  )
}
