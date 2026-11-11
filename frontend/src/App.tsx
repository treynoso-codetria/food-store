import { useEffect } from 'react'

import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Único efecto que habla con la API: confirmar la sesión (cookie) al montar la app.
  // Todo lo demás se obtiene con TanStack Query.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
