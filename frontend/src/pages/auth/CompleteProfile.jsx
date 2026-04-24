import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../store/slices/authSlice';
import api from '../../services/api';
import { Button, Input, Card } from '../../components/ui';

const CompleteProfile = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const res = await api.put('/auth/profile', { phone });
            const updatedUser = res.data.data;
            
            // Update the user in Redux store
            dispatch(loginSuccess({ user: updatedUser, token }));
            
            // Navigate to appropriate dashboard
            if (updatedUser.role === 'OWNER') navigate('/owner/dashboard');
            else if (updatedUser.role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-20 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform origin-bottom translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 w-full max-w-lg">
                <header className="mb-12 text-left">
                    <h2 className="text-6xl md:text-8xl font-display font-black text-white uppercase leading-[0.85] tracking-tighter mb-4">
                        One More <br/><span className="text-primary">Step.</span>
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        Please provide your phone number to continue. We need this for booking confirmations.
                    </p>
                </header>

                <Card className="pt-12 pb-8 px-10 border-l-4 border-l-primary shadow-[40px_40px_80px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <Input 
                            label="Phone Number" 
                            type="text" 
                            placeholder="98XXXXXXXX"
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            required 
                        />
                        
                        {error && (
                            <div className="bg-red-500/10 border-l-2 border-l-red-500 p-3">
                                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full text-lg py-5 mt-4">
                            {loading ? 'SAVING...' : 'COMPLETE PROFILE'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default CompleteProfile;
