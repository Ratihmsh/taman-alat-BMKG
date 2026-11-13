import React, { useState, useEffect } from 'react';

export default function SimulasiAutomaticWeatherStation() {
    // 1. Skenario Cuaca Terpadu:
    // 'clear' (Cerah Normal Tropis),
    // 'storm' (Badai Konvektif Cumulonimbus / Hujan Ekstrem & Angin Kencang)
    const [weatherScenario, setWeatherScenario] = useState('clear');

    // 2. Sensor yang Sedang Dipilih / Diinspeksi (Klik Sensor di Menara)
    // 'wind', 'solar', 'temp_rh', 'rain', 'pressure', 'logger', 'lightning'
    const [selectedSensor, setSelectedSensor] = useState('logger');

    // 3. Status Jaringan Seluler / Telemetri GSM
    // true = Sinyal 4G Normal, false = Blank Spot (Offline Buffer)
    const [isSignalOnline, setIsSignalOnline] = useState(true);

    // 4. Counter Data Tertahan di Memori Internal Datalogger saat Blank Spot
    const [bufferedDataCount, setBufferedDataCount] = useState(0);

    // 5. Animasi Pulsa Transmisi Data ke Server Pusat BMKG
    const [isTransmitting, setIsTransmitting] = useState(false);

    // --- FITUR BARU 1: COUNTDOWN TIMER INTERVAL TRANSMISI 10 MENIT ---
    // Dipercepat menjadi siklus 10 detik untuk keperluan simulasi interaktif
    const [countdownSeconds, setCountdownSeconds] = useState(10);

    // --- FITUR BARU 2: SISTEM PROTEKSI PETIR & GROUNDING ---
    // isGroundingGood = true (<= 5 Ohm, aman), false (> 5 Ohm, datalogger rentan hang tersambar petir)
    const [isGroundingGood, setIsGroundingGood] = useState(true);
    const [isLoggerFallenByLightning, setIsLoggerFallenByLightning] = useState(false);

    // --- FITUR BARU 3: DEGRADASI PANEL SURYA AKIBAT DEBU / KOTORAN BURUNG ---
    const [isSolarDirty, setIsSolarDirty] = useState(false);

    // --- FITUR BARU 4: MODAL POP-UP DISEMINASI PERINGATAN DINI BENCANA INFOBMKG ---
    const [showDisseminationModal, setShowDisseminationModal] = useState(false);

    // --- DATA MULTI-SENSOR REAL-TIME MENGIKUTI SKENARIO CUACA ---
    const baseSolarW = isSolarDirty ? 18 : 65; // Jika kotor berdebu, output drop drastis
    const sensorMetrics = weatherScenario === 'clear'
        ? {
            temp: 32.4, // °C
            rh: 58, // %
            windSpeed: 8, // Knot
            windDir: 135, // Tenggara (SE)
            windDirText: 'Tenggara (SE)',
            solarRad: 890, // W/m²
            pressure: 1012.4, // hPa
            rainRate: 0.0, // mm/jam
            solarPanelW: baseSolarW, // Watt
            batteryV: isSolarDirty ? 11.9 : 13.4, // Volt (Aki tekor jika solar kotor)
            isExtremeAlert: false,
        }
        : {
            temp: 23.8, // Suhu anjlok saat badai
            rh: 96, // Kelembapan mendekati jenuh
            windSpeed: 38, // Wind Gust kencang
            windDir: 315, // Barat Laut (NW)
            windDirText: 'Barat Laut (NW)',
            solarRad: 110, // Matahari tertutup awan gelap
            pressure: 1004.2, // Pressure Drop drastis khas badai konvektif
            rainRate: 34.5, // Curah hujan sangat lebat (>20 mm/jam)
            solarPanelW: Math.round(baseSolarW * 0.15),
            batteryV: 12.1,
            isExtremeAlert: true,
        };

    // --- COUNTDOWN TIMER CYCLE 10 DETIK (MEWAKILI BATCH PACKET 10 MENIT) ---
    useEffect(() => {
        if (isLoggerFallenByLightning) return;

        const timer = setInterval(() => {
            setCountdownSeconds((prev) => {
                if (prev <= 1) {
                    // Saat countdown mencapai 0: pemicu pengiriman paket data
                    if (isSignalOnline) {
                        setIsTransmitting(true);
                        setTimeout(() => setIsTransmitting(false), 1200);
                    } else {
                        setBufferedDataCount((b) => b + 1);
                    }
                    return 10; // Reset ke 10 detik
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSignalOnline, isLoggerFallenByLightning]);

    // Handle Sambaran Petir saat Grounding Buruk
    useEffect(() => {
        if (weatherScenario === 'storm' && !isGroundingGood) {
            setIsLoggerFallenByLightning(true);
        } else {
            setIsLoggerFallenByLightning(false);
        }
    }, [weatherScenario, isGroundingGood]);

    // Handle Pemulihan Sinyal Telemetri (Data Recovery)
    const handleToggleSignal = () => {
        if (!isSignalOnline) {
            setIsSignalOnline(true);
            setIsTransmitting(true);
            setTimeout(() => {
                setBufferedDataCount(0);
                setIsTransmitting(false);
            }, 1400);
        } else {
            setIsSignalOnline(false);
        }
    };

    // Informasi Sensor saat Diklik di Menara
    const sensorInfoMap = {
        lightning: {
            title: 'Penangkal Petir (Finial Rod) & Kabel Grounding (Pasak Bumi)',
            type: 'Proteksi Surge Voltage Elektrikal WMO',
            height: 'Pucuk Paling Tinggi (10.5 Meter)',
            desc: 'Menyalurkan lonjakan arus petir langsung ke tanah. Nilai tahanan pentanahan wajib <= 5 Ohm agar komponen elektronik datalogger tidak hang atau terbakar.',
            reading: `Tahanan Grounding: ${isGroundingGood ? '2.1 Ohm (Aman)' : '14.8 Ohm (BAHAYA!)'}`,
        },
        wind: {
            title: 'Ultrasonic Anemometer & Wind Vane (Ketinggian 10 Meter)',
            type: 'Port Digital / RS-485 (SDI-12)',
            height: '10.0 Meter (Standar WMO Sinoptik)',
            desc: 'Mengukur kecepatan dan arah angin menggunakan gelombang ultrasonik tanpa bagian mekanis yang bergerak, tahan terhadap hembusan badai dan aus.',
            reading: `${sensorMetrics.windSpeed} Knot | Arah: ${sensorMetrics.windDirText} (${sensorMetrics.windDir}°)`,
        },
        solar: {
            title: 'Pyranometer Radiasi Global & Panel Surya 65W',
            type: 'Port Analog Mikrovolt (µV) & Charger Regulator',
            height: '2.5 Meter / Puncak Tiang Penyangga',
            desc: 'Mengukur intensitas sinar matahari global ($W/m^2$) dan mengisi ulang daya aki kering 12V. Bersihkan debu/kotoran burung agar pengisian daya tidak tekor.',
            reading: `Radiasi: ${sensorMetrics.solarRad} W/m² | Daya Surya: ${sensorMetrics.solarPanelW} Watt ${isSolarDirty ? '(Kotor)' : '(Bersih)'}`,
        },
        temp_rh: {
            title: 'Sensor Suhu & Kelembapan Udara (Thermo-Hygrometer Pt100)',
            type: 'Port SDI-12 / Analog Resistif',
            height: '1.5 - 2.0 Meter di Dalam Multi-Plate Radiation Shield',
            desc: 'Piringan pelindung radiasi berventilasi alami melindungi sensor presisi dari panas matahari langsung dan percikan air hujan.',
            reading: `Suhu: ${sensorMetrics.temp}°C | Kelembapan (RH): ${sensorMetrics.rh}%`,
        },
        rain: {
            title: 'Sensor Curah Hujan Otomatis (Tipping Bucket)',
            type: 'Port Digital Pulse Counter',
            height: '1.5 Meter di Samping Menara',
            desc: 'Setiap jungkitan ekuivalen 0.2 mm air hujan mengirim pulsa listrik ke datalogger untuk menghitung akumulasi dan intensitas hujan instan.',
            reading: `Intensitas Hujan: ${sensorMetrics.rainRate} mm/jam`,
        },
        pressure: {
            title: 'Barometer Digital Presisi Tinggi',
            type: 'Port Internal I2C / RS-232',
            height: 'Di Dalam Kotak Enclosure IP66 Datalogger',
            desc: 'Mengukur tekanan atmosfer stasiun (hPa). Penurunan tekanan mendadak adalah indikator terkuat terbentuknya badai konvektif.',
            reading: `Tekanan Udara: ${sensorMetrics.pressure} hPa`,
        },
        logger: {
            title: 'Datalogger & Modem Telemetri 4G / Satelit (Otak AWS)',
            type: 'Central Processing Unit (CPU) IP66 Enclosure',
            height: '1.5 Meter dari Permukaan Tanah',
            desc: 'Mengumpulkan sinyal semua sensor, memproses kalibrasi, menyimpan cadangan memori (SD Card), dan memancarkan data ke BMKG Pusat setiap 10 menit.',
            reading: isLoggerFallenByLightning 
                ? '⚠️ KONSLET / HANG KARENA INDUKSI PETIR! (RESET FUSE!)' 
                : `Baterai: ${sensorMetrics.batteryV}V | Buffer: ${bufferedDataCount} Paket | Status: ${isSignalOnline ? '4G LTE Online' : 'Offline Buffer'}`,
        },
    };

    const activeSensorInfo = sensorInfoMap[selectedSensor];

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Ringkas Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/60">
                        <span>⚡</span> Sistem Observasi Otomatis Terpadu (AWS)
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🗼</span> Simulasi Stasiun Cuaca Otomatis (Automatic Weather Station)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Integrasi menara 10m multi-sensor, proteksi petir, siklus telemetri batch 10-menit, dan hilirisasi peringatan bencana BMKG.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isLoggerFallenByLightning ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' : isSignalOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'}`}>
                        {isLoggerFallenByLightning ? '⚡ Logger Konslet Petir' : isSignalOnline ? '📡 4G Telemetri Online' : '⚠️ Offline (Buffer Lokal)'}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-cyan-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        Kirim: 00:{String(countdownSeconds).padStart(2, '0')} (10m)
                    </span>
                </div>
            </div>

            {/* Layout Utama Asimetris: 60% Visual Menara Tower (7 Kolom) vs 40% Dasbor Telemetri & Skenario (5 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (60% / 7 Kolom): KANVAS MENARA TOWER AWS & JALUR TELEMETRI */}
                <div className="lg:col-span-7 space-y-3.5">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-200 via-sky-50 to-emerald-50 p-4 sm:p-5 overflow-hidden shadow-xs">
                        {/* Status Bar Kecil di Atas Kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>{weatherScenario === 'clear' ? '☀️' : '⛈️'}</span>
                                <span>Kondisi Atmosfer: <strong>{weatherScenario === 'clear' ? 'Cerah Tropis (Normal)' : 'Badai Konvektif Ekstrem!'}</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${sensorMetrics.isExtremeAlert ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
                                {sensorMetrics.isExtremeAlert ? '🚨 ALARM BENCANA AKTIF!' : 'Status Cuaca Aman'}
                            </span>
                        </div>

                        {/* Diagram SVG Interaktif Menara AWS & Transmisi Telemetri */}
                        <svg viewBox="0 0 460 320" className="w-full h-auto select-none drop-shadow-md mx-auto">
                            <defs>
                                <linearGradient id="towerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#475569" />
                                    <stop offset="50%" stopColor="#94a3b8" />
                                    <stop offset="100%" stopColor="#334155" />
                                </linearGradient>
                            </defs>

                            {/* KILATAN SAMBARAN PETIR SAAT BADAI */}
                            {weatherScenario === 'storm' && (
                                <g>
                                    {/* Sambaran Petir dari Awan ke Tombak Penangkal Petir */}
                                    <path
                                        d="M 120 10 L 155 50 L 140 70 L 190 20"
                                        fill="none"
                                        stroke="#fef08a"
                                        strokeWidth="3.5"
                                        filter="drop-shadow(0 0 8px rgba(250,204,21,0.8))"
                                        className="animate-pulse"
                                    />
                                    {/* Hujan lebat */}
                                    {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380, 420].map((x, i) => (
                                        <line
                                            key={i}
                                            x1={x}
                                            y1="10"
                                            x2={x - 22}
                                            y2="80"
                                            stroke="#0284c7"
                                            strokeWidth="2.5"
                                            strokeDasharray="4 6"
                                            className="animate-pulse"
                                        />
                                    ))}
                                </g>
                            )}

                            {/* TANAH TAMAN ALAT */}
                            <rect x="0" y="280" width="460" height="40" fill="#15803d" />
                            <line x1="0" y1="280" x2="460" y2="280" stroke="#166534" strokeWidth="2" />

                            {/* SISTEM GROUNDING PASAK BUMI (KE BAWAH TANAH) */}
                            <g transform="translate(190, 280)">
                                {/* Kabel Tembaga Kuning-Hijau Masuk ke Tanah */}
                                <line x1="18" y1="0" x2="18" y2="30" stroke="#ca8a04" strokeWidth="2.5" />
                                <line x1="12" y1="30" x2="24" y2="30" stroke="#ca8a04" strokeWidth="2" />
                                <line x1="14" y1="34" x2="22" y2="34" stroke="#ca8a04" strokeWidth="1.5" />
                                <text x="32" y="24" fill={isGroundingGood ? "#bbf7d0" : "#fca5a5"} fontSize="6" fontWeight="bold">
                                    Grounding: {isGroundingGood ? '2.1 Ω' : '14.8 Ω (Bahaya)'}
                                </text>
                            </g>

                            {/* ======================================================== */}
                            {/* TOWER BTS / SATELIT & GELOMBANG TELEMETRI                */}
                            {/* ======================================================== */}
                            <g transform="translate(390, 85)">
                                <line x1="0" y1="0" x2="0" y2="195" stroke="#0f172a" strokeWidth="2" />
                                <polygon points="-12,0 0,-18 12,0" fill="#ef4444" />
                                <circle cx="0" cy="-18" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                                <text x="0" y="20" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="black">SERVER BMKG</text>
                                <text x="0" y="30" textAnchor="middle" fill="#475569" fontSize="6">(Pusat Data)</text>

                                {/* GELOMBANG SINYAL DARI ANTENA AWS MENUJU SERVER (SAAT COUNTDOWN 00:00) */}
                                {isTransmitting && !isLoggerFallenByLightning && (
                                    <g>
                                        <circle cx="-160" cy="-20" r="15" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" className="animate-ping" />
                                        <line x1="-150" y1="-20" x2="-20" y2="-18" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="6 4" className="animate-pulse" />
                                        <text x="-85" y="-30" fill="#0284c7" fontSize="7" fontWeight="bold">📡 Paket 10-Menit Meluncur!</text>
                                    </g>
                                )}

                                {/* PAKET TERTUMPUK JIKA BLANK SPOT */}
                                {!isSignalOnline && !isLoggerFallenByLightning && (
                                    <g transform="translate(-160, 40)">
                                        <rect x="-25" y="-12" width="50" height="24" rx="4" fill="#881337" stroke="#fda4af" strokeWidth="1.5" />
                                        <text x="0" y="0" textAnchor="middle" fill="#fecdd3" fontSize="6" fontWeight="bold">OFFLINE BUFFER</text>
                                        <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="black">{bufferedDataCount} Paket Tertahan</text>
                                    </g>
                                )}
                            </g>

                            {/* ======================================================== */}
                            {/* MENARA RANGKA BAJA AWS UTAMA (10 METER)                   */}
                            {/* ======================================================== */}
                            <g transform="translate(190, 280)">
                                {/* Tiang Rangka Baja Kisi-Kisi Segitiga */}
                                <line x1="-18" y1="0" x2="0" y2="-255" stroke="url(#towerGrad)" strokeWidth="3" />
                                <line x1="18" y1="0" x2="0" y2="-255" stroke="url(#towerGrad)" strokeWidth="3" />
                                <line x1="0" y1="0" x2="0" y2="-255" stroke="#64748b" strokeWidth="2" />
                                
                                {[-40, -80, -120, -160, -200, -235].map((y, i) => (
                                    <g key={i}>
                                        <line x1={-18 * (1 - Math.abs(y)/265)} y1={y} x2={18 * (1 - Math.abs(y)/265)} y2={y} stroke="#64748b" strokeWidth="1.5" />
                                        <line x1={-18 * (1 - Math.abs(y)/265)} y1={y} x2={18 * (1 - Math.abs(y+35)/265)} y2={y+35} stroke="#94a3b8" strokeWidth="1" />
                                    </g>
                                ))}

                                <rect x="-35" y="-6" width="70" height="10" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

                                {/* 1. PENANGKAL PETIR (LIGHTNING ROD) DI PUCUK MENARA (10.5 METER) */}
                                <g
                                    transform="translate(0, -260)"
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedSensor('lightning')}
                                >
                                    <line x1="0" y1="5" x2="0" y2="-18" stroke="#f59e0b" strokeWidth="2.5" />
                                    <polygon points="-2,-18 0,-26 2,-18" fill="#ca8a04" />
                                    <text x="8" y="-20" fill={selectedSensor === 'lightning' ? "#b45309" : "#451a03"} fontSize="6" fontWeight="bold">Tombak Petir</text>
                                </g>

                                {/* 2. SENSOR ULTRASONIC ANEMOMETER DI PUNCAK (10 METER) */}
                                <g
                                    transform="translate(0, -250)"
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedSensor('wind')}
                                >
                                    <circle cx="0" cy="0" r="14" fill={selectedSensor === 'wind' ? "#38bdf8" : "transparent"} opacity="0.3" className="animate-pulse" />
                                    <rect x="-4" y="-12" width="8" height="14" fill="#0f172a" />
                                    <line x1="-8" y1="-20" x2="-8" y2="-10" stroke="#0f172a" strokeWidth="2" />
                                    <line x1="8" y1="-20" x2="8" y2="-10" stroke="#0f172a" strokeWidth="2" />
                                    <line x1="0" y1="-24" x2="0" y2="-10" stroke="#0f172a" strokeWidth="2" />
                                    <circle cx="0" cy="-24" r="3" fill="#ef4444" />
                                    <text x="18" y="-12" fill={selectedSensor === 'wind' ? "#0284c7" : "#0f172a"} fontSize="7" fontWeight="bold">10m: Angin Ultrasonik</text>
                                </g>

                                {/* ANTENA MODEM 4G / SATELIT TELEMETRI */}
                                <g transform="translate(14, -235)">
                                    <line x1="0" y1="0" x2="16" y2="-18" stroke="#0f172a" strokeWidth="2" />
                                    <circle cx="16" cy="-18" r="2.5" fill={isSignalOnline ? "#10b981" : "#ef4444"} />
                                    <text x="22" y="-16" fill="#475569" fontSize="6">Antena 4G</text>
                                </g>

                                {/* 3. SENSOR RADIASI PYRANOMETER & PANEL SURYA (65W) */}
                                <g
                                    transform="translate(-25, -170)"
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedSensor('solar')}
                                >
                                    <line x1="25" y1="0" x2="-10" y2="0" stroke="#0f172a" strokeWidth="2" />
                                    {/* Panel Surya (Berdebu abu-abu jika isSolarDirty) */}
                                    <polygon
                                        points="-10,0 -28,-14 -32,-8 -14,6"
                                        fill={isSolarDirty ? "#78716c" : "#1e3a8a"}
                                        stroke={isSolarDirty ? "#d6d3d1" : "#60a5fa"}
                                        strokeWidth="1.5"
                                    />
                                    {isSolarDirty && (
                                        <text x="-26" y="-1" fill="#fef08a" fontSize="5" fontWeight="bold">KOTOR</text>
                                    )}
                                    <circle cx="8" cy="-5" r="4" fill="#e2e8f0" stroke="#0284c7" strokeWidth="1.5" />
                                    <text x="-36" y="-16" fill={selectedSensor === 'solar' ? "#0284c7" : "#0f172a"} fontSize="7" fontWeight="bold">Solar Panel & Pyranometer</text>
                                </g>

                                {/* 4. SENSOR SUHU & RH DALAM RADIATION SHIELD (2 METER) */}
                                <g
                                    transform="translate(18, -100)"
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedSensor('temp_rh')}
                                >
                                    <line x1="-18" y1="0" x2="15" y2="0" stroke="#0f172a" strokeWidth="2" />
                                    {[-8, -4, 0, 4, 8].map((plateY, idx) => (
                                        <ellipse key={idx} cx="15" cy={plateY} rx="10" ry="2.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                                    ))}
                                    <text x="30" y="2" fill={selectedSensor === 'temp_rh' ? "#0284c7" : "#0f172a"} fontSize="7" fontWeight="bold">2m: Suhu & RH Shield</text>
                                </g>

                                {/* 5. KOTAK ENCLOSURE IP66 (DATALOGGER & BAROMETER) */}
                                <g
                                    transform="translate(-32, -85)"
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedSensor('logger')}
                                >
                                    <rect
                                        x="0"
                                        y="0"
                                        width="34"
                                        height="42"
                                        rx="3"
                                        fill={isLoggerFallenByLightning ? "#1e293b" : "#ffffff"}
                                        stroke={isLoggerFallenByLightning ? "#ef4444" : selectedSensor === 'logger' ? "#0284c7" : "#334155"}
                                        strokeWidth={selectedSensor === 'logger' || isLoggerFallenByLightning ? "2.5" : "1.5"}
                                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                    />
                                    <rect x="4" y="5" width="26" height="12" fill="#0f172a" rx="1" />
                                    <text x="17" y="14" textAnchor="middle" fill={isLoggerFallenByLightning ? "#ef4444" : "#38bdf8"} fontSize="5" fontWeight="bold">
                                        {isLoggerFallenByLightning ? "KONSLET!" : "LOGGER"}
                                    </text>
                                    <circle cx="8" cy="24" r="2" fill={isLoggerFallenByLightning ? "#ef4444" : "#10b981"} />
                                    <circle cx="16" cy="24" r="2" fill={isLoggerFallenByLightning ? "#ef4444" : isSignalOnline ? "#3b82f6" : "#f59e0b"} />
                                    <circle cx="24" cy="24" r="2" fill="#ef4444" />
                                    <text x="-8" y="22" textAnchor="end" fill={selectedSensor === 'logger' ? "#0284c7" : "#0f172a"} fontSize="7" fontWeight="bold">Datalogger (CPU)</text>
                                </g>

                                {/* 6. PENAKAR HUJAN TIPPING BUCKET DI SAMPING TIANG */}
                                <g
                                    transform="translate(65, -15)"
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedSensor('rain')}
                                >
                                    <line x1="0" y1="15" x2="0" y2="-20" stroke="#0f172a" strokeWidth="2" />
                                    <rect x="-8" y="-20" width="16" height="22" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" rx="2" />
                                    <text x="0" y="-24" textAnchor="middle" fill={selectedSensor === 'rain' ? "#0284c7" : "#0f172a"} fontSize="7" fontWeight="bold">Tipping Bucket</text>
                                </g>
                            </g>
                        </svg>

                        {/* SELECTOR CEPAT SKENARIO CUACA & TELEMETRI */}
                        <div className="mt-3 p-3 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-2.5 text-xs text-white">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-300 font-semibold">Simulasi Skenario Atmosfer:</span>
                                <div className="inline-flex p-0.5 bg-slate-800 rounded-lg border border-slate-700">
                                    <button
                                        onClick={() => setWeatherScenario('clear')}
                                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                            weatherScenario === 'clear' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        ☀️ Cerah Normal
                                    </button>
                                    <button
                                        onClick={() => setWeatherScenario('storm')}
                                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                            weatherScenario === 'storm' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        ⛈️ Badai Konvektif
                                    </button>
                                </div>
                            </div>

                            {/* Tombol Uji Blank Spot Jaringan */}
                            <button
                                onClick={handleToggleSignal}
                                className={`px-3 py-1 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                    !isSignalOnline 
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse' 
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                <span>{!isSignalOnline ? '📵 Blank Spot (Pulihkan Sinyal)' : '📡 Uji Putus Sinyal (Blank Spot)'}</span>
                            </button>
                        </div>
                    </div>

                    {/* MINI-BAR SOP PEMELIHARAAN (GROUNDING, LAP SOLAR PANEL, & RESET FUSE) */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* 1. Toggle Uji Grounding Petir */}
                        <button
                            onClick={() => setIsGroundingGood(!isGroundingGood)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                !isGroundingGood 
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isGroundingGood ? '⚡ Grounding Rusak (>5Ω)' : '✅ Grounding 2.1Ω (Aman)'}</span>
                        </button>

                        {/* 2. Toggle Debu Panel Surya */}
                        <button
                            onClick={() => setIsSolarDirty(!isSolarDirty)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                isSolarDirty 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isSolarDirty ? '🧼 Lap Debu Solar Panel!' : '✨ Panel Surya Bersih'}</span>
                        </button>

                        {/* 3. Reset Fuse jika Datalogger Hang tersambar petir */}
                        <button
                            onClick={() => {
                                setIsGroundingGood(true);
                                setIsLoggerFallenByLightning(false);
                            }}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                isLoggerFallenByLightning 
                                    ? 'bg-rose-600 text-white border-rose-700 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isLoggerFallenByLightning ? '🔄 Ganti Fuse / Reset' : '🛡️ Fuse Normal'}</span>
                        </button>
                    </div>

                    {/* KARTU DETAIL SENSOR YANG DIPILIH DARI MENARA */}
                    <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/70 space-y-1.5 text-xs text-blue-950">
                        <div className="flex items-center justify-between font-bold">
                            <span className="text-blue-900 flex items-center gap-1.5">
                                <span>🔍</span> Komponen Terpilih: {activeSensorInfo.title}
                            </span>
                            <span className="text-[10.5px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
                                {activeSensorInfo.type}
                            </span>
                        </div>
                        <p className="text-[11px] text-blue-900/80 leading-relaxed">
                            {activeSensorInfo.desc}
                        </p>
                        <div className="pt-1 border-t border-blue-200/60 font-mono font-bold text-blue-950 flex items-center justify-between text-[11px]">
                            <span>Hasil Pembacaan Saat Ini:</span>
                            <span className="bg-white px-2 py-0.5 rounded-md border border-blue-200 text-blue-700">
                                {activeSensorInfo.reading}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SISI KANAN (40% / 5 Kolom): DASBOR TELEMETRI TERPADU & PERINGATAN BENCANA */}
                <div className="lg:col-span-5 space-y-4">
                    {/* STATUS PERINGATAN DINI BENCANA BMKG DENGAN TOMBOL HILIRISASI */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        sensorMetrics.isExtremeAlert 
                            ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-pulse' 
                            : 'bg-slate-900 text-white border-slate-800'
                    }`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>{sensorMetrics.isExtremeAlert ? '🚨' : '📡'}</span> Sistem Peringatan Dini Multi-Unsur
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/30 text-white border border-white/20">
                                WMO Station 96933
                            </span>
                        </div>

                        <div className="mt-2.5 space-y-2">
                            <span className="text-base sm:text-lg font-black block">
                                {sensorMetrics.isExtremeAlert ? 'STATUS: PERINGATAN CUACA EKSTREM' : 'STATUS: AMAN TERKENDALI'}
                            </span>
                            <p className="text-[11px] text-white/90 leading-snug">
                                {sensorMetrics.isExtremeAlert 
                                    ? 'Hujan lebat (>30 mm/j) + Angin kencang (38 Kt) + Tekanan anjlok (1004 hPa)! Data AWS langsung dialirkan untuk diseminasi mitigasi bencana masyarakat.' 
                                    : 'Seluruh unsur parameter atmosfer berada dalam batas aman iklim tropis normal.'}
                            </p>

                            {/* Tombol Hilirisasi Diseminasi InfoBMKG */}
                            {sensorMetrics.isExtremeAlert && (
                                <button
                                    onClick={() => setShowDisseminationModal(true)}
                                    className="w-full mt-2 py-2 px-3 bg-white text-rose-700 hover:bg-rose-50 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                    <span>📱</span>
                                    <span>Buka Simulasi Diseminasi InfoBMKG & BPBD</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DASBOR TELEMETRI MULTI-SENSOR AWS REAL-TIME (6 KOTAK SENSOR) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📊</span> Dasbor Telemetri Terpadu AWS
                            </span>
                            <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded-full border border-cyan-200">
                                Batch: 10 Menit (Timer: 00:{String(countdownSeconds).padStart(2, '0')})
                            </span>
                        </div>

                        {/* Grid 6 Parameter Cuaca */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">🌡️ Suhu Udara (2m)</span>
                                <span className="text-base font-black text-slate-900 font-mono">
                                    {sensorMetrics.temp}°C
                                </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">💧 Kelembapan (RH)</span>
                                <span className="text-base font-black text-blue-700 font-mono">
                                    {sensorMetrics.rh}%
                                </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">💨 Angin 10m (Ultrasonik)</span>
                                <span className="text-base font-black text-cyan-700 font-mono">
                                    {sensorMetrics.windSpeed} Knot
                                </span>
                                <span className="text-[9px] text-slate-500 block truncate">{sensorMetrics.windDirText}</span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">⏱️ Tekanan (Barometer)</span>
                                <span className="text-base font-black text-indigo-700 font-mono">
                                    {sensorMetrics.pressure} hPa
                                </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">☀️ Radiasi Pyranometer</span>
                                <span className="text-base font-black text-amber-600 font-mono">
                                    {sensorMetrics.solarRad} W/m²
                                </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">🌧️ Curah Hujan Instan</span>
                                <span className="text-base font-black text-teal-700 font-mono">
                                    {sensorMetrics.rainRate} mm/j
                                </span>
                            </div>
                        </div>

                        {/* MANAJEMEN DAYA OFF-GRID MANDIRI */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                                🔋 Manajemen Daya Mandiri (Off-Grid Solar System):
                            </span>
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                                <span>Panel Surya: <strong className={isSolarDirty ? "text-amber-600" : ""}>{sensorMetrics.solarPanelW} Watt</strong></span>
                                <span>Tegangan Aki 12V: <strong className={sensorMetrics.batteryV < 12 ? "text-amber-600" : "text-emerald-700"}>{sensorMetrics.batteryV} Volt</strong></span>
                            </div>
                        </div>

                        {/* FITUR KEANDALAN DATA RECOVERY (BLANK SPOT SIMULATION) */}
                        <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[10.5px] text-amber-950 leading-relaxed">
                            💡 <strong>Keandalan Datalogger (Fail-Safe Storage):</strong> Jika menara AWS berada di lokasi blank spot seluler, sensor tetap bekerja dan data disimpan di memori internal SD Card (Buffer: {bufferedDataCount} paket). Begitu sinyal GSM pulih, seluruh data langsung melesat dikirim ke server pusat tanpa ada data yang hilang!
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL POP-UP SIMULASI HILIRISASI DISEMINASI INFOBMKG & BPBD */}
            {showDisseminationModal && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowDisseminationModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <h4 className="text-base font-extrabold text-slate-900">Diseminasi Peringatan Dini BMKG</h4>
                                    <p className="text-[11px] text-slate-500">Hilirisasi Otomatis Data AWS ke Stakeholder & Publik</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDisseminationModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tiruan Layar Notifikasi Darurat Smartphone */}
                        <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 border border-slate-800 shadow-inner">
                            <div className="flex items-center justify-between text-xs text-rose-400 font-bold border-b border-slate-800 pb-2">
                                <span className="flex items-center gap-1.5">
                                    <span>⚠️</span> INFO BMKG ALERT SYSTEM
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">SEKARANG</span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-sm font-black text-amber-400 block">
                                    PERINGATAN DINI CUACA SIGNIFIKAN
                                </span>
                                <p className="text-xs text-slate-200 leading-relaxed">
                                    Terdeteksi Hujan Sangat Lebat (<strong>34.5 mm/jam</strong>) disertai Angin Kencang (<strong>38 Knot</strong>) dan Penurunan Tekanan Barometer di Wilayah Pos AWS Sidoarjo / Sekitarnya.
                                </p>
                            </div>

                            <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-900/60 text-[11px] text-rose-200 space-y-1">
                                <strong>Rekomendasi Aksi BPBD & Warga:</strong>
                                <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                                    <li>Waspada potensi banjir luapan drainase & longsor di lereng.</li>
                                    <li>Hindari berteduh di bawah pohon rindang & baliho rapuh.</li>
                                    <li>Amankan perahu nelayan di pesisir dari hembusan angin gust.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-500 text-center">
                            Data AWS secara otomatis terdistribusi via <strong>SMS Blast, Aplikasi Mobile InfoBMKG, dan Dashboard MEWS (Meteorological Early Warning System)</strong>.
                        </div>

                        <button
                            onClick={() => setShowDisseminationModal(false)}
                            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                        >
                            Tutup Simulasi Notifikasi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
