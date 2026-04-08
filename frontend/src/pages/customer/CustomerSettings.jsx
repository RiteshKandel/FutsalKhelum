import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { loginSuccess } from '../../store/slices/authSlice';
import { Card, Button, Input } from '../../components/ui';

const CustomerSettings = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [profileName, setProfileName] = useState(user?.name || '');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    const handleSave = async () => {
        if (!profileName.trim()) {
            setMsg({ type: 'error', text: 'Name cannot be empty.' });
            return;
        }
        setSaving(true);
        setMsg(null);
        try {
            const res = await api.put('/auth/profile', { name: profileName, phone: profilePhone });
            const updatedUser = { ...user, name: res.data.data.name, phone: res.data.data.phone };
            dispatch(loginSuccess({ user: updatedUser, token }));
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-grow overflow-y-auto p-6 max-w-3xl mx-auto w-full min-h-[calc(100vh-73px)]">
            {/* Header */}
            <header className="mb-10">
                <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter border-l-4 border-primary pl-6">
                    My <span className="text-primary">Settings.</span>
                </h1>
                <p className="text-gray-500 text-xs font-mono mt-2 pl-6 uppercase tracking-widest">
                    Manage your personal profile
                </p>
            </header>

            {/* Profile Card */}
            <section className="space-y-5">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.15em] border-l-4 border-primary pl-4">
                    Edit Profile
                </h2>
                <Card className="p-8 space-y-6">
                    {/* Avatar placeholder */}
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-2xl font-black">
                                {(profileName || user?.name || '?')[0].toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-white font-black text-lg uppercase leading-tight">{user?.name}</p>
                            <p className="text-gray-500 text-xs font-mono">{user?.email}</p>
                            <span className="text-[9px] px-2 py-0.5 border border-primary/30 text-primary font-black uppercase tracking-widest mt-1 inline-block">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Your full name"
                        />
                        <Input
                            label="Phone Number"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="98XXXXXXXX"
                            type="tel"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2">
                            Email Address
                        </label>
                        <p className="bg-black border border-white/5 px-4 py-3 text-gray-500 text-sm font-mono">
                            {user?.email}
                        </p>
                        <p className="text-[9px] text-gray-600 mt-1 font-mono italic">
                            Email address cannot be changed.
                        </p>
                    </div>

                    {msg && (
                        <div className={`p-3 border-l-2 ${
                            msg.type === 'success'
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-red-500/10 border-red-500 text-red-500'
                        }`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{msg.text}</p>
                        </div>
                    )}

                    <Button onClick={handleSave} disabled={saving} className="px-10">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Card>
            </section>
        </div>
    );
};

export default CustomerSettings;
