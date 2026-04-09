import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFutsalDetails } from '../../store/slices/futsalSlice';
import { createBooking } from '../../store/slices/bookingSlice';
import { Button, Card, Input } from '../../components/ui';
import api from '../../services/api';

const FutsalDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { current, loading } = useSelector((state) => state.futsals);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    
    const [bookingDate, setBookingDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    useEffect(() => {
        dispatch(fetchFutsalDetails(id));
    }, [dispatch, id]);

    
    useEffect(() => {
        if (!bookingDate || !id) return;
        
        const fetchSlots = async () => {
            setSlotsLoading(true);
            setSelectedSlot(null);
            setBookingError('');
            setBookingSuccess('');
            try {
                const res = await api.get('/bookings/slots', {
                    params: { futsalId: id, date: bookingDate }
                });
                setSlots(res.data.data);
                if (res.data.message) setBookingError(res.data.message);
            } catch (err) {
                setBookingError('Failed to load slots.');
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSlots();
    }, [bookingDate, id]);

    const handleBooking = async () => {
        if (!isAuthenticated) return navigate('/login');
        if (!selectedSlot) return setBookingError('Please select a time slot.');
        
        setBookingError('');
        setBookingSuccess('');

        const res = await dispatch(createBooking({
            futsalId: id,
            date: bookingDate,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime
        }));

        if (!res.error) {
            const successMsg = user?.role === 'owner' 
                ? 'Booking Confirmed! Access My Bookings to view details.' 
                : 'Booking Pending! Please wait for owner confirmation in My Bookings.';
            setBookingSuccess(successMsg);
            setSelectedSlot(null);
            
            const slotsRes = await api.get('/bookings/slots', { params: { futsalId: id, date: bookingDate } });
            setSlots(slotsRes.data.data);
        } else {
            setBookingError(res.payload?.message || 'This slot may already be booked. Please try another.');
        }
    };

    if (loading || !current) return <div className="p-20 text-center text-primary font-black animate-pulse">LOADING DETAILS...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative h-96 bg-gray-900 border border-gray-800 overflow-hidden group">
                        <img 
                            src={current.images?.[0] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200'} 
                            alt={current.name} 
                            className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute bottom-8 left-8">
                            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">{current.name}</h1>
                            <p className="text-primary/90 font-bold tracking-widest mt-2 uppercase">{current.address}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Card className="text-center">
                            <span className="text-[10px] text-gray-500 block uppercase">Base Rate</span>
                            <span className="text-white font-bold">Rs. {current.pricePerHour}/hr</span>
                        </Card>
                        <Card className="text-center">
                            <span className="text-[10px] text-gray-500 block uppercase">Hours</span>
                            <span className="text-white font-bold">{current.operatingHours?.open || '06:00'} - {current.operatingHours?.close || '22:00'}</span>
                        </Card>
                        <Card className="text-center">
                            <span className="text-[10px] text-gray-500 block uppercase">Days</span>
                            <span className="text-white font-bold text-xs">{current.operatingDays?.join(', ') || 'All Days'}</span>
                        </Card>
                    </div>

                    {current.facilities?.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight border-l-4 border-primary pl-4">Equipment & Amenities</h2>
                            <div className="flex flex-wrap gap-2">
                                {current.facilities.map((ame, i) => (
                                    <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 text-xs font-medium uppercase tracking-tighter border border-gray-700">
                                        {ame}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {current.specialPricing?.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight border-l-4 border-secondary pl-4">Special Rates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {current.specialPricing.map((sp, i) => (
                                    <Card key={i} className="flex justify-between items-center">
                                        <div>
                                            <span className="text-white font-bold text-sm">{sp.label || 'Special'}</span>
                                            <p className="text-[10px] text-gray-500 font-mono mt-1">{sp.day} | {sp.startTime} - {sp.endTime}</p>
                                        </div>
                                        <span className="text-primary font-black">Rs. {sp.pricePerHour}/hr</span>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                
                <div className="space-y-6">
                    <Card className="sticky top-28 border-2 border-primary bg-black shadow-[0_0_30px_rgba(204,255,0,0.1)]">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Book a Slot</h3>
                        
                        
                        <Input 
                            label="Booking Date" 
                            type="date" 
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            required 
                            min={new Date().toISOString().split('T')[0]}
                            max={new Date(new Date().setDate(new Date().getDate() + 21)).toISOString().split('T')[0]}
                        />
                        
                        
                        {bookingDate && (
                            <div className="mt-6">
                                <span className="block text-[10px] text-gray-500 uppercase font-bold mb-3">Available Time Slots</span>
                                {slotsLoading ? (
                                    <p className="text-primary text-xs animate-pulse">Loading slots...</p>
                                ) : slots.length === 0 ? (
                                    <p className="text-gray-500 text-xs italic">No slots available for this date.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot.startTime}
                                                disabled={!slot.isAvailable}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`p-3 text-xs font-bold border transition-all ${
                                                    !slot.isAvailable 
                                                        ? 'border-gray-800 text-gray-700 bg-gray-900/50 cursor-not-allowed line-through' 
                                                        : selectedSlot?.startTime === slot.startTime
                                                            ? 'border-primary bg-primary text-black'
                                                            : 'border-gray-700 text-white hover:border-primary/50 hover:bg-primary/5'
                                                }`}
                                            >
                                                <span className="block font-mono">{slot.startTime} - {slot.endTime}</span>
                                                <span className={`block mt-1 text-[10px] ${
                                                    !slot.isAvailable ? 'text-gray-700' :
                                                    selectedSlot?.startTime === slot.startTime ? 'text-black/70' : 
                                                    slot.price !== current.pricePerHour ? 'text-secondary' : 'text-gray-500'
                                                }`}>
                                                    Rs. {slot.price} {slot.price !== current.pricePerHour ? '★' : ''}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        
                        {selectedSlot && (
                            <div className="border-t border-gray-800 pt-4 mt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 uppercase text-xs">Selected Slot</span>
                                    <span className="text-white font-mono text-sm">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-500 uppercase text-xs">Total</span>
                                    <span className="text-2xl font-black text-primary tracking-tighter">Rs. {selectedSlot.price}</span>
                                </div>
                                <Button onClick={handleBooking} className="w-full text-lg py-4">Confirm Reservation</Button>
                            </div>
                        )}

                        {bookingError && <p className="text-red-500 text-xs mt-4 text-center font-bold uppercase">{bookingError}</p>}
                        {bookingSuccess && <p className="text-primary text-xs mt-4 text-center font-bold uppercase">{bookingSuccess}</p>}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FutsalDetails;
