import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Pannellum } from "pannellum-react";
import axios from 'axios';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">
        <h1 className="font-bold text-lg mb-2">Terjadi kesalahan pada Viewer 360.</h1>
        <pre className="text-sm overflow-x-auto">{this.state.error && this.state.error.toString()}</pre>
      </div>;
    }
    return this.props.children;
  }
}

export default function VirtualTour() {
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    useEffect(() => {
        // Fetch instruments from API
        axios.get('/api/instruments')
            .then(response => {
                setInstruments(response.data);
            })
            .catch(error => console.error("Error fetching instruments:", error));
    }, []);

    const handleHotspotClick = (instrument) => {
        setSelectedInstrument(instrument);
    };

    const closePopup = () => {
        setSelectedInstrument(null);
    };

    return (
        <>
            <Head title="Virtual Tour 360° - Taman Alat BMKG" />
            
            <div className="relative w-screen h-screen overflow-hidden bg-gray-950 select-none">
                {/* 360 Panorama Viewer */}
                <ErrorBoundary>
                    <Pannellum
                        width="100%"
                        height="100vh"
                        image="/images/virtual_tour_360.png"
                        haov={360}
                        vaov={180}
                        vOffset={0}
                        pitch={0}
                        yaw={0}
                        hfov={100}
                        minHfov={40}
                        maxHfov={125}
                        minPitch={-90}
                        maxPitch={90}
                        showZoomCtrl={true}
                        showFullscreenCtrl={true}
                        autoLoad={true}
                    >
                        {instruments
                            .filter(inst => inst.pitch !== null && inst.yaw !== null)
                            .map(inst => (
                                <Pannellum.Hotspot
                                    key={inst.id}
                                    type="info"
                                    pitch={inst.pitch}
                                    yaw={inst.yaw}
                                    text={inst.name}
                                    handleClick={() => handleHotspotClick(inst)}
                                />
                        ))}
                    </Pannellum>
                </ErrorBoundary>

                {/* Floating Top Navigation Bar */}
                <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 font-semibold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md transition-all transform hover:scale-105 text-sm border border-white/40"
                        >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Kembali ke Beranda</span>
                        </Link>
                        
                        <div className="hidden sm:flex items-center bg-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                            Taman Alat BMKG &bull; 360° View
                        </div>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                        <button
                            onClick={() => setShowDrawer(!showDrawer)}
                            className="inline-flex items-center gap-2 bg-blue-600/90 hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105 text-sm border border-blue-400/30"
                        >
                            <span>📋</span>
                            <span className="hidden sm:inline">Daftar Alat</span>
                            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-bold">
                                {instruments.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Bottom Floating Hint Bar */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:block">
                    <div className="bg-gray-900/75 backdrop-blur-md text-white/90 text-xs px-5 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <span>🔄</span> Geser kursor untuk memutar 360°
                        </span>
                        <span className="text-white/30">&bull;</span>
                        <span className="flex items-center gap-1.5">
                            <span>🔍</span> Scroll mouse untuk zoom
                        </span>
                        <span className="text-white/30">&bull;</span>
                        <span className="flex items-center gap-1.5">
                            <span>📍</span> Klik ikon titik untuk detail instrumen
                        </span>
                    </div>
                </div>

                {/* Sliding Instruments Drawer */}
                {showDrawer && (
                    <div 
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
                        onClick={() => setShowDrawer(false)}
                    >
                        <div 
                            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Daftar Instrumen BMKG</h2>
                                    <p className="text-xs text-gray-500">Pilih alat untuk melihat detail penjelasan</p>
                                </div>
                                <button 
                                    onClick={() => setShowDrawer(false)}
                                    className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 space-y-3">
                                {instruments.map(inst => (
                                    <div 
                                        key={inst.id}
                                        onClick={() => {
                                            handleHotspotClick(inst);
                                            setShowDrawer(false);
                                        }}
                                        className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <h3 className="font-bold text-sm text-gray-800 group-hover:text-blue-700">
                                                {inst.name}
                                            </h3>
                                            {inst.category && (
                                                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold shrink-0">
                                                    {inst.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {inst.description || "Klik untuk melihat detail instrumen ini."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Card Pop-up Modal */}
                {selectedInstrument && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={closePopup}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={closePopup}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            
                            <div className="mb-3">
                                {selectedInstrument.category && (
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full uppercase font-semibold tracking-wide mb-2">
                                        {selectedInstrument.category}
                                    </span>
                                )}
                                <h2 className="text-2xl font-bold text-gray-900">{selectedInstrument.name}</h2>
                            </div>

                            {selectedInstrument.image_path && (
                                <img src={selectedInstrument.image_path} alt={selectedInstrument.name} className="w-full h-48 object-cover rounded-xl mb-4 border border-gray-100" />
                            )}

                            <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {selectedInstrument.description || "Belum ada deskripsi untuk alat ini."}
                            </p>

                            {selectedInstrument.audio_path && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
                                        <span>🔊</span> Dengarkan Penjelasan:
                                    </p>
                                    <audio controls className="w-full">
                                        <source src={selectedInstrument.audio_path} type="audio/mpeg" />
                                        Browser Anda tidak mendukung elemen audio.
                                    </audio>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closePopup}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
