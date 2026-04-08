import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { loginSuccess } from '../../store/slices/authSlice';
import { Card, Button, Input } from '../../components/ui';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const OwnerSettings = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // ── Profile state ──
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    // ── Ground config state ──
    const [ground, setGround] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pricePerHour, setPricePerHour] = useState(0);
    const [openTime, setOpenTime] = useState('06:00');
    const [closeTime, setCloseTime] = useState('22:00');
    const [operatingDays, setOperatingDays] = useState([...DAYS]);
    const [specialPricing, setSpecialPricing] = useState([]);
    const [configSaving, setConfigSaving] = useState(false);
    const [configMsg, setConfigMsg] = useState(null);
    const [publishSaving, setPublishSaving] = useState(false);

    useEffect(() => {
        const fetchGround = async () => {
            try {
                const res = await api.get('/futsals/my');
                const g = res.data.data;
                setGround(g);
                if (g) {
                    setPricePerHour(g.pricePerHour || 0);
                    setOpenTime(g.operatingHours?.open || '06:00');
                    setCloseTime(g.operatingHours?.close || '22:00');
                    setOperatingDays(g.operatingDays || [...DAYS]);
                    setSpecialPricing(g.specialPricing || []);
                }
            } catch {}
            setLoading(false);
        };
        fetchGround();
    }, []);

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            const res = await api.put('/auth/profile', { name: profileName, phone: profilePhone });
            const updatedUser = { ...user, name: res.data.data.name, phone: res.data.data.phone };
            dispatch(loginSuccess({ user: updatedUser, token }));
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePublish = async () => {
        if (pricePerHour <= 0) { setConfigMsg({ type: 'error', text: 'Set a valid base price before publishing.' }); return; }
        setPublishSaving(true);
        try {
            const res = await api.put('/futsals/my', { isListed: true });
            setGround(res.data.data);
            setConfigMsg({ type: 'success', text: 'Your ground is now LIVE!' });
        } catch { setConfigMsg({ type: 'error', text: 'Failed to publish.' }); }
        finally { setPublishSaving(false); }
    };

    const handleUnpublish = async () => {
        setPublishSaving(true);
        try {
            const res = await api.put('/futsals/my', { isListed: false });
            setGround(res.data.data);
            setConfigMsg({ type: 'success', text: 'Ground unlisted successfully.' });
        } catch { setConfigMsg({ type: 'error', text: 'Failed to unpublish.' }); }
        finally { setPublishSaving(false); }
    };

    const toggleDay = (day) =>
        setOperatingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

    const addSpecialPricing = () =>
        setSpecialPricing((prev) => [...prev, { label: '', startTime: '18:00', endTime: '22:00', day: 'ALL', pricePerHour: 0 }]);
    const updateSP = (i, field, value) =>
        setSpecialPricing((prev) => prev.map((sp, idx) => (idx === i ? { ...sp, [field]: value } : sp)));
    const removeSP = (i) => setSpecialPricing((prev) => prev.filter((_, idx) => idx !== i));

    const handleSaveConfig = async () => {
        setConfigSaving(true);
        setConfigMsg(null);
        try {
            const res = await api.put('/futsals/my', {
                pricePerHour: Number(pricePerHour),
                operatingHours: { open: openTime, close: closeTime },
                operatingDays,
                specialPricing: specialPricing.map((sp) => ({ ...sp, pricePerHour: Number(sp.pricePerHour) })),
            });
            setGround(res.data.data);
            setConfigMsg({ type: 'success', text: 'Ground configuration saved!' });
        } catch {
            setConfigMsg({ type: 'error', text: 'Failed to save configuration.' });
        } finally {
            setConfigSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">LOADING...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
            <header>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Settings</h1>
                <p className="text-gray-500 text-xs font-mono mt-1 uppercase">{ground?.name}</p>
            </header>

            {/* ─── SECTION 1: Edit Profile ─── */}
            <section className="space-y-5">
                <h2 className="text-xl font-black text-white uppercase tracking-[0.1em] border-l-4 border-primary pl-4">
                    Edit Profile
                </h2>
                <Card className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Ritesh Kandel"
                        />
                        <Input
                            label="Phone Number"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="98XXXXXXXX"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2">Email Address</label>
                        <p className="bg-black border border-white/5 px-4 py-3 text-gray-500 text-sm font-mono">{user?.email}</p>
                        <p className="text-[9px] text-gray-600 mt-1 font-mono italic">Email address cannot be changed.</p>
                    </div>

                    {profileMsg && (
                        <div className={`p-3 border-l-2 ${profileMsg.type === 'success' ? 'bg-primary/10 border-primary text-primary' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{profileMsg.text}</p>
                        </div>
                    )}
                    <Button onClick={handleSaveProfile} disabled={profileSaving} className="px-10">
                        {profileSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                </Card>
            </section>

            <div className="h-px bg-white/5"></div>

            {/* ─── SECTION 2: Ground Configuration ─── */}
            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.1em] border-l-4 border-secondary pl-4">
                        Ground Configuration
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 border ${ground?.isListed ? 'border-primary text-primary' : 'border-red-500 text-red-500'}`}>
                            {ground?.isListed ? '● LIVE' : '○ UNLISTED'}
                        </span>
                        {ground?.isListed
                            ? <Button variant="danger" onClick={handleUnpublish} disabled={publishSaving} className="text-xs px-4 py-2">Unpublish</Button>
                            : <Button onClick={handlePublish} disabled={publishSaving} className="text-xs px-4 py-2">Publish</Button>
                        }
                    </div>
                </div>

                <Card className="p-8 space-y-8">
                    {/* Pricing & Hours */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input label="Base Price / hr (Rs.)" type="number" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} min={0} />
                        <Input label="Opening Time" type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
                        <Input label="Closing Time" type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
                    </div>

                    {/* Operating Days */}
                    <div>
                        <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-3">Operating Days</span>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((d) => (
                                <button key={d} onClick={() => toggleDay(d)}
                                    className={`px-4 py-2 text-xs font-black uppercase border transition-all ${
                                        operatingDays.includes(d)
                                            ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(204,255,0,0.1)]'
                                            : 'border-gray-800 text-gray-600 hover:border-gray-600'
                                    }`}
                                >{d}</button>
                            ))}
                        </div>
                    </div>

                    {/* Special Pricing */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Special Pricing Rules</span>
                            <button onClick={addSpecialPricing}
                                className="text-primary text-xs font-black border border-primary px-3 py-1.5 hover:bg-primary hover:text-black transition">
                                + Add Rule
                            </button>
                        </div>
                        {specialPricing.length === 0 && (
                            <p className="text-gray-600 text-xs italic font-mono">No rules yet. Click "+ Add Rule" to create time-based pricing.</p>
                        )}
                        <div className="space-y-4">
                            {specialPricing.map((sp, i) => (
                                <div key={i} className="bg-zinc-900/60 border border-gray-800 p-6 rounded relative group hover:border-primary/30 transition-all">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 items-end">
                                        {/* Label */}
                                        <div className="lg:col-span-3">
                                            <Input label="Label" value={sp.label} onChange={(e) => updateSP(i, 'label', e.target.value)} placeholder="Night Rate" />
                                        </div>
                                        {/* Day Select */}
                                        <div className="lg:col-span-2">
                                            <span className="block text-[10px] text-gray-500 uppercase font-bold mb-2">Day</span>
                                            <select value={sp.day} onChange={(e) => updateSP(i, 'day', e.target.value)}
                                                className="w-full bg-black border border-white/10 text-white px-3 py-3 text-xs focus:border-primary outline-none h-[46px]">
                                                <option value="ALL">All Days</option>
                                                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        {/* Time Inputs */}
                                        <div className="lg:col-span-2">
                                            <Input label="From" type="time" value={sp.startTime} onChange={(e) => updateSP(i, 'startTime', e.target.value)} />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <Input label="To" type="time" value={sp.endTime} onChange={(e) => updateSP(i, 'endTime', e.target.value)} />
                                        </div>
                                        {/* Price + Delete Button */}
                                        <div className="lg:col-span-3 flex gap-2 items-end">
                                            <div className="flex-1 min-w-0">
                                                <Input label="Rs./hr" type="number" value={sp.pricePerHour} onChange={(e) => updateSP(i, 'pricePerHour', e.target.value)} />
                                            </div>
                                            <button onClick={() => removeSP(i)}
                                                className="h-[46px] w-[46px] flex items-center justify-center text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all text-sm rounded flex-shrink-0"
                                                title="Remove rule">
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {configMsg && (
                        <div className={`p-3 border-l-2 ${configMsg.type === 'success' ? 'bg-primary/10 border-primary text-primary' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{configMsg.text}</p>
                        </div>
                    )}
                    <Button onClick={handleSaveConfig} disabled={configSaving} className="px-10">
                        {configSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </Card>
            </section>
        </div>
    );
};

export default OwnerSettings;
