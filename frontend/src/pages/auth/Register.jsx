import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/slices/authSlice';
import api from '../../services/api';
import { Button, Input, Card } from '../../components/ui';

const Register = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') === 'OWNER' ? 'OWNER' : 'CUSTOMER';

    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: initialRole,
        phone: '',
        futsalName: '',
        address: '',
        lat: '',
        lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(clearAuth());
        return () => dispatch(clearAuth());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/register', formData);
            navigate(`/verify-otp?email=${formData.email}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-background px-4 py-12 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform origin-top translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 w-full max-w-2xl">
                <header className="mb-12 text-left">
                    <h2 className="text-6xl md:text-8xl font-display font-black text-white uppercase leading-[0.85] tracking-tighter mb-4">
                        Create <br/><span className="text-primary">Account.</span>
                    </h2>
                </header>

                <Card className="pt-12 pb-8 px-10 border-l-4 border-l-primary shadow-[40px_40px_80px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex flex-col space-y-3">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">User Role</label>
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, role: 'CUSTOMER'})}
                                    className={`flex-1 py-4 border font-display font-bold transition-all duration-300 uppercase tracking-widest text-[10px] ${formData.role === 'CUSTOMER' ? 'bg-primary text-background border-primary shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-transparent border-white/10 text-gray-500 hover:border-gray-700'}`}
                                >
                                    Player
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, role: 'OWNER'})}
                                    className={`flex-1 py-4 border font-display font-bold transition-all duration-300 uppercase tracking-widest text-[10px] ${formData.role === 'OWNER' ? 'bg-primary text-background border-primary shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-transparent border-white/10 text-gray-500 hover:border-gray-700'}`}
                                >
                                    Owner
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input 
                                label={formData.role === 'OWNER' ? "Owner's Full Name" : "Full Name"}
                                placeholder="RITESH KANDEL"
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                            <Input 
                                label="Phone Number" 
                                placeholder="98XXXXXXXX"
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input 
                                label="Email Address" 
                                type="email" 
                                placeholder="email@example.com"
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                            <Input 
                                label="Password" 
                                type="password" 
                                placeholder="••••••••••••"
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>

                        {formData.role === 'OWNER' && (
                            <div className="pt-6 border-t border-white/5 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-grow bg-primary/20"></div>
                                    <span className="text-[10px] font-display font-bold text-primary uppercase tracking-[.4em]">Ground Details</span>
                                    <div className="h-[1px] flex-grow bg-primary/20"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input 
                                        label="Name of Futsal" 
                                        placeholder="STITCH ARENA"
                                        value={formData.futsalName} 
                                        onChange={(e) => setFormData({...formData, futsalName: e.target.value})} 
                                        required 
                                    />
                                    <Input 
                                        label="Location Address" 
                                        placeholder="Durbar Marg, Kathmandu"
                                        value={formData.address} 
                                        onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                        required 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <Input 
                                        label="Latitude" 
                                        type="number"
                                        step="any"
                                        placeholder="27.7172"
                                        value={formData.lat} 
                                        onChange={(e) => setFormData({...formData, lat: e.target.value})} 
                                    />
                                    <Input 
                                        label="Longitude" 
                                        type="number"
                                        step="any"
                                        placeholder="85.3240"
                                        value={formData.lng} 
                                        onChange={(e) => setFormData({...formData, lng: e.target.value})} 
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border-l-2 border-l-red-500 p-3">
                                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full text-lg py-5 mt-4">
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Already have an account? <Link to="/login" className="text-primary hover:text-white transition-colors underline-offset-4 underline">Sign in</Link>
                    </p>
                </Card>
                
                </div>
            </div>
    );
};

export default Register;
