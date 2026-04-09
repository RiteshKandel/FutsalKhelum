import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearAuth } from '../../store/slices/authSlice';
import api from '../../services/api';
import { Button, Input, Card } from '../../components/ui';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(clearAuth());
        return () => dispatch(clearAuth());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, data: user } = res.data;
            
            if (!user.isVerified) {
                navigate(`/verify-otp?email=${email}`);
                return;
            }

            dispatch(loginSuccess({ user, token }));
            
            if (user.role === 'OWNER') navigate('/owner/dashboard');
            else if (user.role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            dispatch(loginFailure(err.response?.data?.message || 'Login Failed'));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-20 relative overflow-hidden">
            
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-secondary/5 skew-x-12 transform origin-bottom -translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 w-full max-w-lg">
                <header className="mb-12 text-left">
                    <h2 className="text-6xl md:text-8xl font-display font-black text-white uppercase leading-[0.85] tracking-tighter mb-4">
                        Welcome <br/><span className="text-secondary text-primary">Back.</span>
                    </h2>
                </header>

                <Card className="pt-12 pb-8 px-10 border-r-4 border-r-secondary shadow-[-40px_40px_80px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <Input 
                            label="Email" 
                            type="email" 
                            placeholder="email@example.com"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        
                        {error && (
                            <div className="bg-red-500/10 border-l-2 border-l-red-500 p-3">
                                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full text-lg py-5 mt-4">
                            {loading ? 'SIGNING IN...' : 'SIGN IN'}
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        New user? <Link to="/register" className="text-secondary hover:text-white transition-colors underline-offset-4 underline">Sign up</Link>
                    </p>
                </Card>
                
                </div>
            </div>
    );
};

export default Login;
