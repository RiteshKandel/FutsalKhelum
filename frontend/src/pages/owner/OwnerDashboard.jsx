import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Button, Input } from '../../components/ui';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const OwnerDashboard = () => {
    const [ground, setGround] = useState(null);
    const [todaySlots, setTodaySlots] = useState([]);
    const [todayBookings, setTodayBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [saving, setSaving] = useState(false);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [forecastData, setForecastData] = useState(null);

    
    const [pricePerHour, setPricePerHour] = useState(0);
    const [openTime, setOpenTime] = useState('06:00');
    const [closeTime, setCloseTime] = useState('22:00');
    const [operatingDays, setOperatingDays] = useState([...DAYS]);
    const [specialPricing, setSpecialPricing] = useState([]);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const gRes = await api.get('/futsals/my');
                const g = gRes.data.data;
                setGround(g);
                if (g) {
                    setPricePerHour(g.pricePerHour || 0);
                    setOpenTime(g.operatingHours?.open || '06:00');
                    setCloseTime(g.operatingHours?.close || '22:00');
                    setOperatingDays(g.operatingDays || [...DAYS]);
                    setSpecialPricing(g.specialPricing || []);
                    
                    const [sRes, bRes, fRes] = await Promise.all([
                        api.get('/bookings/slots', { params: { futsalId: g._id, date: today } }),
                        api.get('/bookings'),
                        api.get('/bookings/forecast', { params: { futsalId: g._id } }).catch(() => ({ data: { data: null } }))
                    ]);
                    setTodaySlots(sRes.data.data || []);
                    
                    setTodayBookings((bRes.data.data || []).filter(b => {
                        return new Date(b.date).toISOString().split('T')[0] === today;
                    }));

                    if (fRes.data?.data) {
                        setForecastData(fRes.data.data);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [today]);

    const handleSelfBook = async (slot) => {
        if (!ground) return;
        try {
            await api.post('/bookings', {
                futsalId: ground._id,
                date: today,
                startTime: slot.startTime,
                endTime: slot.endTime
            });
            
            const [sRes, bRes] = await Promise.all([
                api.get('/bookings/slots', { params: { futsalId: ground._id, date: today } }),
                api.get('/bookings')
            ]);
            setTodaySlots(sRes.data.data || []);
            setTodayBookings((bRes.data.data || []).filter(b => {
                return new Date(b.date).toISOString().split('T')[0] === today;
            }));
            setBookingSlot(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    const toggleDay = (day) => setOperatingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

    const addSpecialPricing = () => setSpecialPricing(prev => [...prev, { label: '', startTime: '18:00', endTime: '22:00', day: 'ALL', pricePerHour: 0 }]);
    const updateSP = (i, field, value) => setSpecialPricing(prev => prev.map((sp, idx) => idx === i ? { ...sp, [field]: value } : sp));
    const removeSP = (i) => setSpecialPricing(prev => prev.filter((_, idx) => idx !== i));

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            const res = await api.put('/futsals/my', {
                pricePerHour: Number(pricePerHour),
                operatingHours: { open: openTime, close: closeTime },
                operatingDays,
                specialPricing: specialPricing.map(sp => ({ ...sp, pricePerHour: Number(sp.pricePerHour) })),
            });
            setGround(res.data.data);
            alert('Configuration saved!');
        } catch (err) {
            alert('Save failed');
        } finally { setSaving(false); }
    };

    const handlePublish = async () => {
        if (pricePerHour <= 0) return alert('Set a valid base price first.');
        setSaving(true);
        try { const res = await api.put('/futsals/my', { isListed: true }); setGround(res.data.data); } catch { alert('Failed'); } finally { setSaving(false); }
    };

    const handleUnpublish = async () => {
        setSaving(true);
        try { const res = await api.put('/futsals/my', { isListed: false }); setGround(res.data.data); } catch { alert('Failed'); } finally { setSaving(false); }
    };

    if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">LOADING...</div>;

    const bookedCount = todaySlots.filter(s => !s.isAvailable).length;
    const freeCount = todaySlots.filter(s => s.isAvailable).length;
    const todayRevenue = todaySlots.filter(s => !s.isAvailable).reduce((sum, s) => sum + s.price, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{ground?.name || 'My Futsal'}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 border ${ground?.isListed ? 'border-primary text-primary' : 'border-red-500 text-red-500'}`}>
                            {ground?.isListed ? '● LIVE' : '○ NOT LISTED'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{ground?.address}</span>
                    </div>
                </div>
                <a href="/owner/settings" className="text-xs font-black uppercase border border-gray-700 px-4 py-2 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                    ⚙ Settings
                </a>
            </header>

            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-l-4 border-l-primary px-4 py-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Today's Bookings</span>
                    <span className="text-2xl font-black text-white">{bookedCount}</span>
                </Card>
                <Card className="border-l-4 border-l-green-500 px-4 py-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Free Slots</span>
                    <span className="text-2xl font-black text-white">{freeCount}</span>
                </Card>
                <Card className="border-l-4 border-l-secondary px-4 py-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Today's Revenue</span>
                    <span className="text-2xl font-black text-white">Rs. {todayRevenue}</span>
                </Card>
                <Card className="border-l-4 border-l-purple-500 px-4 py-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Rate</span>
                    <span className="text-2xl font-black text-white">Rs. {ground?.pricePerHour}/hr</span>
                </Card>
            </div>


            
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4 border-l-4 border-primary pl-4">
                    Today's Schedule <span className="text-gray-500 text-sm font-mono ml-2">{new Date().toLocaleDateString()}</span>
                </h2>
                {todaySlots.length === 0 ? (
                    <Card><p className="text-gray-500 p-6 text-center italic">No slots configured. Set operating hours and publish your listing.</p></Card>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {todaySlots.map(slot => {
                            const booking = todayBookings.find(b => b.startTime === slot.startTime);
                            return (
                                <button
                                    key={slot.startTime}
                                    onClick={() => {
                                        if (!slot.isAvailable && booking) {
                                            setSelectedBooking(booking);
                                            setBookingSlot(null);
                                        } else if (slot.isAvailable) {
                                            setBookingSlot(bookingSlot?.startTime === slot.startTime ? null : slot);
                                            setSelectedBooking(null);
                                        }
                                    }}
                                    className={`p-4 border text-center transition-all ${
                                        !slot.isAvailable 
                                            ? 'border-red-500/40 bg-red-500/10 cursor-pointer hover:border-red-400 hover:bg-red-500/20' 
                                            : bookingSlot?.startTime === slot.startTime
                                                ? 'border-primary bg-primary text-black scale-95'
                                                : 'border-gray-800 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                                    }`}
                                >
                                    <span className={`block font-mono font-bold text-sm ${
                                        !slot.isAvailable ? 'text-red-400' : 
                                        bookingSlot?.startTime === slot.startTime ? 'text-black' : 'text-white'
                                    }`}>
                                        {slot.startTime}
                                    </span>
                                    <span className={`block text-[9px] mt-1 ${
                                        !slot.isAvailable ? 'text-red-400/60' : 
                                        bookingSlot?.startTime === slot.startTime ? 'text-black/60' : 'text-gray-500'
                                    }`}>
                                        {!slot.isAvailable ? 'BOOKED' : `Rs.${slot.price}`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                
                {bookingSlot && (
                    <div className="mt-4 flex items-center gap-4 p-4 border border-primary/30 bg-primary/5 animate-in fade-in duration-200">
                        <span className="text-white font-bold text-sm flex-1">
                            Book slot {bookingSlot.startTime} – {bookingSlot.endTime} · <span className="text-primary">Rs. {bookingSlot.price}</span>
                        </span>
                        <Button onClick={() => handleSelfBook(bookingSlot)} className="text-xs px-6">Book Slot</Button>
                        <button onClick={() => setBookingSlot(null)} className="text-gray-500 text-xs hover:text-white transition">Cancel</button>
                    </div>
                )}

                
                {selectedBooking && (
                    <div className="mt-4 p-5 border border-red-500/30 bg-red-500/5 animate-in fade-in duration-200 relative">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs transition"
                        >✕ Close</button>
                        <p className="text-[9px] text-red-400/60 font-mono uppercase tracking-[0.2em] mb-3">Slot Booking Details</p>
                        <h3 className="text-xl font-black text-white mb-4">{selectedBooking.startTime} – {selectedBooking.endTime}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Player Name</p>
                                <p className="text-white font-bold text-sm uppercase">{selectedBooking.userId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Phone</p>
                                <p className="text-white font-bold text-sm">{selectedBooking.userId?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Email</p>
                                <p className="text-white font-bold text-sm">{selectedBooking.userId?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Amount</p>
                                <p className="text-primary font-black text-lg">Rs. {selectedBooking.price}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Status</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                    selectedBooking.status === 'CONFIRMED' ? 'bg-primary/20 text-primary' :
                                    selectedBooking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-red-500/20 text-red-500'
                                }`}>{selectedBooking.status}</span>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Booking Ref</p>
                                <p className="text-gray-400 font-mono text-xs">{selectedBooking._id?.slice(-10).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI REVENUE PULSE FORECAST SECTION */}
            {forecastData && forecastData.forecast && (
                <div className="mt-8 border-t border-gray-800 pt-8 animate-in fade-in duration-500">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4 border-l-4 border-secondary pl-4 flex items-center gap-2">
                        📈 REVENUE PULSE <span className="text-secondary text-[10px] px-2 py-0.5 bg-secondary/10 border border-secondary/30 rounded">AI FORECAST</span>
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <Card className="lg:col-span-2 p-6 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
                            <div className="flex h-48 items-end gap-2 justify-between">
                                {forecastData.forecast.map((dayData, idx) => {
                                    const maxVal = Math.max(1, ...forecastData.forecast.map(d => Math.max(d.projectedRevenue, d.historicalAvg)));
                                    const pHeight = (dayData.projectedRevenue / maxVal) * 100;
                                    const hHeight = (dayData.historicalAvg / maxVal) * 100;
                                    
                                    return (
                                        <div key={idx} className="flex flex-col items-center flex-1 gap-2 group relative">
                                            <div className="w-full flex justify-center items-end h-32 gap-1">
                                                {/* Historical Bar (Dim) */}
                                                <div 
                                                    style={{ height: `${hHeight}%` }} 
                                                    className="w-2 md:w-3 bg-gray-700 transition-all group-hover:bg-gray-500 rounded-t-sm"
                                                    title={`Historical Avg: Rs. ${dayData.historicalAvg}`}
                                                ></div>
                                                {/* Projected Bar (Bright) */}
                                                <div 
                                                    style={{ height: `${pHeight}%` }} 
                                                    className="w-2 md:w-3 bg-secondary transition-all group-hover:brightness-125 group-hover:shadow-[0_0_10px_#00D1FF] rounded-t-sm"
                                                    title={`Projected: Rs. ${dayData.projectedRevenue}`}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-white uppercase">
                                                {dayData.day}
                                            </span>
                                            
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gray-800 p-2 text-[9px] font-mono z-10 whitespace-nowrap pointer-events-none rounded shadow-xl">
                                                <div className="text-secondary">Proj: Rs. {dayData.projectedRevenue}</div>
                                                <div className="text-gray-500">Hist: Rs. {dayData.historicalAvg}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex gap-4 justify-center text-[10px] font-mono text-gray-500 uppercase">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-700 rounded-sm"></div> Historical</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-secondary rounded-sm"></div> AI Projected</span>
                            </div>
                        </Card>

                        <Card className="p-6 border-secondary/40 bg-secondary/5 h-full">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-secondary/20 pb-2">Tactical Insights</h3>
                            <ul className="space-y-4">
                                {forecastData.insights.map((insight, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-300">
                                        <span className="text-secondary mt-0.5">⚡</span>
                                        <span className={insight.includes('ALERT') ? 'text-red-400 font-bold' : insight.includes('WARNING') ? 'text-yellow-400 font-bold' : ''}>
                                            {insight}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
