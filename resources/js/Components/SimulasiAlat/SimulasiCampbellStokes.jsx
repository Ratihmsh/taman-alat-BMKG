import React, { useState } from 'react';

export default function SimulasiCampbellStokes() {
    // 1. Slider Waktu Penyinaran Matahari (06:00 s/d 18:00 WIB, format desimal)
    const [solarHour, setSolarHour] = useState(12.0); // Default 12:00 (siang puncak)

    // 2. Status Awan Melintas / Tutupan Awan (Cerah vs Awan Mendung)
    // Jika awan melintas, radiasi langsung < 120 W/m2 (standar WMO), titik api padam & tidak membakar
    const [isCloudCovered, setIsCloudCovered] = useState(false);

    // 3. Tipe Kertas Pias Terpasang (Standar 3 Jenis BMKG Berdasarkan Deklinasi Semu Matahari)
    // 'straight' (Lurus - Ekuinoks Mar/Sep), 'long' (Lengkung Panjang - Musim Panas), 'short' (Lengkung Pendek - Musim Dingin)
    const [selectedCardType, setSelectedCardType] = useState('straight');

    // 4. Pilihan Musim / Periode Bulan Pengamatan
    // 'equinox' (Maret/September), 'solstice_north' (Juni - Matahari di Utara), 'solstice_south' (Desember - Matahari di Selatan)
    const [seasonPeriod, setSeasonPeriod] = useState('equinox');

    // 5. Status Embun Pagi pada Bola Kaca (true = Kaca Bening Kering, false = Kaca Berembun Buram)
    const [isGlassClean, setIsGlassClean] = useState(true);

    // 6. Kalibrasi Poros Orientasi Utara - Selatan (true = Tepat Sejajar, false = Miring Meleset)
    const [isNorthSouthAligned, setIsNorthSouthAligned] = useState(true);

    // --- CEK KESESUAIAN PIAS DENGAN MUSIM (SOP BMKG) ---
    // Aturan BMKG Belahan Bumi Selatan (Indonesia Tropis):
    // Ekuinoks (Mar/Sep) -> Pias Lurus (Celah Tengah)
    // Juni (Matahari di Utara 23.5° LU) -> Pias Lengkung Pendek
    // Desember (Matahari di Selatan 23.5° LS) -> Pias Lengkung Panjang
    const getCardSlotMatch = () => {
        if (seasonPeriod === 'equinox' && selectedCardType === 'straight') return true;
        if (seasonPeriod === 'solstice_north' && selectedCardType === 'short') return true;
        if (seasonPeriod === 'solstice_south' && selectedCardType === 'long') return true;
        return false;
    };

    const isCardCorrectlyMatched = getCardSlotMatch();

    // Syarat pembakaran aktif (Burn Active):
    // 1. Tidak tertutup awan (radiasi > 120 W/m2)
    // 2. Bola kaca bersih dari embun
    // 3. Poros sejajar Utara-Selatan
    // 4. Kertas pias cocok dengan musim (titik api jatuh pas di atas kertas)
    // 5. Jam antara 06.30 - 17.30 WIB
    const isBurningActive = 
        !isCloudCovered && 
        isGlassClean && 
        isNorthSouthAligned && 
        isCardCorrectlyMatched && 
        solarHour >= 6.5 && 
        solarHour <= 17.5;

    // --- POSISI TITIK API FOKUS DI ATAS KERTAS PIAS (SVG X, Y) ---
    // Rentang jam 06:00 - 18:00 dipetakan ke koordinat X mangkuk: 90 s/d 370
    const focalProgress = (solarHour - 6) / 12; // 0 s/d 1
    const focalX = 90 + focalProgress * 280;

    // Koordinat Y titik fokus tergantung kemiringan/deklinasi matahari
    // Jika pias salah, titik api meleset ke luar kertas pias!
    let focalY = 195;
    if (seasonPeriod === 'solstice_north') focalY = 186;
    if (seasonPeriod === 'solstice_south') focalY = 204;
    if (!isNorthSouthAligned) focalY += 15; // Meleset jatuh ke mangkuk logam

    // Posisi Matahari di Langit
    const sunAngleRad = Math.PI * (1 - focalProgress);
    const sunSkyX = 230 - 180 * Math.cos(sunAngleRad);
    const sunSkyY = 120 - 95 * Math.sin(sunAngleRad);

    // --- DATA JAM GOSONG HARIAN (SKENARIO PEMBAKARAN LPM) ---
    // Mensimulasikan jejak gosong sepanjang hari (jam 08:00 - 16:00 standar BMKG)
    // Jika awan menutupi saat siang (misal jam 10-11 atau saat isCloudCovered), jejak putus
    const recordedHours = [
        { hour: 7, burned: true },
        { hour: 8, burned: true },
        { hour: 9, burned: true },
        { hour: 10, burned: !isCloudCovered },
        { hour: 11, burned: false }, // Awan mendung lewat
        { hour: 12, burned: !isCloudCovered },
        { hour: 13, burned: !isCloudCovered },
        { hour: 14, burned: true },
        { hour: 15, burned: true },
        { hour: 16, burned: !isCloudCovered },
        { hour: 17, burned: false },
    ];

    // Total jam terbakar standar pengamatan BMKG (08:00 - 16:00 = 8 jam acuan resmi)
    const totalBurnedHours = recordedHours
        .filter(h => h.hour >= 8 && h.hour <= 16 && h.burned)
        .length + (isBurningActive ? 0.5 : 0);

    const sunshineDurationPercentage = Number(((totalBurnedHours / 8) * 100).toFixed(1));

    // Format Jam dan Menit
    const hourInt = Math.floor(solarHour);
    const minutesInt = Math.round((solarHour - hourInt) * 60);
    const formattedTime = `${String(hourInt).padStart(2, '0')}:${String(minutesInt).padStart(2, '0')}`;

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Ringkas Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-amber-200/60">
                        <span>☀️</span> Penyinaran Matahari & Aktinometri
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🔍</span> Simulasi Campbell Stokes (Lama Penyinaran Matahari)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Simulasi optika bola kaca pejal, fokus titik api, jejak gosong kertas pias, dan analisis persentase LPM BMKG.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isBurningActive ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {isBurningActive ? '🔥 Terbakar Aktif (Fokus Api)' : '⚪ Tidak Terbakar (Redup/Meleset)'}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        🕒 {formattedTime} WIB
                    </span>
                </div>
            </div>

            {/* Layout Utama 60% Visual Diorama (7 Kolom) vs 40% Panel Kontrol & Analisis (5 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (60% / 7 Kolom): KANVAS VISUAL OPTIKA BOLA KACA & MANGKUK PIAS */}
                <div className="lg:col-span-7 space-y-3.5">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-200 via-sky-50 to-slate-100 p-4 sm:p-5 overflow-hidden shadow-xs">
                        {/* Status Bar Kecil di Atas Kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>{isCloudCovered ? '☁️' : '☀️'}</span>
                                <span>Radiasi Langsung: <strong>{isCloudCovered ? 'Terhalang Awan (<120 W/m²)' : 'Cerah Terang (>120 W/m²)'}</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${isBurningActive ? 'text-amber-600 animate-pulse' : 'text-rose-600'}`}>
                                {!isGlassClean 
                                    ? '⚠️ Bola Kaca Berembun!' 
                                    : !isNorthSouthAligned 
                                    ? '⚠️ Poros Meleset dari Utara-Selatan!' 
                                    : !isCardCorrectlyMatched 
                                    ? '⚠️ Pias Salah Alur / Musim!' 
                                    : isCloudCovered 
                                    ? '☁️ Awan Menutupi Sinar' 
                                    : '🎯 Titik Api Tepat di Garis Pias!'}
                            </span>
                        </div>

                        {/* Diagram SVG Interaktif: Bola Kaca Pejal & Mangkuk Pias Campbell Stokes */}
                        <svg viewBox="0 0 460 290" className="w-full h-auto select-none drop-shadow-md mx-auto">
                            <defs>
                                <radialGradient id="sphereGlassGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                                    <stop offset="40%" stopColor="#e0f2fe" stopOpacity="0.8" />
                                    <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.45" />
                                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
                                </radialGradient>
                                <radialGradient id="sunGlowCS" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fef08a" />
                                    <stop offset="70%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="bowlBrassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#78350f" />
                                    <stop offset="35%" stopColor="#d97706" />
                                    <stop offset="70%" stopColor="#fde047" />
                                    <stop offset="100%" stopColor="#b45309" />
                                </linearGradient>
                            </defs>

                            {/* MATAHARI DI LANGIT */}
                            <g transform={`translate(${sunSkyX}, ${sunSkyY})`}>
                                <circle cx="0" cy="0" r="22" fill="url(#sunGlowCS)" />
                                <circle cx="0" cy="0" r="14" fill="#f59e0b" />
                                <text x="0" y="3" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="black">☀️</text>
                            </g>

                            {/* AWAN MELINTAS JIKA isCloudCovered = TRUE */}
                            {isCloudCovered && (
                                <g transform={`translate(${sunSkyX - 35}, ${sunSkyY - 10})`} className="animate-pulse">
                                    <ellipse cx="35" cy="12" rx="30" ry="16" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                                    <ellipse cx="20" cy="8" rx="18" ry="14" fill="#ffffff" />
                                    <ellipse cx="48" cy="8" rx="20" ry="14" fill="#cbd5e1" />
                                    <text x="35" y="16" textAnchor="middle" fill="#475569" fontSize="7" fontWeight="bold">Awan</text>
                                </g>
                            )}

                            {/* BERKAS SINAR MATAHARI KONVERGEN (FOKUS) MENEMBUS BOLA KACA */}
                            {!isCloudCovered && (
                                <g opacity={isGlassClean ? 0.75 : 0.3}>
                                    {/* Sinar masuk dari matahari ke bola kaca (230, 140) */}
                                    <line x1={sunSkyX} y1={sunSkyY} x2="200" y2="120" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
                                    <line x1={sunSkyX} y1={sunSkyY} x2="260" y2="120" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
                                    {/* Sinar keluar mengkerucut ke titik fokus di kertas pias */}
                                    <polygon
                                        points={`205,150 255,150 ${focalX},${focalY}`}
                                        fill="rgba(251, 191, 36, 0.35)"
                                        stroke="#f59e0b"
                                        strokeWidth="1.5"
                                    />
                                </g>
                            )}

                            {/* ======================================================== */}
                            {/* INSTRUMEN CAMPBELL STOKES FISIK (BOLA KACA & MANGKUK)   */}
                            {/* ======================================================== */}
                            
                            {/* Dudukan Kaki Logam Tembaga / Kuningan Berat */}
                            <g transform="translate(230, 240)">
                                <rect x="-65" y="15" width="130" height="15" rx="3" fill="#451a03" stroke="#1c1917" strokeWidth="2" />
                                <circle cx="0" cy="10" r="14" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                {/* Busur Penyetel Garis Lintang (Latitude Scale ~7° LS) */}
                                <path d="M -35 15 A 35 35 0 0 1 35 15" fill="none" stroke="#fde047" strokeWidth="2.5" />
                                <text x="0" y="26" textAnchor="middle" fill="#fef08a" fontSize="6" fontWeight="bold">LATITUDE: 7.4° S</text>
                            </g>

                            {/* MANGKUK TEMBAGA SETENGAH LINGKARAN (SPHERICAL BOWL DENGAN 3 ALUR/CELAH) */}
                            <g transform="translate(230, 140)">
                                {/* Mangkuk Logam Belakang */}
                                <path
                                    d="M -155 45 A 165 80 0 0 0 155 45 L 140 70 A 150 70 0 0 1 -140 70 Z"
                                    fill="url(#bowlBrassGrad)"
                                    stroke="#78350f"
                                    strokeWidth="2.5"
                                />

                                {/* 3 ALUR CELAH PIAS (SLOT ATAS, TENGAH, BAWAH) */}
                                <path d="M -135 48 A 145 68 0 0 0 135 48" fill="none" stroke="#451a03" strokeWidth="2" strokeDasharray="4 2" />
                                <path d="M -138 56 A 148 70 0 0 0 138 56" fill="none" stroke="#451a03" strokeWidth="2.5" />
                                <path d="M -135 64 A 145 68 0 0 0 135 64" fill="none" stroke="#451a03" strokeWidth="2" strokeDasharray="4 2" />

                                {/* KERTAS PIAS BIRU TEBAL TERPASANG (CARD) */}
                                <g>
                                    {/* Bentuk Kertas Pias Tergantung Tipe yang Dipilih */}
                                    {selectedCardType === 'straight' && (
                                        <path
                                            d="M -135 52 A 145 69 0 0 0 135 52 L 132 60 A 145 69 0 0 1 -132 60 Z"
                                            fill="#1e3a8a"
                                            stroke="#60a5fa"
                                            strokeWidth="1.5"
                                        />
                                    )}
                                    {selectedCardType === 'long' && (
                                        <path
                                            d="M -145 56 A 155 75 0 0 0 145 56 L 142 66 A 155 75 0 0 1 -142 66 Z"
                                            fill="#1e3a8a"
                                            stroke="#93c5fd"
                                            strokeWidth="1.5"
                                        />
                                    )}
                                    {selectedCardType === 'short' && (
                                        <path
                                            d="M -125 46 A 135 62 0 0 0 125 46 L 123 54 A 135 62 0 0 1 -123 54 Z"
                                            fill="#1e3a8a"
                                            stroke="#38bdf8"
                                            strokeWidth="1.5"
                                        />
                                    )}

                                    {/* Garis-Garis Skala Jam pada Kertas Pias (06 s/d 18) */}
                                    {[-110, -85, -60, -35, -10, 15, 40, 65, 90, 115].map((x, i) => (
                                        <line key={i} x1={x} y1="52" x2={x} y2="60" stroke="#93c5fd" strokeWidth="1" />
                                    ))}

                                    {/* JEJAK GOSONG / TERBAKAR PADA KERTAS PIAS (CHARRED BURN TRACE) */}
                                    {/* Garis gosong coklat gelap/hitam berlubang */}
                                    <path
                                        d="M -105 56 L -40 56 M -10 56 L 50 56"
                                        fill="none"
                                        stroke="#1c1917"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M -105 56 L -40 56 M -10 56 L 50 56"
                                        fill="none"
                                        stroke="#ea580c"
                                        strokeWidth="1.5"
                                    />
                                </g>
                            </g>

                            {/* BOLA KACA PEJAL TRANSPARAN (DIAMETER 10 CM STANDAR WMO) */}
                            <g transform="translate(230, 140)">
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="46"
                                    fill="url(#sphereGlassGrad)"
                                    stroke="#38bdf8"
                                    strokeWidth="2"
                                    filter="drop-shadow(0 6px 12px rgba(2, 132, 199, 0.3))"
                                />
                                {/* Kilau Refleksi Kaca Cembung */}
                                <ellipse cx="-15" cy="-18" rx="18" ry="10" fill="#ffffff" opacity="0.6" transform="rotate(-30)" />
                                
                                {/* EMBUN BURAM JIKA isGlassClean = FALSE */}
                                {!isGlassClean && (
                                    <g opacity="0.7">
                                        <circle cx="0" cy="0" r="45" fill="#f8fafc" filter="blur(1.5px)" />
                                        <text x="0" y="4" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="black">EMBUN TEBAL!</text>
                                    </g>
                                )}
                            </g>

                            {/* TITIK API MENYILAUKAN & ASAP TIPIS DI ATAS KERTAS PIAS */}
                            {isBurningActive && (
                                <g transform={`translate(${focalX}, ${focalY})`}>
                                    {/* Kilau Pijar Api Terang */}
                                    <circle cx="0" cy="0" r="8" fill="#fef08a" opacity="0.8" className="animate-ping" />
                                    <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
                                    <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
                                    
                                    {/* Asap tipis mengepul dari kertas yang terbakar */}
                                    <g opacity="0.6">
                                        <path d="M 0 -2 Q -3 -8 0 -14 T 2 -22" fill="none" stroke="#64748b" strokeWidth="1.5" className="animate-pulse" />
                                        <text x="0" y="-12" textAnchor="middle" fill="#ea580c" fontSize="6" fontWeight="extrabold">Terbakar!</text>
                                    </g>
                                </g>
                            )}

                            {/* DISPLAY DIGITAL BMKG LOGBOOK DI SUDUT */}
                            <g transform="translate(345, 25)">
                                <rect x="0" y="0" width="105" height="70" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
                                <text x="52" y="16" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">DURASI LPM (08-16)</text>
                                <text x="52" y="38" textAnchor="middle" fill="#f59e0b" fontSize="17" fontWeight="black" fontFamily="monospace">
                                    {totalBurnedHours} Jam
                                </text>
                                <text x="52" y="52" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                                    {sunshineDurationPercentage}% Sinar
                                </text>
                                <text x="52" y="64" textAnchor="middle" fill="#94a3b8" fontSize="6">
                                    Standar BMKG 8 Jam
                                </text>
                            </g>
                        </svg>

                        {/* FLOATING CONTROLS DI DALAM KANVAS DIORAMA */}
                        <div className="mt-3 p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl border border-slate-700/80 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                                    <span>🕒</span> Lintasan Sinar Matahari:
                                </span>
                                <span className="font-mono font-black text-amber-400">
                                    Pukul {formattedTime} WIB
                                </span>
                            </div>

                            <input
                                type="range"
                                min="6.0"
                                max="18.0"
                                step="0.25"
                                value={solarHour}
                                onChange={(e) => setSolarHour(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
                                {/* Toggle Awan Melintas */}
                                <button
                                    onClick={() => setIsCloudCovered(!isCloudCovered)}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        isCloudCovered 
                                            ? 'bg-slate-700 text-white border-slate-600' 
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{isCloudCovered ? '☁️ Awan Menutupi (Aktif)' : '☀️ Langit Terik Cerah'}</span>
                                </button>

                                {/* Lap Embun Bola Kaca */}
                                <button
                                    onClick={() => setIsGlassClean(!isGlassClean)}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        !isGlassClean 
                                            ? 'bg-sky-600 text-white border-sky-600 animate-pulse' 
                                            : 'bg-slate-800 text-sky-300 border-sky-700/60 hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{!isGlassClean ? '🧽 Lap Embun Kaca!' : '✨ Bola Kaca Bening'}</span>
                                </button>

                                {/* Kalibrasi Poros Utara - Selatan */}
                                <button
                                    onClick={() => setIsNorthSouthAligned(!isNorthSouthAligned)}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        !isNorthSouthAligned 
                                            ? 'bg-rose-600 text-white border-rose-600 animate-pulse' 
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{!isNorthSouthAligned ? '🧭 Luruskan Poros U-S!' : '✅ Poros Sejajar (U-S)'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* EDUKASI PRINSIP OPTIKA LENSA BOLA KACA PEJAL */}
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                        <span className="text-sm shrink-0">💡</span>
                        <div>
                            <strong>Prinsip Kerja Optik Campbell Stokes:</strong> Bola kaca pejal bertindak sebagai lensa cembung homogen dengan panjang fokus sangat pendek. Ketika intensitas radiasi matahari langsung melebihi <strong>ambang batas $120 \, \text{W/m}^2$</strong>, panas yang terkumpul di titik fokus cukup tinggi untuk mengarangkan (membakar) kertas pias biru khusus tanpa menimbulkan nyala api terbuka.
                        </div>
                    </div>
                </div>

                {/* SISI KANAN (40% / 5 Kolom): SELEKSI PIAS & KALKULATOR ANALISIS LPM */}
                <div className="lg:col-span-5 space-y-4">
                    {/* MINI-GAME SOP BMKG: SELEKTOR 3 PIAS & DEKLINASI MUSIM */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📋</span> Prosedur Pemasangan Pias BMKG
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isCardCorrectlyMatched ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'}`}>
                                {isCardCorrectlyMatched ? '✅ Pias Sesuai Musim' : '⚠️ Pias Salah Alur!'}
                            </span>
                        </div>

                        {/* 1. Pilih Periode Bulan / Musim Matahari */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                                Posisi Matahari / Periode Bulan:
                            </span>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                <button
                                    onClick={() => setSeasonPeriod('equinox')}
                                    className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                                        seasonPeriod === 'equinox'
                                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                    }`}
                                >
                                    <span className="block text-[11px]">Ekuinoks</span>
                                    <span className="text-[9px] text-slate-400">Mar & Sep</span>
                                </button>

                                <button
                                    onClick={() => setSeasonPeriod('solstice_north')}
                                    className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                                        seasonPeriod === 'solstice_north'
                                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                    }`}
                                >
                                    <span className="block text-[11px]">Utara (BBU)</span>
                                    <span className="text-[9px] text-slate-400">Mei - Jul</span>
                                </button>

                                <button
                                    onClick={() => setSeasonPeriod('solstice_south')}
                                    className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                                        seasonPeriod === 'solstice_south'
                                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                    }`}
                                >
                                    <span className="block text-[11px]">Selatan (BBS)</span>
                                    <span className="text-[9px] text-slate-400">Nov - Jan</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Pilih Tipe Kertas Pias (User Harus Memilih yang Pas) */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                                Pasang Kertas Pias ke Celah Mangkuk:
                            </span>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                <button
                                    onClick={() => setSelectedCardType('straight')}
                                    className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                                        selectedCardType === 'straight'
                                            ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                    }`}
                                >
                                    <span className="block text-[11px]">➖ Pias Lurus</span>
                                    <span className="text-[9px] text-slate-400">Celah Tengah</span>
                                </button>

                                <button
                                    onClick={() => setSelectedCardType('short')}
                                    className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                                        selectedCardType === 'short'
                                            ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                    }`}
                                >
                                    <span className="block text-[11px]">🌒 Lengkung Pendek</span>
                                    <span className="text-[9px] text-slate-400">Celah Atas</span>
                                </button>

                                <button
                                    onClick={() => setSelectedCardType('long')}
                                    className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                                        selectedCardType === 'long'
                                            ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                    }`}
                                >
                                    <span className="block text-[11px]">🌙 Lengkung Panjang</span>
                                    <span className="text-[9px] text-slate-400">Celah Bawah</span>
                                </button>
                            </div>
                        </div>

                        {!isCardCorrectlyMatched && (
                            <p className="text-[11px] text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/80 leading-snug">
                                ❌ <strong>Pias Tidak Cocok!</strong> Titik api jatuh di luar kertas pias sehingga durasi sinar tidak terekam. Pilih tipe pias yang sesuai dengan periode musim matahari di atas!
                            </p>
                        )}
                    </div>

                    {/* KARTU KALKULATOR ANALISIS PIAS (LAMA PENYINARAN MATAHARI % BMKG) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📐</span> Analisis Lama Penyinaran Matahari (LPM)
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                                WMO Standar
                            </span>
                        </div>

                        {/* Visual Penggaris Pias Harian (Jam 08 - 16) */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">
                                Simulasi Pias Terbakar (Jam 08:00 – 16:00 WIB):
                            </span>
                            
                            {/* Baris Strip Pias Kertas */}
                            <div className="flex h-6 rounded-md overflow-hidden border border-slate-300 bg-blue-900 p-0.5 gap-0.5">
                                {recordedHours.filter(h => h.hour >= 8 && h.hour <= 16).map((h, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 flex items-center justify-center text-[8px] font-mono font-bold rounded-xs ${
                                            h.burned 
                                                ? 'bg-slate-950 text-amber-400 border border-amber-500/50' 
                                                : 'bg-blue-800 text-blue-200'
                                        }`}
                                    >
                                        {h.burned ? '🔥' : `${h.hour}`}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                                <span>08:00</span>
                                <span>12:00</span>
                                <span>16:00</span>
                            </div>
                        </div>

                        {/* Rincian Angka Durasi & Persentase */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Durasi Terbakar</span>
                                <span className="text-sm font-black text-amber-700 font-mono">
                                    {totalBurnedHours} Jam
                                </span>
                                <span className="text-[9px] text-slate-500">dari 8 Jam Standar</span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Persentase LPM (%)</span>
                                <span className="text-sm font-black text-blue-700 font-mono">
                                    {sunshineDurationPercentage}%
                                </span>
                                <span className="text-[9px] text-slate-500">Kategori {sunshineDurationPercentage > 60 ? 'Cerah' : 'Berawan'}</span>
                            </div>
                        </div>

                        {/* Rumus Resmi BMKG */}
                        <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[10.5px] text-amber-950 font-mono leading-relaxed">
                            <strong>Rumus:</strong> LPM (%) = (Jam Terbakar / 8 Jam Standar) × 100% <br />
                            LPM = ({totalBurnedHours} / 8) × 100% = <strong>{sunshineDurationPercentage}%</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
