import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
      return <div className="p-10 text-red-500">
        <h1>Terjadi kesalahan pada Viewer 360.</h1>
        <pre>{this.state.error && this.state.error.toString()}</pre>
      </div>;
    }
    return this.props.children;
  }
}

export default function VirtualTour({ tourSpot }) {
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState(null);

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

    const tourImage = tourSpot?.image_path || 'https://pannellum.org/images/alma.jpg';

    return (
        <>
            <Head title="Taman Alat Virtual Tour" />
            <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
                <a href="/" className="absolute top-4 left-4 z-50 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md font-bold hover:bg-gray-100 transition-colors">
                    &larr; Kembali ke Beranda
                </a>
                <ErrorBoundary>
                    <Pannellum
                        width="100%"
                        height="100vh"
                        image={tourImage}
                        pitch={10}
                        yaw={tourSpot && tourSpot.yaw ? tourSpot.yaw : 180}
                        hfov={110}
                        autoLoad
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

                {/* Info Card Pop-up */}
                {selectedInstrument && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md z-50">
                        <button 
                            onClick={closePopup}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 p-2"
                        >
                            X
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">{selectedInstrument.name}</h2>
                        
                        {selectedInstrument.category && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide mb-4">
                                {selectedInstrument.category}
                            </span>
                        )}

                        {selectedInstrument.image_path && (
                            <img src={selectedInstrument.image_path} alt={selectedInstrument.name} className="w-full h-48 object-cover rounded-md mb-4" />
                        )}

                        <p className="text-gray-600 mb-4 whitespace-pre-line">
                            {selectedInstrument.description || "Belum ada deskripsi untuk alat ini."}
                        </p>

                        {selectedInstrument.function && (
                            <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-700">Fungsi:</p>
                                <p className="text-gray-600 whitespace-pre-line">{selectedInstrument.function}</p>
                            </div>
                        )}

                        {selectedInstrument.working_principle && (
                            <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-700">Cara Kerja:</p>
                                <p className="text-gray-600 whitespace-pre-line">{selectedInstrument.working_principle}</p>
                            </div>
                        )}

                        {selectedInstrument.audio_path && (
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Dengarkan Penjelasan:</p>
                                <audio controls className="w-full">
                                    <source src={selectedInstrument.audio_path} type="audio/mpeg" />
                                    Browser Anda tidak mendukung elemen audio.
                                </audio>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
