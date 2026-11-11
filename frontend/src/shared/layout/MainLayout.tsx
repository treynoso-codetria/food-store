import { Outlet } from 'react-router-dom'

import { Navbar } from './Navbar'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-albahaca-100 py-6 text-center text-xs text-stone-500">
        Food Store · TPI Programación 4 · UTN
      </footer>
    </div>
  )
}
