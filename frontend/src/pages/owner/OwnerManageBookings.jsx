import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Button } from '../../components/ui';

const OwnerManageBookings = () => {
    const [ground, setGround] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [booking, setBooking] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date(new Date().setDate(new Date().getDate() + 21)).toISOString().split('T')[0];
    const isPastDate = selectedDate < today;

    useEffect(() => {
        const fetchGround = async () => {
            try {
                const res = await api.get('/futsals/my');
                setGround(res.data.data);
            } catch {}
            setLoading(false);
        };
        fetchGround();
    }, []);

    useEffect(() => {
        if (!ground) return;
        const fetchData = async () => {
            try {
                const bRes = await api.get('/bookings');
                const all = bRes.data.data || [];
                setAllBookings(all);
                
                if (!isPastDate) {
                    const sRes = await api.get('/bookings/slots', { params: { futsalId: ground._id, date: selectedDate } });
                    setSlots(sRes.data.data || []);
                } else {
                    setSlots([]);
                }
            } catch {}
        };
        fetchData();
    }, [ground, selectedDate, isPastDate]);

    const refreshAll = async () => {
        if (!ground) return;
        const bRes = await api.get('/bookings');
        const all = bRes.data.data || [];
        setAllBookings(all);
        if (!isPastDate) {
            const sRes = await api.get('/bookings/slots', { params: { futsalId: ground._id, date: selectedDate } });
            setSlots(sRes.data.data || []);
        }
    };

    const pendingBookings = allBookings.filter(b => b.status === 'PENDING');

    
    const selectedDateBookings = allBookings.filter(b => {
        const bd = new Date(b.date);
        const sd = new Date(selectedDate);
        return bd.toDateString() === sd.toDateString();
    });

    
    const getBookingForSlot = (slot) => {
        return allBookings.find(b => {
            const bd = new Date(b.date);
            const sd = new Date(selectedDate);
            return b.startTime === slot.startTime
                && bd.toDateString() === sd.toDateString();
        });
    };

    const handleSelfBook = async () => {
        if (!bookingSlot || !ground) return;
        setBooking(true);
        try {
            await api.post('/bookings', {
                futsalId: ground._id,
                date: selectedDate,
                startTime: bookingSlot.startTime,
                endTime: bookingSlot.endTime
            });
            setBookingSlot(null);
            await refreshAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    const handleBookingStatus = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            await refreshAll();
        } catch {
            alert('Status update failed. Please try again.');
        }
    };

    if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">LOADING...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

            
            <header>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Manage Bookings</h1>
                <p className="text-gray-500 text-xs font-mono mt-1 uppercase">{ground?.name} — Owner Control Panel</p>
            </header>

            
            <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.1em] border-l-4 border-primary pl-4">
                        {isPastDate ? 'Past Booking History' : 'Book Slots'}
                    </h2>
                    
                    <div className="relative">
                        <label className="block text-[9px] text-primary font-black uppercase tracking-[0.25em] mb-1.5">Select Date</label>
                        <div className="relative shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-primary/20 rounded-sm">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => { setSelectedDate(e.target.value); setBookingSlot(null); setSelectedBooking(null); }}
                                max={maxDate}
                                className="bg-zinc-900 border border-primary/30 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all w-52 cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-2 font-semibold">
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {isPastDate ? (
                    
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] bg-gray-800 text-gray-400 font-black uppercase px-2 py-0.5 tracking-widest">READ ONLY — HISTORICAL DATA</span>
                        </div>
                        {selectedDateBookings.length === 0 ? (
                            <Card><p className="text-gray-500 p-6 text-center italic">No bookings recorded for this date.</p></Card>
                        ) : (
                            <div className="space-y-2">
                                {selectedDateBookings.map(b => (
                                    <div key={b._id} className={`p-4 border-l-2 bg-zinc-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                                        b.status === 'CONFIRMED' ? 'border-primary' : b.status === 'PENDING' ? 'border-yellow-500' : 'border-red-500'
                                    }`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-white text-sm font-black uppercase">{b.startTime} – {b.endTime}</p>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 ${
                                                    b.status === 'CONFIRMED' ? 'bg-primary/20 text-primary' :
                                                    b.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'
                                                }`}>{b.status}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-mono">{b.userId?.name || 'Self-Booked'} | {b.userId?.phone || 'N/A'} | Rs. {b.price}</p>
                                        </div>
                                        <p className="text-[9px] text-gray-700 font-mono">{b._id?.slice(-8).toUpperCase()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : slots.length === 0 ? (
                    <Card><p className="text-gray-500 p-6 text-center italic">No slots for this date. Check operating hours and days.</p></Card>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {slots.map(slot => {
                            const existingBooking = getBookingForSlot(slot);
                            const isSelected = bookingSlot?.startTime === slot.startTime;
                            const isDetailOpen = selectedBooking?.startTime === slot.startTime;
                            return (
                                <button
                                    key={slot.startTime}
                                    onClick={() => {
                                        if (!slot.isAvailable && existingBooking) {
                                            setSelectedBooking(isDetailOpen ? null : existingBooking);
                                            setBookingSlot(null);
                                        } else if (slot.isAvailable) {
                                            setBookingSlot(isSelected ? null : slot);
                                            setSelectedBooking(null);
                                        }
                                    }}
                                    className={`p-4 border text-center transition-all ${
                                        !slot.isAvailable
                                            ? isDetailOpen
                                                ? 'border-red-400 bg-red-500/20 cursor-pointer ring-1 ring-red-400'
                                                : 'border-red-500/40 bg-red-500/10 cursor-pointer hover:border-red-400 hover:bg-red-500/20'
                                            : isSelected
                                                ? 'border-primary bg-primary text-black cursor-pointer scale-95'
                                                : 'border-gray-800 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                                    }`}
                                >
                                    <span className={`block font-mono font-black text-xs ${!slot.isAvailable ? 'text-red-400' : isSelected ? 'text-black' : 'text-white'}`}>
                                        {slot.startTime}
                                    </span>
                                    <span className={`block text-[9px] mt-1 font-bold ${!slot.isAvailable ? 'text-red-400/60' : isSelected ? 'text-black/70' : 'text-gray-500'}`}>
                                        {!slot.isAvailable ? 'BOOKED' : `Rs. ${slot.price}`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                
                {bookingSlot && (
                    <div className="flex items-center gap-4 p-4 border border-primary/40 bg-primary/5 animate-in fade-in duration-200">
                        <div className="flex-1">
                            <p className="text-white font-black text-sm uppercase tracking-tight">
                                Book Slot: {bookingSlot.startTime} – {bookingSlot.endTime}
                            </p>
                            <p className="text-primary text-xs font-mono mt-0.5">
                                Rs. {bookingSlot.price} · {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <Button onClick={handleSelfBook} disabled={booking} className="text-xs px-6">
                            {booking ? 'Booking...' : 'Confirm & Book'}
                        </Button>
                        <button onClick={() => setBookingSlot(null)} className="text-gray-500 text-xs hover:text-white transition">Cancel</button>
                    </div>
                )}

                
                {selectedBooking && (
                    <div className="p-5 border border-red-500/30 bg-red-500/[0.04] animate-in fade-in duration-200 relative">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs transition"
                        >✕ Close</button>
                        <p className="text-[9px] text-red-400/60 font-mono uppercase tracking-[0.2em] mb-3">Booked Slot Details</p>
                        <h3 className="text-xl font-black text-white mb-4">{selectedBooking.startTime} – {selectedBooking.endTime}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Player Name</p>
                                <p className="text-white font-bold text-sm uppercase">{selectedBooking.userId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Phone</p>
                                <p className="text-white font-bold text-sm">{selectedBooking.userId?.phone || selectedBooking.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Email</p>
                                <p className="text-white font-bold text-sm">{selectedBooking.userId?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Amount</p>
                                <p className="text-primary font-black text-xl">Rs. {selectedBooking.price}</p>
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
                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-1">Ref ID</p>
                                <p className="text-gray-400 font-mono text-xs">{selectedBooking._id?.slice(-10).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <div className="h-px bg-white/5"></div>

            
            <section className="space-y-5">
                <div className="flex items-center gap-3">
                    {pendingBookings.length > 0 && (
                        <div className="relative h-2.5 w-2.5 flex-shrink-0">
                            <div className="h-2.5 w-2.5 bg-yellow-500 rounded-full animate-ping absolute"></div>
                            <div className="h-2.5 w-2.5 bg-yellow-500 rounded-full"></div>
                        </div>
                    )}
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.1em] border-l-4 border-yellow-500 pl-4">
                        Player Booking Requests
                        {pendingBookings.length > 0 && (
                            <span className="ml-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
                        )}
                    </h2>
                </div>

                {pendingBookings.length === 0 ? (
                    <Card>
                        <div className="p-8 text-center">
                            <p className="text-gray-600 text-2xl mb-2">✓</p>
                            <p className="text-gray-500 italic text-sm">No pending requests. You're all caught up!</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingBookings.map(b => (
                            <Card key={b._id} className="border border-yellow-500/20 bg-yellow-500/[0.03] p-6 relative overflow-hidden hover:border-yellow-500/40 transition-colors">
                                <div className="absolute -right-4 -bottom-2 text-yellow-500/5 text-8xl font-black italic pointer-events-none select-none">REQ</div>
                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <p className="text-[9px] text-yellow-500/60 font-mono uppercase tracking-[0.25em] mb-1">Incoming Booking Request</p>
                                        <h3 className="text-2xl font-display font-black text-white tracking-tight">
                                            {b.startTime} – {b.endTime}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-mono mt-1">
                                            {new Date(b.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-black/30 rounded p-3 space-y-1">
                                        <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2">Player Details</p>
                                        <p className="text-white text-sm font-bold uppercase">{b.userId?.name || 'Unknown Player'}</p>
                                        <p className="text-gray-400 text-[10px] font-mono">{b.userId?.email || 'No Email'}</p>
                                        <p className="text-gray-400 text-[10px] font-mono">{b.userId?.phone || b.phone || 'No Phone'}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-primary font-display font-black text-xl">Rs. {b.price}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleBookingStatus(b._id, 'CONFIRMED')}
                                                className="bg-primary hover:brightness-110 text-black text-[10px] font-black px-4 py-2 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleBookingStatus(b._id, 'CANCELLED')}
                                                className="border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default OwnerManageBookings;
