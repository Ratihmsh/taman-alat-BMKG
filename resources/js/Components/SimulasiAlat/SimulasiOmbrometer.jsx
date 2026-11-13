import React, { useState } from 'react';

export default function SimulasiOmbrometer() {
    // 1. Pilihan Waktu Pengamatan (Disiplin Waktu "Golden Hour 07:00 WIB")
    // '07:00' (Tepat Waktu, data valid 100%), '11:00' (Telat 4 jam, air terpanaskan kaleng dan menguap)
    const [observationTime, setObservationTime] = useState('07:00');

    // 2. Skenario Hujan Semalaman:
    // 'light' (Hujan Sedang: 12.5 mm, cukup 1x tuang),
    // 'heavy' (Hujan Lebat: 38.5 mm, butuh 2x tuang batch: 25.0 mm + 13.5 mm),
    // 'trace' (Hujan Rintik / Jejak: <0.5 mm -> dicatat "TT" / Trace)
    const [rainScenario, setRainScenario] = useState('heavy');

    // 3. Status Penuangan Air dari Kran ke Gelas Ukur:
    const [isTapOpen, setIsTapOpen] = useState(false);
    const [currentPourStep, setCurrentPourStep] = useState(1);
    const [waterInGlassMm, setWaterInGlassMm] = useState(0);
    const [recordedBatches, setRecordedBatches] = useState([]);

    // 4. Mini-Game Presisi: Ketinggian Sudut Pandang Mata (Eye-Level Slider)
    const [eyeLevelOffset, setEyeLevelOffset] = useState(4); // Default agak miring

    // 5. Status Kalibrasi Fisik Lapangan & Troubleshooting (SOP BMKG):
    const [isHeight120cm, setIsHeight120cm] = useState(true); // Ketinggian corong 120 cm
    const [isObstacleFree, setIsObstacleFree] = useState(true); // Bebas naungan pohon
    const [isWaterpassLevel, setIsWaterpassLevel] = useState(true); // Mulut corong datar
    
    // --- FITUR BARU 2: SARINGAN CORONG TERSUMBAT DAUN ---
    const [isStrainerClogged, setIsStrainerClogged] = useState(false);

    // --- FITUR BARU 3: KRAN BOCOR / MENETES KE TANAH ---
    const [isTapLeaking, setIsTapLeaking] = useState(false);

    // --- FITUR BARU 4: SUDAH MENGETUK TETESAN TERAKHIR ---
    const [hasTappedLastDrop, setHasTappedLastDrop] = useState(false);

    // --- DATA SKENARIO HUJAN & EFEK EVAPORASI / KEBOCORAN ---
    const baseRainTarget = rainScenario === 'light' ? 12.5 : rainScenario === 'heavy' ? 38.5 : 0.3;
    const evaporationLoss = observationTime === '11:00' ? (baseRainTarget > 1 ? 2.8 : 0.3) : 0.0;
    const leakageLoss = isTapLeaking ? (baseRainTarget > 5 ? 7.0 : 0.2) : 0.0;
    
    const effectiveWaterTotal = Math.max(0, Number((baseRainTarget - evaporationLoss - leakageLoss).toFixed(1)));

    // Target isi gelas pada langkah saat ini:
    const getTargetForCurrentStep = () => {
        if (isStrainerClogged) return 0; // Air tidak masuk ke kaleng bawah karena tertahan di corong!
        if (rainScenario === 'trace') return effectiveWaterTotal;
        if (currentPourStep === 1) {
            return Math.min(25.0, effectiveWaterTotal);
        } else {
            return Math.max(0, Number((effectiveWaterTotal - 25.0).toFixed(1)));
        }
    };

    const currentStepTarget = getTargetForCurrentStep();

    // Handle Buka Kran (Mengisi Gelas Ukur)
    const handleOpenTap = () => {
        setIsTapOpen(true);
        setHasTappedLastDrop(false);
        setTimeout(() => {
            setWaterInGlassMm(currentStepTarget);
            setIsTapOpen(false);
        }, 600);
    };

    // Handle Mengetuk Tetesan Terakhir (+0.1 mm)
    const handleTapLastDrop = () => {
        if (hasTappedLastDrop || waterInGlassMm === 0) return;
        setWaterInGlassMm((prev) => Number((prev + 0.1).toFixed(1)));
        setHasTappedLastDrop(true);
    };

    // Handle Catat & Buang Air Gelas Ukur (Lanjut ke batch berikutnya)
    const handleRecordAndEmpty = () => {
        if (waterInGlassMm === 0) return;
        setRecordedBatches((prev) => [...prev, waterInGlassMm]);
        setWaterInGlassMm(0);
        setHasTappedLastDrop(false);

        if (rainScenario === 'heavy' && currentPourStep === 1) {
            setCurrentPourStep(2);
        }
    };

    // Reset Alur Pengamatan jika Skenario Diubah
    const handleScenarioChange = (scen) => {
        setRainScenario(scen);
        setCurrentPourStep(1);
        setWaterInGlassMm(0);
        setRecordedBatches([]);
        setIsTapOpen(false);
        setHasTappedLastDrop(false);
    };

    const totalAccumulatedMm = Number(
        (recordedBatches.reduce((acc, curr) => acc + curr, 0) + waterInGlassMm).toFixed(1)
    );

    // Evaluasi Meniskus Mata (Eye-Level)
    const isMeniscusAligned = Math.abs(eyeLevelOffset) <= 1;
    const apparentReading = isMeniscusAligned
        ? waterInGlassMm
        : eyeLevelOffset > 1
        ? Number((waterInGlassMm + (eyeLevelOffset * 0.2)).toFixed(1))
        : Number((waterInGlassMm + (eyeLevelOffset * 0.2)).toFixed(1));

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Ringkas Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/60">
                        <span>🌧️</span> Curah Hujan Manual (Ground Truth Standard)
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🪣</span> Simulasi Penakar Hujan Manual (Ombrometer OBS)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Standar validasi mutlak BMKG: disiplin waktu 07:00 WIB, penuangan bertahap (&gt;25 mm), presisi meniskus, dan SOP tetesan terakhir.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                        Waktu: {observationTime} WIB {observationTime === '07:00' ? '(Tepat Waktu)' : '(Telat / Evaporasi)'}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-cyan-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        {rainScenario === 'trace' ? 'Hasil: TT (Trace)' : `Total: ${totalAccumulatedMm} mm`}
                    </span>
                </div>
            </div>

            {/* Layout Utama Asimetris: 60% Visual Kaleng OBS & Gelas Ukur (7 Kolom) vs 40% Kontrol & Analisis (5 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (60% / 7 Kolom): KANVAS VISUAL PENAMPANG OMBROMETER OBS & GELAS UKUR */}
                <div className="lg:col-span-7 space-y-3.5">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100 p-4 sm:p-5 overflow-hidden shadow-xs">
                        {/* Status Bar Kecil di Atas Kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>💧</span>
                                <span>Status Kran: <strong>{isTapOpen ? 'Air Mengucur ke Gelas Ukur...' : waterInGlassMm > 0 ? 'Air Tertampung di Gelas Ukur' : 'Kran Tertutup'}</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${isStrainerClogged ? 'text-rose-600 animate-pulse' : isTapLeaking ? 'text-amber-600 animate-pulse' : isMeniscusAligned ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                                {isStrainerClogged 
                                    ? '⚠️ Saringan Tersumbat! Air Menggenang di Corong' 
                                    : isTapLeaking
                                    ? '⚠️ Kran Bocor! Air Menetes ke Tanah (-7.0mm)'
                                    : isMeniscusAligned 
                                    ? '🎯 Sudut Mata Tepat Sejajar Meniskus Bawah!' 
                                    : eyeLevelOffset > 1 
                                    ? '⚠️ Pandangan Terlalu Tinggi (Paralaks Atas)' 
                                    : '⚠️ Pandangan Terlalu Rendah (Paralaks Bawah)'}
                            </span>
                        </div>

                        {/* Diagram SVG Penampang Ombrometer OBS & Gelas Ukur */}
                        <svg viewBox="0 0 460 310" className="w-full h-auto select-none drop-shadow-md mx-auto">
                            <defs>
                                <linearGradient id="galvanizedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#475569" />
                                    <stop offset="50%" stopColor="#94a3b8" />
                                    <stop offset="100%" stopColor="#64748b" />
                                </linearGradient>
                                <linearGradient id="brassTapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ca8a04" />
                                    <stop offset="100%" stopColor="#eab308" />
                                </linearGradient>
                                <linearGradient id="glassMeasureGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                                    <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.75" />
                                </linearGradient>
                            </defs>

                            {/* POHON MANGGA RINDANG JIKA isObstacleFree = false */}
                            {!isObstacleFree && (
                                <g transform="translate(80, 70)" opacity="0.85">
                                    <circle cx="0" cy="0" r="45" fill="#15803d" />
                                    <circle cx="-20" cy="-10" r="35" fill="#166534" />
                                    <circle cx="20" cy="-5" r="38" fill="#14532d" />
                                    <text x="0" y="4" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="black">⚠️ DI BAWAH POHON!</text>
                                    <text x="0" y="14" textAnchor="middle" fill="#ffffff" fontSize="6">(Tetesan Daun Tidak Alami)</text>
                                </g>
                            )}

                            {/* TANAH TAMAN ALAT */}
                            <rect x="0" y="275" width="460" height="35" fill="#16a34a" />
                            <line x1="0" y1="275" x2="460" y2="275" stroke="#15803d" strokeWidth="2" />

                            {/* TIANG PENYANGGA KAYU / BESI OMBROMETER (KETINGGIAN 120 CM) */}
                            {(() => {
                                const poleTopY = isHeight120cm ? 140 : 210;
                                const poleHeight = 275 - poleTopY;
                                return (
                                    <g transform="translate(130, 0)">
                                        <rect x="-14" y={poleTopY} width="28" height={poleHeight} fill="#78350f" stroke="#451a03" strokeWidth="2" rx="2" />
                                        <text x="0" y={270} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                                            {isHeight120cm ? 'Tinggi 120 cm (Standar BMKG)' : '⚠️ Terlalu Pendek (50 cm)'}
                                        </text>
                                    </g>
                                );
                            })()}

                            {/* TABUNG SILINDER OMBROMETER OBS LOGAM */}
                            {(() => {
                                const obsBaseY = isHeight120cm ? 140 : 210;
                                const tiltDeg = isWaterpassLevel ? 0 : 12;
                                return (
                                    <g
                                        transform={`translate(130, ${obsBaseY}) rotate(${tiltDeg})`}
                                        style={{ transition: 'transform 0.4s ease' }}
                                    >
                                        <rect x="-35" y="-95" width="70" height="95" fill="url(#galvanizedGrad)" stroke="#334155" strokeWidth="2" rx="3" />
                                        
                                        {/* CORONG PENANGKAP ATAS (LUAS 100 CM², DIAMETER 11.3 CM) */}
                                        <path
                                            d="M -36 -95 L 36 -95 L 8 -55 L -8 -55 Z"
                                            fill="#475569"
                                            stroke="#1e293b"
                                            strokeWidth="1.5"
                                        />
                                        <line x1="-36" y1="-95" x2="36" y2="-95" stroke="#ffffff" strokeWidth="2" />
                                        <text x="0" y="-100" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="black">
                                            MULUT CORONG 100 CM²
                                        </text>

                                        {/* GENANGAN AIR JIKA SARINGAN TERSUMBAT DAUN */}
                                        {isStrainerClogged && (
                                            <g>
                                                <polygon points="-28,-80 28,-80 8,-55 -8,-55" fill="#0284c7" opacity="0.85" />
                                                <ellipse cx="0" cy="-55" rx="8" ry="4" fill="#78350f" stroke="#b45309" strokeWidth="1" />
                                                <text x="0" y="-84" textAnchor="middle" fill="#fef08a" fontSize="6" fontWeight="bold">SARINGAN TERSUMBAT!</text>
                                            </g>
                                        )}

                                        {/* EVAPORASI UAP AIR PANAS JIKA TELAT DIUKUR (11:00 WIB) */}
                                        {observationTime === '11:00' && (
                                            <g transform="translate(0, -60)">
                                                <path d="M -8 0 Q -14 -20 0 -30 T 8 -40" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
                                                <text x="0" y="-25" textAnchor="middle" fill="#b45309" fontSize="6" fontWeight="bold">Evaporasi Panas (-2.8mm)</text>
                                            </g>
                                        )}

                                        {/* KRAN KUNINGAN PENGELUAR AIR DI BAGIAN BAWAH */}
                                        <g transform="translate(35, -15)">
                                            <rect x="0" y="-4" width="22" height="8" fill="url(#brassTapGrad)" stroke="#78350f" strokeWidth="1" rx="1" />
                                            <rect
                                                x="10"
                                                y="-10"
                                                width="4"
                                                height="12"
                                                fill="#b45309"
                                                stroke="#451a03"
                                                strokeWidth="1"
                                                transform={isTapOpen ? "rotate(90 12 -4)" : "rotate(0 12 -4)"}
                                            />
                                            <rect x="18" y="0" width="6" height="8" fill="url(#brassTapGrad)" stroke="#78350f" strokeWidth="1" />
                                            
                                            {/* AIR MENGUCUR SAAT KRAN DIBUKA */}
                                            {isTapOpen && (
                                                <g>
                                                    <line x1="21" y1="8" x2="21" y2="70" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
                                                    <circle cx="21" cy="70" r="3" fill="#38bdf8" />
                                                </g>
                                            )}

                                            {/* TETESAN BOCOR KE TANAH JIKA isTapLeaking = true */}
                                            {isTapLeaking && !isTapOpen && (
                                                <g>
                                                    <circle cx="21" cy="18" r="2.5" fill="#38bdf8" className="animate-ping" />
                                                    <line x1="21" y1="18" x2="21" y2="100" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 6" className="animate-pulse" />
                                                    <text x="28" y="24" fill="#b91c1c" fontSize="6" fontWeight="bold">Menetes Bocor!</text>
                                                </g>
                                            )}

                                            {/* TETESAN TERAKHIR YANG MENGGANTUNG SEBELUM DIKETUK */}
                                            {!hasTappedLastDrop && waterInGlassMm > 0 && !isTapOpen && (
                                                <g>
                                                    <circle cx="21" cy="10" r="2" fill="#38bdf8" className="animate-pulse" />
                                                    <text x="28" y="12" fill="#0284c7" fontSize="5" fontWeight="bold">Sisa Tetesan</text>
                                                </g>
                                            )}
                                        </g>
                                    </g>
                                );
                            })()}

                            {/* GELAS UKUR KHUSUS OBS (BERSKALA 0 - 25 MM) */}
                            <g transform="translate(265, 120)">
                                <rect x="-24" y="0" width="48" height="155" rx="3" fill="url(#glassMeasureGrad)" stroke="#38bdf8" strokeWidth="2" />
                                <rect x="-35" y="152" width="70" height="6" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                                <text x="0" y="-6" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="black">
                                    GELAS UKUR OBS (0-25 MM)
                                </text>

                                {[0, 5, 10, 15, 20, 25].map((mmVal) => {
                                    const yPos = 150 - (mmVal / 25) * 140;
                                    return (
                                        <g key={mmVal}>
                                            <line x1="10" y1={yPos} x2="24" y2={yPos} stroke="#0369a1" strokeWidth="1.5" />
                                            <text x="8" y={yPos + 3} textAnchor="end" fill="#0369a1" fontSize="7" fontWeight="bold">
                                                {mmVal}
                                            </text>
                                        </g>
                                    );
                                })}

                                {waterInGlassMm > 0 && (() => {
                                    const waterHeightPx = (waterInGlassMm / 25) * 140;
                                    const waterTopY = 150 - waterHeightPx;
                                    return (
                                        <g>
                                            <rect x="-22" y={waterTopY} width="44" height={waterHeightPx} fill="#38bdf8" opacity="0.75" />
                                            <path
                                                d={`M -22 ${waterTopY} Q 0 ${waterTopY + 4} 22 ${waterTopY}`}
                                                fill="none"
                                                stroke="#0284c7"
                                                strokeWidth="2"
                                            />
                                            <line x1="-12" y1={waterTopY + 4} x2="12" y2={waterTopY + 4} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                                            <text x="-26" y={waterTopY + 6} textAnchor="end" fill="#b91c1c" fontSize="6" fontWeight="bold">Meniskus Bawah</text>
                                        </g>
                                    );
                                })()}
                            </g>

                            {/* MATA OBSERVER */}
                            {(() => {
                                const targetY = waterInGlassMm > 0 ? (150 - (waterInGlassMm / 25) * 140 + 120) : 210;
                                const eyeY = targetY - (eyeLevelOffset * 3.5);
                                return (
                                    <g transform={`translate(365, ${eyeY})`}>
                                        <line x1="-20" y1="0" x2="-80" y2={targetY - eyeY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                                        <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#334155" strokeWidth="2" />
                                        <circle cx="-3" cy="0" r="5" fill="#0f172a" />
                                        <circle cx="-5" cy="-2" r="1.5" fill="#ffffff" />
                                        <text x="14" y="3" fill="#0f172a" fontSize="7" fontWeight="bold">Mata Observer</text>
                                    </g>
                                );
                            })()}
                        </svg>

                        {/* FLOATING CONTROLS PENUANGAN KRAN & TAMPUNGAN */}
                        <div className="mt-3 p-3 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-2.5 text-xs text-white">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={handleOpenTap}
                                    disabled={isTapOpen || waterInGlassMm > 0}
                                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                        waterInGlassMm > 0 
                                            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                                            : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-2xs'
                                    }`}
                                >
                                    <span>🚰 Buka Kran (Isi Gelas)</span>
                                </button>

                                {/* FITUR BARU 4: KETUK TETESAN TERAKHIR */}
                                {waterInGlassMm > 0 && !hasTappedLastDrop && (
                                    <button
                                        onClick={handleTapLastDrop}
                                        className="px-2.5 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-2xs animate-pulse flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>👆 Ketuk Tetesan Terakhir (+0.1mm)</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleRecordAndEmpty}
                                    disabled={waterInGlassMm === 0}
                                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                        waterInGlassMm === 0 
                                            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-2xs'
                                    }`}
                                >
                                    <span>📝 Catat & Buang ({waterInGlassMm} mm)</span>
                                </button>
                            </div>

                            <span className="text-slate-400 font-mono text-[11px]">
                                Step: <strong>Batch #{currentPourStep}</strong>
                            </span>
                        </div>
                    </div>

                    {/* MINI-BAR KONTROL SOP KALIBRASI LAPANGAN & ANOMALI */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* 1. Toggle Saringan Corong Tersumbat */}
                        <button
                            onClick={() => setIsStrainerClogged(!isStrainerClogged)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                isStrainerClogged 
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isStrainerClogged ? '🧹 Bersihkan Saringan!' : '🍂 Sumbat Saringan'}</span>
                        </button>

                        {/* 2. Toggle Kran Bocor */}
                        <button
                            onClick={() => setIsTapLeaking(!isTapLeaking)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                isTapLeaking 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isTapLeaking ? '🔧 Ganti Seal Kran!' : '✅ Kran Rapat'}</span>
                        </button>

                        {/* 3. Toggle Ketinggian 120 cm */}
                        <button
                            onClick={() => setIsHeight120cm(!isHeight120cm)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                !isHeight120cm 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isHeight120cm ? '📏 Naikkan 120 cm' : '✅ Tinggi 120cm'}</span>
                        </button>

                        {/* 4. Toggle Bebas Pohon */}
                        <button
                            onClick={() => setIsObstacleFree(!isObstacleFree)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                !isObstacleFree 
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isObstacleFree ? '🌳 Hindari Pohon' : '✅ Area Terbuka'}</span>
                        </button>
                    </div>

                    {/* EDUKASI KHUSUS GELAS UKUR OBS VS GELAS KIMIA ML */}
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-950 leading-relaxed flex items-start gap-2">
                        <span className="text-sm shrink-0">⚠️</span>
                        <div>
                            <strong>Edukasi Gelas Ukur Khusus OBS vs Gelas Kimia (ml):</strong> Skala gelas ukur OBS sudah dikalibrasi langsung ke satuan <strong>milimeter (mm)</strong> untuk luas corong 100 cm². Setiap <strong>10 ml air = 1 mm curah hujan</strong>. Dilarang mengganti gelas ukur OBS dengan gelas kimia laboratorium biasa yang berskala ml, karena pembacaan akan menjadi sangat kasar dan tidak valid!
                        </div>
                    </div>
                </div>

                {/* SISI KANAN (40% / 5 Kolom): SLIDER SUDUT MATA MENISKUS, DISIPLIN WAKTU, & KALKULATOR BATCH */}
                <div className="lg:col-span-5 space-y-4">
                    {/* PANEL PEMILIHAN SKENARIO HUJAN & DISIPLIN WAKTU 07:00 WIB */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>⏰</span> Golden Hour SOP: Pukul 07:00 WIB
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${observationTime === '07:00' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'}`}>
                                {observationTime === '07:00' ? 'Tepat Waktu (Valid)' : 'Telat (Underestimate)'}
                            </span>
                        </div>

                        {/* Toggle Waktu Pengamatan: 07:00 vs 11:00 */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                onClick={() => setObservationTime('07:00')}
                                className={`py-2 px-2.5 rounded-xl font-bold border transition-all cursor-pointer text-left ${
                                    observationTime === '07:00'
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                <span className="block font-black text-sm">07:00 WIB</span>
                                <span className="text-[10px] opacity-80">Jadwal Baku BMKG</span>
                            </button>

                            <button
                                onClick={() => setObservationTime('11:00')}
                                className={`py-2 px-2.5 rounded-xl font-bold border transition-all cursor-pointer text-left ${
                                    observationTime === '11:00'
                                        ? 'bg-amber-600 text-white border-amber-500 shadow-2xs'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                <span className="block font-black text-sm">11:00 WIB</span>
                                <span className="text-[10px] opacity-80">Telat (Air Menguap)</span>
                            </button>
                        </div>

                        {/* Pilihan Skenario Curah Hujan */}
                        <div className="pt-2 border-t border-slate-800 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-300 block">Pilih Skenario Hujan Semalaman:</label>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                <button
                                    onClick={() => handleScenarioChange('light')}
                                    className={`py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                        rainScenario === 'light'
                                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    Sedang (12.5mm)
                                </button>
                                <button
                                    onClick={() => handleScenarioChange('heavy')}
                                    className={`py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                        rainScenario === 'heavy'
                                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    Lebat (38.5mm)
                                </button>
                                <button
                                    onClick={() => handleScenarioChange('trace')}
                                    className={`py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                        rainScenario === 'trace'
                                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-2xs'
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    Rintik (TT/Trace)
                                </button>
                            </div>
                        </div>

                        {/* Penjelasan Ilmiah Evaporasi / Kebocoran */}
                        {(observationTime === '11:00' || isTapLeaking) && (
                            <p className="text-[10.5px] text-amber-300 bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/80 leading-relaxed">
                                ⚠️ <strong>Faktor Pengurangan:</strong> {observationTime === '11:00' ? "Air menguap akibat panas siang (-2.8 mm). " : ""}{isTapLeaking ? "Kran bocor meneteskan air ke tanah (-7.0 mm)." : ""}
                            </p>
                        )}
                    </div>

                    {/* MINI-GAME PRESISI: MEMBACA MENISKUS BAWAH (SLIDER EYE-LEVEL) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>👁️</span> Posisi Sudut Pandang Mata (Eye-Level)
                            </span>
                            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${isMeniscusAligned ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                Terbaca: {waterInGlassMm > 0 ? `${apparentReading} mm` : '0.0 mm'}
                            </span>
                        </div>

                        {/* Slider Mata Vertikal */}
                        <div className="space-y-1">
                            <input
                                type="range"
                                min="-8"
                                max="8"
                                step="1"
                                value={eyeLevelOffset}
                                onChange={(e) => setEyeLevelOffset(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>Bawah (Paralaks -)</span>
                                <span className="text-blue-700 font-bold">Pas Sejajar (Meniskus Bawah)</span>
                                <span>Atas (Paralaks +)</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug">
                            {isMeniscusAligned 
                                ? '✅ Garis pandang mata tegak lurus horizontal sejajar dengan dasar cekungan air (meniskus bawah). Pembacaan 100% valid!' 
                                : '⚠️ Terjadi Kesalahan Paralaks! Geser slider agar mata tegak lurus dengan titik terendah lengkungan air.'}
                        </p>
                    </div>

                    {/* KARTU TERPADU: REKAPITULASI BATCH & ATURAN HUJAN JEJAK (TRACE) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📋</span> Buku Log Observasi Harian BMKG
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                                Form ME-45
                            </span>
                        </div>

                        {/* Rincian Penuangan Bertahap jika Hujan Lebat */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Tampungan Ke-1 (Maks 25mm):</span>
                                <span className="font-bold text-slate-900 font-mono">
                                    {recordedBatches[0] !== undefined ? `${recordedBatches[0]} mm` : waterInGlassMm > 0 && currentPourStep === 1 ? `${waterInGlassMm} mm (Di Gelas)` : '-'}
                                </span>
                            </div>

                            {rainScenario === 'heavy' && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Tampungan Ke-2 (Sisa Air):</span>
                                    <span className="font-bold text-slate-900 font-mono">
                                        {recordedBatches[1] !== undefined ? `${recordedBatches[1]} mm` : waterInGlassMm > 0 && currentPourStep === 2 ? `${waterInGlassMm} mm (Di Gelas)` : '-'}
                                    </span>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-150 flex justify-between items-center text-sm font-extrabold text-blue-900">
                                <span>Total Curah Hujan 24 Jam:</span>
                                <span className="font-mono text-base text-blue-700">
                                    {rainScenario === 'trace' ? 'TT (Trace / Jejak)' : `${totalAccumulatedMm} mm`}
                                </span>
                            </div>
                        </div>

                        {/* ATURAN HUJAN JEJAK (TRACE / TT) RESMI BMKG */}
                        <div className="p-2.5 bg-cyan-50/80 rounded-xl border border-cyan-200/60 text-[10.5px] text-cyan-950 leading-relaxed">
                            💡 <strong>Aturan Baku BMKG (Hujan Jejak):</strong> Jika hujan turun namun jumlah air di gelas ukur kurang dari 0.5 mm (hanya membasahi corong/dasar gelas), observer dilarang mencatat 0.0 mm. Hasil wajib dicatat sebagai <strong>"TT" (Tercatat / Trace)</strong> untuk membuktikan bahwa hujan memang terjadi secara meteorologis!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
