import React, { useState } from 'react';

export default function SimulasiAnemometer() {
    // Tab Aktif Era Teknologi: 'manual' (Klimatologi Konvensional) vs 'otomatis' (Telemetri AWS)
    const [activeTab, setActiveTab] = useState('manual');

    // 1. Slider Kecepatan Angin Utama pada Tiang Standar 10 Meter (Knot)
    // Range 0 - 55 knot (Skala Beaufort 0 s/d 10+)
    const [windSpeedKnot, setWindSpeedKnot] = useState(14); // Default 14 knot (Beaufort 4)

    // 2. Arah Datangnya Angin (Derajat Azimuth 0 - 360°)
    const [windDirectionDeg, setWindDirectionDeg] = useState(315); // Default Barat Laut (NW)

    // 3. Efek Kekasaran Permukaan Tanah (Surface Roughness)
    // 'grass' (rumput pendek taman alat BMKG) vs 'rough' (semak belukar / bangunan)
    const [surfaceType, setSurfaceType] = useState('grass');

    // 4. Status Hembusan Angin Mendadak (Wind Gust)
    const [isGustActive, setIsGustActive] = useState(false);

    // --- PROFIL KECEPATAN ANGIN BERDASARKAN KETINGGIAN TIANG (WMO No. 8) ---
    // Hukum Eksponensial Profil Angin (Hellmann Power Law): v(z) = v10 * (z / 10)^alpha
    // alpha = 0.14 untuk rumput pendek terbuka (taman alat), 0.28 untuk banyak rintangan
    const alpha = surfaceType === 'grass' ? 0.14 : 0.28;
    const baseSpeed = isGustActive ? windSpeedKnot + 18 : windSpeedKnot;

    // Kecepatan di 3 tiang BMKG:
    const speed10m = baseSpeed;
    const speed2m = Number((baseSpeed * Math.pow(2 / 10, alpha)).toFixed(1));
    const speed05m = Number((baseSpeed * Math.pow(0.5 / 10, alpha)).toFixed(1));

    // Konversi Satuan Internasional BMKG:
    // 1 Knot = 0.51444 m/s = 1.852 km/jam
    const speedKmh = Number((speed10m * 1.852).toFixed(1));
    const speedMs = Number((speed10m * 0.51444).toFixed(1));

    // --- KLASIFIKASI SKALA BEAUFORT (0 - 12) ---
    const getBeaufortData = (knot) => {
        if (knot < 1) return { scale: 0, name: 'Tenang (Calm)', desc: 'Asap naik lurus tegak ke atas, permukaan air danau tenang bagai kaca.', color: 'text-slate-500', bg: 'bg-slate-100', treeTilt: 0, flagWave: 0 };
        if (knot <= 3) return { scale: 1, name: 'Udara Tenang (Light Air)', desc: 'Asap menunjukkan arah angin bergeser pelan, baling-baling mulai berputar lemah.', color: 'text-sky-600', bg: 'bg-sky-50', treeTilt: 2, flagWave: 1 };
        if (knot <= 6) return { scale: 2, name: 'Semilir Lemah (Light Breeze)', desc: 'Angin terasa menerpa wajah, daun-daun kecil mulai bergemerisik lembut.', color: 'text-teal-600', bg: 'bg-teal-50', treeTilt: 5, flagWave: 2 };
        if (knot <= 10) return { scale: 3, name: 'Semilir Lembut (Gentle Breeze)', desc: 'Daun dan ranting kecil bergerak terus-menerus, bendera berkibar ringan.', color: 'text-emerald-600', bg: 'bg-emerald-50', treeTilt: 8, flagWave: 4 };
        if (knot <= 16) return { scale: 4, name: 'Semilir Sedang (Moderate Breeze)', desc: 'Debu jalanan melayang, dahan kecil bergoyang, bendera berkibar mantap.', color: 'text-amber-600', bg: 'bg-amber-50', treeTilt: 12, flagWave: 6 };
        if (knot <= 21) return { scale: 5, name: 'Angin Segar (Fresh Breeze)', desc: 'Pohon-pohon kecil mulai bergoyang, riak air danau berombak kecil.', color: 'text-orange-600', bg: 'bg-orange-50', treeTilt: 17, flagWave: 8 };
        if (knot <= 27) return { scale: 6, name: 'Angin Kuat (Strong Breeze)', desc: 'Dahan besar bergoyang, payung sulit digunakan, kabel listrik bersiul tertiup angin.', color: 'text-orange-700', bg: 'bg-orange-100', treeTilt: 22, flagWave: 10 };
        if (knot <= 33) return { scale: 7, name: 'Angin Kencang (Near Gale)', desc: 'Seluruh pohon bergoyang kuat, sulit berjalan melawan arah terpaan angin.', color: 'text-rose-600', bg: 'bg-rose-50', treeTilt: 28, flagWave: 12 };
        if (knot <= 40) return { scale: 8, name: 'Badai Ringan (Gale)', desc: 'Ranting pohon patah, kemudi mobil terdorong oleng di jalan terbuka.', color: 'text-rose-700', bg: 'bg-rose-100', treeTilt: 35, flagWave: 14 };
        if (knot <= 47) return { scale: 9, name: 'Badai Kuat (Strong Gale)', desc: 'Kerusakan struktural ringan, atap seng genteng rumah terlepas!', color: 'text-red-700', bg: 'bg-red-100', treeTilt: 42, flagWave: 16 };
        return { scale: 10, name: 'Badai Penuh (Storm / Violent Storm 10+)', desc: 'Pohon tumbang, kerusakan parah! Status Peringatan Dini Cuaca Ekstrem BMKG!', color: 'text-purple-700', bg: 'bg-purple-100', treeTilt: 50, flagWave: 18 };
    };

    const beaufort = getBeaufortData(speed10m);

    // --- TEKNOLOGI MANUAL BMKG: PERHITUNGAN JARAK TEMPUH ANGIN (WIND RUN) ---
    // Odometer Cup Counter: Selisih angka km dalam 24 jam
    // Menggunakan kecepatan rata-rata di tiang rendah (0.5m / 2m) untuk evaporasi & agroklimat
    const odometerStartKm = 1250.0;
    const speed05mKmh = Number((speed05m * 1.852).toFixed(1));
    const windRun24hKm = Number((speed05mKmh * 24).toFixed(1));
    const odometerEndKm = Number((odometerStartKm + windRun24hKm).toFixed(1));

    // Arah Mata Angin 8 Penjuru
    const getWindDirectionLabel = (deg) => {
        const d = (deg % 360 + 360) % 360;
        if (d >= 337.5 || d < 22.5) return { label: 'Utara (N)', abbr: 'U' };
        if (d >= 22.5 && d < 67.5) return { label: 'Timur Laut (NE)', abbr: 'TL' };
        if (d >= 67.5 && d < 112.5) return { label: 'Timur (E)', abbr: 'T' };
        if (d >= 112.5 && d < 157.5) return { label: 'Tenggara (SE)', abbr: 'TG' };
        if (d >= 157.5 && d < 202.5) return { label: 'Selatan (S)', abbr: 'S' };
        if (d >= 202.5 && d < 247.5) return { label: 'Barat Daya (SW)', abbr: 'BD' };
        if (d >= 247.5 && d < 292.5) return { label: 'Barat (W)', abbr: 'B' };
        return { label: 'Barat Laut (NW)', abbr: 'BL' };
    };

    const dirData = getWindDirectionLabel(windDirectionDeg);

    // Durasi animasi putaran mangkuk anemometer (detik per putaran)
    const calcAnimDuration = (speed) => {
        if (speed <= 0.5) return '0s';
        const sec = Math.max(0.10, 3.8 / speed);
        return `${sec.toFixed(2)}s`;
    };

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Header Ringkas Modul Simulasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/60">
                        <span>💨</span> Dinamika Atmosfer & Pengukuran Angin
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🌀</span> Simulasi Anemometer (Sistem Manual & Otomatis)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Diorama lanskap Skala Beaufort, profil 3 tiang ketinggian BMKG, dan perbandingan dua era teknologi pengamatan angin.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${beaufort.bg} ${beaufort.color} border-current/20`}>
                        Beaufort {beaufort.scale}: {beaufort.name}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-cyan-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        {speed10m} Knot ({speedKmh} km/j)
                    </span>
                </div>
            </div>

            {/* Layout Utama: 60% Diorama Panorama (7 Kolom) vs 40% Panel Tab Era Teknologi (5 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (60% / 7 Kolom): KANVAS PANORAMA BEAUFORT & 3 TIANG KETINGGIAN */}
                <div className="lg:col-span-7 space-y-3.5">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-200 via-sky-50 to-emerald-50 p-4 sm:p-5 overflow-hidden shadow-xs">
                        {/* Status Bar Kecil di Atas Kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>🧭</span>
                                <span>Arah Datang Angin: <strong>{dirData.label} ({windDirectionDeg}°)</strong></span>
                            </span>
                            <span className={`text-[11px] font-bold ${isGustActive ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
                                {isGustActive ? '🌪️ PERINGATAN GUST (HEMBUSAN MENDADAK)!' : 'Angin Bertiup Stabil'}
                            </span>
                        </div>

                        {/* Diagram SVG Diorama Lanskap: 3 Tiang Ketinggian & Efek Beaufort */}
                        <svg viewBox="0 0 460 300" className="w-full h-auto select-none drop-shadow-md mx-auto">
                            <defs>
                                <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#86efac" />
                                    <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                                <linearGradient id="roughGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#a3a3a3" />
                                    <stop offset="100%" stopColor="#525252" />
                                </linearGradient>
                            </defs>

                            {/* PARTIKEL ALIRAN ANGIN (STREAMLINES) */}
                            {speed10m > 1 && (
                                <g opacity={Math.min(0.85, speed10m / 35)}>
                                    {[25, 75, 125, 175, 220].map((y, i) => (
                                        <line
                                            key={i}
                                            x1="10"
                                            y1={y}
                                            x2="450"
                                            y2={y + (beaufort.flagWave * 0.4)}
                                            stroke="#38bdf8"
                                            strokeWidth={i === 0 ? "2.5" : "1.5"}
                                            strokeDasharray="12 16"
                                            className="animate-pulse"
                                        />
                                    ))}
                                </g>
                            )}

                            {/* TANAH TAMAN ALAT BMKG */}
                            <rect x="0" y="250" width="460" height="50" fill={surfaceType === 'grass' ? "url(#grassGrad)" : "url(#roughGrad)"} />
                            <line x1="0" y1="250" x2="460" y2="250" stroke="#15803d" strokeWidth="2" />

                            {/* ELEMEN LANSKAP BEAUFORT: ASAP, BENDERA, & POHON */}
                            {/* 1. Asap Pabrik di Kiri */}
                            <g transform="translate(30, 250)">
                                <rect x="-8" y="-45" width="16" height="45" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
                                <path
                                    d={`M 0 -45 Q ${beaufort.treeTilt * 1.5} -70 ${beaufort.treeTilt * 3.5} -95`}
                                    fill="none"
                                    stroke="#94a3b8"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    opacity="0.6"
                                />
                                <text x="0" y="-50" textAnchor="middle" fill="#64748b" fontSize="6" fontWeight="bold">Asap</text>
                            </g>

                            {/* 2. Tiang Bendera BMKG di Kanan */}
                            <g transform="translate(425, 250)">
                                <line x1="0" y1="0" x2="0" y2="-90" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="0" cy="-90" r="3" fill="#f59e0b" />
                                <polygon
                                    points={`0,-88 ${Math.max(8, beaufort.flagWave * 2.2)},${-88 + (beaufort.flagWave * 0.4)} ${Math.max(6, beaufort.flagWave * 2)},${-72 - (beaufort.flagWave * 0.3)} 0,-72`}
                                    fill="#ef4444"
                                    stroke="#b91c1c"
                                    strokeWidth="1"
                                />
                                <text x="0" y="-95" textAnchor="middle" fill="#0f172a" fontSize="6" fontWeight="bold">Bendera</text>
                            </g>

                            {/* 3. Pohon Indikator Bergoyang Sesuai Skala Beaufort */}
                            <g transform="translate(85, 250)">
                                <path
                                    d={`M -5 0 Q ${beaufort.treeTilt * 0.3} -30 ${beaufort.treeTilt * 0.7} -60 L ${beaufort.treeTilt * 0.7 + 5} -60 Q ${beaufort.treeTilt * 0.3 + 5} -30 5 0 Z`}
                                    fill="#78350f"
                                />
                                <g transform={`translate(${beaufort.treeTilt * 0.7}, -75)`}>
                                    <circle cx="0" cy="0" r="24" fill="#16a34a" opacity="0.9" />
                                    <circle cx="-12" cy="5" r="18" fill="#15803d" />
                                    <circle cx="14" cy="4" r="18" fill="#22c55e" />
                                </g>
                                <text x="0" y="15" textAnchor="middle" fill="#14532d" fontSize="6" fontWeight="bold">Pohon Indikator</text>
                            </g>

                            {/* ======================================================== */}
                            {/* 3 TIANG PROFIL ANGIN BMKG (10M, 2M, 0.5M)               */}
                            {/* ======================================================== */}

                            {/* TIANG 1: 10 METER (STANDAR SINOPTIK WMO / SISTEM OTOMATIS AWS) */}
                            <g transform="translate(260, 250)">
                                <line x1="0" y1="0" x2="0" y2="-200" stroke="#334155" strokeWidth="4" />
                                <line x1="-12" y1="0" x2="0" y2="-200" stroke="#64748b" strokeWidth="1.5" />
                                <line x1="12" y1="0" x2="0" y2="-200" stroke="#64748b" strokeWidth="1.5" />

                                {/* WIND VANE PENUNJUK ARAH ANGIN OTOMATIS */}
                                <g transform="translate(0, -215)">
                                    <circle cx="0" cy="0" r="4" fill="#0f172a" />
                                    <g transform={`rotate(${windDirectionDeg - 90})`} style={{ transition: 'transform 0.5s ease-out' }}>
                                        <line x1="-20" y1="0" x2="22" y2="0" stroke="#0f172a" strokeWidth="2.5" />
                                        <polygon points="22,-4 30,0 22,4" fill="#ef4444" />
                                        <polygon points="-20,-8 -12,0 -20,8 -24,8 -16,0 -24,-8" fill="#0284c7" />
                                    </g>
                                </g>

                                {/* Mangkuk Cup Anemometer 10 Meter (Berputar Sangat Cepat) */}
                                <g transform="translate(0, -200)">
                                    <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
                                    <g
                                        className={speed10m > 0 ? "animate-spin" : ""}
                                        style={{ transformOrigin: '0px 0px', animationDuration: calcAnimDuration(speed10m) }}
                                    >
                                        <line x1="-18" y1="0" x2="18" y2="0" stroke="#0f172a" strokeWidth="2" />
                                        <circle cx="-18" cy="0" r="5" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
                                        <circle cx="18" cy="0" r="5" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
                                        <circle cx="0" cy="-14" r="5" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
                                    </g>
                                </g>

                                <rect x="-35" y="-185" width="70" height="18" rx="4" fill="#0f172a" />
                                <text x="0" y="-173" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="black" fontFamily="monospace">
                                    10m: {speed10m} Kt
                                </text>
                                <text x="0" y="15" textAnchor="middle" fill="#1e293b" fontSize="7" fontWeight="bold">Tiang 10m (Otomatis AWS)</text>
                            </g>

                            {/* TIANG 2: 2 METER (AGROKLIMATOLOGI MANUAL) */}
                            <g transform="translate(195, 250)">
                                <line x1="0" y1="0" x2="0" y2="-90" stroke="#475569" strokeWidth="3" />
                                <line x1="-6" y1="0" x2="0" y2="-90" stroke="#64748b" strokeWidth="1" />
                                <line x1="6" y1="0" x2="0" y2="-90" stroke="#64748b" strokeWidth="1" />

                                <g transform="translate(0, -90)">
                                    <circle cx="0" cy="0" r="3" fill="#0f172a" />
                                    <g
                                        className={speed2m > 0 ? "animate-spin" : ""}
                                        style={{ transformOrigin: '0px 0px', animationDuration: calcAnimDuration(speed2m) }}
                                    >
                                        <line x1="-14" y1="0" x2="14" y2="0" stroke="#0f172a" strokeWidth="1.5" />
                                        <circle cx="-14" cy="0" r="4" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                        <circle cx="14" cy="0" r="4" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                        <circle cx="0" cy="-10" r="4" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                    </g>
                                </g>

                                <rect x="-28" y="-80" width="56" height="15" rx="3" fill="#1e293b" />
                                <text x="0" y="-70" textAnchor="middle" fill="#a5f3fc" fontSize="7" fontWeight="bold" fontFamily="monospace">
                                    2m: {speed2m} Kt
                                </text>
                                <text x="0" y="15" textAnchor="middle" fill="#334155" fontSize="7" fontWeight="bold">Tiang 2m</text>
                            </g>

                            {/* TIANG 3: 0.5 METER (PANCI PENGUAPAN / MANUAL CUP COUNTER ODOMETER) */}
                            <g transform="translate(345, 250)">
                                <line x1="0" y1="0" x2="0" y2="-40" stroke="#64748b" strokeWidth="2.5" />

                                {/* Tabung Silinder Odometer Manual di Tiang Rendah */}
                                <rect x="-6" y="-28" width="12" height="14" rx="2" fill="#0f172a" stroke="#ca8a04" strokeWidth="1" />

                                <g transform="translate(0, -40)">
                                    <circle cx="0" cy="0" r="2.5" fill="#0f172a" />
                                    <g
                                        className={speed05m > 0 ? "animate-spin" : ""}
                                        style={{ transformOrigin: '0px 0px', animationDuration: calcAnimDuration(speed05m) }}
                                    >
                                        <line x1="-11" y1="0" x2="11" y2="0" stroke="#0f172a" strokeWidth="1.5" />
                                        <circle cx="-11" cy="0" r="3.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                        <circle cx="11" cy="0" r="3.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                        <circle cx="0" cy="-8" r="3.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                                    </g>
                                </g>

                                <rect x="-26" y="-55" width="52" height="14" rx="3" fill="#334155" />
                                <text x="0" y="-46" textAnchor="middle" fill="#e0f2fe" fontSize="7" fontWeight="bold" fontFamily="monospace">
                                    0.5m: {speed05m} Kt
                                </text>
                                <text x="0" y="15" textAnchor="middle" fill="#854d0e" fontSize="7" fontWeight="bold">Tiang 0.5m (Manual)</text>
                            </g>
                        </svg>

                        {/* FLOATING CONTROLS DI DALAM KANVAS DIORAMA */}
                        <div className="mt-3 p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl border border-slate-700/80 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                                    <span>🎚️</span> Slider Kecepatan Angin (Tiang 10m):
                                </span>
                                <span className="font-mono font-black text-cyan-400">
                                    {speed10m} Knot ({speedKmh} km/jam)
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="55"
                                step="1"
                                value={windSpeedKnot}
                                onChange={(e) => setWindSpeedKnot(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
                                {/* Toggle Kondisi Permukaan */}
                                <button
                                    onClick={() => setSurfaceType(surfaceType === 'grass' ? 'rough' : 'grass')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>{surfaceType === 'grass' ? '🌱 Rumput Pendek (Taman Alat)' : '🏢 Rintangan Bangunan / Semak'}</span>
                                </button>

                                {/* Tombol Pemicu Wind Gust */}
                                <button
                                    onClick={() => setIsGustActive(!isGustActive)}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        isGustActive 
                                            ? 'bg-rose-600 text-white border-rose-600 animate-pulse' 
                                            : 'bg-slate-800 text-rose-400 border-rose-500/50 hover:bg-rose-950/40'
                                    }`}
                                >
                                    <span>{isGustActive ? '🌪️ Gust Aktif (+18 Kt)!' : '⚡ Pemicu Wind Gust'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* EDUKASI PROFIL ANGIN (LAPISAN BATAS) */}
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                        <span className="text-sm shrink-0">💡</span>
                        <div>
                            <strong>Mengapa Ada 3 Ketinggian Tiang?</strong> Tiang <strong>0.5m</strong> untuk mengukur laju evaporasi panci terbuka, tiang <strong>2m</strong> untuk zona tanaman agroklimat, dan tiang <strong>10m</strong> adalah standar WMO internasional agar pembacaan angin terbebas dari hambatan gesekan permukaan tanah.
                        </div>
                    </div>
                </div>

                {/* SISI KANAN (40% / 5 Kolom): PANEL TAB DUA ERA TEKNOLOGI BMKG */}
                <div className="lg:col-span-5 space-y-4">
                    {/* NAVIGASI TAB: KLIMATOLOGI MANUAL VS TELEMETRI OTOMATIS */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                activeTab === 'manual'
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span>⚙️</span>
                            <span>Klimatologi Manual</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('otomatis')}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                activeTab === 'otomatis'
                                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span>📡</span>
                            <span>Telemetri AWS</span>
                        </button>
                    </div>

                    {/* ISI TAB 1: KLIMATOLOGI MANUAL (CUP COUNTER ODOMETER & WIND RUN) */}
                    {activeTab === 'manual' && (
                        <div className="space-y-4">
                            {/* Kartu Odometer Analog Mekanik */}
                            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3.5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>📟</span> Odometer Cup Counter (Tiang 0.5m)
                                    </span>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                                        Mekanik Murni (Tanpa Listrik)
                                    </span>
                                </div>

                                {/* Display Roda Anger Counter Analog */}
                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <div className="text-center flex-1 border-r border-slate-800 pr-2">
                                        <span className="text-[10px] text-slate-400 block mb-1">Kemarin (07:00)</span>
                                        <div className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 font-mono text-sm sm:text-base font-black text-slate-300 tracking-widest">
                                            {odometerStartKm.toFixed(1)} km
                                        </div>
                                    </div>

                                    <div className="text-center flex-1 pl-2">
                                        <span className="text-[10px] text-cyan-400 font-bold block mb-1">Hari Ini (07:00)</span>
                                        <div className="bg-slate-900 px-2 py-1.5 rounded-lg border border-cyan-500/60 font-mono text-sm sm:text-base font-black text-cyan-400 tracking-widest shadow-2xs">
                                            {odometerEndKm.toFixed(1)} km
                                        </div>
                                    </div>
                                </div>

                                {/* Penjelasan Miskonsepsi Angin Manual */}
                                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                                    💡 <strong>Miskonsepsi Umum:</strong> Alat manual tidak membaca kecepatan instan (km/jam), melainkan mencatat akumulasi <strong>jarak tempuh angin (*wind run*)</strong> selama 24 jam penuh!
                                </p>
                            </div>

                            {/* Kartu Kalkulator Wind Run BMKG */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                                    Rumus Baku Kecepatan Rata-rata Harian BMKG
                                </span>

                                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Total Jarak Angin (Δ km):</span>
                                        <span className="font-bold text-slate-900 font-mono">{windRun24hKm} km</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Durasi Periode Pengamatan:</span>
                                        <span className="font-bold text-slate-900 font-mono">24 Jam</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-150 flex justify-between items-center text-sm font-extrabold text-blue-900">
                                        <span>Kecepatan Rata-rata:</span>
                                        <span className="font-mono text-base text-blue-700">{speed05mKmh} km/jam</span>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[10.5px] text-amber-950 font-mono leading-relaxed">
                                    <strong>Rumus:</strong> V = (Counter Akhir - Counter Awal) / 24 <br />
                                    V = ({odometerEndKm.toFixed(1)} - {odometerStartKm.toFixed(1)}) / 24 = <strong>{speed05mKmh} km/jam</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ISI TAB 2: TELEMETRI OTOMATIS (AWS / WIND VANE & ULTRASONIK) */}
                    {activeTab === 'otomatis' && (
                        <div className="space-y-4">
                            {/* Kartu Compass Wind Rose 360° */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🧭</span> Mawar Angin (Compass Rose 360°)
                                    </span>
                                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                        {dirData.abbr} - {windDirectionDeg}°
                                    </span>
                                </div>

                                {/* 8 Tombol Arah Mata Angin */}
                                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                                    {[
                                        { name: 'Utara', deg: 0 },
                                        { name: 'T.Laut', deg: 45 },
                                        { name: 'Timur', deg: 90 },
                                        { name: 'Tenggara', deg: 135 },
                                        { name: 'Selatan', deg: 180 },
                                        { name: 'B.Daya', deg: 225 },
                                        { name: 'Barat', deg: 270 },
                                        { name: 'B.Laut', deg: 315 },
                                    ].map((d) => (
                                        <button
                                            key={d.deg}
                                            onClick={() => setWindDirectionDeg(d.deg)}
                                            className={`py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                                windDirectionDeg === d.deg
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {d.name}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-[11px] text-slate-600 leading-snug">
                                    Sirip <em>Wind Vane</em> otomatis mensejajarkan diri ke arah datangnya angin. Sensor telemetri AWS membaca nilai azimuth derajat secara digital setiap detik.
                                </p>
                            </div>

                            {/* Kartu Telemetri Digital Logger AWS (3 Satuan Internasional) */}
                            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 border border-slate-800 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>📡</span> Data Logger AWS BMKG (Tiang 10m)
                                    </span>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                                        Real-Time Telemetri
                                    </span>
                                </div>

                                {/* 3 Kotak Konversi Satuan */}
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-[9px] text-slate-400 block">Knot (WMO)</span>
                                        <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">
                                            {speed10m}
                                        </span>
                                    </div>
                                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-[9px] text-slate-400 block">m / detik</span>
                                        <span className="text-sm sm:text-base font-black text-indigo-400 font-mono">
                                            {speedMs}
                                        </span>
                                    </div>
                                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                        <span className="text-[9px] text-slate-400 block">km / jam</span>
                                        <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                                            {speedKmh}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700/80 text-[10.5px] text-slate-300 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Rata-rata 10 Menit:</span>
                                        <span className="font-bold text-white font-mono">{speed10m} Knot</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Hembusan Maksimum (Gust):</span>
                                        <span className="font-bold text-rose-400 font-mono">{speed10m + (isGustActive ? 0 : 5)} Knot</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
