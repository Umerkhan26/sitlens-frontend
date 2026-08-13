import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { WebsitesPage } from './pages/WebsitesPage'
import { WebsiteHistoryPage } from './pages/WebsiteHistoryPage'
import { AuditProgressPage } from './pages/AuditProgressPage'
import { AuditReportPage } from './pages/AuditReportPage'
import { AuditComparePage } from './pages/AuditComparePage'
import { AppLayout } from './layouts/AppLayout'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="websites" element={<WebsitesPage />} />
            <Route path="websites/:id" element={<WebsiteHistoryPage />} />
            <Route path="audits/:id" element={<AuditProgressPage />} />
            <Route path="audits/:id/report" element={<AuditReportPage />} />
            <Route path="audits/:id/compare" element={<AuditComparePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
