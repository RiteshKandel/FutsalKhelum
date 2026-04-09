import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFutsals } from '../../store/slices/futsalSlice';
import { Card, Input } from '../../components/ui';
import { Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import api from '../../services/api';

const mapStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 27.7172, lng: 85.3240 };

const CustomerDashboard = () => {
    const dispatch = useDispatch();
    const { list, loading: futsalLoading } = useSelector((s) => s.futsals);

    const [search, setSearch] = useState('');
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [mapRef, setMapRef] = useState(null);
    const [userPos, setUserPos] = useState(null);
    const [nearby, setNearby] = useState([]);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    useEffect(() => {
        dispatch(fetchFutsals());

        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                setUserPos({ lat: latitude, lng: longitude });
                api.get('/futsals/nearby', { params: { lat: latitude, lng: longitude, distance: 15 } })
                    .then(res => setNearby(res.data.data))
                    .catch(() => { });
            }, () => {
                
            });
        }
    }, [dispatch]);

    const activeFutsals = useMemo(() => {
        const source = nearby.length > 0 ? nearby : list;
        return source.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
    }, [nearby, list, search]);

    const handleCardClick = useCallback((futsal) => {
        if (mapRef && futsal.location?.coordinates) {
            mapRef.panTo({ lat: futsal.location.coordinates[1], lng: futsal.location.coordinates[0] });
            mapRef.setZoom(15);
        }
        setSelectedMarker(futsal);
    }, [mapRef]);

    return (
        <div className="flex flex-col h-[calc(100vh-73px)] bg-background">
            <div className="flex flex-grow overflow-hidden">
                
                <div className="w-full md:w-[400px] bg-surface-low border-r border-white/5 flex flex-col overflow-hidden">
                    <div className="p-6 pb-3">
                        <header className="mb-6">
                            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
                                Nearby <span className="text-primary">Grounds.</span>
                            </h2>
                        </header>
                        <Input
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mb-3"
                        />
                    </div>

                    <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-3">
                        {futsalLoading ? (
                            <div className="flex items-center space-x-3 text-primary animate-pulse font-display font-bold uppercase tracking-widest text-[10px]">
                                <div className="w-2 h-2 bg-primary"></div>
                                <span>Loading grounds...</span>
                            </div>
                        ) : activeFutsals.length === 0 ? (
                            <p className="text-gray-600 font-display text-[10px] uppercase tracking-widest italic pt-4">No grounds found in this area.</p>
                        ) : (
                            activeFutsals.map(futsal => (
                                <div key={futsal._id} onClick={() => handleCardClick(futsal)} className="cursor-pointer">
                                    <Card className={`raised-card transition-all duration-300 group p-6 border border-white/5 hover:border-primary/30 relative overflow-hidden ${
                                        selectedMarker?._id === futsal._id 
                                            ? 'bg-primary/5 border-primary/40 shadow-[0_10px_30px_rgba(204,255,0,0.15)] ring-1 ring-primary/20' 
                                            : 'hover:bg-white/[0.02] hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
                                    }`}>
                                        
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/5 via-transparent to-transparent transition-opacity duration-500 pointer-events-none"></div>
                                                                                <div className="flex justify-between items-start">
                                            <h3 className="font-display font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{futsal.name}</h3>
                                            <span className="bg-primary text-background text-[9px] px-2 py-0.5 font-black uppercase flex-shrink-0 ml-2">Live</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-tighter opacity-60">{futsal.address}</p>
                                        <div className="mt-4 flex items-center gap-4 text-[9px] text-gray-600 font-mono">
                                            <span>🕐 {futsal.operatingHours?.open || '06:00'}-{futsal.operatingHours?.close || '22:00'}</span>
                                            <span>📅 {futsal.operatingDays?.length === 7 ? 'All Days' : futsal.operatingDays?.join(', ')}</span>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                                            <span className="text-primary font-display font-bold text-sm tracking-tighter">RS. {futsal.pricePerHour} <span className="text-[10px] opacity-60">/ HR</span></span>
                                            <Link to={`/futsal/${futsal._id}`} onClick={e => e.stopPropagation()} className="text-[9px] text-black bg-primary px-3 py-1.5 font-black uppercase tracking-widest hover:bg-primary/80 transition">
                                                Book Now
                                            </Link>
                                        </div>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                
                <div className="flex-grow bg-black relative overflow-hidden hidden md:block">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={mapStyle}
                            center={userPos || defaultCenter}
                            zoom={13}
                            onLoad={map => setMapRef(map)}
                            mapTypeId="hybrid"
                            options={{ 
                                disableDefaultUI: true, 
                                zoomControl: true, 
                                mapTypeControl: false,
                                mapTypeId: 'hybrid'
                            }}
                        >
                            {activeFutsals.map(futsal => {
                                if (!futsal.location?.coordinates || (futsal.location.coordinates[0] === 0 && futsal.location.coordinates[1] === 0)) return null;
                                return (
                                    <MarkerF 
                                        key={futsal._id} 
                                        position={{ lat: futsal.location.coordinates[1], lng: futsal.location.coordinates[0] }} 
                                        onClick={() => setSelectedMarker(futsal)}
                                        icon={{
                                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                                            fillColor: "#CCFF00",
                                            fillOpacity: 1,
                                            strokeWeight: 0,
                                            scale: 1.5,
                                            anchor: { x: 12, y: 22 },
                                            labelOrigin: { x: 12, y: -10 }
                                        }}
                                        label={{
                                            text: futsal.name,
                                            className: 'marker-label'
                                        }}
                                    />
                                );
                            })}
                            {selectedMarker && selectedMarker.location?.coordinates?.[0] !== 0 && (
                                <InfoWindowF position={{ lat: selectedMarker.location.coordinates[1], lng: selectedMarker.location.coordinates[0] }} onCloseClick={() => setSelectedMarker(null)}>
                                <div className="bg-zinc-950 p-0 rounded-lg overflow-hidden min-w-[170px] border border-white/10 shadow-2xl">
                                    <div className="relative h-16 bg-zinc-900 overflow-hidden">
                                        {selectedMarker.images?.[0] ? (
                                            <img src={selectedMarker.images[0]} alt={selectedMarker.name} className="w-full h-full object-cover opacity-80" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-black flex items-center justify-center">
                                                <span className="text-primary/10 font-display font-black text-2xl uppercase">Futsal</span>
                                            </div>
                                        )}
                                        <div className="absolute top-1 left-1 z-10">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMarker(null);
                                                }}
                                                className="bg-black/50 hover:bg-black text-white w-5 h-5 flex items-center justify-center rounded-full transition-colors text-[10px]"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="absolute top-1 right-1">
                                            <span className="bg-primary text-black text-[7px] px-1.5 py-0.5 font-black uppercase rounded shadow-[0_0_5px_rgba(204,255,0,0.5)]">Live</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-zinc-950">
                                        <h4 className="text-white font-display font-black text-sm uppercase tracking-tight leading-none mb-0.5">{selectedMarker.name}</h4>
                                        <p className="text-zinc-500 text-[8px] font-mono uppercase tracking-tighter mb-2 truncate">
                                            {selectedMarker.address}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <div>
                                                <span className="text-primary font-display font-black text-sm leading-none">Rs. {selectedMarker.pricePerHour}</span>
                                            </div>
                                            <Link 
                                                to={`/futsal/${selectedMarker._id}`} 
                                                className="bg-primary hover:bg-white text-black px-3 py-1.5 rounded font-display font-black text-[8px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                                            >
                                                Book
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                </InfoWindowF>
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-primary font-display font-black animate-pulse">Loading map...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
