import { createBrowserRouter, RouterProvider } from 'react-router-dom';
    import AppLayout from './components/layouts/AppLayout';
    import AuthLayout from './components/layouts/AuthLayout';
    import LoginPage from './pages/auth/LoginPage';
    import RegisterPage from './pages/auth/RegisterPage';
    import DashboardPage from './pages/dashboard/DashboardPage';

    const router = createBrowserRouter([
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          // Add other protected routes here
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
        ],
      },
    ]);

    export function Router() {
      return <RouterProvider router={router} />;
    }
