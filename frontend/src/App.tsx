import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/Login/LoginPage'
import { RegisterPage } from './pages/Register/RegisterPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          {/* More routes will be added here */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
