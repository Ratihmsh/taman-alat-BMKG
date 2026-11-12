import React, { useState } from 'react';

export default function SimulasiPanciPenguapan() {
    // 1. Pilihan Skenario Cuaca 24 Jam
    // 'kemarau' (terik + angin kencang) vs 'hujan' (presipitasi + air bertambah)
    const [scenario, setScenario] = useState('kemarau');

    // 2. Kontrol Hook Gauge (Mikrometer Kait)
    // Tinggi air target: kemarau = 195.0 mm, hujan = 212.0 mm (air bertambah)
    // User menggeser micrometerPos untuk mencari titik sentuh ujung kail
    const [micrometerPos, setMicrometerPos] = useState(195.0); // mm

    // 3. Status Termometer Apung (Six-Bellani)
    // isMagnetReset: true jika indeks besi sudah ditarik magnet menempel ke raksa
    const [isMagnetReset, setIsMagnetReset] = useState(false);

    // 4. Status Pemeliharaan & Kebersihan (Quality Control BMKG)
    const [hasLeaves, setHasLeaves] = useState(true); // Ada daun mengapung
    const [hasMoss, setHasMoss] = useState(true); // Ada lumut hijau di dasar panci
    const [isWaterRefilled, setIsWaterRefilled] = useState(false); // Air diisi ulang ke batas aman

    // --- DATA SKENARIO FISIKA EVAPORASI BMKG (WMO No. 8) ---
    // P0 = Tinggi air kemarin (pukul 07:00 WIB) = standar 200.0 mm
    const P0 = 200.0;

    // Nilai terukur berdasarkan skenario:
    // Skenario Kemarau: Penguapan murni 7.2 mm, Hujan = 0 mm -> P1 = 192.8 mm
    // Skenario Hujan: Hujan masuk = 18.0 mm, Penguapan = 4.5 mm -> Netto air bertambah +13.5 mm -> P1 = 213.5 mm
    const currentScenarioData = scenario === 'kemarau'
        ? {
            label: 'Kemarau Terik Berangin',
            description: 'Radiasi matahari kuat dan angin kencang memicu laju evaporasi tinggi tanpa presipitasi.',
            windSpeed: 3.4, // m/s pada ketinggian 0.5 meter (Cup Anemometer)
            waterTempMax: 32.5, // °C
            waterTempMin: 23.0, // °C
            rainMm: 0.0, // mm dari Penakar Hujan
            targetWaterLevel: 192.8, // mm (air susut 7.2 mm)
            evaporationReal: 7.2, // mm
        }
        : {
            label: 'Hari Berawan & Hujan Lebat',
            description: 'Hujan lebat menambah air panci secara drastis, namun evaporasi tetap terjadi di sela waktu.',
            windSpeed: 1.2, // m/s
            waterTempMax: 27.0, // °C
            waterTempMin: 22.5, // °C
            rainMm: 18.0, // mm dari Penakar Hujan Hellmann/OBS
            targetWaterLevel: 213.5, // mm (P1 lebih tinggi dari P0!)
            evaporationReal: 4.5, // mm
        };

    // Selisih antara posisi mikrometer user dan permukaan air aktual
    const levelDiff = Math.abs(micrometerPos - currentScenarioData.targetWaterLevel);
    // Toleransi sentuhan ujung kail dengan meniskus air (0.15 mm)
    const isHookTouchValid = levelDiff <= 0.15;
    const isHookSubmerged = micrometerPos < currentScenarioData.targetWaterLevel - 0.15; // Kail terlalu dalam
    const isHookAboveWater = micrometerPos > currentScenarioData.targetWaterLevel + 0.15; // Kail di atas air

    // Perhitungan Neraca Air Evaporasi Baku BMKG:
    // Rumus: E = (P0 - P1) + Hujan
    const P1 = currentScenarioData.targetWaterLevel;
    const calculatedEvaporation = Number(((P0 - P1) + currentScenarioData.rainMm).toFixed(1));

    // Reset posisi mikrometer saat berganti skenario agar user mencari titik sentuh baru
    const handleScenarioChange = (newScen) => {
        setScenario(newScen);
        if (newScen === 'kemarau') {
            setMicrometerPos(196.0);
        } else {
            setMicrometerPos(210.0);
        }
        setIsMagnetReset(false);
    };

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Ringkas Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-800 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-cyan-200/60">
                        <span>💧</span> Hidrometeorologi & Evaporasi Terbuka
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🌊</span> Simulasi Panci Penguapan (Open Pan Class A)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Simulasi operasional pembacaan Hook Gauge, koreksi neraca air curah hujan, Cup Anemometer 0.5m, dan pemeliharaan WMO.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-cyan-50 text-cyan-700 border-cyan-200">
                        {currentScenarioData.label}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-cyan-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        Evaporasi: {calculatedEvaporation} mm
                    </span>
                </div>
            </div>

            {/* Layout Utama 1 Section Terpadu */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (7 Kolom): Visual Interaktif Panci Penguapan, Stilling Well Hook Gauge, & Floating Thermometer */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100 p-5 overflow-hidden">
                        {/* Status bar kecil di atas kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>{scenario === 'kemarau' ? '☀️' : '🌧️'}</span>
                                <span>Kondisi Cuaca: <strong>{scenario === 'kemarau' ? 'Panas Terik & Angin Aktif' : 'Hujan Mengguyur Panci'}</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${isHookTouchValid ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                                {isHookTouchValid
                                    ? '🎯 Meniskus Pas! Kail Menyentuh Air'
                                    : isHookSubmerged
                                    ? '⚠️ Kail Terlalu Masuk (Tenggelam)'
                                    : '🔍 Putar Mikrometer ke Bawah Menuju Air'}
                            </span>
                        </div>

                        {/* Diagram SVG Interaktif Ekosistem Panci Penguapan Kelas A */}
                        <svg viewBox="0 0 460 290" className="w-full h-auto max-h-[290px] select-none drop-shadow-md mx-auto">
                            <defs>
                                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                                </linearGradient>
                                <linearGradient id="panGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#94a3b8" />
                                    <stop offset="50%" stopColor="#cbd5e1" />
                                    <stop offset="100%" stopColor="#64748b" />
                                </linearGradient>
                                <linearGradient id="woodenBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#b45309" />
                                    <stop offset="100%" stopColor="#78350f" />
                                </linearGradient>
                            </defs>

                            {/* Efek Cuaca Hujan atau Partikel Uap Panas */}
                            {scenario === 'hujan' ? (
                                <g opacity="0.6">
                                    {[30, 80, 130, 180, 230, 280, 330, 380, 420].map((x, i) => (
                                        <line key={i} x1={x} y1="15" x2={x - 15} y2="65" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 8" className="animate-pulse" />
                                    ))}
                                    <text x="50" y="30" fill="#0369a1" fontSize="9" fontWeight="bold">Presipitasi: +18.0 mm</text>
                                </g>
                            ) : (
                                <g opacity="0.7">
                                    {/* Partikel Uap Air Mengepul ke Atas */}
                                    {[150, 200, 250, 300].map((x, i) => (
                                        <path
                                            key={i}
                                            d={`M ${x} 140 Q ${x - 10} 115 ${x} 90 T ${x} 65`}
                                            fill="none"
                                            stroke="#67e8f9"
                                            strokeWidth="2.5"
                                            strokeDasharray="4 4"
                                            className="animate-pulse"
                                        />
                                    ))}
                                    <text x="225" y="60" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="extrabold">Uap Air Menguap Bebas (Evaporasi)</text>
                                </g>
                            )}

                            {/* LANDASAN KAYU (WOODEN BASE PALLET STANDAR BMKG) */}
                            {/* Balok kayu berongga setinggi 10 cm agar udara mengalir di bawah panci */}
                            <g transform="translate(100, 220)">
                                <rect x="0" y="0" width="250" height="18" fill="url(#woodenBaseGrad)" rx="3" stroke="#451a03" strokeWidth="2" />
                                {/* Kisi-kisi kayu pembagi */}
                                <line x1="50" y1="0" x2="50" y2="18" stroke="#451a03" strokeWidth="2" />
                                <line x1="100" y1="0" x2="100" y2="18" stroke="#451a03" strokeWidth="2" />
                                <line x1="150" y1="0" x2="150" y2="18" stroke="#451a03" strokeWidth="2" />
                                <line x1="200" y1="0" x2="200" y2="18" stroke="#451a03" strokeWidth="2" />
                                <text x="125" y="30" textAnchor="middle" fill="#78350f" fontSize="7" fontWeight="bold">DUDUKAN BALOK KAYU BERONGA (10 CM)</text>
                            </g>

                            {/* CUP COUNTER ANEMOMETER DI SAMPING PANCI (TINGGI 0.5 METER) */}
                            <g transform="translate(60, 150)">
                                <rect x="8" y="20" width="4" height="68" fill="#475569" stroke="#1e293b" strokeWidth="1" />
                                <rect x="0" y="45" width="20" height="15" fill="#0f172a" rx="2" />
                                <text x="10" y="55" textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="bold" fontFamily="monospace">
                                    {currentScenarioData.windSpeed}m/s
                                </text>
                                <text x="10" y="70" textAnchor="middle" fill="#475569" fontSize="6" fontWeight="bold">Anemometer</text>
                                <text x="10" y="78" textAnchor="middle" fill="#64748b" fontSize="5">0.5 m</text>
                                {/* 3 Mangkuk Angin Berputar */}
                                <g className={scenario === 'kemarau' ? 'animate-spin' : ''} style={{ transformOrigin: '10px 20px', animationDuration: scenario === 'kemarau' ? '1.5s' : '4s' }}>
                                    <line x1="-15" y1="20" x2="35" y2="20" stroke="#0f172a" strokeWidth="2" />
                                    <circle cx="-15" cy="20" r="4.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                    <circle cx="35" cy="20" r="4.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                    <circle cx="10" cy="5" r="4.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                </g>
                            </g>

                            {/* WADAH PANCI PENGUAPAN KELAS A (STAINLESS / GALVANIS) */}
                            {/* Diameter 120.7 cm, Tinggi 25.4 cm */}
                            <g transform="translate(105, 140)">
                                {/* Bodi Luar Logam Panci */}
                                <rect x="0" y="0" width="240" height="80" rx="4" fill="url(#panGrad)" stroke="#334155" strokeWidth="2.5" />
                                <line x1="0" y1="4" x2="240" y2="4" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />

                                {/* LUMUT DI DASAR PANCI JIKA hasMoss = TRUE */}
                                {hasMoss && (
                                    <g opacity="0.8">
                                        <rect x="15" y="68" width="210" height="8" rx="3" fill="#15803d" />
                                        <ellipse cx="60" cy="70" rx="20" ry="4" fill="#166534" />
                                        <ellipse cx="180" cy="72" rx="25" ry="4" fill="#14532d" />
                                        <text x="120" y="75" textAnchor="middle" fill="#dcfce7" fontSize="6" fontWeight="bold">LUMUT HIJAU DI DASAR (PERLU DISIKAT!)</text>
                                    </g>
                                )}

                                {/* VOLUME AIR DI DALAM PANCI */}
                                {/* Ketinggian air berubah tergantung skenario (kemarau susut vs hujan bertambah) */}
                                {(() => {
                                    const waterTopY = scenario === 'kemarau' ? 24 : 12; // Lebih tinggi jika hujan
                                    const waterHeight = 76 - waterTopY;
                                    return (
                                        <g>
                                            <rect x="4" y={waterTopY} width="232" height={waterHeight} fill="url(#waterGrad)" rx="2" />
                                            {/* Permukaan Air Bening */}
                                            <line x1="4" y1={waterTopY} x2="236" y2={waterTopY} stroke="#ffffff" strokeWidth="2" opacity="0.8" />

                                            {/* DAUN KERING MENGAPUNG JIKA hasLeaves = TRUE */}
                                            {hasLeaves && (
                                                <g transform={`translate(150, ${waterTopY - 2})`}>
                                                    <ellipse cx="0" cy="0" rx="7" ry="3.5" fill="#d97706" transform="rotate(-15)" />
                                                    <ellipse cx="20" cy="1" rx="6" ry="3" fill="#b45309" transform="rotate(20)" />
                                                    <ellipse cx="-25" cy="0" rx="8" ry="4" fill="#78350f" transform="rotate(-5)" />
                                                    <text x="0" y="-6" textAnchor="middle" fill="#b45309" fontSize="6" fontWeight="bold">Daun Kering!</text>
                                                </g>
                                            )}

                                            {/* TERMOMETER APUNG (SIX-BELLANI FLOATING THERMOMETER) */}
                                            <g transform={`translate(45, ${waterTopY - 4})`}>
                                                {/* Pelampung Segitiga Logam */}
                                                <polygon points="0,0 35,0 17.5,-7" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                                                {/* Pipa Kaca Termometer Bentuk U */}
                                                <rect x="6" y="-3" width="23" height="4" rx="2" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1" />
                                                {/* Indeks Besi Penunjuk Suhu Maks-Min */}
                                                <rect x="8" y="-2" width="4" height="2" fill={isMagnetReset ? "#10b981" : "#ef4444"} />
                                                <rect x="23" y="-2" width="4" height="2" fill={isMagnetReset ? "#10b981" : "#ef4444"} />
                                                <text x="17" y="-9" textAnchor="middle" fill="#0c4a6e" fontSize="5" fontWeight="bold">
                                                    Termometer Apung ({currentScenarioData.waterTempMax}°C)
                                                </text>
                                            </g>

                                            {/* TABUNG PENENANG (STILLING WELL) & HOOK GAUGE */}
                                            <g transform="translate(195, 0)">
                                                {/* Tabung Silinder Kuningan Stilling Well */}
                                                <rect x="-14" y="8" width="28" height="68" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" opacity="0.9" />
                                                <line x1="-14" y1="12" x2="14" y2="12" stroke="#a16207" strokeWidth="1" />
                                                {/* Lubang kecil di dasar stilling well tempat masuk air */}
                                                <rect x="-3" y="70" width="6" height="4" fill="#0284c7" />

                                                {/* MIKROMETER HOOK GAUGE DI ATAS TABUNG */}
                                                <rect x="-10" y="-22" width="20" height="18" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" rx="2" />
                                                <text x="0" y="-10" textAnchor="middle" fill="#0f172a" fontSize="6" fontWeight="bold" fontFamily="monospace">
                                                    {micrometerPos.toFixed(1)}
                                                </text>
                                                {/* Batang Rel Kail */}
                                                <line x1="0" y1="-4" x2="0" y2="40" stroke="#475569" strokeWidth="2" />

                                                {/* UJUNG KAIL KAIT (HOOK GAUGE) YANG MENGARAH KE ATAS */}
                                                {(() => {
                                                    // Mapping posisi micrometerPos ke koordinat Y kail
                                                    // Posisi ideal menyentuh permukaan adalah saat Y hook tepat = waterTopY
                                                    const hookVisualY = waterTopY + (currentScenarioData.targetWaterLevel - micrometerPos) * 2.2;
                                                    return (
                                                        <g transform={`translate(0, ${hookVisualY})`}>
                                                            {/* Kail melengkung ke atas seperti mata kail */}
                                                            <path
                                                                d="M 0 10 L 0 16 Q 0 22 -6 22 Q -12 22 -12 16 L -12 0"
                                                                fill="none"
                                                                stroke="#0f172a"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                            />
                                                            {/* Ujung titik kait lancip */}
                                                            <polygon points="-12,0 -14,4 -10,4" fill="#ef4444" />

                                                            {/* MENISKUS / RIAK AIR SAAT UJUNG KAIL TEPAT MENYENTUH */}
                                                            {isHookTouchValid && (
                                                                <g>
                                                                    <circle cx="-12" cy="0" r="5" fill="none" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" />
                                                                    <circle cx="-12" cy="0" r="3" fill="#38bdf8" />
                                                                    <text x="-12" y="-5" textAnchor="middle" fill="#0284c7" fontSize="6" fontWeight="black">MENISKUS!</text>
                                                                </g>
                                                            )}
                                                        </g>
                                                    );
                                                })()}
                                                <text x="0" y="83" textAnchor="middle" fill="#854d0e" fontSize="6" fontWeight="bold">Stilling Well</text>
                                            </g>
                                        </g>
                                    );
                                })()}
                            </g>

                            {/* DISPLAY DIGITAL LOGBOOK BMKG DI SUDUT */}
                            <g transform="translate(355, 30)">
                                <rect x="0" y="0" width="95" height="75" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
                                <text x="47" y="15" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">HASIL EVAPORASI (E)</text>
                                <text x="47" y="38" textAnchor="middle" fill="#38bdf8" fontSize="17" fontWeight="black" fontFamily="monospace">
                                    {calculatedEvaporation}
                                </text>
                                <text x="47" y="52" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">Milimeter (mm)</text>
                                <text x="47" y="66" textAnchor="middle" fill="#e2e8f0" fontSize="7">
                                    {scenario === 'kemarau' ? 'Hujan: 0.0 mm' : 'Hujan: 18.0 mm'}
                                </text>
                            </g>
                        </svg>
                    </div>

                    {/* BAR KONTROL TOMBOL INTERAKTIF SOP MAINTENANCE (PEMBERSIHAN & RESET MAGNET) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* 1. Serok Daun Kering */}
                        <button
                            onClick={() => setHasLeaves(!hasLeaves)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                hasLeaves
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{hasLeaves ? '🍂 Serok Daun!' : '✨ Air Bebas Daun'}</span>
                        </button>

                        {/* 2. Sikat Lumut Dasar Panci */}
                        <button
                            onClick={() => setHasMoss(!hasMoss)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                hasMoss
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{hasMoss ? '🧽 Sikat Lumut!' : '✨ Dasar Mengkilap'}</span>
                        </button>

                        {/* 3. Reset Magnet Batang Termometer Apung */}
                        <button
                            onClick={() => setIsMagnetReset(!isMagnetReset)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                !isMagnetReset
                                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isMagnetReset ? '🧲 Tarik Magnet!' : '✅ Indeks Reset'}</span>
                        </button>

                        {/* 4. Isi Ulang Air Standar WMO */}
                        <button
                            onClick={() => setIsWaterRefilled(!isWaterRefilled)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                isWaterRefilled
                                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{isWaterRefilled ? '🚰 Air Standar (5 cm)' : '💧 Cek Ketinggian'}</span>
                        </button>
                    </div>

                    {/* BOX EDUKASI STANDAR OPERASIONAL (SOP) BMKG */}
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                        <span className="text-sm shrink-0">📋</span>
                        <div>
                            <strong>SOP Harian Observer Pukul 07:00 WIB:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10.5px]">
                                <li><strong>Bidikan Hook Gauge:</strong> Putar sekrup mikrometer perlahan hingga ujung kail menyentuh air dari bawah membentuk pantulan meniskus. Jangan sampai kail tenggelam!</li>
                                <li><strong>Reset Termometer Apung:</strong> Gunakan batang magnet untuk menarik jarum indeks besi kembali menempel ke raksa setelah suhu maks/min dicatat.</li>
                                <li><strong>Kebersihan Panci:</strong> Dasar panci harus bersih dari lumut dan daun agar penyerapan radiasi matahari tetap seragam sesuai standar WMO Class A.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* SISI KANAN (5 Kolom): MINI-GAME HOOK GAUGE, KALKULATOR NERACA AIR, & CUP ANEMOMETER */}
                <div className="lg:col-span-5 space-y-4">
                    {/* PANEL PEMILIHAN SKENARIO CUACA 24 JAM */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                                Pilih Skenario Cuaca 24 Jam
                            </span>
                            <span className="text-[10px] bg-slate-800 text-cyan-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                                07:00 Kemarin ➔ 07:00 Hari Ini
                            </span>
                        </div>

                        {/* Toggle Tombol Skenario A vs B */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleScenarioChange('kemarau')}
                                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                    scenario === 'kemarau'
                                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-2xs'
                                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <span className="text-sm font-extrabold block text-amber-400">☀️ Skenario A</span>
                                <span className="text-[11px] block font-semibold">Kemarau Terik</span>
                                <span className="text-[10px] text-slate-400">Air susut murni (Hujan = 0 mm)</span>
                            </button>

                            <button
                                onClick={() => handleScenarioChange('hujan')}
                                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                    scenario === 'hujan'
                                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-2xs'
                                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <span className="text-sm font-extrabold block text-cyan-400">🌧️ Skenario B</span>
                                <span className="text-[11px] block font-semibold">Hujan Lebat</span>
                                <span className="text-[10px] text-slate-400">Air panci naik (Hujan = 18 mm)</span>
                            </button>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                            {currentScenarioData.description}
                        </p>
                    </div>

                    {/* MINI-GAME BIDIKAN HOOK GAUGE (MIKROMETER KAIT) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>🎯</span> Mini-Game: Putar Sekrup Hook Gauge
                            </span>
                            <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-lg border border-cyan-200">
                                {micrometerPos.toFixed(2)} mm
                            </span>
                        </div>

                        {/* Slider Putar Mikrometer */}
                        <div className="space-y-1.5">
                            <input
                                type="range"
                                min={scenario === 'kemarau' ? '188.0' : '208.0'}
                                max={scenario === 'kemarau' ? '198.0' : '218.0'}
                                step="0.05"
                                value={micrometerPos}
                                onChange={(e) => setMicrometerPos(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>Kail Masuk Dalam</span>
                                <span className="text-cyan-700 font-bold">Target Bidik: {currentScenarioData.targetWaterLevel.toFixed(1)} mm</span>
                                <span>Kail Di Atas Air</span>
                            </div>
                        </div>

                        {/* Feedback Presisi Pembacaan */}
                        <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            isHookTouchValid
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isHookSubmerged
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <span className="text-base">{isHookTouchValid ? '✅' : '⚠️'}</span>
                                <span className="text-[11px] font-bold">
                                    {isHookTouchValid
                                        ? 'Sentuhan Sempurna! Meniskus Terbentuk.'
                                        : isHookSubmerged
                                        ? 'Kail tenggelam terlalu dalam! Putar ke atas.'
                                        : 'Ujung kail belum menyentuh permukaan air.'}
                                </span>
                            </div>
                            <button
                                onClick={() => setMicrometerPos(currentScenarioData.targetWaterLevel)}
                                className="text-[10px] font-bold underline cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                Pas-kan
                            </button>
                        </div>
                    </div>

                    {/* KARTU TERPADU: KALKULATOR NERACA AIR EVAPORASI & CUP ANEMOMETER */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Rumus Neraca Air Evaporasi (BMKG)
                            </span>
                            <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded-full border border-cyan-200">
                                WMO No. 8
                            </span>
                        </div>

                        {/* 3 Kotak Data Pengukuran */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Tinggi Kemarin (P₀)</span>
                                <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
                                    {P0.toFixed(1)} mm
                                </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Tinggi Hari Ini (P₁)</span>
                                <span className="text-xs sm:text-sm font-bold text-cyan-700 font-mono">
                                    {P1.toFixed(1)} mm
                                </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Curah Hujan (H)</span>
                                <span className="text-xs sm:text-sm font-bold text-blue-700 font-mono">
                                    {currentScenarioData.rainMm.toFixed(1)} mm
                                </span>
                            </div>
                        </div>

                        {/* Rumus Step-by-Step BMKG */}
                        {/* <div className="p-2.5 bg-cyan-50/80 rounded-xl border border-cyan-200/60 text-[10.5px] text-cyan-950 leading-relaxed font-mono">
                            <strong>Rumus:</strong> E = (P₀ - P₁) + Curah Hujan (H) <br />
                            E = ({P0.toFixed(1)} - {P1.toFixed(1)}) + {currentScenarioData.rainMm.toFixed(1)} = <strong>{calculatedEvaporation} mm</strong>
                        </div> */}

                        {/* DATA PENDUKUNG: ANEMOMETER 0.5M & SUHU AIR MAKS-MIN */}
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 space-y-1.5 text-xs">
                            <span className="text-[10px] font-bold text-blue-900 uppercase block tracking-wider">
                                Unsur Cuaca Pendukung Evaporasi:
                            </span>
                            <div className="flex items-center justify-between text-[11px] text-blue-800">
                                <span>💨 Kecepatan Angin (0.5m): <strong>{currentScenarioData.windSpeed} m/s</strong></span>
                                <span>🌡️ Suhu Air: <strong>{currentScenarioData.waterTempMin}°C – {currentScenarioData.waterTempMax}°C</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
