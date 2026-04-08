import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../../store/slices/bookingSlice';
import { Card } from '../../components/ui';

const MyBookings = () => {
    const dispatch = useDispatch();
    const { myBookings, loading } = useSelector((s) => s.bookings);

    useEffect(() => {
        dispatch(fetchMyBookings());
    }, [dispatch]);

    return (
        <div className="flex-grow overflow-y-auto p-6 max-w-7xl mx-auto w-full min-h-[calc(100vh-73px)] bg-black">
            <header className="mb-8">
                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter border-l-4 border-primary pl-6">
                    My <span className="text-primary">Bookings.</span>
                </h2>
            </header>

            {loading ? (
                <div className="flex items-center space-x-3 text-primary animate-pulse font-display font-bold uppercase tracking-widest text-[10px]">
                    <div className="w-2 h-2 bg-primary"></div>
                    <span>Loading bookings...</span>
                </div>
            ) : myBookings.length === 0 ? (
                <Card className="border-dashed border-gray-800 bg-transparent py-20">
                    <p className="text-gray-600 text-center font-display text-xs uppercase tracking-[0.2em] italic">No bookings found. <br/><span className="text-primary/50 not-italic mt-2 block">Book your first ground today.</span></p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...myBookings]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((booking, idx) => (
                        <Card key={booking._id} className="relative group overflow-hidden border-2 border-white/5 hover:border-primary/30 transition-all duration-500 bg-surface-low">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 -mr-10 -mt-10 rotate-45 group-hover:bg-primary/10 transition-colors"></div>
                            
                            <div className="relative z-10 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">Booking #{idx + 1}</span>
                                    <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                                        booking.status === 'CONFIRMED' ? 'border-primary text-primary bg-primary/5' : 
                                        booking.status === 'CANCELLED' ? 'border-red-500 text-red-500 bg-red-500/5' : 
                                        'border-gray-500 text-gray-400 bg-gray-500/5'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">{booking.futsalId?.name || 'Unknown Ground'}</h3>
                                <p className="text-[10px] text-gray-500 font-mono uppercase mb-4 opacity-70 italic tracking-tighter">Location: {booking.futsalId?.address || 'Not available'}</p>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                                        <span>BOOKING DATE:</span>
                                        <span className="text-white font-bold">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                                        <span>TIME:</span>
                                        <span className="text-primary font-bold">{booking.startTime} - {booking.endTime}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Booking ID</p>
                                        <p className="text-[10px] text-gray-400 font-mono uppercase truncate w-32">{booking._id.substr(-12).toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Price</p>
                                        <p className="text-lg font-display font-black text-white leading-none">Rs. {booking.price}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
