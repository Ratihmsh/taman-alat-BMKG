import React, { useState, useEffect } from 'react';

export default function SimulasiPsychrometerStandar() {
    // 1. Slider Kelembapan Udara Lingkungan (RH 20% - 100%)
    const [rh, setRh] = useState(65); // Default 65%

    // 2. Slider Suhu Bola Kering (Dry Bulb) 20°C - 40°C
    const [dryBulbTemp, setDryBulbTemp] = useState(30.0);

    // 3. Status Air pada Bejana Kasa (Ada Air vs Kering)
    const [hasWater, setHasWater] = useState(true);

    // 4. Slider Pendek Kecepatan Ventilasi Udara (0 = Mati, 1 = Tenang, 2 = Sedang, 3 = Kencang)
    const [ventilationLevel, setVentilationLevel] = useState(2); // Default 2 (Sedang / Standar BMKG)

    // 5. Suhu Bola Basah Animasi (Berjalan perlahan saat ventilasi diubah)
    const [animatedWetBulb, setAnimatedWetBulb] = useState(24.5);

    // --- KALKULASI FISIKA PSIKROMETRI WMO & BMKG ---
    const maxDepressionTheoretical = ((100 - rh) / 100) * 8.5;

    // Faktor efisiensi penguapan berdasarkan slider level 0 - 3:
    // 0 = Mati (0.45), 1 = Tenang (0.75), 2 = Sedang (1.0 Standar WMO), 3 = Kencang (1.08)
    const windFactors = [0.45, 0.75, 1.0, 1.08];
    const currentFactor = windFactors[ventilationLevel] ?? 1.0;

    const targetDepression = hasWater
        ? maxDepressionTheoretical * currentFactor
        : 0;

    const targetWetBulb = Number((dryBulbTemp - targetDepression).toFixed(1));

    // Animasi transisi penurunan suhu bola basah
    useEffect(() => {
        let timer = setInterval(() => {
            setAnimatedWetBulb((prev) => {
                const diff = targetWetBulb - prev;
                if (Math.abs(diff) < 0.1) {
                    return targetWetBulb;
                }
                return Number((prev + diff * 0.25).toFixed(1));
            });
        }, 80);

        return () => clearInterval(timer);
    }, [targetWetBulb]);

    const depression = Number((dryBulbTemp - animatedWetBulb).toFixed(1));

    // Perhitungan Titik Embun (Dew Point - Formula Magnus-Tetens)
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * dryBulbTemp) / (b + dryBulbTemp)) + Math.log(rh / 100);
    const dewPoint = Number(((b * alpha) / (a - alpha)).toFixed(1));

    // Status Kategori Kelembapan
    const getRhStatus = (val) => {
        if (val < 40) return { label: 'Udara Kering (Penguapan Sangat Cepat)', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
        if (val <= 75) return { label: 'Ideal Tropis / Nyaman', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
        if (val < 95) return { label: 'Lembap Tinggi (Penguapan Lambat)', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
        return { label: 'Udara Jenuh 100% (Hujan/Kabut - Penguapan Berhenti)', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    };

    const rhStatus = getRhStatus(rh);

    // Keterangan label slider ventilasi
    const ventOptions = [
        { label: 'Mati (0 m/s)', short: 'Mati', desc: 'Udara stagnan, penguapan terhambat.' },
        { label: 'Tenang (0.8 m/s)', short: 'Tenang', desc: 'Aliran alami lemah.' },
        { label: 'Sedang (2.5 m/s) - Standar BMKG', short: 'Sedang', desc: 'Kecepatan optimal WMO No. 8.' },
        { label: 'Kencang (4.5 m/s)', short: 'Kencang', desc: 'Aliran angin kencang.' }
    ];

    const currentVent = ventOptions[ventilationLevel];

    // --- DATA TABEL MATRIKS PSIKROMETRIK BMKG / WMO ---
    const tableRowsTemp = [26, 28, 30, 32, 34];
    const tableColsDepression = [0, 1, 2, 3, 4, 5, 6];

    const getTableRhValue = (tKering, deltaT) => {
        if (deltaT === 0) return 100;
        const tBasah = tKering - deltaT;
        const eSatDry = 6.112 * Math.exp((17.67 * tKering) / (tKering + 243.5));
        const eSatWet = 6.112 * Math.exp((17.67 * tBasah) / (tBasah + 243.5));
        const eActual = eSatWet - 0.00066 * 1013 * deltaT * (1 + 0.00115 * tBasah);
        const resultRh = Math.round((eActual / eSatDry) * 100);
        return Math.max(10, Math.min(100, resultRh));
    };

    const activeRowTemp = tableRowsTemp.reduce((prev, curr) =>
        Math.abs(curr - dryBulbTemp) < Math.abs(prev - dryBulbTemp) ? curr : prev
    );

    const activeColDep = tableColsDepression.reduce((prev, curr) =>
        Math.abs(curr - depression) < Math.abs(prev - depression) ? curr : prev
    );

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/60">
                        <span>💧</span> Simulasi Termodinamika & Psikrometri
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🌡️</span> Simulasi Cara Kerja Psychrometer Standar
                    </h3>
                    <p className="text-xs text-slate-500">
                        Uji pengaruh laju ventilasi terhadap penguapan kain kasa dan pelajari cara observer BMKG membaca Tabel Psikrometrik Resmi.
                    </p>
                </div>

                {/* Status Badges Cepat */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${rhStatus.bg} ${rhStatus.color} ${rhStatus.border}`}>
                        RH: {rh}% ({rh >= 80 ? 'Lembap' : rh <= 45 ? 'Kering' : 'Normal'})
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-sky-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        ΔT: {depression}°C
                    </span>
                </div>
            </div>

            {/* Layout Utama 1 Section Terpadu */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (7 Kolom): Visual Interaktif Psychrometer + Ventilasi */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-sky-50/40 to-blue-50/50 p-5 overflow-hidden">
                        {/* Status bar di atas kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span className={ventilationLevel > 0 ? 'animate-spin inline-block text-sky-600' : ''}>💨</span>
                                <span>Ventilasi: </span>
                            </span>
                            <span className={`text-[11px] font-bold ${hasWater ? 'text-blue-600' : 'text-rose-600 animate-pulse'}`}>
                                {hasWater ? '💧 Kain Kasa Basah' : '⚠️ Kasa Kering (Error!)'}
                            </span>
                        </div>

                        {/* Diagram SVG Interaktif Psychrometer */}
                        <svg viewBox="0 0 440 280" className="w-full h-auto max-h-[270px] select-none drop-shadow-md mx-auto">
                            <defs>
                                <linearGradient id="mercuryGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#b91c1c" />
                                </linearGradient>
                                <linearGradient id="mercuryGradWet" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#0284c7" />
                                    <stop offset="100%" stopColor="#0369a1" />
                                </linearGradient>
                            </defs>

                            {/* Papan Dudukan Kayu Psychrometer */}
                            <rect x="70" y="20" width="300" height="235" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
                            <rect x="78" y="28" width="284" height="219" rx="8" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1.5" />

                            <text x="220" y="44" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="extrabold" letterSpacing="1">
                                PSYCHROMETER STANDAR BMKG
                            </text>
                            <line x1="120" y1="50" x2="320" y2="50" stroke="#e2e8f0" strokeWidth="1.5" />

                            {/* Skala Derajat Celcius */}
                            <g stroke="#94a3b8" strokeWidth="1" opacity="0.6">
                                {[50, 40, 30, 20, 10, 0].map((t, idx) => {
                                    const yPos = 70 + idx * 24;
                                    return (
                                        <g key={t}>
                                            <line x1="205" y1={yPos} x2="215" y2={yPos} strokeWidth="1.5" />
                                            <line x1="225" y1={yPos} x2="235" y2={yPos} strokeWidth="1.5" />
                                            <text x="220" y={yPos + 3} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">{t}°</text>
                                        </g>
                                    );
                                })}
                            </g>

                            {/* 1. TERMOMETER BOLA KERING (KIRI) */}
                            <g transform="translate(130, 60)">
                                <rect x="0" y="0" width="16" height="145" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                                {(() => {
                                    const h = Math.min(125, Math.max(15, (dryBulbTemp / 50) * 125));
                                    return (
                                        <rect
                                            x="4"
                                            y={130 - h}
                                            width="8"
                                            height={h}
                                            rx="4"
                                            fill="url(#mercuryGradDry)"
                                            className="transition-all duration-300"
                                        />
                                    );
                                })()}
                                <circle cx="8" cy="138" r="10" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
                                <text x="8" y="-8" textAnchor="middle" fill="#be123c" fontSize="9" fontWeight="extrabold">BOLA KERING</text>
                                <rect x="-18" y="152" width="52" height="20" rx="5" fill="#fee2e2" stroke="#f87171" strokeWidth="1" />
                                <text x="8" y="166" textAnchor="middle" fill="#991b1b" fontSize="10" fontWeight="black">{dryBulbTemp.toFixed(1)}°C</text>
                            </g>

                            {/* 2. TERMOMETER BOLA BASAH (KANAN) */}
                            <g transform="translate(290, 60)">
                                <rect x="0" y="0" width="16" height="145" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                                {(() => {
                                    const h = Math.min(125, Math.max(15, (animatedWetBulb / 50) * 125));
                                    return (
                                        <rect
                                            x="4"
                                            y={130 - h}
                                            width="8"
                                            height={h}
                                            rx="4"
                                            fill="url(#mercuryGradWet)"
                                            className="transition-all duration-300"
                                        />
                                    );
                                })()}
                                <circle cx="8" cy="138" r="10" fill="#0284c7" />

                                {/* Kain Kasa Muslin */}
                                <rect
                                    x="-3"
                                    y="126"
                                    width="22"
                                    height="24"
                                    rx="4"
                                    fill={hasWater ? '#bae6fd' : '#e2e8f0'}
                                    stroke={hasWater ? '#0284c7' : '#94a3b8'}
                                    strokeWidth="1.5"
                                />

                                {/* Sumbu Air */}
                                <path
                                    d="M 8 150 Q 8 165 2 175"
                                    fill="none"
                                    stroke={hasWater ? '#38bdf8' : '#cbd5e1'}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />

                                {/* Bejana Air Murni */}
                                <rect x="-8" y="172" width="24" height="22" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                                {hasWater ? (
                                    <rect x="-6" y="178" width="20" height="14" fill="#38bdf8" opacity="0.8" />
                                ) : (
                                    <text x="4" y="186" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="bold">KOSONG</text>
                                )}

                                {/* ANIMASI EFEK TIUPAN ALIRAN UDARA */}
                                {ventilationLevel > 0 && hasWater && rh < 100 && (
                                    <g>
                                        <path
                                            d="M -60 135 L -10 135"
                                            stroke="#38bdf8"
                                            strokeWidth={ventilationLevel === 3 ? '3.5' : ventilationLevel === 2 ? '2.5' : '1.5'}
                                            strokeDasharray="6 4"
                                            className="animate-pulse"
                                        />
                                        <path
                                            d="M -70 145 L -15 145"
                                            stroke="#0284c7"
                                            strokeWidth={ventilationLevel === 3 ? '3' : ventilationLevel === 2 ? '2' : '1.2'}
                                            strokeDasharray="5 3"
                                        />
                                        <circle cx="24" cy="132" r="3" fill="#38bdf8" className={ventilationLevel === 3 ? 'animate-ping' : 'animate-pulse'} />
                                        <circle cx="36" cy="125" r="2.5" fill="#0284c7" />
                                        <text x="25" y="120" fill="#0369a1" fontSize="8" fontWeight="extrabold">Kalor Menguap ↗</text>
                                    </g>
                                )}

                                <text x="8" y="-8" textAnchor="middle" fill="#0369a1" fontSize="9" fontWeight="extrabold">BOLA BASAH</text>
                                <rect x="-18" y="200" width="52" height="20" rx="5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
                                <text x="8" y="214" textAnchor="middle" fill="#0369a1" fontSize="10" fontWeight="black">{animatedWetBulb}°C</text>
                            </g>

                            {/* Selisih Depresi (ΔT) di Tengah */}
                            <g transform="translate(205, 120)">
                                <rect x="-30" y="0" width="90" height="40" rx="8" fill="#f8fafc" stroke="#6366f1" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
                                <text x="15" y="15" textAnchor="middle" fill="#4338ca" fontSize="8" fontWeight="bold">DEPRESI (ΔT)</text>
                                <text x="15" y="30" textAnchor="middle" fill="#4f46e5" fontSize="13" fontWeight="black">
                                    {depression}°C
                                </text>
                            </g>
                        </svg>
                    </div>

                    {/* KONTROL 1 BARIS RAMPING: SLIDER PENDEK VENTILASI + BUTTON KASA BASAH */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* Sisi Kiri: Slider Pendek Ventilasi */}
                        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-xs">💨</span>
                                <span className="text-xs font-bold text-slate-700">Ventilasi:</span>
                                <span className="text-[11px] font-extrabold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                    {currentVent.short}
                                </span>
                            </div>

                            {/* Input Range Slider Pendek */}
                            <div className="flex-1 max-w-[160px] flex flex-col justify-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="1"
                                    value={ventilationLevel}
                                    onChange={(e) => setVentilationLevel(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5 mt-0.5">
                                    <span>Mati</span>
                                    <span>Tenang</span>
                                    <span>Sedang</span>
                                    <span>Kencang</span>
                                </div>
                            </div>
                        </div>

                        {/* Sisi Kanan: Button Kasa Basah (Dalam 1 Baris) */}
                        <button
                            onClick={() => setHasWater(!hasWater)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                                hasWater
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                            }`}
                        >
                            <span>{hasWater ? '💧 Kain Kasa Basah' : '❌ Kasa Kering'}</span>
                        </button>
                    </div>
                </div>

                {/* SISI KANAN (5 Kolom): SLIDER KONTROL & HASIL PSIKROMETRI */}
                <div className="lg:col-span-5 space-y-4">
                    {/* PANEL SLIDER KELEMBAPAN & SUHU */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs space-y-4">
                        {/* 1. Slider Kelembapan Relatif (RH Udara) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                    <span>💧</span> Kelembapan Relatif (RH Udara):
                                </span>
                                <span className="text-base font-black text-sky-400 font-mono">
                                    {rh}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="100"
                                step="1"
                                value={rh}
                                onChange={(e) => setRh(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>20% (Kering Terik)</span>
                                <span>60%</span>
                                <span>80%</span>
                                <span>100% (Jenuh/Hujan)</span>
                            </div>
                        </div>

                        {/* 2. Slider Suhu Bola Kering */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                    <span>🌡️</span> Suhu Lingkungan (Bola Kering):
                                </span>
                                <span className="text-sm font-black text-rose-400 font-mono">
                                    {dryBulbTemp.toFixed(1)}°C
                                </span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="40"
                                step="0.5"
                                value={dryBulbTemp}
                                onChange={(e) => setDryBulbTemp(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>20.0°C</span>
                                <span>30.0°C (Standar)</span>
                                <span>40.0°C</span>
                            </div>
                        </div>

                        {/* Penjelasan Interaktif Sesuai Slider Ventilasi */}
                        <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs leading-relaxed">
                            <p className="text-sky-300 font-semibold mb-1">
                                💨 Mode Ventilasi: {currentVent.label}
                            </p>
                            <p className="text-slate-300">
                                {currentVent.desc}
                            </p>
                        </div>
                    </div>

                    {/* KARTU HASIL PENGUKURAN METEOROLOGI */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Hasil Analisis Psikrometris
                        </span>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-500 block mb-0.5">Depresi Bola Basah (ΔT)</span>
                                <span className="text-lg font-black text-indigo-600">
                                    {depression}°C
                                </span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">(T.Kering - T.Basah)</span>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-500 block mb-0.5">Titik Embun (Dew Point)</span>
                                <span className="text-lg font-black text-teal-600">
                                    {dewPoint}°C
                                </span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Kondensasi uap air</span>
                            </div>
                        </div>

                        {/* Status Udara Saat Ini */}
                        <div className={`p-3 rounded-xl border ${rhStatus.border} ${rhStatus.bg} text-xs`}>
                            <div className="flex items-center justify-between font-bold mb-1">
                                <span className={rhStatus.color}>Kondisi Udara:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] bg-white font-extrabold ${rhStatus.color}`}>
                                    RH {rh}%
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                                {rhStatus.label}. Semakin kering udara, semakin cepat penguapan air kasa menyerap panas reservoir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL PSIKROMETRIK MATRIKS INTERAKTIF (STANDAR RESMI BMKG/WMO) */}
            <div className="pt-6 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 border border-indigo-200">
                            <span>📖</span> Buku Saku Observer BMKG
                        </div>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>📊</span> Tabel Matriks Psikrometrik Resmi BMKG / WMO
                        </h4>
                        <p className="text-xs text-slate-500">
                            Tabel silang ini digunakan observer manual: Tarik garis horizontal dari <strong>Suhu Bola Kering</strong> dan vertikal dari <strong>Depresi (ΔT)</strong> untuk menemukan nilai <strong>Kelembapan Relatif (RH %)</strong>.
                        </p>
                    </div>

                    {/* Titik Pertemuan Aktif Badge */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
                        <span className="text-xs text-slate-600 font-medium">Titik Pertemuan:</span>
                        <span className="text-xs font-bold text-blue-900">
                            {activeRowTemp}°C &times; ΔT {activeColDep}°C
                        </span>
                        <span className="text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-2xs">
                            RH = {getTableRhValue(activeRowTemp, activeColDep)}%
                        </span>
                    </div>
                </div>

                {/* Grid Matriks Tabel Interaktif */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-slate-50/50 p-1">
                    <table className="w-full text-center border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-2.5 text-left text-[11px] font-extrabold text-slate-800 bg-slate-200/60 sticky left-0 z-10 w-36">
                                    T. Kering \ ΔT
                                </th>
                                {tableColsDepression.map((colDep) => {
                                    const isColActive = colDep === activeColDep;
                                    return (
                                        <th
                                            key={colDep}
                                            className={`p-2 font-mono transition-colors ${
                                                isColActive
                                                    ? 'bg-blue-600 text-white font-black shadow-xs'
                                                    : 'text-slate-600 hover:bg-slate-200/50'
                                            }`}
                                        >
                                            ΔT {colDep}°C
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 bg-white">
                            {tableRowsTemp.map((rowTemp) => {
                                const isRowActive = rowTemp === activeRowTemp;
                                return (
                                    <tr
                                        key={rowTemp}
                                        className={`transition-colors ${isRowActive ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'}`}
                                    >
                                        <td className={`p-2.5 text-left font-mono font-bold sticky left-0 z-10 transition-colors ${
                                            isRowActive
                                                ? 'bg-blue-600 text-white font-black shadow-xs'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {rowTemp}.0°C
                                        </td>

                                        {tableColsDepression.map((colDep) => {
                                            const isIntersect = isRowActive && colDep === activeColDep;
                                            const isColMatch = colDep === activeColDep;
                                            const rhVal = getTableRhValue(rowTemp, colDep);

                                            return (
                                                <td
                                                    key={colDep}
                                                    className={`p-2.5 font-mono text-xs transition-all relative ${
                                                        isIntersect
                                                            ? 'bg-amber-400 text-slate-950 font-black scale-110 shadow-md rounded-lg ring-2 ring-amber-500 z-20 animate-pulse'
                                                            : isRowActive || isColMatch
                                                                ? 'bg-blue-100/60 text-blue-900 font-bold'
                                                                : 'text-slate-600'
                                                    }`}
                                                >
                                                    {rhVal}%
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] text-slate-500 px-1">
                    <span>
                        💡 <strong>Kotak Kuning Menyala:</strong> Titik temu pembacaan alat Anda saat ini di tabel resmi.
                    </span>
                    <span>
                        Sumber: <em>WMO Publication No. 8 & Buku Pedoman Pengamatan BMKG</em>
                    </span>
                </div>
            </div>
        </div>
    );
}
