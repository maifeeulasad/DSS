import { createFileRoute, redirect } from '@tanstack/react-router'
import App from '../App'
import { AuthToken } from '../services/dssApi'

export const Route = createFileRoute('/analysis')({
  // Skip SSR for this route - App uses browser-only APIs (canvas, antv/g6, etc.)
  ssr: false,
  // Auth guard runs only on the client - localStorage is unavailable during build-time prerendering
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !AuthToken.isPresent()) {
      throw redirect({ to: '/login' })
    }
  },
  component: App,
})
