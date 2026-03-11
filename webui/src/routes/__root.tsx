import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import React from 'react'
import '../index.css'

export const Route = createRootRoute({
  component: RootLayout,
})

export default function RootLayout() {
  return (
    <>
      <Outlet />
    </>
  )
}
