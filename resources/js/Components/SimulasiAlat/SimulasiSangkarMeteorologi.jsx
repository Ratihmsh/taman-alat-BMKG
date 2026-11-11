import React, { useState } from 'react';

export default function SimulasiSangkarMeteorologi() {
    // 1. Kontrol Proteksi Sangkar (Di Dalam vs Di Luar)
    const [isInside, setIsInside] = useState(true);

    // 2. Kontrol Slider Jam 24 Jam (0 - 24 format angka bulat)
    // Default jam 13:00 (siang puncak)
    const [hour, setHour] = useState(13);

    // 3. Kontrol Pintu Sangkar (Buka vs Tutup)
    const [isDoorOpen, setIsDoorOpen] = useState(true);

    // 4. Termometer yang dipilih saat pintu terbuka
    const [selectedTool, setSelectedTool] = useState('kering');

    // Kalkulasi kurva fluktuasi suhu harian realistis (Diurnal Temperature Cycle)
    const calculateAmbientTemp = (h) => {
        const minTemp = 23.0; // Terdingin subuh jam 05:00
        const maxTemp = 34.5; // Terpanas siang jam 13:30
        const radians = ((h - 8) / 24) * 2 * Math.PI;
        const norm = (Math.sin(radians - Math.PI / 2) + 1) / 2;
        return Number((minTemp + (maxTemp - minTemp) * norm).toFixed(1));
    };

    const ambientTemp = calculateAmbientTemp(hour);

    // Jika di luar sangkar, saat siang hari (06:00 - 18:00) suhu tabung terdistorsi radiasi
    const isDaylight = hour >= 6 && hour < 18;
    const directRadiationBonus = isDaylight ? (Math.sin(((hour - 6) / 12) * Math.PI) * 13) : 0;
    const displayedTemp = isInside ? ambientTemp : Number((ambientTemp + directRadiationBonus).toFixed(1));

    // Perilaku Indeks Maksimum & Minimum
    const maxRecord = 34.5;
    const minRecord = 23.0;
    const maxIndexPos = hour < 14 ? ambientTemp : maxRecord;
    const minIndexPos = hour < 5 ? ambientTemp : minRecord;

    // Data 4 instrumen
    const toolData = {
        kering: {
            name: 'Termometer Bola Kering',
            badge: 'Suhu Aktual',
            icon: '🌡️',
            val: `${ambientTemp}°C`,
            color: 'text-rose-600',
            border: 'border-rose-200',
            bg: 'bg-rose-50/70',
            desc: 'Mengukur temperatur udara atmosfer aktual secara netral tanpa distorsi radiasi langsung.'
        },
        basah: {
            name: 'Termometer Bola Basah',
            badge: 'Kelembapan Udara (RH)',
            icon: '💧',
            val: `${(ambientTemp - 4.2).toFixed(1)}°C`,
            color: 'text-sky-600',
            border: 'border-sky-200',
            bg: 'bg-sky-50/70',
            desc: 'Reservoir dibalut kain kasa basah. Penguapan air menyerap kalor sehingga selalu lebih dingin dari bola kering. Selisihnya digunakan untuk menghitung kelembapan udara.'
        },
        maksimum: {
            name: 'Termometer Maksimum',
            badge: 'Rekor Terpanas 24 Jam',
            icon: '🔥',
            val: `${maxIndexPos}°C`,
            color: 'text-amber-600',
            border: 'border-amber-200',
            bg: 'bg-amber-50/70',
            desc: 'Dilengkapi leher kapiler sempit. Saat suhu siang memuncak lalu mendingin, raksa terputus sehingga indeks tetap tertahan di rekor terpanas hari ini.'
        },
        minimum: {
            name: 'Termometer Minimum',
            badge: 'Rekor Terdingin 24 Jam',
            icon: '❄️',
            val: `${minIndexPos}°C`,
            color: 'text-indigo-600',
            border: 'border-indigo-200',
            bg: 'bg-indigo-50/70',
            desc: 'Menggunakan alkohol bening dengan indeks halter di dalamnya. Meniskus alkohol menarik indeks ke suhu subuh terendah dan tetap tertinggal di sana.'
        }
    };

    return (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm">
            {/* Header Ringkas Section Tunggal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-150">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/60">
                        <span>⚡</span> Laboratorium Simulasi Interaktif
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🏠</span> Simulasi Terpadu Sangkar Meteorologi
                    </h3>
                    <p className="text-xs text-slate-500">
                        Geser slider waktu pengamatan 24 jam untuk melihat perubahan suhu, efek proteksi radiasi sangkar, dan intip instrumen di dalamnya.
                    </p>
                </div>

                {/* Status Badges Cepat */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isInside
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    }`}>
                        {isInside ? '🛡️ Terlindungi Sangkar' : '⚠️ Terpapar Radiasi'}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        🕒 {String(hour).padStart(2, '0')}:00 WIB
                    </span>
                </div>
            </div>

            {/* Dashboard Terpadu: 1 Layar Grid Saling Terhubung */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (7 Kolom): Visual Interaktif Sangkar + Cuaca */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Kanvas Animasi SVG Utama */}
                    <div className={`relative rounded-2xl border transition-all duration-500 p-5 overflow-hidden ${
                        !isInside
                            ? 'bg-gradient-to-br from-amber-50 via-orange-100/50 to-rose-100/60 border-rose-300'
                            : hour >= 6 && hour < 18
                                ? 'bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50/40 border-blue-200'
                                : 'bg-gradient-to-br from-slate-900/40 via-indigo-950/20 to-blue-900/30 border-slate-300'
                    }`}>
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>{isDaylight ? '☀️' : '🌙'}</span>
                                <span>{isDaylight ? `Siang Hari (${hour}:00 WIB)` : `Malam / Subuh (${hour}:00 WIB)`}</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                                {isInside ? 'Kisi-kisi mengalirkan udara segar' : 'Sensor kepanasan sinar langsung'}
                            </span>
                        </div>

                        {/* Diagram SVG Sangkar Interaktif */}
                        <svg viewBox="0 0 440 270" className="w-full h-auto max-h-[260px] select-none drop-shadow-md mx-auto">
                            <defs>
                                <pattern id="jalusiLouverMerged" width="14" height="7" patternUnits="userSpaceOnUse">
                                    <line x1="0" y1="2" x2="14" y2="6" stroke="#cbd5e1" strokeWidth="2" />
                                </pattern>
                                <linearGradient id="mercuryGradMerged" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#991b1b" />
                                </linearGradient>
                            </defs>

                            {/* Matahari / Bulan */}
                            {isDaylight ? (
                                <g transform="translate(55, 45)">
                                    <circle cx="0" cy="0" r="22" fill="#f59e0b" className="animate-pulse" />
                                    <circle cx="0" cy="0" r="30" fill="#fef08a" opacity="0.4" />
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                                        <line key={i} x1="0" y1="0" x2="38" y2="0" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${deg})`} />
                                    ))}
                                    <text x="0" y="3" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="bold">Matahari</text>
                                </g>
                            ) : (
                                <g transform="translate(55, 45)">
                                    <circle cx="0" cy="0" r="20" fill="#f8fafc" />
                                    <circle cx="6" cy="-4" r="18" fill="#1e293b" />
                                    <text x="0" y="3" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">Bulan</text>
                                </g>
                            )}

                            {/* DI LUAR SANGKAR (ERROR RADIASI) */}
                            {!isInside ? (
                                <g>
                                    {isDaylight && (
                                        <g>
                                            <line x1="80" y1="65" x2="235" y2="140" stroke="#ef4444" strokeWidth="4" strokeDasharray="8 4" className="animate-pulse" />
                                            <circle cx="240" cy="155" r="42" fill="#fee2e2" opacity="0.6" />
                                        </g>
                                    )}
                                    <line x1="240" y1="180" x2="240" y2="245" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                                    <rect x="232" y="65" width="16" height="120" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.5" />
                                    <rect
                                        x="236"
                                        y={65 + (120 - Math.min(105, ((displayedTemp - 15) / 35) * 110))}
                                        width="8"
                                        height={Math.min(105, ((displayedTemp - 15) / 35) * 110)}
                                        rx="4"
                                        fill="url(#mercuryGradMerged)"
                                    />
                                    <circle cx="240" cy="170" r="10" fill="#ef4444" />

                                    <g transform="translate(275, 80)">
                                        <rect x="0" y="0" width="150" height="52" rx="10" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                                        <text x="12" y="18" fill="#991b1b" fontSize="10" fontWeight="extrabold">⚠️ ERROR RADIASI!</text>
                                        <text x="12" y="32" fill="#b91c1c" fontSize="9" fontWeight="bold">Terbaca: {displayedTemp}°C</text>
                                        <text x="12" y="44" fill="#dc2626" fontSize="8">(Dipanaskan sinar matahari)</text>
                                    </g>
                                </g>
                            ) : (
                                /* DI DALAM SANGKAR */
                                <g>
                                    {isDaylight && (
                                        <g>
                                            <line x1="85" y1="60" x2="185" y2="110" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
                                            <path d="M 185 110 L 200 50" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
                                            <polygon points="200,50 206,58 196,62" fill="#0ea5e9" />
                                            <text x="205" y="70" fill="#0284c7" fontSize="8" fontWeight="bold">Pantulan Albedo 85%+</text>
                                        </g>
                                    )}

                                    <path d="M 20 160 Q 90 145 160 160 T 240 160" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="5 5" />
                                    <text x="15" y="150" fill="#0369a1" fontSize="9" fontWeight="bold">Sirkulasi Angin ➔</text>

                                    <line x1="205" y1="190" x2="195" y2="245" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
                                    <line x1="285" y1="190" x2="295" y2="245" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
                                    <line x1="198" y1="218" x2="292" y2="218" stroke="#64748b" strokeWidth="2.5" />

                                    <polygon points="170,95 320,95 305,80 185,80" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                                    <polygon points="160,80 330,80 245,52" fill="#ffffff" stroke="#64748b" strokeWidth="2.5" />
                                    <rect x="185" y="95" width="120" height="95" rx="6" fill="#f8fafc" stroke="#64748b" strokeWidth="2.5" />

                                    {!isDoorOpen ? (
                                        <g onClick={() => setIsDoorOpen(true)} className="cursor-pointer group">
                                            <rect x="190" y="100" width="110" height="85" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                                            <rect x="195" y="105" width="100" height="75" fill="url(#jalusiLouverMerged)" stroke="#cbd5e1" strokeWidth="1" />
                                            <line x1="245" y1="100" x2="245" y2="185" stroke="#94a3b8" strokeWidth="2" />
                                            <circle cx="238" cy="142" r="3" fill="#64748b" />
                                            <circle cx="252" cy="142" r="3" fill="#64748b" />
                                            <rect x="200" y="130" width="90" height="24" rx="6" fill="#2563eb" className="group-hover:fill-blue-700 transition-colors" />
                                            <text x="245" y="145" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Buka Pintu Sangkar</text>
                                        </g>
                                    ) : (
                                        <g>
                                            <rect x="145" y="98" width="38" height="90" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(-15 185 98)" />
                                            <rect x="305" y="98" width="38" height="90" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(15 305 98)" />
                                            <line x1="195" y1="165" x2="295" y2="165" stroke="#94a3b8" strokeWidth="2.5" />

                                            {/* 1. Bola Kering */}
                                            <g onClick={() => setSelectedTool('kering')} className="cursor-pointer">
                                                <rect x="202" y="108" width="8" height="55" rx="4" fill={selectedTool === 'kering' ? '#fee2e2' : '#ffffff'} stroke={selectedTool === 'kering' ? '#e11d48' : '#94a3b8'} strokeWidth={selectedTool === 'kering' ? '2.5' : '1'} />
                                                <rect x="204" y="122" width="4" height="35" rx="2" fill="#e11d48" />
                                                <circle cx="206" cy="160" r="5" fill="#e11d48" />
                                                <text x="206" y="104" textAnchor="middle" fill="#be123c" fontSize="7" fontWeight="bold">Kering</text>
                                            </g>

                                            {/* 2. Bola Basah */}
                                            <g onClick={() => setSelectedTool('basah')} className="cursor-pointer">
                                                <rect x="222" y="108" width="8" height="55" rx="4" fill={selectedTool === 'basah' ? '#e0f2fe' : '#ffffff'} stroke={selectedTool === 'basah' ? '#0284c7' : '#94a3b8'} strokeWidth={selectedTool === 'basah' ? '2.5' : '1'} />
                                                <rect x="224" y="126" width="4" height="30" rx="2" fill="#0284c7" />
                                                <circle cx="226" cy="160" r="5" fill="#0284c7" />
                                                <rect x="222" y="156" width="8" height="8" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
                                                <text x="226" y="104" textAnchor="middle" fill="#0369a1" fontSize="7" fontWeight="bold">Basah</text>
                                            </g>

                                            {/* 3. Maksimum */}
                                            <g onClick={() => setSelectedTool('maksimum')} className="cursor-pointer">
                                                <line x1="245" y1="118" x2="288" y2="124" stroke={selectedTool === 'maksimum' ? '#d97706' : '#94a3b8'} strokeWidth={selectedTool === 'maksimum' ? '4.5' : '3'} strokeLinecap="round" />
                                                <circle cx="247" cy="118" r="3.5" fill="#d97706" />
                                                <text x="268" y="114" textAnchor="middle" fill="#b45309" fontSize="7" fontWeight="bold">Maks</text>
                                            </g>

                                            {/* 4. Minimum */}
                                            <g onClick={() => setSelectedTool('minimum')} className="cursor-pointer">
                                                <line x1="245" y1="142" x2="288" y2="142" stroke={selectedTool === 'minimum' ? '#4f46e5' : '#94a3b8'} strokeWidth={selectedTool === 'minimum' ? '4.5' : '3'} strokeLinecap="round" />
                                                <circle cx="247" cy="142" r="3.5" fill="#4f46e5" />
                                                <text x="268" y="154" textAnchor="middle" fill="#4338ca" fontSize="7" fontWeight="bold">Min</text>
                                            </g>
                                        </g>
                                    )}

                                    <g transform="translate(320, 110)">
                                        <rect x="0" y="0" width="110" height="42" rx="8" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5" />
                                        <text x="8" y="16" fill="#166534" fontSize="9" fontWeight="extrabold">✅ SUHU AKURAT</text>
                                        <text x="8" y="30" fill="#15803d" fontSize="9" fontWeight="bold">Ambien: {ambientTemp}°C</text>
                                    </g>
                                </g>
                            )}

                            <line x1="30" y1="245" x2="410" y2="245" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
                            <text x="240" y="260" textAnchor="middle" fill="#64748b" fontSize="8">Taman Alat Terbuka di Atas Rumput Hijau (Tinggi 1.2 - 1.5 m)</text>
                        </svg>
                    </div>

                    {/* Kontrol Sakelar Posisi & Buka Pintu */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">Posisi Alat:</span>
                            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
                                <button
                                    onClick={() => setIsInside(true)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isInside ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    🏠 Di Dalam Sangkar
                                </button>
                                <button
                                    onClick={() => setIsInside(false)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        !isInside ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    ☀️ Di Luar Sangkar
                                </button>
                            </div>
                        </div>

                        {isInside && (
                            <button
                                onClick={() => setIsDoorOpen(!isDoorOpen)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                                    isDoorOpen ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                                }`}
                            >
                                <span>{isDoorOpen ? '🚪 Tutup Pintu' : '🔓 Buka & Intip Dalam'}</span>
                            </button>
                        )}
                    </div>

                    {/* Ringkasan SOP Singkat */}
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                        <span className="text-sm shrink-0">📋</span>
                        <div>
                            <strong>Pengamatan BMKG:</strong> Observer mencatat data setiap jam sinoptik (07:00, 13:00, 18:00 WIB). Petugas cukup membaca jarum indeks yang tertinggal untuk rekor harian tanpa harus memantau 24 jam penuh!
                        </div>
                    </div>

                </div>

                {/* SISI KANAN (5 Kolom): SLIDER WAKTU PENGAMATAN & INSTRUMEN */}
                <div className="lg:col-span-5 space-y-4">
                    {/* PANEL WAKTU PENGAMATAN BERUPA SLIDER */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🕒</span>
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Waktu Pengamatan</span>
                                    <span className="text-sm font-extrabold text-amber-400">
                                        Pukul {String(hour).padStart(2, '0')}:00 WIB
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">Suhu Terbaca:</span>
                                <span className={`text-lg font-black ${isInside ? 'text-blue-400' : 'text-rose-400'}`}>
                                    {displayedTemp}°C
                                </span>
                            </div>
                        </div>

                        {/* Slider Waktu 24 Jam */}
                        <div className="space-y-1.5">
                            <input
                                type="range"
                                min="0"
                                max="24"
                                step="1"
                                value={hour}
                                onChange={(e) => setHour(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>00:00</span>
                                <span>05:00 (Min)</span>
                                <span>13:00 (Maks)</span>
                                <span>18:00</span>
                                <span>24:00</span>
                            </div>
                        </div>

                        {/* Tombol Cepat Jam Sinoptik BMKG */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                            <span className="text-slate-400 text-[10px]">Pilihan Jam:</span>
                            <div className="flex gap-1.5">
                                {[
                                    { h: 5, label: '05:00' },
                                    { h: 7, label: '07:00' },
                                    { h: 13, label: '13:00' },
                                    { h: 18, label: '18:00' }
                                ].map((preset) => (
                                    <button
                                        key={preset.h}
                                        onClick={() => setHour(preset.h)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                                            hour === preset.h
                                                ? 'bg-amber-400 text-slate-950 font-bold'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug">
                            {isInside ? (
                                <>💡 <em>Geser slider ke jam 14:00 lalu ke jam 20:00</em> untuk melihat jarum indeks Maksimum tertahan di rekor terpanas (<strong>{maxIndexPos}°C</strong>)!</>
                            ) : (
                                <>⚠️ <em>Di luar sangkar</em>, radiasi matahari langsung mendistorsi pembacaan termometer hingga <strong>{displayedTemp}°C</strong> (palsu)!</>
                            )}
                        </p>
                    </div>

                    {/* Kartu 4 Termometer Terpadu */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                4 Instrumen Utama di Dalam Sangkar
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                                Standar WMO
                            </span>
                        </div>

                        {/* Tab Selector 4 Termometer */}
                        <div className="grid grid-cols-2 gap-1.5">
                            {Object.keys(toolData).map((key) => {
                                const tool = toolData[key];
                                const isSelected = selectedTool === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedTool(key)}
                                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className="text-sm">{tool.icon}</span>
                                            <span className="text-[11px] font-bold truncate">{tool.name.split(' ')[1] || tool.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-extrabold ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                                            {tool.val}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Detail Alat Terpilih */}
                        {toolData[selectedTool] && (
                            <div className={`p-3.5 rounded-xl border-2 ${toolData[selectedTool].border} ${toolData[selectedTool].bg} animate-fadeIn`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${toolData[selectedTool].color}`}>
                                        {toolData[selectedTool].badge}
                                    </span>
                                    <span className="text-xs font-black bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {toolData[selectedTool].val}
                                    </span>
                                </div>
                                <h5 className="text-xs font-extrabold text-slate-900 mb-1">
                                    {toolData[selectedTool].name}
                                </h5>
                                <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                                    {toolData[selectedTool].desc}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
