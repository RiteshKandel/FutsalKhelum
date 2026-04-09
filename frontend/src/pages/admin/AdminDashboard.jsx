import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const defaultCenter = { lat: 27.7172, lng: 85.324 };

const AdminDashboard = () => {
    const [allFutsals, setAllFutsals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/futsals/admin/all');
                setAllFutsals(res.data.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">LOADING ADMIN HUB...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-73px)]">
            <div className="bg-surface-low border-b border-white/5 px-6 py-3 flex items-center gap-6 shrink-0">
                <div className="flex-grow">
                    <h1 className="text-xl font-black text-white uppercase tracking-tighter inline mr-6">Admin Hub</h1>
                    <span className="text-[10px] font-display font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-1">
                        All Futsals ({allFutsals.length})
                    </span>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden">
                <div className="w-full md:w-[420px] bg-surface-low border-r border-white/5 overflow-y-auto p-6 space-y-3">
                    {allFutsals.length === 0 ? (
                        <p className="text-gray-500 italic text-xs">No listed futsals yet.</p>
                    ) : (
                        allFutsals.map(f => (
                            <Card key={f._id} className={`p-4 border-l-2 cursor-pointer transition-all hover:border-primary/50 ${selectedMarker?._id === f._id ? 'border-l-primary bg-primary/5' : 'border-l-gray-800'}`}
                                onClick={() => setSelectedMarker(f)}>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white uppercase text-sm">{f.name}</h3>
                                    <span className={`text-[8px] px-2 py-0.5 font-black uppercase border ${f.isListed ? 'border-primary text-primary' : 'border-gray-600 text-gray-600'}`}>
                                        {f.isListed ? 'Live' : 'Unlisted'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 font-mono">{f.address}</p>
                                <div className="mt-2 flex items-center justify-between text-[9px] text-gray-600 font-mono">
                                    <span>Rs. {f.pricePerHour}/hr</span>
                                    <span>{f.operatingHours?.open || '06:00'}-{f.operatingHours?.close || '22:00'}</span>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                <div className="flex-grow bg-black relative hidden md:block">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={defaultCenter}
                            zoom={12}
                            mapTypeId="hybrid"
                            options={{ disableDefaultUI: true, zoomControl: true, mapTypeControl: false, mapTypeId: 'hybrid' }}
                        >
                            {allFutsals.map(f => {
                                if (!f.location?.coordinates || (f.location.coordinates[0] === 0 && f.location.coordinates[1] === 0)) return null;
                                return (
                                    <MarkerF 
                                        key={f._id} 
                                        position={{ lat: f.location.coordinates[1], lng: f.location.coordinates[0] }} 
                                        onClick={() => setSelectedMarker(f)}
                                        icon={{
                                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                                            fillColor: "#CCFF00",
                                            fillOpacity: 1,
                                            strokeWeight: 0,
                                            scale: 1.5,
                                            anchor: { x: 12, y: 22 },
                                            labelOrigin: { x: 12, y: -10 }
                                        }}
                                        label={{ text: f.name, className: 'marker-label' }}
                                    />
                                );
                            })}
                            {selectedMarker && selectedMarker.location?.coordinates?.[0] !== 0 && (
                                <InfoWindowF position={{ lat: selectedMarker.location.coordinates[1], lng: selectedMarker.location.coordinates[0] }} onCloseClick={() => setSelectedMarker(null)}>
                                    <div style={{ background: '#000', padding: '12px', borderRadius: '4px', minWidth: '180px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{selectedMarker.name}</h4>
                                        <p style={{ color: '#888', fontSize: '10px', margin: '4px 0', fontFamily: 'monospace' }}>{selectedMarker.address}</p>
                                        <p style={{ color: '#ccff00', fontWeight: 900, fontSize: '12px' }}>Rs. {selectedMarker.pricePerHour}/hr</p>
                                        <p style={{ color: '#666', fontSize: '9px', marginTop: '4px' }}>Hours: {selectedMarker.operatingHours?.open}-{selectedMarker.operatingHours?.close}</p>
                                        {selectedMarker.isBlocked && <p style={{ color: '#ff4444', fontWeight: 900, fontSize: '10px', marginTop: '4px' }}>BLOCKED INCIDENT</p>}
                                    </div>
                                </InfoWindowF>
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><p className="text-primary animate-pulse">Loading Map...</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
