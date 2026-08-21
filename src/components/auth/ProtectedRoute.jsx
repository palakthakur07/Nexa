import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

// Gates a route behind authentication. While the session is resolving we
// show a lightweight loader; unauthenticated users are sent to /login with
// the intended path preserved so they land back here after signing in.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, configured } = useAuth();
  const location = useLocation();

  // If Supabase isn't configured at all, don't lock the user out of the
  // demo — let them through so the app is still explorable locally.
  if (!configured) return children;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="anim-spin-slow h-8 w-8 rounded-full" style={{ border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent-strong)" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

