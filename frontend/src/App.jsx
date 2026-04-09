import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import Search from './pages/customer/Search';
import FutsalDetails from './pages/customer/FutsalDetails';
import MyBookings from './pages/customer/MyBookings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerSettings from './pages/customer/CustomerSettings';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerManageBookings from './pages/owner/OwnerManageBookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import UnderReview from './pages/owner/UnderReview';
import OwnerSettings from './pages/owner/OwnerSettings';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black flex flex-col font-inter">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/under-review" element={<UnderReview />} />
            <Route path="/search" element={<Search />} />
            <Route path="/futsal/:id" element={<FutsalDetails />} />
            
            
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/settings" element={<CustomerSettings />} />
            </Route>

            
            <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/bookings" element={<OwnerManageBookings />} />
              <Route path="/owner/settings" element={<OwnerSettings />} />
            </Route>

            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
