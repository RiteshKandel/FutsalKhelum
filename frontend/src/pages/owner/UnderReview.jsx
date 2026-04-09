import { Card } from '../../components/ui';
import { motion } from 'framer-motion';

const UnderReview = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4 relative overflow-hidden font-inter">
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(204,255,0,0.05),transparent_70%)]"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            
            <div className="relative z-10 w-full max-w-3xl text-center">
                <header className="mb-16">
                    <h2 className="text-6xl md:text-9xl font-display font-black text-white uppercase leading-[0.8] tracking-tighter">
                        Review in <br/><span className="text-primary text-outline">Progress.</span>
                    </h2>
                </header>

                <Card className="p-12 border-t-4 border-t-primary bg-zinc-950/50 backdrop-blur-xl">
                    <div className="flex flex-col items-center space-y-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center animate-spin-slow">
                                <div className="w-16 h-16 rounded-full border-b-2 border-primary"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-primary font-mono text-[10px] font-bold">WAITING</span>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-md">
                            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Account Under Review</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Our administrative team is currently verifying your ground details. 
                                We ensure every arena meets the FutsalKhelum standard before going live.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 w-full pt-8 border-t border-white/5 opacity-40">
                            <div className="text-left">
                                <span className="block text-[8px] font-mono text-zinc-600 uppercase mb-1">Queue Status</span>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Priority Phase 1</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-[8px] font-mono text-zinc-600 uppercase mb-1">Expected Sync</span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">12 - 24 Hours</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => window.location.href = '/'}
                            className="mt-8 px-8 py-3 border border-white/10 text-white font-display font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500"
                        >
                            Return Home
                        </button>
                    </div>
                </Card>

                </div>
            </div>
    );
};

export default UnderReview;
