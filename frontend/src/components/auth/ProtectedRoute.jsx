import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, requirePhone = true }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-primary p-10 font-display">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="uppercase tracking-[0.5em] text-[10px] font-bold animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  // Enforce phone number for all users (especially Google users)
  if (requirePhone && !user?.phone) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if (user?.role === 'OWNER' && !user?.isApproved) {
    return <Navigate to="/under-review" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
