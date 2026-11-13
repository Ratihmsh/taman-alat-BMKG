import React, { useState, useEffect } from 'react';

export default function SimulasiAutomaticRainGauge() {
    // 1. Slider Fleksibel Intensitas Hujan (0 - 60 mm/jam)
    const [rainRateMmH, setRainRateMmH] = useState(12.0); // default 12.0 mm/jam (Hujan Lebat)

    // 2. Status Bejana Jungkit (Tipping Bucket): 'left' atau 'right'
    const [bucketSide, setBucketSide] = useState('left');

    // 3. Counter Akumulasi Jungkitan (Tips) & Curah Hujan (mm)
    const [tipCount, setTipCount] = useState(14); // default 14 tips = 2.8 mm
    const [isPulsing, setIsPulsing] = useState(false); // Sinyal magnetik Reed Switch

    // 4. Status Kerusakan / Anomali Lapangan (SOP BMKG):
    const [isFunnelClogged, setIsFunnelClogged] = useState(false); // Corong tersumbat daun
    const [hasSpiderWeb, setHasSpiderWeb] = useState(false); // Sarang laba-laba di poros bawah
    const [hasWaterSpike, setHasWaterSpike] = useState(false); // Data spike lonjakan pasca-pembersihan
    const [isCalibrated, setIsCalibrated] = useState(true); // Kalibrasi sekrup 0.2 mm

    // --- KLASIFIKASI KATEGORI HUJAN RESMI BMKG ---
    const getRainCategory = (rate) => {
        if (rate <= 0.15) return { label: 'Rintik Halus (<0.2 mm)', category: 'Evaporation Loss (Tidak Terjungkit)', color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-300', isAlert: false };
        if (rate <= 1.0) return { label: 'Sangat Ringan (<1 mm/j)', category: 'Hujan Sangat Ringan', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', isAlert: false };
        if (rate <= 5.0) return { label: 'Hujan Ringan (1-5 mm/j)', category: 'Hujan Ringan', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', isAlert: false };
        if (rate <= 10.0) return { label: 'Hujan Sedang (5-10 mm/j)', category: 'Hujan Sedang', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', isAlert: false };
        if (rate <= 20.0) return { label: 'Hujan Lebat (10-20 mm/j)', category: 'Hujan Lebat', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', isAlert: false };
        return { label: 'Sangat Lebat (>20 mm/j)', category: 'Badai Konvektif Ekstrem', color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300', isAlert: true };
    };

    const categoryData = getRainCategory(rainRateMmH);

    // --- CATU DAYA TELEMETRI AWS (PANEL SURYA & BATERAI AKI 12V) ---
    // Logika realistis BMKG:
    // Semakin lebat hujan -> tutupan awan cumulonimbus semakin tebal gelap -> tegangan panel surya turun drastis
    // Cerah (0 mm/j) -> Solar 18.2V, Baterai 12.8V
    // Badai (50 mm/j) -> Solar 10.2V, Baterai drop menuju < 11.2V
    const solarVoltage = Number(Math.max(9.8, 18.2 - (rainRateMmH / 60) * 8.4).toFixed(1));
    const batteryVoltage = Number(Math.max(10.9, 12.8 - (rainRateMmH / 60) * 1.7).toFixed(1));
    const isBatteryLow = batteryVoltage < 11.2;

    // Volume per jungkitan standar WMO (corong 200 mm -> 0.20 mm per tip = ~6.28 ml)
    const mmPerTip = isCalibrated ? 0.20 : 0.26;
    const totalRainMm = Number((tipCount * mmPerTip).toFixed(1));

    // --- LOOP SIMULASI GERAK MEKANIK JUNGKITAN ---
    useEffect(() => {
        // Jika hujan <= 0.15 mm/j (rintik di bawah ambang batas) ATAU corong tersumbat ATAU ada sarang laba-laba -> TIDAK TERJUNGKIT!
        if (rainRateMmH <= 0.15 || isFunnelClogged || hasSpiderWeb) return;

        // Interval jungkitan (ms): semakin lebat, waktu antar-jungkitan semakin singkat
        // 1 mm/j ~ 4000ms | 60 mm/j ~ 180ms
        const intervalMs = Math.max(180, Math.round(720 / (rainRateMmH / 5)));

        const timer = setInterval(() => {
            setBucketSide((prev) => (prev === 'left' ? 'right' : 'left'));
            setTipCount((prev) => prev + 1);

            // Nyalakan pulsa sinyal reed switch jika baterai tidak drop
            if (!isBatteryLow) {
                setIsPulsing(true);
                setTimeout(() => setIsPulsing(false), 150);
            }
        }, intervalMs);

        return () => clearInterval(timer);
    }, [rainRateMmH, isFunnelClogged, hasSpiderWeb, isBatteryLow]);

    // Handle Pembersihan Daun Tersumbat (Memicu lonjakan data palsu / false spike)
    const handleCleanFunnel = () => {
        setIsFunnelClogged(false);
        setHasWaterSpike(true);
        setTipCount((prev) => prev + 6);
    };

    // Data grafik batang hyetograph mini (distribusi curah hujan per interval 10 menit)
    const hyetographData = [
        { time: '10:00', val: Number(((rainRateMmH / 60) * 1.5).toFixed(1)) },
        { time: '10:10', val: Number(((rainRateMmH / 60) * 3.5).toFixed(1)) },
        { time: '10:20', val: Number(((rainRateMmH / 60) * 7.5).toFixed(1)) },
        { time: '10:30', val: hasWaterSpike ? 14.8 : Number(((rainRateMmH / 60) * 10.0).toFixed(1)) },
        { time: '10:40', val: Number(((rainRateMmH / 60) * 6.5).toFixed(1)) },
        { time: '10:50', val: Number(((rainRateMmH / 60) * 2.0).toFixed(1)) },
    ];

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Ringkas Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/60">
                        <span>🌧️</span> Presipitasi & Hidrometeorologi Otomatis
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>⚖️</span> Simulasi Penakar Hujan Otomatis (ARG Tipping Bucket)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Penampang Sinar-X bejana jungkit, slider intensitas dinamis, daya baterai telemetri AWS, dan SOP Quality Control BMKG.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryData.bg} ${categoryData.color} ${categoryData.border}`}>
                        {categoryData.label} ({rainRateMmH} mm/j)
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-cyan-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        Total: {totalRainMm} mm ({tipCount} Tips)
                    </span>
                </div>
            </div>

            {/* Layout Utama Asimetris: 60% Visual Mekanik Sinar-X (7 Kolom) vs 40% Telemetri & QC (5 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (60% / 7 Kolom): KANVAS SINAR-X POTONGAN MELINTANG TIPPING BUCKET */}
                <div className="lg:col-span-7 space-y-3.5">


                    {/* STATUS PERINGATAN DINI BANJIR BANDANG BMKG */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        categoryData.isAlert
                            ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-pulse'
                            : 'bg-slate-900 text-white border-slate-800'
                    }`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>{categoryData.isAlert ? '🚨' : '📡'}</span> Status Mitigasi Hidrologi
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/30 text-white border border-white/20">
                                AWS Real-Time Alert
                            </span>
                        </div>

                        <div className="mt-2.5 space-y-1">
                            <span className="text-base sm:text-lg font-black block">
                                {categoryData.isAlert ? 'STATUS: WASPADA BANJIR BANDANG' : 'STATUS: AMAN TERKENDALI'}
                            </span>
                            <p className="text-[11px] text-white/90 leading-snug">
                                {categoryData.isAlert
                                    ? 'Intensitas hujan melebihi 20 mm/jam! Sistem otomatis memicu sirine peringatan dini & alert SMS BPBD.'
                                    : 'Laju presipitasi masih dalam toleransi aman kapasitas saluran drainase.'}
                            </p>
                        </div>
                    </div>

                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-5 overflow-hidden text-white shadow-xs">
                        {/* Status Bar Kecil di Atas Kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isPulsing ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                                <span>Sensor Reed Switch: <strong>{isBatteryLow ? '⚠️ TRANSMISI TERTUNDA (LOW BATTERY)' : isPulsing ? '📡 PULSA DIGITAL (+0.2 mm)' : 'Standby'}</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${isFunnelClogged ? 'text-amber-400 animate-pulse' : hasSpiderWeb ? 'text-purple-400 animate-pulse' : hasWaterSpike ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                                {isFunnelClogged
                                    ? '⚠️ Corong Tersumbat Daun!'
                                    : hasSpiderWeb
                                    ? '🕸️ Poros Terganjal Sarang Serangga!'
                                    : hasWaterSpike
                                    ? '⚠️ False Spike Terdeteksi!'
                                    : rainRateMmH <= 0.15
                                    ? 'ℹ️ Rintik Halus (<0.2mm Menguap)'
                                    : '✅ Jungkitan Berfungsi Normal'}
                            </span>
                        </div>

                        {/* Diagram SVG Penampang Sinar-X ARG Tipping Bucket */}
                        <svg viewBox="0 0 460 300" className="w-full h-auto select-none drop-shadow-md mx-auto">
                            <defs>
                                <linearGradient id="metalCasingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                                    <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#475569" stopOpacity="0.4" />
                                </linearGradient>
                                <linearGradient id="bucketGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#cbd5e1" />
                                    <stop offset="100%" stopColor="#64748b" />
                                </linearGradient>
                                <linearGradient id="waterFlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                                </linearGradient>
                            </defs>

                            {/* HUJAN TURUN DARI ATAS MENUJU CORONG */}
                            {rainRateMmH > 0.15 && (
                                <g opacity={Math.min(0.9, 0.3 + (rainRateMmH / 60) * 0.6)}>
                                    {[160, 185, 210, 230, 250, 275, 300].map((x, i) => (
                                        <line
                                            key={i}
                                            x1={x}
                                            y1="10"
                                            x2={x - 8}
                                            y2="45"
                                            stroke="#38bdf8"
                                            strokeWidth={rainRateMmH > 20 ? "2.5" : "1.5"}
                                            strokeDasharray="4 6"
                                            className="animate-pulse"
                                        />
                                    ))}
                                </g>
                            )}

                            {/* TABUNG SILINDER LUAR ARG (TRANSPARAN / SINAR-X) */}
                            <rect x="130" y="45" width="200" height="240" rx="8" fill="url(#metalCasingGrad)" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" />
                            <text x="140" y="60" fill="#94a3b8" fontSize="7" fontWeight="bold">DIAMETER CORONG 200 MM (WMO)</text>

                            {/* CORONG PENGUMPUL AIR HUJAN (COLLECTOR FUNNEL) */}
                            <path
                                d="M 135 50 L 325 50 L 235 110 L 225 110 Z"
                                fill="#334155"
                                stroke="#94a3b8"
                                strokeWidth="2"
                            />
                            <rect x="226" y="110" width="8" height="22" fill="#475569" stroke="#64748b" strokeWidth="1" />

                            {/* GENANGAN AIR DI CORONG JIKA TERSUMBAT DAUN */}
                            {isFunnelClogged && (
                                <g>
                                    <polygon points="160,75 300,75 235,110 225,110" fill="#0284c7" opacity="0.85" />
                                    <ellipse cx="230" cy="110" rx="14" ry="6" fill="#78350f" stroke="#b45309" strokeWidth="1" transform="rotate(-10 230 110)" />
                                    <text x="230" y="95" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="black">CORONG TERSUMBAT DAUN!</text>
                                </g>
                            )}

                            {/* TETESAN AIR MENGALIR KE DALAM BUCKET JIKA TIDAK TERSUMBAT */}
                            {!isFunnelClogged && rainRateMmH > 0 && (
                                <g>
                                    <line x1="230" y1="132" x2="230" y2="155" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" className="animate-pulse" />
                                    <circle cx="230" cy="155" r="2.5" fill="#38bdf8" />
                                </g>
                            )}

                            {/* BEJANA JUNGKIT KEMBAR (TWIN TIPPING BUCKETS) */}
                            <g
                                transform={`translate(230, 195) rotate(${bucketSide === 'left' ? -12 : 12})`}
                                style={{ transition: hasSpiderWeb ? 'none' : 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                            >
                                <circle cx="0" cy="0" r="5" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
                                <line x1="-55" y1="0" x2="55" y2="0" stroke="#0f172a" strokeWidth="3" />

                                {/* Mangkuk Kiri */}
                                <path
                                    d="M -5 0 L -48 -22 L -52 14 Z"
                                    fill="url(#bucketGrad)"
                                    stroke="#334155"
                                    strokeWidth="1.5"
                                />
                                {bucketSide === 'right' && (
                                    <polygon points="-8, -2 -42, -18 -46, 10" fill="url(#waterFlowGrad)" />
                                )}

                                {/* Mangkuk Kanan */}
                                <path
                                    d="M 5 0 L 48 -22 L 52 14 Z"
                                    fill="url(#bucketGrad)"
                                    stroke="#334155"
                                    strokeWidth="1.5"
                                />
                                {bucketSide === 'left' && (
                                    <polygon points="8, -2 42, -18 46, 10" fill="url(#waterFlowGrad)" />
                                )}

                                {/* Magnet kecil di poros */}
                                <rect x="-4" y="6" width="8" height="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                            </g>

                            {/* SARANG LABA-LABA MENGIKAT POROS JIKA hasSpiderWeb = TRUE */}
                            {hasSpiderWeb && (
                                <g transform="translate(230, 195)" opacity="0.85">
                                    <line x1="-25" y1="-5" x2="25" y2="15" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="2 2" />
                                    <line x1="-20" y1="12" x2="20" y2="-10" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="2 2" />
                                    <circle cx="0" cy="5" r="14" fill="none" stroke="#f8fafc" strokeWidth="1" strokeDasharray="3 3" />
                                    <text x="0" y="32" textAnchor="middle" fill="#d8b4fe" fontSize="7" fontWeight="bold">🕸️ POROS TERGANJAL SARANG SERANGGA</text>
                                </g>
                            )}

                            {/* EVAPORATION LOSS PADA RINTIK HALUS (<0.2 mm) */}
                            {rainRateMmH > 0 && rainRateMmH <= 0.15 && (
                                <g transform="translate(230, 175)">
                                    <path d="M -5 0 Q -10 -15 0 -22 T 5 -30" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
                                    <text x="0" y="-35" textAnchor="middle" fill="#67e8f9" fontSize="6" fontWeight="bold">Air Menguap (0.15mm Belum Terjungkit)</text>
                                </g>
                            )}

                            {/* REED SWITCH (SENSOR SAKELAR MAGNETIK TETAP) */}
                            <g transform="translate(230, 218)">
                                <rect x="-8" y="0" width="16" height="8" rx="2" fill="#1e293b" stroke={isPulsing ? "#10b981" : "#64748b"} strokeWidth="1.5" />
                                <text x="0" y="6" textAnchor="middle" fill={isPulsing ? "#34d399" : "#94a3b8"} fontSize="5" fontWeight="bold">REED</text>
                                {isPulsing && (
                                    <g>
                                        <circle cx="0" cy="4" r="14" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" />
                                        <line x1="0" y1="8" x2="0" y2="28" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" />
                                    </g>
                                )}
                            </g>

                            {/* SEKRUP KALIBRASI VOLUME 0.2 MM DI BAWAH TIAP MANGKUK */}
                            <g transform="translate(182, 222)">
                                <line x1="0" y1="0" x2="0" y2="12" stroke="#e2e8f0" strokeWidth="2" />
                                <circle cx="0" cy="0" r="3" fill="#ca8a04" />
                                <text x="0" y="20" textAnchor="middle" fill="#94a3b8" fontSize="5">Baut 0.2mm</text>
                            </g>
                            <g transform="translate(278, 222)">
                                <line x1="0" y1="0" x2="0" y2="12" stroke="#e2e8f0" strokeWidth="2" />
                                <circle cx="0" cy="0" r="3" fill="#ca8a04" />
                                <text x="0" y="20" textAnchor="middle" fill="#94a3b8" fontSize="5">Baut 0.2mm</text>
                            </g>

                            {/* SALURAN PEMBUANGAN AIR (DRAIN HOLES) */}
                            <rect x="195" y="270" width="70" height="10" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                            <text x="230" y="277" textAnchor="middle" fill="#64748b" fontSize="6" fontWeight="bold">LUBANG DRAINASE KELUAR</text>
                        </svg>

                        {/* SLIDER FLEKSIBEL INTENSITAS HUJAN (0 - 60 MM/JAM) */}
                        <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                                    <span>🎚️</span> Slider Intensitas Curah Hujan:
                                </span>
                                <span className={`font-mono font-black ${categoryData.color}`}>
                                    {rainRateMmH.toFixed(1)} mm / jam ({categoryData.category})
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="60"
                                step="0.5"
                                value={rainRateMmH}
                                onChange={(e) => setRainRateMmH(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>0 (Kering)</span>
                                <span>2.5 (Ringan)</span>
                                <span>8 (Sedang)</span>
                                <span>20 (Lebat)</span>
                                <span className="text-rose-400 font-bold">50+ (Ekstrem)</span>
                            </div>
                        </div>
                    </div>

                    {/* MINI-BAR SOP OPERASIONAL & TROUBLESHOOTING BMKG */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* 1. Toggle Corong Tersumbat Daun */}
                        <button
                            onClick={() => {
                                if (isFunnelClogged) {
                                    handleCleanFunnel();
                                } else {
                                    setIsFunnelClogged(true);
                                }
                            }}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                isFunnelClogged
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isFunnelClogged ? '🧹 Bersihkan Daun!' : '🍂 Sumbat Daun'}</span>
                        </button>

                        {/* 2. Toggle Sarang Laba-laba / Serangga di Poros */}
                        <button
                            onClick={() => setHasSpiderWeb(!hasSpiderWeb)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                hasSpiderWeb
                                    ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{hasSpiderWeb ? '🧹 Bersihkan Poros!' : '🕸️ Sarang Laba²'}</span>
                        </button>

                        {/* 3. Tombol QC: Hapus Spike Data Palsu */}
                        <button
                            onClick={() => setHasWaterSpike(false)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                hasWaterSpike
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{hasWaterSpike ? '🛡️ Hapus Spike!' : '✅ QC Bersih'}</span>
                        </button>

                        {/* 4. Uji Kalibrasi Sekrup Stopper 0.2 mm */}
                        <button
                            onClick={() => setIsCalibrated(!isCalibrated)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                !isCalibrated
                                    ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isCalibrated ? '🔧 Kalibrasi Sekrup' : '⚖️ Presisi 0.2mm'}</span>
                        </button>
                    </div>
                </div>

                {/* SISI KANAN (40% / 5 Kolom): CATU DAYA TELEMETRI AWS, HYETOGRAPH, & PERINGATAN BANJIR */}
                <div className="lg:col-span-5 space-y-4">
                    {/* WIDGET CATU DAYA & TELEMETRI AWS (SOLAR PANEL & BATERAI AKI 12V) */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>⚡</span> Daya Telemetri Pos Hujan Otomatis
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isBatteryLow ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                                {isBatteryLow ? 'Low Battery (<11.2V)' : 'Daya Stabil (Normal)'}
                            </span>
                        </div>

                        {/* Dua Bar Indikator: Solar Panel Voltage & Baterai 12V */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block mb-1">☀️ Solar Panel Output</span>
                                <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                                    {solarVoltage} Volt
                                </span>
                                <span className="text-[9px] text-slate-500 block">Matahari / Awan</span>
                            </div>

                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block mb-1">🔋 Aki Kering 12V</span>
                                <span className={`text-sm sm:text-base font-black font-mono ${isBatteryLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {batteryVoltage} Volt
                                </span>
                                <span className="text-[9px] text-slate-500 block">Ambang Batas: 11.2V</span>
                            </div>
                        </div>

                        {/* Status Transmisi Modem GSM / Satelit */}
                        <div className={`p-2.5 rounded-xl border text-[11px] leading-snug flex items-center justify-between ${
                            isBatteryLow
                                ? 'bg-rose-950/50 text-rose-200 border-rose-800'
                                : 'bg-slate-800/80 text-slate-300 border-slate-700'
                        }`}>
                            <span>Status Pengiriman Data:</span>
                            <strong className={isBatteryLow ? 'text-rose-400' : 'text-emerald-400'}>
                                {isBatteryLow ? '⚠️ Tertunda (Simpan di Datalogger)' : '📡 Terkirim Real-Time (GSM OK)'}
                            </strong>
                        </div>
                    </div>

                    {/* GRAFIK HYETOGRAPH REAL-TIME (INTENSITAS HUJAN PER INTERVAL WAKTU) */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                                Grafik Hyetograph Real-Time (mm / 10 Menit)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                                Pos AWS BMKG
                            </span>
                        </div>

                        {/* Bar Chart Hyetograph */}
                        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
                            <svg viewBox="0 0 320 85" className="w-full h-20 select-none overflow-visible">
                                <line x1="25" y1="70" x2="310" y2="70" stroke="#334155" strokeWidth="1" />
                                <line x1="25" y1="40" x2="310" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="25" y1="10" x2="310" y2="10" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                                <text x="20" y="73" fill="#64748b" fontSize="7" textAnchor="end">0</text>
                                <text x="20" y="43" fill="#64748b" fontSize="7" textAnchor="end">8</text>
                                <text x="20" y="13" fill="#64748b" fontSize="7" textAnchor="end">16</text>

                                {hyetographData.map((d, i) => {
                                    const barHeight = Math.min(60, (d.val / 16) * 60);
                                    const x = 45 + i * 45;
                                    const y = 70 - barHeight;
                                    const isSpikeBar = i === 3 && hasWaterSpike;

                                    return (
                                        <g key={i}>
                                            <rect
                                                x={x - 12}
                                                y={y}
                                                width="24"
                                                height={barHeight}
                                                rx="2"
                                                fill={isSpikeBar ? "#f43f5e" : d.val > 6 ? "#f59e0b" : "#38bdf8"}
                                                stroke={isSpikeBar ? "#fda4af" : "#0284c7"}
                                                strokeWidth="1"
                                            />
                                            <text x={x} y={y - 3} fill={isSpikeBar ? "#f43f5e" : "#e0f2fe"} fontSize="6" fontWeight="bold" textAnchor="middle">
                                                {d.val}
                                            </text>
                                            <text x={x} y="80" fill="#64748b" fontSize="7" textAnchor="middle">
                                                {d.time}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>

                    {/* KARTU TERPADU: KALKULATOR PULSA JUNGKITAN & SPESIFIKASI WMO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>🧮</span> Kalkulator Pulsa Bejana (WMO No. 8)
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                                1 Tip = {mmPerTip.toFixed(2)} mm
                            </span>
                        </div>

                        {/* Dua Kotak Angka Akumulasi */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Frekuensi Jungkitan</span>
                                <span className="text-base font-black text-slate-800 font-mono">
                                    {tipCount} Tips
                                </span>
                                <span className="text-[9px] text-slate-500">Pulsa Sakelar Reed</span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Total Curah Hujan</span>
                                <span className="text-base font-black text-blue-700 font-mono">
                                    {totalRainMm} mm
                                </span>
                                <span className="text-[9px] text-slate-500">Akumulasi Terukur</span>
                            </div>
                        </div>

                        {/* Rumus Konversi Pulsa BMKG */}
                        <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[10.5px] text-amber-950 font-mono leading-relaxed">
                            <strong>Rumus:</strong> Hujan (mm) = Jumlah Jungkitan × {mmPerTip.toFixed(2)} mm <br />
                            Hujan = {tipCount} × {mmPerTip.toFixed(2)} = <strong>{totalRainMm} mm</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
