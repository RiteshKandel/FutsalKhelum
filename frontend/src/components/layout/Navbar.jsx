import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'CUSTOMER': return '/dashboard';
            case 'OWNER': return '/owner/dashboard';
            case 'ADMIN': return '/admin/dashboard';
            default: return '/';
        }
    };

    return (
        <nav className="bg-surface-high/80 backdrop-blur-xl border-b border-white/5 py-4 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 overflow-hidden">
            <Link to={isAuthenticated ? getDashboardLink() : '/'} className="text-xl md:text-2xl font-display font-black text-primary uppercase tracking-tighter truncate">
                Futsal<span className="text-white">Khelum</span>
            </Link>

            <div className="flex items-center space-x-3 md:space-x-8 text-[9px] md:text-[10px] font-display font-bold uppercase tracking-widest text-gray-400 shrink-0">
                {!isAuthenticated && (
                    <Link to="/search" className="hidden sm:block hover:text-primary transition-colors">Find Grounds</Link>
                )}
                {isAuthenticated ? (
                    <>
                        {user.role === 'CUSTOMER' && (
                            <>
                                <Link to="/dashboard" className="hidden md:block hover:text-primary transition-colors">Dashboard</Link>
                                <Link to="/my-bookings" className="hidden md:block hover:text-primary transition-colors">My Bookings</Link>
                                <Link to="/settings" className="hidden md:block hover:text-primary transition-colors">Settings</Link>
                            </>
                        )}
                        {user.role === 'OWNER' && (
                            <>
                                <Link to="/owner/dashboard" className="hidden md:block hover:text-primary transition-colors">Dashboard</Link>
                                <Link to="/owner/bookings" className="hidden md:block hover:text-primary transition-colors">Manage Bookings</Link>
                                <Link to="/owner/settings" className="hidden md:block hover:text-primary transition-colors">Settings</Link>
                            </>
                        )}
                        {user.role === 'ADMIN' && (
                            <>
                                <Link to="/admin/dashboard" className="hidden md:block hover:text-primary transition-colors">Admin Hub</Link>
                                <Link to="/admin/manage-futsals" className="hidden md:block hover:text-primary transition-colors">Manage Futsals</Link>
                            </>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="bg-primary text-background px-3 py-2 md:px-4 md:py-2 font-black tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all duration-300 ml-2"
                        >
                            LOGOUT
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="bg-primary text-background px-4 py-2 md:px-6 md:py-2 font-black tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all duration-300 ml-2">
                        LOGIN
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
