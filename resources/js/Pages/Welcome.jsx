import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Pannellum } from "pannellum-react";
import axios from 'axios';

export default function Welcome() {
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

    return (
        <>
            <Head title="Taman Alat Virtual Tour" />
            <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
                <Pannellum
                    width="100%"
                    height="100vh"
                    image="https://pannellum.org/images/alma.jpg" // Placeholder image
                    pitch={10}
                    yaw={180}
                    hfov={110}
                    autoLoad
                >
                    {instruments.map(inst => (
                        (inst.pitch !== null && inst.yaw !== null) ? (
                            <Pannellum.Hotspot
                                key={inst.id}
                                type="info"
                                pitch={inst.pitch}
                                yaw={inst.yaw}
                                text={inst.name}
                                handleClick={() => handleHotspotClick(inst)}
                            />
                        ) : null
                    ))}
                </Pannellum>

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
