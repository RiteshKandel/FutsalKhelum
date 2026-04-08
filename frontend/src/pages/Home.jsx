import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const Home = () => {
    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center text-center px-4">
            {/* Background scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/5 via-transparent to-black"></div>

            <div className="relative z-10 max-w-5xl">
                <div className="inline-block border border-primary px-6 py-2 mb-8 bg-primary/10 animate-pulse">
                    <span className="text-primary font-bold uppercase tracking-[0.4em] text-xs">Tactical Booking Command Center</span>
                </div>
                
                <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                    DOMINATE <br/> <span className="text-primary">THE TURF.</span>
                </h1>
                
                <p className="text-gray-400 text-lg md:text-2xl font-light tracking-widest max-w-2xl mx-auto mb-12 uppercase italic px-4">
                    High-performance Futsal instrumentation for the next generation of players and owners.
                </p>

                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
                    <Link to="/search">
                        <Button className="text-xl px-12 py-5 w-full md:w-auto">Locate Grounds</Button>
                    </Link>
                    <Link to="/register?role=OWNER">
                        <Button variant="secondary" className="text-xl px-12 py-5 w-full md:w-auto">Register Pitch</Button>
                    </Link>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-left border-t border-gray-900 pt-12">
                    <div className="space-y-2">
                        <span className="text-primary font-black text-2xl tracking-tighter">01.</span>
                        <h3 className="text-white font-bold uppercase text-lg">Geospatial Edge</h3>
                        <p className="text-gray-600 text-sm italic font-mono uppercase tracking-tighter">Locate precisely within meters using satellite data.</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-primary font-black text-2xl tracking-tighter">02.</span>
                        <h3 className="text-white font-bold uppercase text-lg">Instant Lock</h3>
                        <p className="text-gray-600 text-sm italic font-mono uppercase tracking-tighter">Real-time scheduling with zero collision protocol.</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-primary font-black text-2xl tracking-tighter">03.</span>
                        <h3 className="text-white font-bold uppercase text-lg">Elite Oversight</h3>
                        <p className="text-gray-600 text-sm italic font-mono uppercase tracking-tighter">Comprehensive instrumentation for pitch managers.</p>
                    </div>
                </div>
            </div>

            {/* Corner HUD elements */}
            <div className="absolute top-12 left-12 hidden lg:block opacity-30">
                <div className="text-primary font-mono text-[10px] space-y-1">
                    <p>SYST_LOD: 0.84</p>
                    <p>GRID_STS: NOMINAL</p>
                    <p>CNCT_ID: F_KH_99</p>
                </div>
            </div>
            <div className="absolute bottom-12 right-12 hidden lg:block opacity-30">
                <div className="text-primary font-mono text-[10px] space-y-1 text-right">
                    <p>LAT: 27.7172 N</p>
                    <p>LON: 85.3240 E</p>
                    <p>T-MT: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
