import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CatalogProvider } from "./context/CatalogContext.jsx";
import { ProfileProvider } from "./context/ProfileContext.jsx";
import { NexaDrawerProvider } from "./context/NexaDrawerContext.jsx";
import { SavedProvider } from "./context/SavedContext.jsx";
import { ConnectionsProvider } from "./context/ConnectionsContext.jsx";
import { ConversationsProvider } from "./context/ConversationsContext.jsx";
import { OrganizationProvider } from "./context/OrganizationContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AdminRoute from "./components/auth/AdminRoute.jsx";
import PageTransition from "./components/motion/PageTransition.jsx";
import NavBar from "./components/NavBar.jsx";
import NexaDrawer from "./components/NexaDrawer.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Analysis from "./pages/Analysis.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Discover from "./pages/Discover.jsx";
import OpportunityDetail from "./pages/OpportunityDetail.jsx";
import Saved from "./pages/Saved.jsx";
import Network from "./pages/Network.jsx";
import MentorDetail from "./pages/MentorDetail.jsx";
import BecomeMentor from "./pages/BecomeMentor.jsx";
import Requests from "./pages/Requests.jsx";
import Nexa from "./pages/Nexa.jsx";
import PlaceholderRoute from "./pages/PlaceholderRoute.jsx";
import AdminOpportunities from "./pages/AdminOpportunities.jsx";
import AdminOrganizations from "./pages/AdminOrganizations.jsx";
import AdminSources from "./pages/AdminSources.jsx";
import OrgSignup from "./pages/OrgSignup.jsx";
import OrgDashboard from "./pages/OrgDashboard.jsx";


// Small helpers to keep the route table readable.
const P = ({ children }) => <PageTransition>{children}</PageTransition>;
const Guard = ({ children }) => (
  <ProtectedRoute><PageTransition>{children}</PageTransition></ProtectedRoute>
);
const AdminGuard = ({ children }) => (
  <ProtectedRoute><AdminRoute><PageTransition>{children}</PageTransition></AdminRoute></ProtectedRoute>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<P><Landing /></P>} />
        <Route path="/login" element={<P><Login /></P>} />
        <Route path="/signup" element={<P><Signup /></P>} />
        <Route path="/reset-password" element={<P><ResetPassword /></P>} />
        <Route path="/auth/update-password" element={<P><UpdatePassword /></P>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Onboarding is reachable right after signup */}
        <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
        <Route path="/analysis" element={<Guard><Analysis /></Guard>} />

        {/* Protected product */}
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/profile" element={<Guard><Profile /></Guard>} />
        <Route path="/discover" element={<Guard><Discover /></Guard>} />
        <Route path="/discover/:id" element={<Guard><OpportunityDetail /></Guard>} />
        <Route path="/saved" element={<Guard><Saved /></Guard>} />
        <Route path="/network" element={<Guard><Network /></Guard>} />
        <Route path="/network/connections" element={<Navigate to="/requests" replace />} />
        <Route path="/network/:id" element={<Guard><MentorDetail /></Guard>} />
        <Route path="/become-mentor" element={<Guard><BecomeMentor /></Guard>} />
        <Route path="/requests" element={<Guard><Requests /></Guard>} />
        <Route path="/nexa" element={<Guard><Nexa /></Guard>} />
        <Route path="/roadmap" element={<Guard><PlaceholderRoute route="roadmap" /></Guard>} />

        {/* Organizations — real-org accounts that submit/manage their own listings */}
        <Route path="/org/signup" element={<Guard><OrgSignup /></Guard>} />
        <Route path="/org/dashboard" element={<Guard><OrgDashboard /></Guard>} />

        <Route path="/admin/opportunities" element={<AdminGuard><AdminOpportunities /></AdminGuard>} />
        <Route path="/admin/organizations" element={<AdminGuard><AdminOrganizations /></AdminGuard>} />
        <Route path="/admin/sources" element={<AdminGuard><AdminSources /></AdminGuard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// Provider order: Auth is outermost (everything below reads the session),
// then Catalog (public data), then the per-user data providers.
export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <ProfileProvider>
          <OrganizationProvider>
            <SavedProvider>
              <ConnectionsProvider>
                <ConversationsProvider>
                  <NexaDrawerProvider>
                    <div id="nexa-app" style={{ minHeight: "100%" }}>
                      <NavBar />
                      <AnimatedRoutes />
                      <NexaDrawer />
                    </div>
                  </NexaDrawerProvider>
                </ConversationsProvider>
              </ConnectionsProvider>
            </SavedProvider>
          </OrganizationProvider>
        </ProfileProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}

