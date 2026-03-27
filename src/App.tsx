import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuthStore } from "@/stores/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import { Loader2 } from "lucide-react";

// Auth pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const VerifyOtpPage = lazy(() => import("@/pages/VerifyOtpPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));

// Shared pages
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// User pages
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const BookingsPage = lazy(() => import("@/pages/BookingsPage"));
const UserWalletPage = lazy(() => import("@/pages/UserWalletPage"));
const UserCouponsPage = lazy(() => import("@/pages/UserCouponsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));

// Provider pages
const ProviderServicesPage = lazy(() => import("@/pages/ProviderServicesPage"));
const ProviderBookingsPage = lazy(() => import("@/pages/ProviderBookingsPage"));
const ProviderEarningsPage = lazy(() => import("@/pages/ProviderEarningsPage"));
const WithdrawalPage = lazy(() => import("@/pages/WithdrawalPage"));
const UploadDocumentsPage = lazy(() => import("@/pages/UploadDocumentsPage"));

// Admin pages
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminProvidersPage = lazy(() => import("@/pages/AdminProvidersPage"));
const AdminCategoriesPage = lazy(() => import("@/pages/AdminCategoriesPage"));
const AdminServicesPage = lazy(() => import("@/pages/AdminServicesPage"));
const AdminBookingsPage = lazy(() => import("@/pages/AdminBookingsPage"));
const AdminCouponsPage = lazy(() => import("@/pages/AdminCouponsPage"));
const AdminTransactionsPage = lazy(() => import("@/pages/AdminTransactionsPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/AdminAnalyticsPage"));
const AdminSettingsPage = lazy(() => import("@/pages/AdminSettingsPage"));
const AdminWithdrawalsPage = lazy(() => import("@/pages/AdminWithdrawalsPage"));

// Provider Manager pages
const PMApplicationsPage = lazy(() => import("@/pages/PMApplicationsPage"));
const PMApprovedPage = lazy(() => import("@/pages/PMApprovedPage"));
const PMRejectedPage = lazy(() => import("@/pages/PMRejectedPage"));

// Verification Manager pages
const VerificationPage = lazy(() => import("@/pages/VerificationPage"));
const VMPendingPage = lazy(() => import("@/pages/VMPendingPage"));
const VMApprovedPage = lazy(() => import("@/pages/VMApprovedPage"));
const VMRejectedPage = lazy(() => import("@/pages/VMRejectedPage"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const LW = ({ children, roles }: { children: React.ReactNode; roles?: Parameters<typeof ProtectedRoute>[0]["roles"] }) => (
  <ProtectedRoute roles={roles}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public / Auth */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
            <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/provider/upload-documents" element={<UploadDocumentsPage />} />

            {/* Shared - All authenticated roles */}
            <Route path="/dashboard" element={<LW><DashboardPage /></LW>} />
            <Route path="/profile" element={<LW><ProfilePage /></LW>} />
            <Route path="/chat" element={<LW><ChatPage /></LW>} />
            <Route path="/reviews" element={<LW><ReviewsPage /></LW>} />
            <Route path="/settings" element={<LW><SettingsPage /></LW>} />

            {/* User */}
            <Route path="/services" element={<LW><ServicesPage /></LW>} />
            <Route path="/bookings" element={<LW roles={["User"]}><BookingsPage /></LW>} />
            <Route path="/wallet" element={<LW roles={["User"]}><UserWalletPage /></LW>} />
            <Route path="/coupons" element={<LW roles={["User"]}><UserCouponsPage /></LW>} />
            <Route path="/reports" element={<LW><ReportsPage /></LW>} />

            {/* Provider */}
            <Route path="/provider/services" element={<LW roles={["ServiceProvider"]}><ProviderServicesPage /></LW>} />
            <Route path="/provider/bookings" element={<LW roles={["ServiceProvider"]}><ProviderBookingsPage /></LW>} />
            <Route path="/provider/earnings" element={<LW roles={["ServiceProvider"]}><ProviderEarningsPage /></LW>} />
            <Route path="/provider/withdraw" element={<LW roles={["ServiceProvider"]}><WithdrawalPage /></LW>} />

            {/* Admin */}
            <Route path="/admin/users" element={<LW roles={["Admin"]}><AdminUsersPage /></LW>} />
            <Route path="/admin/providers" element={<LW roles={["Admin"]}><AdminProvidersPage /></LW>} />
            <Route path="/admin/categories" element={<LW roles={["Admin"]}><AdminCategoriesPage /></LW>} />
            <Route path="/admin/services" element={<LW roles={["Admin"]}><AdminServicesPage /></LW>} />
            <Route path="/admin/bookings" element={<LW roles={["Admin"]}><AdminBookingsPage /></LW>} />
            <Route path="/admin/coupons" element={<LW roles={["Admin"]}><AdminCouponsPage /></LW>} />
            <Route path="/admin/transactions" element={<LW roles={["Admin"]}><AdminTransactionsPage /></LW>} />
            <Route path="/admin/analytics" element={<LW roles={["Admin"]}><AdminAnalyticsPage /></LW>} />
            <Route path="/admin/settings" element={<LW roles={["Admin"]}><AdminSettingsPage /></LW>} />
            <Route path="/admin/withdrawals" element={<LW roles={["Admin"]}><AdminWithdrawalsPage /></LW>} />

            {/* Provider Manager */}
            <Route path="/pm/applications" element={<LW roles={["ProviderManager"]}><PMApplicationsPage /></LW>} />
            <Route path="/pm/approved" element={<LW roles={["ProviderManager"]}><PMApprovedPage /></LW>} />
            <Route path="/pm/rejected" element={<LW roles={["ProviderManager"]}><PMRejectedPage /></LW>} />

            {/* Verification Manager */}
            <Route path="/verification" element={<LW roles={["VerificationManager"]}><VerificationPage /></LW>} />
            <Route path="/verification/pending" element={<LW roles={["VerificationManager"]}><VMPendingPage /></LW>} />
            <Route path="/verification/approved" element={<LW roles={["VerificationManager"]}><VMApprovedPage /></LW>} />
            <Route path="/verification/rejected" element={<LW roles={["VerificationManager"]}><VMRejectedPage /></LW>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
