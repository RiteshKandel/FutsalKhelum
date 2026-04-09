import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { Card, Button } from '../../components/ui';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const defaultCenter = { lat: 27.7172, lng: 85.324 };

const AdminManageFutsals = () => {
    const [pendingFutsals, setPendingFutsals] = useState([]);
    const [activeFutsals, setActiveFutsals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPendingId, setExpandedPendingId] = useState(null);
    const [expandedActiveId, setExpandedActiveId] = useState(null);
    const [markerPositions, setMarkerPositions] = useState({});
    const [activeTab, setActiveTab] = useState('manage');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes] = await Promise.all([
                api.get('/futsals/pending'),
                api.get('/futsals/admin/all')
            ]);
            setPendingFutsals(pendingRes.data.data);
            setActiveFutsals(allRes.data.data);

            const positions = {};
            pendingRes.data.data.forEach(f => {
                if (f.location?.coordinates?.[0] && f.location?.coordinates?.[1]) {
                    positions[f._id] = { lat: f.location.coordinates[1], lng: f.location.coordinates[0] };
                }
            });
            setMarkerPositions(positions);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMapClick = useCallback((futsalId, e) => {
        setMarkerPositions(prev => ({ ...prev, [futsalId]: { lat: e.latLng.lat(), lng: e.latLng.lng() } }));
    }, []);

    const handleVerify = async (id) => {
        try {
            const position = markerPositions[id];
            await api.put(`/futsals/${id}/verify`, position ? { lat: position.lat, lng: position.lng } : {});
            alert('Futsal authorized!');
            fetchData();
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleToggleBlock = async (id) => {
        try {
            const res = await api.put(`/futsals/${id}/toggle-block`);
            alert(res.data.message);
            fetchData();
        } catch (err) {
            alert('Failed to update block status: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">LOADING MANAGEMENT CONSOLE...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-73px)] overflow-hidden">
            <div className="bg-surface-low border-b border-white/5 px-6 py-3 flex items-center gap-6 shrink-0 z-10">
                <div className="flex-grow">
                    <h1 className="text-xl font-black text-white uppercase tracking-tighter inline mr-6">Manage Futsals</h1>
                    <button onClick={() => setActiveTab('manage')} className={`text-[10px] font-display font-black uppercase tracking-widest pb-1 border-b-2 transition mr-6 ${activeTab === 'manage' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'}`}>
                        Active Directory ({activeFutsals.length})
                    </button>
                    <button onClick={() => setActiveTab('pending')} className={`text-[10px] font-display font-black uppercase tracking-widest pb-1 border-b-2 transition ${activeTab === 'pending' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'}`}>
                        Verification Queue ({pendingFutsals.length})
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4">
                {activeTab === 'pending' ? (
                    <>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter border-l-4 border-primary pl-4">Pending Verifications</h2>
                        {pendingFutsals.length === 0 ? (
                            <Card><p className="text-gray-500 p-8 text-center italic">No pending verifications.</p></Card>
                        ) : (
                            pendingFutsals.map(futsal => (
                                <Card key={futsal._id} className="p-0 overflow-hidden">
                                    <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition" onClick={() => setExpandedPendingId(expandedPendingId === futsal._id ? null : futsal._id)}>
                                        <div>
                                            <h3 className="text-lg font-bold text-white uppercase">{futsal.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1">Owner: {futsal.ownerId?.name} | {futsal.ownerId?.email} | {futsal.ownerId?.phone}</p>
                                        </div>
                                        <span className="text-primary font-mono">{expandedPendingId === futsal._id ? '▲' : '▼'}</span>
                                    </div>
                                    {expandedPendingId === futsal._id && (
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
                                                        mapTypeId="hybrid"
                                                        onClick={(e) => handleMapClick(futsal._id, e)}
                                                        options={{ disableDefaultUI: true, zoomControl: true, mapTypeControl: false, mapTypeId: 'hybrid' }}
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
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter border-l-4 border-primary pl-4">Active & Blocked Directory</h2>
                        {activeFutsals.length === 0 ? (
                            <Card><p className="text-gray-500 p-8 text-center italic">No active futsals to manage.</p></Card>
                        ) : (
                            activeFutsals.map(futsal => (
                                <Card key={futsal._id} className="p-0 overflow-hidden">
                                    <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition" onClick={() => setExpandedActiveId(expandedActiveId === futsal._id ? null : futsal._id)}>
                                        <div>
                                            <h3 className="text-lg font-bold text-white uppercase flex items-center gap-3">
                                                {futsal.name}
                                                {futsal.isBlocked && <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded uppercase tracking-widest">Blocked</span>}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1">Owner: {futsal.ownerId?.name}</p>
                                        </div>
                                        <span className="text-primary font-mono">{expandedActiveId === futsal._id ? '▲' : '▼'}</span>
                                    </div>
                                    {expandedActiveId === futsal._id && (
                                        <div className="border-t border-gray-800 p-5 space-y-4 bg-black/40">
                                            <div className="flex gap-4">
                                                <Button 
                                                    variant={futsal.isBlocked ? "primary" : "danger"} 
                                                    onClick={() => handleToggleBlock(futsal._id)}
                                                >
                                                    {futsal.isBlocked ? 'Restore Access (Unblock)' : 'Revoke Access (Block)'}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {futsal.isBlocked 
                                                    ? 'This futsal is currently hidden from user searches and map.' 
                                                    : 'Revoking access will temporarily hide this futsal from all user searches and map views.'}
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminManageFutsals;
