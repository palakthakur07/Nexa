import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProfile } from "../../context/ProfileContext.jsx";

// Gates a route behind profile.isAdmin (see rowToProfile / schema.sql's
// is_admin column + protect_is_admin trigger). Nests inside ProtectedRoute
// in App.jsx, so by the time this runs we already know the user is signed
// in — this only adds the extra admin check.
export default function AdminRoute({ children }) {
  const { configured } = useAuth();
  const { profile, profileLoaded } = useProfile();

  // Offline demo mode has no real admin concept — let it through so the
  // form is still explorable locally, same spirit as ProtectedRoute.
  if (!configured) return children;

  if (!profileLoaded) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="anim-spin-slow h-8 w-8 rounded-full" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
      </div>
    );
  }

  if (!profile.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
