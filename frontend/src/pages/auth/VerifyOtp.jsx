import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, clearAuth } from '../../store/slices/authSlice';
import api from '../../services/api';
import { Button, Input, Card } from '../../components/ui';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user?.isVerified) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        dispatch(clearAuth());
        return () => dispatch(clearAuth());
    }, [dispatch]);
    const email = searchParams.get('email');

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            const { token, data: user } = res.data;
            dispatch(loginSuccess({ user, token }));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md border-t-4 border-t-primary text-center">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Verify Identity</h2>
                <p className="text-gray-400 text-sm mb-8">Enter the 6-digit code sent to <span className="text-white font-bold">{email}</span></p>
                
                <form onSubmit={handleVerify} className="space-y-6 text-left">
                    <Input 
                        label="6-Digit OTP" 
                        maxLength={6} 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        required 
                        className="text-center text-2xl tracking-[1em]"
                    />
                    {error && <p className="text-red-500 text-xs font-bold uppercase text-center">{error}</p>}
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Verifying...' : 'Unlock Account'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default VerifyOtp;
