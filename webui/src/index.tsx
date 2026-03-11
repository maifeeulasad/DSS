import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import './index.css';
import reportWebVitals from './reportWebVitals';
import RootLayout from './routes/__root';
import { AuthToken } from './services/dssApi';

// Import all route components  
import Home from './routes/index';
import Login from './routes/login';
import App from './App';

// Create root route
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Create child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analysis',
  beforeLoad: () => {
    if (!AuthToken.isPresent()) {
      throw redirect({ to: '/login' });
    }
  },
  component: App,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  analysisRoute,
  loginRoute,
])

// Create router
const router = createRouter({
  routeTree,
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// @ts-ignore
reportWebVitals();
