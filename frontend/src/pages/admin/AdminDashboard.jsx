import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { Card, Button } from '../../components/ui';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const defaultCenter = { lat: 27.7172, lng: 85.324 };

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#000000" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
];

const AdminDashboard = () => {
    const [pendingFutsals, setPendingFutsals] = useState([]);
    const [allFutsals, setAllFutsals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [markerPositions, setMarkerPositions] = useState({});
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pending'

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pendingRes, allRes] = await Promise.all([
                    api.get('/futsals/pending'),
                    api.get('/futsals')
                ]);
                setPendingFutsals(pendingRes.data.data);
                setAllFutsals(allRes.data.data);

                // Init marker positions for pending futsals
                const positions = {};
                pendingRes.data.data.forEach(f => {
                    if (f.location?.coordinates?.[0] && f.location?.coordinates?.[1]) {
                        positions[f._id] = { lat: f.location.coordinates[1], lng: f.location.coordinates[0] };
                    }
                });
                setMarkerPositions(positions);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleMapClick = useCallback((futsalId, e) => {
        setMarkerPositions(prev => ({ ...prev, [futsalId]: { lat: e.latLng.lat(), lng: e.latLng.lng() } }));
    }, []);

    const handleVerify = async (id) => {
        try {
            const position = markerPositions[id];
            await api.put(`/futsals/${id}/verify`, position ? { lat: position.lat, lng: position.lng } : {});
            alert('Futsal authorized!');
            setPendingFutsals(pendingFutsals.filter(o => o._id !== id));
            // Refresh all futsals
            const res = await api.get('/futsals');
            setAllFutsals(res.data.data);
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">LOADING ADMIN HUB...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-73px)]">
            {/* Top Tab Bar */}
            <div className="bg-surface-low border-b border-white/5 px-6 py-3 flex items-center gap-6 shrink-0">
                <div className="flex-grow">
                    <h1 className="text-xl font-black text-white uppercase tracking-tighter inline mr-6">Admin Hub</h1>
                    <button onClick={() => setActiveTab('overview')} className={`text-[10px] font-display font-black uppercase tracking-widest pb-1 border-b-2 transition mr-6 ${activeTab === 'overview' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'}`}>
                        All Futsals ({allFutsals.length})
                    </button>
                    <button onClick={() => setActiveTab('pending')} className={`text-[10px] font-display font-black uppercase tracking-widest pb-1 border-b-2 transition ${activeTab === 'pending' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'}`}>
                        Pending ({pendingFutsals.length})
                    </button>
                </div>
            </div>

            {activeTab === 'overview' ? (
                <div className="flex flex-grow overflow-hidden">
                    {/* Sidebar: All Futsals */}
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

                    {/* Map */}
                    <div className="flex-grow bg-black relative hidden md:block">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={defaultCenter}
                                zoom={12}
                                options={{ styles: darkMapStyle, disableDefaultUI: true, zoomControl: true, mapTypeControl: true, mapTypeControlOptions: { position: 3 } }}
                            >
                                {allFutsals.map(f => {
                                    if (!f.location?.coordinates || (f.location.coordinates[0] === 0 && f.location.coordinates[1] === 0)) return null;
                                    return <MarkerF key={f._id} position={{ lat: f.location.coordinates[1], lng: f.location.coordinates[0] }} title={f.name} onClick={() => setSelectedMarker(f)} />;
                                })}
                                {selectedMarker && selectedMarker.location?.coordinates?.[0] !== 0 && (
                                    <InfoWindowF position={{ lat: selectedMarker.location.coordinates[1], lng: selectedMarker.location.coordinates[0] }} onCloseClick={() => setSelectedMarker(null)}>
                                        <div style={{ background: '#000', padding: '12px', borderRadius: '4px', minWidth: '180px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{selectedMarker.name}</h4>
                                            <p style={{ color: '#888', fontSize: '10px', margin: '4px 0', fontFamily: 'monospace' }}>{selectedMarker.address}</p>
                                            <p style={{ color: '#ccff00', fontWeight: 900, fontSize: '12px' }}>Rs. {selectedMarker.pricePerHour}/hr</p>
                                            <p style={{ color: '#666', fontSize: '9px', marginTop: '4px' }}>Hours: {selectedMarker.operatingHours?.open}-{selectedMarker.operatingHours?.close}</p>
                                        </div>
                                    </InfoWindowF>
                                )}
                            </GoogleMap>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center"><p className="text-primary animate-pulse">Loading Map...</p></div>
                        )}
                    </div>
                </div>
            ) : (
                /* Pending Tab */
                <div className="flex-grow overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter border-l-4 border-primary pl-4">Verification Queue</h2>
                    {pendingFutsals.length === 0 ? (
                        <Card><p className="text-gray-500 p-8 text-center italic">No pending verifications.</p></Card>
                    ) : (
                        pendingFutsals.map(futsal => (
                            <Card key={futsal._id} className="p-0 overflow-hidden">
                                <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition" onClick={() => setExpandedId(expandedId === futsal._id ? null : futsal._id)}>
                                    <div>
                                        <h3 className="text-lg font-bold text-white uppercase">{futsal.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono mt-1">Owner: {futsal.ownerId?.name} | {futsal.ownerId?.email} | {futsal.ownerId?.phone}</p>
                                    </div>
                                    <span className="text-primary font-mono">{expandedId === futsal._id ? '▲' : '▼'}</span>
                                </div>
                                {expandedId === futsal._id && (
                                    <div className="border-t border-gray-800 p-5 space-y-4 bg-black/40">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div><span className="block text-[10px] text-gray-500 uppercase font-bold">Address</span><span className="text-white text-sm">{futsal.address}</span></div>
                                            <div><span className="block text-[10px] text-gray-500 uppercase font-bold">Phone</span><span className="text-white text-sm">{futsal.ownerId?.phone || 'N/A'}</span></div>
                                            <div>
                                                <span className="block text-[10px] text-gray-500 uppercase font-bold">Coords</span>
                                                <span className="text-primary font-mono text-xs">
                                                    {markerPositions[futsal._id] ? `${markerPositions[futsal._id].lat.toFixed(5)}, ${markerPositions[futsal._id].lng.toFixed(5)}` : 'Click map to set'}
                                                </span>
                                            </div>
                                        </div>
                                        {isLoaded && (
                                            <div className="border border-gray-800 rounded overflow-hidden">
                                                <GoogleMap
                                                    mapContainerStyle={{ width: '100%', height: '260px' }}
                                                    center={markerPositions[futsal._id] || defaultCenter}
                                                    zoom={13}
                                                    onClick={(e) => handleMapClick(futsal._id, e)}
                                                    options={{ styles: darkMapStyle, disableDefaultUI: true, zoomControl: true, mapTypeControl: true, mapTypeControlOptions: { position: 3 } }}
                                                >
                                                    {markerPositions[futsal._id] && <MarkerF position={markerPositions[futsal._id]} />}
                                                </GoogleMap>
                                            </div>
                                        )}
                                        <div className="flex gap-3 pt-2">
                                            <Button onClick={() => handleVerify(futsal._id)}>Authorize & Set Location</Button>
                                            <Button variant="danger">Reject</Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
