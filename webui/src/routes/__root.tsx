import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import React from 'react'
import '../index.css'

export const Route = createRootRoute({
  component: RootLayout,
})

export default function RootLayout() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* Header Navigation */}
        <header className="bg-gray-800 text-white p-4">
          <nav className="container mx-auto flex gap-6">
            <Link to="/" className="hover:text-blue-400 font-semibold">
              Home
            </Link>
            <Link to="/analysis" className="hover:text-blue-400">
              Analysis
            </Link>
            <Link to="/login" className="hover:text-blue-400">
              Login
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-4">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; 2026 DSS - All Rights Reserved</p>
          </div>
        </footer>
      </div>
    </>
  )
}
