import React, { useState } from 'react';

export default function SimulasiPyranometer() {
    // 1. Slider Waktu Lintasan Matahari (06:00 s/d 18:00 WIB, format desimal)
    const [solarHour, setSolarHour] = useState(12.0); // Default 12:00 (siang puncak)

    // 2. Status Awan Melintas / Tutupan Awan (Cerah vs Awan Tebal)
    const [isCloudCovered, setIsCloudCovered] = useState(false);

    // 3. Status Kebersihan Kubah Kaca (Bersih vs Kotor Berdebu/Noda)
    const [isDomeDirty, setIsDomeDirty] = useState(false);

    // 4. Status Waterpass / Bubble Level (Tegak Datar vs Miring 15 derajat)
    const [isLevel, setIsLevel] = useState(true);

    // 5. Status Silica Gel Desiccant (true = Biru/Kering, false = Merah Muda/Lembap Jenuh berembun)
    const [isSilicaDry, setIsSilicaDry] = useState(true);

    // --- KALKULASI FISIKA RADIASI MATAHARI GLOBAL (WMO No. 8) ---
    const calculateSolarElevation = (h) => {
        if (h < 6 || h > 18) return 0;
        const progress = (h - 6) / 12; // 0 s/d 1
        return Math.sin(progress * Math.PI); // 0 -> 1 -> 0
    };

    const elevationFactor = calculateSolarElevation(solarHour);
    const maxClearSkyRadiation = 1020; // W/m2 pada kondisi langit cerah terik di Indonesia

    // Faktor pengurangan radiasi:
    const cloudFactor = isCloudCovered ? 0.26 : 1.0;
    const dirtFactor = isDomeDirty ? 0.82 : 1.0;
    const tiltFactor = isLevel ? 1.0 : 0.75;
    // Jika silica gel jenuh (pink), timbul embun halus di dalam kubah kaca memotong radiasi ~12%
    const moistureFactor = isSilicaDry ? 1.0 : 0.88;

    // Radiasi Matahari Global Efektif yang diterima sensor (W/m2)
    const calculatedRadiation = Math.max(
        0,
        Math.round(maxClearSkyRadiation * elevationFactor * cloudFactor * dirtFactor * tiltFactor * moistureFactor)
    );

    // --- EFEK SEEBECK THERMOPILE BMKG ---
    const calibrationConstantK = 10.0; // uV per W/m2
    const thermopileMicroVolts = calculatedRadiation * calibrationConstantK;
    const thermopileMilliVolts = Number((thermopileMicroVolts / 1000).toFixed(2));

    // Estimasi Output Listrik Panel Surya / PLTS (efisiensi modul standar 20% per m2)
    const solarPanelPowerWatts = Math.round(calculatedRadiation * 0.20);

    // --- INDEKS UV (ULTRAVIOLET INDEX - WHO / BMKG) ---
    // Di daerah tropis khatulistiwa, UVI berkorelasi erat dengan intensitas radiasi global saat siang hari
    const calculateUVIndex = (rad, hour) => {
        if (rad < 30 || hour < 7 || hour > 17.5) return { score: 0, category: 'Nol / Malam', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', note: 'Aman beraktivitas di luar tanpa pelindung.' };
        // Skala empiris tropis: 1000 W/m2 cerah zenit ~ 11-12 UVI
        const uvi = Number((rad / 88).toFixed(1));
        if (uvi <= 2.9) {
            return { score: uvi, category: 'Rendah (Low)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', note: 'Aman untuk beraktivitas luar ruangan.' };
        } else if (uvi <= 5.9) {
            return { score: uvi, category: 'Sedang (Moderate)', color: 'bg-amber-100 text-amber-800 border-amber-300', note: 'Gunakan topi atau pakaian lengan panjang jika berada di luar.' };
        } else if (uvi <= 7.9) {
            return { score: uvi, category: 'Tinggi (High)', color: 'bg-orange-100 text-orange-800 border-orange-300', note: 'Gunakan tabir surya (sunscreen SPF 30+) dan cari tempat teduh.' };
        } else if (uvi <= 10.9) {
            return { score: uvi, category: 'Sangat Tinggi (Very High)', color: 'bg-rose-100 text-rose-800 border-rose-300', note: 'Bahaya kerusakan kulit & mata! Batasi paparan langsung pukul 10:00 - 15:00.' };
        } else {
            return { score: uvi, category: 'Ekstrem (Extreme 11+)', color: 'bg-purple-100 text-purple-800 border-purple-300', note: 'Peringatan Ekstrem: Kulit dapat terbakar dalam hitungan menit! Wajib pelindung penuh.' };
        }
    };

    const uvData = calculateUVIndex(calculatedRadiation, solarHour);

    // --- TITIK-TITIK GRAFIK AKTINOGRAM HARIAN (06:00 - 18:00 WIB) ---
    // Simulasi kurva radiasi sepanjang hari (13 titik, setiap 1 jam)
    const hoursTimeline = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const actinogramPoints = hoursTimeline.map((h) => {
        const elev = calculateSolarElevation(h);
        // Jika jam tersebut berdekatan dengan jam saat ini dan ada awan, buat lekukan (dip)
        let cFactor = 1.0;
        if (isCloudCovered && Math.abs(h - solarHour) < 1.5) {
            cFactor = 0.28;
        } else if (isCloudCovered && Math.abs(h - 12) < 1.0) {
            cFactor = 0.35;
        }
        const val = Math.round(maxClearSkyRadiation * elev * cFactor * dirtFactor * tiltFactor * moistureFactor);
        return { hour: h, radiation: val };
    });

    // Posisi Matahari di Busur Langit (X dan Y pada diagram)
    const sunProgress = (solarHour - 6) / 12; // 0 s/d 1
    const sunAngleRad = Math.PI * (1 - sunProgress); // PI ke 0
    const sunPosX = 230 - 180 * Math.cos(sunAngleRad);
    const sunPosY = 145 - 115 * Math.sin(sunAngleRad);

    // Kategori Intensitas Radiasi
    const getRadiationCategory = (val) => {
        if (val === 0) return { label: 'Gelap / Malam (Nol)', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300' };
        if (val < 250) return { label: 'Rendah (Pagi / Mendung Gelap)', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' };
        if (val < 600) return { label: 'Sedang (Pagi Tinggi / Sore / Berawan)', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
        if (val < 900) return { label: 'Tinggi (Cerah Siang)', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
        return { label: 'Sangat Tinggi / Terik Maksimal (Puncak Zenit)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    };

    const radCategory = getRadiationCategory(calculatedRadiation);

    // Format Jam dan Menit
    const hourInt = Math.floor(solarHour);
    const minutesInt = Math.round((solarHour - hourInt) * 60);
    const formattedTime = `${String(hourInt).padStart(2, '0')}:${String(minutesInt).padStart(2, '0')}`;

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-amber-200/60">
                        <span>☀️</span> Radiasi Matahari & Energi Surya
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>⚡</span> Simulasi Cara Kerja Pyranometer
                    </h3>
                    <p className="text-xs text-slate-500">
                        Simulasi pengukuran Radiasi Matahari Global (W/m²), Aktinogram real-time, efek thermopile Seebeck, dan SOP pemeliharaan BMKG.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${radCategory.bg} ${radCategory.color} ${radCategory.border}`}>
                        {radCategory.label}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        🕒 {formattedTime} WIB
                    </span>
                </div>
            </div>

            {/* Layout Utama 1 Section Terpadu */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (7 Kolom): Visual Interaktif Lintasan Matahari, Kubah Pyranometer, & Troubleshooting */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-200 via-sky-50 to-slate-100 p-5 overflow-hidden">
                        {/* Status bar kecil di atas kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>{isCloudCovered ? '☁️' : '☀️'}</span>
                                <span>Kondisi Langit: <strong>{isCloudCovered ? 'Awan Tebal Menutupi Matahari' : 'Langit Biru Cerah'}</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${isLevel && !isDomeDirty && isSilicaDry ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                                {!isLevel
                                    ? '⚠️ Sensor Miring (Koreksi Waterpass!)'
                                    : isDomeDirty
                                    ? '⚠️ Kubah Kaca Kotor (Perlu Lap!)'
                                    : !isSilicaDry
                                    ? '⚠️ Silica Gel Jenuh (Kubah Berembun!)'
                                    : '✅ Sensor Normal & Datar (WMO)'}
                            </span>
                        </div>

                        {/* Diagram SVG Interaktif Lintasan Langit & Pyranometer */}
                        <svg viewBox="0 0 460 300" className="w-full h-auto max-h-[290px] select-none drop-shadow-md mx-auto">
                            <defs>
                                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="glassDomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                                    <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.75" />
                                </linearGradient>
                                <linearGradient id="blackAbsorberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#1e293b" />
                                    <stop offset="100%" stopColor="#020617" />
                                </linearGradient>
                            </defs>

                            {/* Busur Lintasan Langit Matahari (Arc) */}
                            <path
                                d="M 50 145 A 180 115 0 0 1 410 145"
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="2"
                                strokeDasharray="5 5"
                                opacity="0.6"
                            />
                            <text x="50" y="160" fill="#64748b" fontSize="8" fontWeight="bold">Timur (06:00)</text>
                            <text x="230" y="20" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">Zenit Siang (12:00)</text>
                            <text x="410" y="160" textAnchor="end" fill="#64748b" fontSize="8" fontWeight="bold">Barat (18:00)</text>

                            {/* MATAHARI BERGERAK DINAMIS MENGIKUTI SLIDER */}
                            <g transform={`translate(${sunPosX}, ${sunPosY})`}>
                                <circle cx="0" cy="0" r="26" fill="url(#sunGlow)" />
                                <circle cx="0" cy="0" r="16" fill="#f59e0b" />
                                {/* Sinar-sinar foton memancar */}
                                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                                    <line
                                        key={i}
                                        x1="0"
                                        y1="0"
                                        x2="24"
                                        y2="0"
                                        stroke="#f59e0b"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        transform={`rotate(${deg})`}
                                    />
                                ))}
                                <text x="0" y="3" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="black">☀️</text>
                            </g>

                            {/* AWAN MELINTAS JIKA isCloudCovered = TRUE */}
                            {isCloudCovered && (
                                <g transform={`translate(${sunPosX - 40}, ${sunPosY - 10})`} className="animate-pulse">
                                    <ellipse cx="40" cy="15" rx="36" ry="18" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                                    <ellipse cx="25" cy="8" rx="22" ry="16" fill="#ffffff" />
                                    <ellipse cx="55" cy="8" rx="24" ry="16" fill="#cbd5e1" />
                                    <text x="40" y="20" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="bold">Awan Tebal</text>
                                </g>
                            )}

                            {/* BERKAS SINAR FOTON MENUJU KUBAH PYRANOMETER */}
                            {calculatedRadiation > 0 && (
                                <g opacity={isCloudCovered ? 0.35 : 0.85}>
                                    <line
                                        x1={sunPosX}
                                        y1={sunPosY}
                                        x2="230"
                                        y2="210"
                                        stroke={isCloudCovered ? "#94a3b8" : "#f59e0b"}
                                        strokeWidth={isCloudCovered ? "2" : "3.5"}
                                        strokeDasharray="6 4"
                                        className="animate-pulse"
                                    />
                                    <text
                                        x={(sunPosX + 230) / 2 + 10}
                                        y={(sunPosY + 210) / 2}
                                        fill={isCloudCovered ? "#64748b" : "#b45309"}
                                        fontSize="8"
                                        fontWeight="extrabold"
                                    >
                                        {isCloudCovered ? "Radiasi Difus" : "Radiasi Total (Global)"}
                                    </text>
                                </g>
                            )}

                            {/* ========================================================= */}
                            {/* INSTRUMEN PYRANOMETER FISIK (BMKG STANDARD)               */}
                            {/* ========================================================= */}
                            <g transform={`translate(230, 220) rotate(${isLevel ? 0 : 15})`} style={{ transition: 'transform 0.4s ease' }}>
                                {/* Tiang Dudukan Besi Penyangga */}
                                <rect x="-10" y="35" width="20" height="40" fill="#64748b" stroke="#334155" strokeWidth="2" />
                                <line x1="-50" y1="75" x2="50" y2="75" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

                                {/* Bodi Silinder Logam Utama (Heat Sink) */}
                                <rect x="-42" y="15" width="84" height="24" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />

                                {/* Piringan Putih Pelindung Radiasi (White Sun Shield) */}
                                <ellipse cx="0" cy="15" rx="72" ry="12" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                                <text x="0" y="17" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">PELINDUNG RADIASI (SUN SHIELD)</text>

                                {/* WATERPASS BULAT (BUBBLE LEVEL) DI SISI KIRI BADAN */}
                                <g transform="translate(-52, 10)">
                                    <circle cx="0" cy="0" r="8" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
                                    <circle cx="0" cy="0" r="5" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                                    {/* Gelembung Udara Waterpass */}
                                    <circle
                                        cx={isLevel ? 0 : -3.5}
                                        cy={isLevel ? 0 : -2.5}
                                        r="3"
                                        fill={isLevel ? "#10b981" : "#ef4444"}
                                        stroke="#ffffff"
                                        strokeWidth="1"
                                    />
                                </g>

                                {/* TABUNG CARTRIDGE SILICA GEL DI SISI KANAN BADAN */}
                                <g transform="translate(50, 10)">
                                    <rect x="-4" y="-7" width="8" height="15" rx="3" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
                                    {/* Butiran Silica: Biru (kering) vs Merah Muda (jenuh) */}
                                    <circle cx="0" cy="-3" r="2" fill={isSilicaDry ? "#2563eb" : "#f43f5e"} />
                                    <circle cx="-1.5" cy="1" r="1.5" fill={isSilicaDry ? "#3b82f6" : "#fb7185"} />
                                    <circle cx="1.5" cy="4" r="1.5" fill={isSilicaDry ? "#1d4ed8" : "#fda4af"} />
                                    <text x="0" y="14" textAnchor="middle" fill="#475569" fontSize="5" fontWeight="bold">Silica</text>
                                </g>

                                {/* Rangkaian Thermopile di Bawah Cakram Hitam */}
                                <rect x="-24" y="0" width="48" height="15" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
                                <text x="0" y="10" textAnchor="middle" fill="#0f172a" fontSize="6" fontWeight="bold">THERMOPILE (SEEBECK)</text>

                                {/* CAKRAM HITAM PENYERAP RADIASI (BLACK ABSORBER COATING) */}
                                <ellipse
                                    cx="0"
                                    cy="0"
                                    rx="22"
                                    ry="7"
                                    fill="url(#blackAbsorberGrad)"
                                    stroke={calculatedRadiation > 500 ? "#f97316" : "#475569"}
                                    strokeWidth={calculatedRadiation > 500 ? "2" : "1.5"}
                                    className={calculatedRadiation > 600 ? "animate-pulse" : ""}
                                />

                                {/* KUBAH KACA GANDA (DOUBLE GLASS DOME) */}
                                {/* Kubah Luar */}
                                <path
                                    d="M -34 0 A 34 32 0 0 1 34 0 Z"
                                    fill="url(#glassDomeGrad)"
                                    stroke="#38bdf8"
                                    strokeWidth="2"
                                />
                                {/* Kubah Dalam (Inner Dome WMO) */}
                                <path
                                    d="M -26 0 A 26 24 0 0 1 26 0 Z"
                                    fill="url(#glassDomeGrad)"
                                    stroke="#7dd3fc"
                                    strokeWidth="1.5"
                                    opacity="0.8"
                                />

                                {/* EMBUN DI DALAM KUBAH JIKA SILICA GEL JENUH (isSilicaDry = false) */}
                                {!isSilicaDry && (
                                    <g opacity="0.65">
                                        <ellipse cx="-12" cy="-14" rx="8" ry="5" fill="#ffffff" filter="blur(1px)" />
                                        <ellipse cx="10" cy="-16" rx="9" ry="6" fill="#ffffff" filter="blur(1px)" />
                                        <ellipse cx="0" cy="-22" rx="7" ry="4" fill="#ffffff" filter="blur(1px)" />
                                        <text x="0" y="-12" textAnchor="middle" fill="#0284c7" fontSize="6" fontWeight="bold">Embun!</text>
                                    </g>
                                )}

                                {/* NODA KOTORAN DEBU / BURUNG PADA KUBAH KACA JIKA isDomeDirty = TRUE */}
                                {isDomeDirty && (
                                    <g>
                                        <ellipse cx="6" cy="-18" rx="6" ry="4" fill="#78350f" opacity="0.8" />
                                        <circle cx="-10" cy="-12" r="3" fill="#92400e" opacity="0.75" />
                                        <circle cx="15" cy="-8" r="2.5" fill="#78350f" opacity="0.85" />
                                        <text x="0" y="-25" textAnchor="middle" fill="#b45309" fontSize="7" fontWeight="black">KOTOR!</text>
                                    </g>
                                )}
                            </g>

                            {/* DISPLAY DIGITAL DATA LOGGER BMKG DI SUDUT */}
                            <g transform="translate(340, 190)">
                                <rect x="0" y="0" width="105" height="65" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
                                <text x="52" y="16" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">LOGGER RADIASI</text>
                                <text x="52" y="38" textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="black" fontFamily="monospace">
                                    {calculatedRadiation}
                                </text>
                                <text x="52" y="52" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">Watt / m²</text>
                            </g>
                        </svg>
                    </div>

                    {/* BAR KONTROL TOMBOL INTERAKTIF TROUBLESHOOTING & SOP BMKG */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* 1. Toggle Awan Melintas */}
                        <button
                            onClick={() => setIsCloudCovered(!isCloudCovered)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                isCloudCovered
                                    ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isCloudCovered ? '☁️ Awan Aktif' : '☀️ Langit Cerah'}</span>
                        </button>

                        {/* 2. Tombol Pembersih Kubah Kaca */}
                        <button
                            onClick={() => setIsDomeDirty(!isDomeDirty)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                isDomeDirty
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isDomeDirty ? '🧼 Lap Kaca!' : '✨ Kubah Bersih'}</span>
                        </button>

                        {/* 3. Tombol Leveling Waterpass */}
                        <button
                            onClick={() => setIsLevel(!isLevel)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                !isLevel
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isLevel ? '⚖️ Luruskan!' : '✅ Waterpass 0°'}</span>
                        </button>

                        {/* 4. Tombol Desiccant Silica Gel */}
                        <button
                            onClick={() => setIsSilicaDry(!isSilicaDry)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                !isSilicaDry
                                    ? 'bg-pink-100 text-pink-800 border-pink-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isSilicaDry ? '🔄 Ganti Silica!' : '🔵 Silica Kering'}</span>
                        </button>
                    </div>

                    {/* SOP Observer BMKG Pemeliharaan Pyranometer */}
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                        <span className="text-sm shrink-0">📋</span>
                        <div>
                            <strong>Tiga Pilar SOP Observer BMKG:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10.5px]">
                                <li><strong>Waterpass:</strong> Memastikan alat tegak datar sempurna (gelembung di tengah nivo).</li>
                                <li><strong>Kebersihan Kubah:</strong> Menyeka noda/debu kubah ganda dengan kain mikrofiber.</li>
                                <li><strong>Silica Gel:</strong> Mengganti tabung desiccant jika warnanya berubah dari biru menjadi merah muda agar kubah kaca bagian dalam tidak berembun.</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* SISI KANAN (5 Kolom): SLIDER LINTASAN WAKTU, FISIKA THERMOPILE, SKALA UV INDEX & PLTS */}
                <div className="lg:col-span-5 space-y-4">
                    {/* PANEL SLIDER LINTASAN MATAHARI 06:00 - 18:00 */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">☀️</span>
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Waktu Lintasan Matahari</span>
                                    <span className="text-sm font-extrabold text-amber-400">
                                        Pukul {formattedTime} WIB
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">Intensitas Radiasi:</span>
                                <span className="text-base font-black text-amber-400 font-mono">
                                    {calculatedRadiation} W/m²
                                </span>
                            </div>
                        </div>

                        {/* Slider Waktu 06:00 - 18:00 */}
                        <div className="space-y-1">
                            <input
                                type="range"
                                min="6.0"
                                max="18.0"
                                step="0.25"
                                value={solarHour}
                                onChange={(e) => setSolarHour(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>06:00 (Terbit)</span>
                                <span>09:00</span>
                                <span className="text-amber-400 font-bold">12:00 (Zenit)</span>
                                <span>15:00</span>
                                <span>18:00 (Terbenam)</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                            💡 <em>Geser slider ke jam 12:00</em> untuk melihat radiasi global mencapai puncaknya (~1000 W/m²). Lalu coba klik tombol <strong>"Awan Melintas"</strong> untuk melihat drop radiasi seketika!
                        </p>
                    </div>

                    {/* KARTU TERPADU: KONVERSI FISIKA THERMOPILE & INDEKS UV EDUKASI PUBLIK */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                        {/* 1. Header & Bagian Indeks UV Edukasi Publik */}
                        <div className="space-y-2 pb-3.5 border-b border-slate-200/80">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>🛡️</span> Skala Indeks Sinar UV (Edukasi Publik)
                                </span>
                                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${uvData.color}`}>
                                    UV: {uvData.score} ({uvData.category})
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 font-medium">Tingkat Bahaya Paparan:</span>
                                    <span className="font-extrabold text-slate-900">{uvData.category}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {uvData.note}
                                </p>
                            </div>
                        </div>

                        {/* 2. Bagian Konversi Fisika Sensor Thermopile (Efek Seebeck) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Konversi Fisika Sensor Thermopile
                                </span>
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                                    Efek Seebeck
                                </span>
                            </div>

                            {/* Dua Kotak Tegangan Listrik Sensor */}
                            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                    <span className="text-[10px] text-slate-400 block">Tegangan Sensor (V)</span>
                                    <span className="text-sm font-bold text-indigo-700 font-mono">
                                        {thermopileMicroVolts} µV
                                    </span>
                                    <span className="text-[9px] text-slate-500">({thermopileMilliVolts} mV)</span>
                                </div>

                                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                    <span className="text-[10px] text-slate-400 block">Konstanta Kalibrasi (k)</span>
                                    <span className="text-sm font-bold text-slate-800 font-mono">10.0</span>
                                    <span className="text-[9px] text-slate-500">µV / (W/m²)</span>
                                </div>
                            </div>

                            {/* Rumus Konversi Radiasi BMKG */}
                            {/* <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[10px] text-amber-900 leading-relaxed font-mono">
                                <strong>Rumus:</strong> Radiasi = Tegangan (µV) / k = {thermopileMicroVolts} µV / 10.0 = <strong>{calculatedRadiation} W/m²</strong>
                            </div> */}

                            {/* POTENSI ENERGI PANEL SURYA / PLTS */}
                            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-emerald-800 block">Potensi Energi Surya (PLTS):</span>
                                    <span className="text-[11px] text-emerald-700">Daya Listrik per 1 m² panel surya (efisiensi 20%)</span>
                                </div>
                                <span className="text-base font-black text-emerald-800 font-mono">
                                    ~{solarPanelPowerWatts} Watt
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
