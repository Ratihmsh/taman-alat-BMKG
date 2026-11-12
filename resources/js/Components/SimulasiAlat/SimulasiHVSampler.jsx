import React, { useState } from 'react';

export default function SimulasiHVSampler() {
    // 1. Skenario Kualitas Udara Luar Ambien
    const [airScenario, setAirScenario] = useState('polusi');

    // 2. Kondisi Cuaca: 'cerah' vs 'hujan' (Washout Effect / Wet Deposition)
    const [weatherCondition, setWeatherCondition] = useState('cerah');

    // 3. Durasi Waktu Operasi Sampling (0 jam s/d 24 jam)
    const [samplingHours, setSamplingHours] = useState(24);

    // 4. Status Motor Hisap (Blower On / Off)
    const [isMotorRunning, setIsMotorRunning] = useState(true);

    // 5. Pengaturan Laju Aliran Udara / Flow Rate (1.0 - 1.8 m3/menit, Standar BMKG: 1.13 - 1.70 m3/menit)
    const [flowRate, setFlowRate] = useState(1.4);

    // 6. Tampilan Inspeksi Filter (Buka Atap Shelter)
    const [inspectFilter, setInspectFilter] = useState(false);

    // 7. Modal Pop-up Logbook Pengamatan BMKG
    const [showLogbookModal, setShowLogbookModal] = useState(false);

    // Data parameter dasar skenario polusi saat kondisi cerah
    const baseScenarioData = {
        bersih: {
            name: 'Udara Bersih (Pegunungan / Desa)',
            targetConcentrationDry: 22,
            dustRateFactorDry: 0.15,
            filterColorDry: '#cbd5e1',
        },
        sedang: {
            name: 'Udara Sedang (Perkotaan Normal)',
            targetConcentrationDry: 58,
            dustRateFactorDry: 0.45,
            filterColorDry: '#94a3b8',
        },
        polusi: {
            name: 'Udara Berpolusi (Jalan Raya / Industri)',
            targetConcentrationDry: 135,
            dustRateFactorDry: 0.85,
            filterColorDry: '#475569',
        },
        ekstrem: {
            name: 'Kritis / Kabut Asap Pekat (Karhutla)',
            targetConcentrationDry: 285,
            dustRateFactorDry: 1.0,
            filterColorDry: '#1e293b',
        }
    };

    const base = baseScenarioData[airScenario];

    // --- LOGIKA FISIKA METEOROLOGI: WASHOUT EFFECT (WET DEPOSITION) ---
    const isRaining = weatherCondition === 'hujan';
    const rainWashoutFactor = isRaining ? 0.28 : 1.0;

    const effectiveTargetConcentration = Math.round(base.targetConcentrationDry * rainWashoutFactor);
    const effectiveDustRateFactor = base.dustRateFactorDry * rainWashoutFactor;

    const activeFilterColor = isRaining
        ? (airScenario === 'ekstrem' ? '#64748b' : airScenario === 'polusi' ? '#94a3b8' : '#e2e8f0')
        : base.filterColorDry;

    // Evaluasi Kategori Mutu Udara / ISPU Dinamis
    const getIspuCategory = (conc) => {
        if (conc <= 50) return {
            label: 'BAIK (Sehat)',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            badgeBg: 'bg-emerald-500'
        };
        if (conc <= 100) return {
            label: 'SEDANG (Dapat Diterima)',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            badgeBg: 'bg-blue-500'
        };
        if (conc <= 199) return {
            label: 'TIDAK SEHAT (Sensitif Waspada)',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            badgeBg: 'bg-amber-500'
        };
        return {
            label: 'BERBAHAYA (Kritis)',
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            badgeBg: 'bg-rose-600'
        };
    };

    // --- KALKULASI METODE GRAVIMETRI BMKG (SNI 19-7119.3-2005) ---
    const totalMinutes = samplingHours * 60;
    const totalVolumeAir = Number((flowRate * totalMinutes).toFixed(1)); // m3
    const weightInitialW1 = 4.2500; // gram (filter bersih)

    const dustMassGrams = isMotorRunning
        ? Number(((effectiveTargetConcentration * totalVolumeAir) / 1000000).toFixed(4))
        : 0;

    const weightFinalW2 = Number((weightInitialW1 + dustMassGrams).toFixed(4));

    const calculatedConcentration = totalVolumeAir > 0
        ? Math.round(((weightFinalW2 - weightInitialW1) * 1000000) / totalVolumeAir)
        : 0;

    const ispuStatus = getIspuCategory(calculatedConcentration);

    const filterDarknessPct = Math.min(
        100,
        Math.round((samplingHours / 24) * effectiveDustRateFactor * 100)
    );

    const isFlowRateValid = flowRate >= 1.13 && flowRate <= 1.70;

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 relative">
            {/* Header Ringkas Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/60">
                        <span>🔬</span> Laboratorium Gravimetri Kualitas Udara BMKG
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🌪️</span> Simulasi High Volume Air Sampler (HV Sampler)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Uji efek sedotan motor vacuum 24 jam, akumulasi partikulat pada kertas filter, dan metode penimbangan gravimetri laboratorium.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ispuStatus.bg} ${ispuStatus.color} ${ispuStatus.border}`}>
                        ISPU: {ispuStatus.label}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        Durasi: {samplingHours} Jam
                    </span>
                </div>
            </div>

            {/* Layout Utama 1 Section Terpadu */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (7 Kolom): Diagram Penampang, Bar Kontrol Cuaca, SOP Filter & Tombol Logbook */}
                <div className="lg:col-span-7 space-y-4">
                    {/* 1. KANVAS DIAGRAM PENAMPANG */}
                    <div className={`relative rounded-2xl border transition-all duration-700 p-5 overflow-hidden ${
                        isRaining
                            ? 'border-blue-300 bg-gradient-to-b from-slate-200 via-sky-100 to-blue-100'
                            : 'border-slate-200 bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40'
                    }`}>
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span className={isMotorRunning && samplingHours > 0 ? 'inline-block animate-bounce text-blue-600' : 'text-slate-400'}>⚡</span>
                                <span>Status Motor: <strong>{isMotorRunning && samplingHours > 0 ? 'Menghisap Udara' : 'Mati / Siaga'}</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${isRaining ? 'text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md' : 'text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md'}`}>
                                {isRaining ? '🌧️ Efek Washout Hujan: Partikel Debu Luruh ke Tanah!' : '☀️ Cuaca Kering / Cerah: Debu Melayang Bebas'}
                            </span>
                        </div>

                        {/* Diagram SVG HV Sampler */}
                        <svg viewBox="0 0 460 300" className="w-full h-auto max-h-[290px] select-none drop-shadow-md mx-auto">
                            <defs>
                                <linearGradient id="metalShelterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#e2e8f0" />
                                    <stop offset="50%" stopColor="#f8fafc" />
                                    <stop offset="100%" stopColor="#cbd5e1" />
                                </linearGradient>
                                <linearGradient id="vacuumTubeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#334155" />
                                    <stop offset="100%" stopColor="#0f172a" />
                                </linearGradient>
                            </defs>

                            {/* ANIMASI HUJAN */}
                            {isRaining && (
                                <g stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 8" opacity="0.8" className="animate-pulse">
                                    <line x1="50" y1="10" x2="30" y2="80" />
                                    <line x1="100" y1="5" x2="80" y2="75" />
                                    <line x1="150" y1="15" x2="130" y2="85" />
                                    <line x1="330" y1="10" x2="310" y2="80" />
                                    <line x1="380" y1="5" x2="360" y2="75" />
                                    <line x1="420" y1="15" x2="400" y2="85" />
                                </g>
                            )}

                            {/* Efek Partikel Debu Luar */}
                            {isMotorRunning && samplingHours > 0 && (
                                <g opacity="0.85">
                                    {!isRaining ? (
                                        <>
                                            <circle cx="80" cy="50" r="3" fill="#64748b" className="animate-ping" />
                                            <circle cx="110" cy="30" r="2.5" fill="#475569" />
                                            <circle cx="340" cy="40" r="3" fill="#64748b" />
                                            <circle cx="370" cy="60" r="2.5" fill="#475569" className="animate-ping" />
                                            <text x="75" y="90" fill="#2563eb" fontSize="9" fontWeight="bold">Udara Ambien Masuk ➔</text>
                                            <text x="375" y="90" textAnchor="end" fill="#2563eb" fontSize="9" fontWeight="bold">➔ Udara Masuk</text>
                                        </>
                                    ) : (
                                        <>
                                            <text x="75" y="90" fill="#0284c7" fontSize="8" fontWeight="bold">Debu Tersapu Hujan ↓</text>
                                            <text x="375" y="90" textAnchor="end" fill="#0284c7" fontSize="8" fontWeight="bold">↓ Udara Bersih</text>
                                        </>
                                    )}

                                    <path d="M 90 75 Q 160 90 190 95" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="6 4" className="animate-pulse" />
                                    <path d="M 360 75 Q 290 90 260 95" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="6 4" className="animate-pulse" />
                                </g>
                            )}

                            {/* KAKI KABINET ALUMINIUM */}
                            <rect x="175" y="245" width="100" height="35" rx="4" fill="#64748b" stroke="#334155" strokeWidth="2" />
                            <line x1="150" y1="280" x2="300" y2="280" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

                            {/* BADAN KABINET ALUMINIUM */}
                            <rect x="165" y="95" width="120" height="150" rx="4" fill="url(#metalShelterGrad)" stroke="#64748b" strokeWidth="2.5" />

                            {/* Saluran Pembuangan Udara Bersih */}
                            {isMotorRunning && samplingHours > 0 && (
                                <g opacity="0.7">
                                    <path d="M 215 250 L 215 275" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 3" />
                                    <path d="M 235 250 L 235 275" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 3" />
                                    <text x="225" y="293" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="bold">Exhaust Bersih</text>
                                </g>
                            )}

                            {/* Motor Blower Vacuum */}
                            <rect x="190" y="155" width="70" height="70" rx="8" fill="url(#vacuumTubeGrad)" stroke="#475569" strokeWidth="2" />
                            <circle cx="225" cy="190" r="22" fill="#1e293b" />
                            <g transform="translate(225, 190)">
                                <line x1="-16" y1="0" x2="16" y2="0" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" className={isMotorRunning && samplingHours > 0 ? "animate-spin" : ""} />
                                <line x1="0" y1="-16" x2="0" y2="16" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" className={isMotorRunning && samplingHours > 0 ? "animate-spin" : ""} />
                                <circle cx="0" cy="0" r="5" fill="#f59e0b" />
                            </g>
                            <text x="225" y="218" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">MOTOR VACUUM</text>

                            {/* FILTER HOLDER & KERTAS FILTER */}
                            <g transform="translate(175, 105)">
                                <rect x="0" y="0" width="100" height="28" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
                                <rect x="5" y="4" width="90" height="20" rx="2" fill="#475569" />

                                <rect
                                    x="8"
                                    y="6"
                                    width="84"
                                    height="16"
                                    rx="2"
                                    fill={samplingHours === 0 ? '#ffffff' : activeFilterColor}
                                    style={{
                                        opacity: samplingHours === 0 ? 1.0 : 0.25 + (filterDarknessPct / 100) * 0.75,
                                        transition: 'all 0.5s ease'
                                    }}
                                    stroke="#94a3b8"
                                    strokeWidth="1"
                                />

                                {samplingHours > 0 && (
                                    <g opacity={Math.min(1, filterDarknessPct / 60)}>
                                        <circle cx="20" cy="14" r="1.5" fill="#0f172a" />
                                        <circle cx="35" cy="11" r="1.2" fill="#0f172a" />
                                        <circle cx="50" cy="15" r="1.8" fill="#0f172a" />
                                        <circle cx="68" cy="12" r="1.4" fill="#0f172a" />
                                        <circle cx="80" cy="14" r="1.6" fill="#0f172a" />
                                    </g>
                                )}

                                <text x="50" y="18" textAnchor="middle" fill={filterDarknessPct > 50 && !isRaining ? "#ffffff" : "#0f172a"} fontSize="8" fontWeight="extrabold">
                                    FILTER GLASS FIBER
                                </text>
                            </g>

                            {/* ATAP SHELTER MIRING */}
                            {!inspectFilter ? (
                                <g onClick={() => setInspectFilter(true)} className="cursor-pointer group">
                                    <polygon
                                        points="145,95 305,95 225,50"
                                        fill="url(#metalShelterGrad)"
                                        stroke="#475569"
                                        strokeWidth="2.5"
                                        className="group-hover:opacity-90 transition-opacity"
                                    />
                                    <line x1="225" y1="50" x2="225" y2="95" stroke="#94a3b8" strokeWidth="1.5" />
                                    <rect x="165" y="90" width="120" height="5" fill="#1e293b" opacity="0.7" />
                                    <text x="225" y="75" textAnchor="middle" fill="#334155" fontSize="8" fontWeight="bold">Atap Shelter Miring</text>
                                </g>
                            ) : (
                                <g onClick={() => setInspectFilter(false)} className="cursor-pointer group">
                                    <polygon
                                        points="145,55 305,55 225,10"
                                        fill="url(#metalShelterGrad)"
                                        stroke="#2563eb"
                                        strokeWidth="2.5"
                                    />
                                    <text x="225" y="38" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontWeight="bold">Atap Dibuka (Klik Tutup)</text>
                                </g>
                            )}

                            {/* ROTAMETER */}
                            <g transform="translate(295, 130)">
                                <rect x="0" y="0" width="75" height="55" rx="6" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
                                <text x="37" y="14" textAnchor="middle" fill="#475569" fontSize="7" fontWeight="bold">FLOW RECORDER</text>
                                <circle cx="37" cy="34" r="14" fill="#ffffff" stroke={isFlowRateValid ? "#10b981" : "#f43f5e"} strokeWidth="2" />
                                <text x="37" y="38" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="black">{flowRate}</text>
                                <text x="37" y="46" textAnchor="middle" fill="#64748b" fontSize="6">m³/menit</text>
                            </g>

                            {/* PREVIEW FILTER JIKA DIINSPEKSI */}
                            {inspectFilter && (
                                <g transform="translate(45, 120)">
                                    <rect x="0" y="0" width="105" height="95" rx="8" fill="#ffffff" stroke="#2563eb" strokeWidth="2" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.15))" />
                                    <text x="52" y="16" textAnchor="middle" fill="#1e3a8a" fontSize="8" fontWeight="black">KERTAS FILTER (8x10")</text>
                                    <rect
                                        x="12"
                                        y="24"
                                        width="80"
                                        height="48"
                                        rx="4"
                                        fill={samplingHours === 0 ? '#ffffff' : activeFilterColor}
                                        style={{ opacity: samplingHours === 0 ? 1 : 0.25 + (filterDarknessPct / 100) * 0.75 }}
                                        stroke="#cbd5e1"
                                        strokeWidth="1.5"
                                    />
                                    <text x="52" y="85" textAnchor="middle" fill="#475569" fontSize="7" fontWeight="bold">
                                        Debu: {filterDarknessPct}% {isRaining ? '(Luruh Hujan)' : ''}
                                    </text>
                                </g>
                            )}
                        </svg>
                    </div>

                    {/* 2. BAR KONTROL TOMBOL: CUACA HUJAN, INSPEKSI FILTER, & MOTOR */}
                    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 overflow-x-auto whitespace-nowrap">

                        {/* TOGGLE CUACA HUJAN */}
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-slate-700">Kondisi Cuaca:</span>
                            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl gap-1">
                                <button
                                    onClick={() => setWeatherCondition('cerah')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        !isRaining ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                                    }`}
                                >
                                    ☀️ Cerah
                                </button>
                                <button
                                    onClick={() => setWeatherCondition('hujan')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isRaining ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                                    }`}
                                >
                                    🌧️ Hujan
                                </button>
                            </div>
                        </div>

                        {/* INTIP FILTER & MOTOR */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setInspectFilter(!inspectFilter)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                    inspectFilter
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <span>{inspectFilter ? '🔒 Tutup Atap' : '🔍 Intip Filter'}</span>
                            </button>

                            <button
                                onClick={() => setIsMotorRunning(!isMotorRunning)}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                    isMotorRunning
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                                        : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                                }`}
                            >
                                <span>{isMotorRunning ? '🟢 Motor ON' : '🔴 Motor OFF'}</span>
                            </button>
                        </div>

                    </div>

                    {/* 3. MENGISI AREA KOSONG: EDUKASI SOP FILTER (DESIKATOR & PINSET) + TOMBOL LOGBOOK */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span>🧪</span> SOP Penanganan Filter (SNI 19-7119.3-2005)
                            </span>
                            <span className="text-[10px] text-blue-700 font-extrabold bg-blue-100 px-2 py-0.5 rounded-full">
                                Standar Akreditasi
                            </span>
                        </div>

                        {/* Dua Kotak Prosedur: Desikator & Pinset */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            {/* Desikator */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                                    <span className="text-sm">🫙</span>
                                    <span>Desikasi 24 Jam (Silica Gel)</span>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
                                    Sebelum & sesudah disampling, filter wajib diinapkan selama <strong>24 jam di dalam Desikator kedap udara</strong> untuk menghilangkan kadar air/kelembapan sehingga berat yang ditimbang murni berat partikulat debu.
                                </p>
                            </div>

                            {/* Pinset Khusus */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                                    <span className="text-sm">🥢</span>
                                    <span>Wajib Gunakan Pinset Khusus</span>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
                                    <strong>Dilarang menyentuh filter dengan tangan telanjang!</strong> Minyak, keringat, dan debu jari teknisi dapat mengkontaminasi berat filter hingga beberapa miligram dan merusak validitas data BMKG.
                                </p>
                            </div>
                        </div>

                        {/* Tombol Cetak / Lihat Formulir Logbook Pengamatan BMKG */}
                        <div className="pt-1">
                            <button
                                onClick={() => setShowLogbookModal(true)}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer transform hover:-translate-y-0.5"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>📄 Lihat Lembar Logbook Resmi Pengamatan BMKG (Formulir KU-1)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SISI KANAN (5 Kolom): SKENARIO, SLIDER DURASI, & LAB GRAVIMETRI */}
                <div className="lg:col-span-5 space-y-4">
                    {/* PANEL SKENARIO LINGKUNGAN & SLIDER WAKTU */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs space-y-3.5">
                        {/* 1. Pemilihan Skenario Lingkungan Ambien */}
                        <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                <span>🏙️</span> Lokasi / Kualitas Udara Luar:
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                                {Object.keys(baseScenarioData).map((key) => {
                                    const sc = baseScenarioData[key];
                                    const isSel = airScenario === key;
                                    const displayConc = isRaining ? Math.round(sc.targetConcentrationDry * 0.28) : sc.targetConcentrationDry;

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setAirScenario(key)}
                                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                                isSel
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                            }`}
                                        >
                                            <span className="text-[11px] font-bold block truncate">{sc.name.split('(')[0]}</span>
                                            <span className="text-[9px] text-slate-300">~{displayConc} µg/m³</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Slider Waktu Sampling (0 jam s/d 24 jam) */}
                        <div className="space-y-1 pt-2 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                    <span>⏱️</span> Durasi Sampling Udara:
                                </span>
                                <span className="text-sm font-black text-amber-400 font-mono">
                                    {samplingHours} Jam {samplingHours === 24 && '(Standar BMKG)'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="24"
                                step="1"
                                value={samplingHours}
                                onChange={(e) => setSamplingHours(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>0 Jam</span>
                                <span>6 Jam</span>
                                <span>12 Jam</span>
                                <span>24 Jam (Selesai)</span>
                            </div>
                        </div>

                        {/* 3. Slider Flow Rate */}
                        <div className="space-y-1 pt-2 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                    <span>💨</span> Flow Rate:
                                </span>
                                <span className={`text-sm font-black font-mono ${isFlowRateValid ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                                    {flowRate} m³/menit
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1.0"
                                max="1.8"
                                step="0.05"
                                value={flowRate}
                                onChange={(e) => setFlowRate(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                                <span>1.0 m³/m</span>
                                <span className="text-emerald-400 font-bold">1.13 - 1.70 (Standar WMO)</span>
                                <span>1.8 m³/m</span>
                            </div>
                        </div>

                        {/* Keterangan Insight Hujan */}
                        {isRaining && (
                            <div className="p-2.5 bg-blue-950/80 rounded-xl border border-blue-700/70 text-[11px] text-sky-200 leading-snug">
                                🌧️ <strong>Insight Meteorologi:</strong> Hujan menyebabkan <em>wet deposition / washout effect</em>. Tetesan air hujan mengikat partikel debu melayang dan membawanya jatuh ke tanah, sehingga konsentrasi polutan yang dihisap turun drastis ke <strong>{calculatedConcentration} µg/m³</strong>!
                            </div>
                        )}
                    </div>

                    {/* KARTU LAB GRAVIMETRI BMKG */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Prosedur Gravimetri Filter (SNI 19-7119.3)
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                                Lab Kualitas Udara
                            </span>
                        </div>

                        {/* Tiga Kotak Data Timbang */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[9px] text-slate-400 block">Berat Awal (W₁)</span>
                                <span className="text-xs font-bold text-slate-800 font-mono">{weightInitialW1.toFixed(4)} g</span>
                                <span className="text-[8px] text-slate-500">Filter Bersih</span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[9px] text-slate-400 block">Berat Akhir (W₂)</span>
                                <span className="text-xs font-bold text-blue-700 font-mono">{weightFinalW2.toFixed(4)} g</span>
                                <span className="text-[8px] text-blue-500">Debu Tersaring</span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[9px] text-slate-400 block">Vol. Udara (V)</span>
                                <span className="text-xs font-bold text-emerald-700 font-mono">{totalVolumeAir} m³</span>
                                <span className="text-[8px] text-emerald-500">Tersedot Total</span>
                            </div>
                        </div>

                        {/* Hasil Perhitungan Konsentrasi Akhir */}
                        <div className={`p-3.5 rounded-xl border ${ispuStatus.border} ${ispuStatus.bg}`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-700">Konsentrasi Partikulat (TSP / PM₁₀):</span>
                                <span className={`text-base font-black ${ispuStatus.color} font-mono`}>
                                    {calculatedConcentration} µg/m³
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                                <span className="text-slate-600">Kategori Mutu Udara BMKG:</span>
                                <span className={`font-extrabold ${ispuStatus.color}`}>
                                    {ispuStatus.label}
                                </span>
                            </div>
                        </div>

                        {/* Rumus Gravimetri Singkat & Koreksi Standar */}
                        <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/60 text-[10px] text-blue-900 leading-relaxed font-mono">
                            <strong>Rumus:</strong> ((W₂ - W₁) × 10⁶) / V = (( {weightFinalW2.toFixed(4)} - {weightInitialW1.toFixed(4)} ) × 10⁶) / {totalVolumeAir || 1} = <strong>{calculatedConcentration} µg/m³</strong>
                            <div className="text-[9px] text-slate-500 font-sans mt-1">
                                *Catatan: Volume udara (V) terkoreksi pada kondisi temperatur 25°C dan tekanan atmosfer 760 mmHg standar BMKG.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL POP-UP LOGBOOK FORMULIR OBSERVASI RESMI BMKG */}
            {showLogbookModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setShowLogbookModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tombol Tutup */}
                        <button
                            onClick={() => setShowLogbookModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* Kop Lembar Observasi BMKG */}
                        <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
                            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">Badan Meteorologi, Klimatologi, dan Geofisika</span>
                            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                                FORMULIR LOGBOOK PENGAMATAN KUALITAS UDARA (KU-1)
                            </h4>
                            <span className="text-[10px] text-slate-600">Instrumen: High Volume Air Sampler (HVAS - TSP/PM10)</span>
                        </div>

                        {/* Rincian Data Observasi */}
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Lokasi / Stasiun</span>
                                <span className="font-bold text-slate-800">Taman Alat Stasiun Klimatologi BMKG</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Skenario Ambien</span>
                                <span className="font-bold text-slate-800">{base.name.split('(')[0]}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Kondisi Cuaca Observasi</span>
                                <span className="font-bold text-slate-800">{isRaining ? 'Hujan (Washout Aktif)' : 'Cerah / Kering'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Durasi & Laju Hisap</span>
                                <span className="font-bold text-slate-800">{samplingHours} Jam @ {flowRate} m³/menit</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Total Volume Udara (V)</span>
                                <span className="font-mono font-bold text-slate-800">{totalVolumeAir} m³</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Bobot Filter Bersih (W₁)</span>
                                <span className="font-mono text-slate-700">{weightInitialW1.toFixed(4)} gram</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Bobot Filter + Debu (W₂)</span>
                                <span className="font-mono font-bold text-blue-700">{weightFinalW2.toFixed(4)} gram</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Massa Partikulat Terjaring</span>
                                <span className="font-mono font-bold text-amber-700">{dustMassGrams.toFixed(4)} gram</span>
                            </div>

                            {/* Kotak Hasil Akhir & Stempel Validasi */}
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Konsentrasi Akhir Terhitung:</span>
                                    <span className="text-lg font-black text-slate-900 font-mono">{calculatedConcentration} µg/m³</span>
                                </div>
                                <div className={`text-right px-3 py-1.5 rounded-lg border font-extrabold text-xs ${ispuStatus.bg} ${ispuStatus.color} ${ispuStatus.border}`}>
                                    {ispuStatus.label}
                                </div>
                            </div>
                        </div>

                        {/* Catatan Kaki Lembar Resmi */}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Metode SNI 19-7119.3-2005 Terakreditasi</span>
                            <span className="font-mono">VALIDATED BY OBSERVER</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
