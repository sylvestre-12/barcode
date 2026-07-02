import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/components/auth/Login'
import { DashboardRouter } from '@/components/dashboard/DashboardRouter'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { ProfileManagement } from '@/components/profile/ProfileManagement'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { AttendanceRecords } from '@/components/records/AttendanceRecords'
import { LiveActivity } from '@/components/activity/LiveActivity'
import { Toaster } from 'sonner'
import { Analytics } from '@/components/analytics/Analytics'
import { Reports } from '@/components/reports/Reports'
import { BarcodeManagement } from '@/components/barcodes/BarcodeManagement'
import { AuditLogs } from '@/components/audit/AuditLogs'
import { Register } from '@/components/auth/Register'
import { VerifyEmail } from '@/components/auth/VerifyEmail'
import { ForgotPassword } from '@/components/auth/ForgotPassword'
import { VerifyResetOTP } from '@/components/auth/VerifyResetOTP'
import { CreateNewPassword } from '@/components/auth/CreateNewPassword'
import { VerifyTwoFa } from '@/components/auth/VerifyTwoFa'


function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset" element={<VerifyResetOTP />} />
          <Route path="/reset-password" element={<CreateNewPassword />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/my-dashboard" element={<DashboardRouter />} />
            <Route path="/scanner" element={<BarcodeScanner />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/records" element={<AttendanceRecords />} />
            <Route path="/live-activity" element={<LiveActivity />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/barcodes" element={<BarcodeManagement />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/verify-2fa" element={<VerifyTwoFa />} />
          
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App