import React, { useState, useEffect } from 'react';

export default function SimulasiCampbellStokes() {
    // 1. Slider Waktu Penyinaran Matahari (06:00 - 18:00 WIB, desimal)
    const [solarHour, setSolarHour] = useState(11.5); // Default 11:30

    // 2. Jenis Kertas Pias Terpasang:
    // 'straight' (Lurus - Ekuinoks Mar/Sep),
    // 'long_curved' (Lengkung Panjang - 12 Apr - 2 Sep / Deklinasi Utara),
    // 'short_curved' (Lengkung Pendek - 15 Okt - 28 Feb / Deklinasi Selatan)
    const [selectedCard, setSelectedCard] = useState('straight');

    // 3. Pilihan Bulan dalam Setahun (Untuk Verifikasi SOP Deklinasi BMKG)
    const [selectedMonth, setSelectedMonth] = useState('mar'); // 'mar', 'jun', 'des'

    // 4. Status Tutupan Awan (Cerah vs Awan Mendung / Radiasi < 120 W/m2)
    const [isCloudCovered, setIsCloudCovered] = useState(false);

    // 5. Status Embun Pagi pada Bola Kaca (Buram vs Jernih)
    const [hasMorningDew, setHasMorningDew] = useState(false);

    // 6. Kalibrasi Poros Utara-Selatan (true = tepat, false = melenceng 15 derajat)
    const [isAlignedNorthSouth, setIsAlignedNorthSouth] = useState(true);

    // --- FITUR BARU 1: KOREKSI LOCAL APPARENT TIME (LAT) VS WIB ---
    // Bujur stasiun (misal Surabaya/Sidoarjo 112.7° BT) memiliki selisih ~31 menit dari meridian 105° BT WIB
    // isLATCorrected = true jika observer telah menyelaraskan garis jam 12:00 pias ke Waktu Matahari Sejati
    const [isLATCorrected, setIsLATCorrected] = useState(true);

    // --- FITUR BARU 2: KONDISI KERTAS BASAH AKIBAT HUJAN (WET CARD EFFECT) ---
    // 'dry' (kering normal), 'wet' (sedang hujan/basah kuyup), 'drying' (matahari menyinari tapi masih menguapkan air)
    const [cardWetness, setCardWetness] = useState('dry');

    // Timer simulasi evaporasi kertas basah (drying -> dry)
    useEffect(() => {
        let timer;
        if (cardWetness === 'drying') {
            timer = setTimeout(() => {
                setCardWetness('dry');
            }, 3500); // 3.5 detik simulasi pengeringan serat kertas
        }
        return () => clearTimeout(timer);
    }, [cardWetness]);

    const handleRainToggle = () => {
        if (cardWetness === 'dry' || cardWetness === 'drying') {
            setCardWetness('wet');
            setIsCloudCovered(true);
        } else {
            // Hujan reda, matahari muncul kembali -> proses pengeringan karton pias (drying)
            setCardWetness('drying');
            setIsCloudCovered(false);
        }
    };

    // --- LOGIKA KESESUAIAN PIAS DENGAN BULAN (SOP BMKG / WMO) ---
    const getCardValidation = () => {
        if (selectedMonth === 'mar') {
            return selectedCard === 'straight' 
                ? { valid: true, note: 'Tepat! Bulan Maret (Ekuinoks) menggunakan Pias Lurus pada alur tengah.' }
                : { valid: false, note: 'Salah pias! Bulan Maret seharusnya menggunakan Pias Lurus.' };
        }
        if (selectedMonth === 'jun') {
            return selectedCard === 'long_curved'
                ? { valid: true, note: 'Tepat! Bulan Juni (Matahari di Utara) menggunakan Pias Lengkung Panjang pada alur bawah.' }
                : { valid: false, note: 'Salah pias! Bulan Juni memerlukan Pias Lengkung Panjang.' };
        }
        if (selectedMonth === 'des') {
            return selectedCard === 'short_curved'
                ? { valid: true, note: 'Tepat! Bulan Desember memerlukan Pias Lengkung Pendek pada alur atas.' }
                : { valid: false, note: 'Salah pias! Bulan Desember memerlukan Pias Lengkung Pendek.' };
        }
        return { valid: true, note: '' };
    };

    const cardStatus = getCardValidation();

    // --- INTENSITAS PENYINARAN MATAHARI & AMBANG BATAS PEMBAKARAN (120 W/m2) ---
    const calculateClearSkyRadiation = (h) => {
        if (h < 6 || h > 18) return 0;
        return Math.max(0, Math.sin(((h - 6) / 12) * Math.PI) * 1000);
    };

    const currentRawRad = calculateClearSkyRadiation(solarHour);
    const currentRad = isCloudCovered ? 80 : (hasMorningDew ? currentRawRad * 0.4 : currentRawRad);
    
    // Syarat terjadinya pembakaran titik api:
    // 1. Radiasi >= 120 W/m2
    // 2. Kertas pias sesuai alur deklinasi
    // 3. Bola kaca tidak buram embun
    // 4. Poros utara-selatan selaras
    // 5. Kertas pias SUDAH KERING (jika masih basah/drying, energi panas terserap untuk evaporasi air!)
    const isBurningActive = currentRad >= 120 && cardStatus.valid && !hasMorningDew && isAlignedNorthSouth && cardWetness === 'dry';

    // --- HISTORI JEJAK TERBAKAR (WMO RULES: LUBANG TEMBUS, COKELAT, TITIK-TITIK) ---
    // Slot jam 06:00 - 18:00
    const hoursSlot = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const burnSegments = hoursSlot.map((h) => {
        const inPassedCloud = isCloudCovered && (h >= 12 && h <= 13.5);
        const reached = solarHour >= h;
        const burned = reached && !inPassedCloud && cardStatus.valid && !hasMorningDew && cardWetness !== 'wet';
        
        // Jenis jejak menurut WMO:
        // 'deep' = lubang tembus hitam (terik > 400 W/m2)
        // 'scorched' = cokelat terbakar permukaan (pagi/sore/awan tipis)
        // 'spot' = bintik-bintik terputus
        let burnType = 'deep';
        if (h <= 7 || h >= 17) {
            burnType = 'scorched';
        } else if (isCloudCovered && (h === 11 || h === 14)) {
            burnType = 'spot';
        }

        return { hour: h, burned, burnType };
    });

    // Menghitung lama penyinaran matahari (LPM) dalam jam pada jam efektif pengamatan BMKG (08.00 - 16.00)
    const effectiveHours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    const totalEffectiveBurned = effectiveHours.filter((h) => {
        if (solarHour < h) return false;
        if (isCloudCovered && (h === 12 || h === 13)) return false;
        if (cardWetness === 'wet' || cardWetness === 'drying') return false;
        return cardStatus.valid && !hasMorningDew;
    }).length;

    // Persentase Penyinaran Matahari (%) Standar BMKG (Acuan 8 Jam Pengamatan)
    const totalPossibleHoursBMKG = 8;
    const lpmPercentage = Math.min(100, Number(((totalEffectiveBurned / totalPossibleHoursBMKG) * 100).toFixed(1)));

    // Posisi Titik Api di Mangkuk Kertas Pias (X dan Y)
    // Jika LAT belum dikoreksi, garis bergeser offset sebesar 22px (~30 menit)
    const latOffset = isLATCorrected ? 0 : 22;
    const burnX = 60 + ((solarHour - 6) / 12) * 340 + latOffset;
    const basePiasY = selectedCard === 'long_curved' ? 228 : (selectedCard === 'short_curved' ? 212 : 220);
    const burnY = isAlignedNorthSouth ? basePiasY : basePiasY + 14;

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
                        <span>☀️</span> Penyinaran Matahari & Optika Meteorologi
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🔍</span> Simulasi Campbell Stokes (Lama Penyinaran)
                    </h3>
                    <p className="text-xs text-slate-500">
                        Fisika titik api lensa bola kaca pejal, koreksi Waktu Matahari Sejati (LAT), 3 varian pias, dan analisis jejak WMO No. 8.
                    </p>
                </div>

                {/* Status Ringkas Header */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isBurningActive ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                        {cardWetness === 'wet' ? '🌧️ Hujan (Kertas Basah)' : cardWetness === 'drying' ? '💨 Evaporasi Air Pias...' : isBurningActive ? '🔥 Titik Api Aktif (Membakar)' : '⚪ Tidak Membakar (<120 W/m²)'}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-3 py-1 rounded-full border border-slate-700 shadow-2xs">
                        LPM: {totalEffectiveBurned} Jam ({lpmPercentage}%)
                    </span>
                </div>
            </div>

            {/* Layout Utama Asimetris: 60% Visual Optik (7 Kolom) vs 40% Kontrol Pias & Kalkulator (5 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SISI KIRI (60% / 7 Kolom): KANVAS OPTIKA BOLA KACA & MANGKUK PIAS */}
                <div className="lg:col-span-7 space-y-3.5">
                    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-200 via-sky-50 to-slate-100 p-4 sm:p-5 overflow-hidden shadow-xs">
                        {/* Status Bar Kecil di Atas Kanvas */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span>{isCloudCovered ? '☁️' : '☀️'}</span>
                                <span>Radiasi: <strong>{Math.round(currentRad)} W/m²</strong> {currentRad >= 120 ? '(≥120 W/m² WMO)' : '(<120 W/m²)'}</span>
                            </span>
                            <span className={`text-[11px] font-bold ${cardStatus.valid && isAlignedNorthSouth && !hasMorningDew && isLATCorrected && cardWetness === 'dry' ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                                {!isLATCorrected 
                                    ? '⚠️ Jam Pias Belum Dikoreksi ke LAT!' 
                                    : cardWetness === 'wet'
                                    ? '🌧️ Kertas Basah Kuyup!'
                                    : cardWetness === 'drying'
                                    ? '💨 Menguapkan Air (Belum Nyala)'
                                    : !cardStatus.valid 
                                    ? '⚠️ Pias Salah Pasang!' 
                                    : !isAlignedNorthSouth 
                                    ? '⚠️ Poros U-S Melenceng!' 
                                    : hasMorningDew 
                                    ? '⚠️ Kaca Berembun!' 
                                    : '✅ Fokus Tepat di Garis Pias'}
                            </span>
                        </div>

                        {/* Diagram SVG Optika Bola Kaca & Kertas Pias */}
                        <svg viewBox="0 0 460 300" className="w-full h-auto select-none drop-shadow-md mx-auto">
                            <defs>
                                <radialGradient id="glassSphereGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                                    <stop offset="40%" stopColor="#e0f2fe" stopOpacity="0.65" />
                                    <stop offset="70%" stopColor="#bae6fd" stopOpacity="0.45" />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                                </radialGradient>
                                <radialGradient id="focusPointGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="40%" stopColor="#fef08a" />
                                    <stop offset="80%" stopColor="#f97316" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="brassBowlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#78350f" />
                                    <stop offset="50%" stopColor="#d97706" />
                                    <stop offset="100%" stopColor="#92400e" />
                                </linearGradient>
                            </defs>

                            {/* MATAHARI DI LANGIT MENGIKUTI WAKTU */}
                            {(() => {
                                const sunProgress = (solarHour - 6) / 12;
                                const sunAngleRad = Math.PI * (1 - sunProgress);
                                const sunX = 230 - 180 * Math.cos(sunAngleRad);
                                const sunY = 120 - 90 * Math.sin(sunAngleRad);

                                return (
                                    <g>
                                        <g opacity={isCloudCovered ? 0.25 : 0.75}>
                                            <line x1={sunX} y1={sunY} x2="230" y2="135" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
                                            <line x1={sunX - 10} y1={sunY} x2="215" y2="135" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" />
                                            <line x1={sunX + 10} y1={sunY} x2="245" y2="135" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" />
                                        </g>

                                        <circle cx={sunX} cy={sunY} r="18" fill="#fbbf24" filter="drop-shadow(0 0 8px rgba(245,158,11,0.6))" />
                                        <circle cx={sunX} cy={sunY} r="12" fill="#f59e0b" />
                                        <text x={sunX} y={sunY + 4} textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="black">☀️</text>

                                        {isCloudCovered && (
                                            <g transform={`translate(${sunX - 30}, ${sunY - 10})`}>
                                                <ellipse cx="30" cy="12" rx="28" ry="14" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                                                <ellipse cx="18" cy="8" rx="18" ry="12" fill="#ffffff" />
                                                <ellipse cx="42" cy="8" rx="20" ry="12" fill="#cbd5e1" />
                                                <text x="30" y="16" textAnchor="middle" fill="#475569" fontSize="7" fontWeight="bold">Mendung</text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })()}

                            {/* PENYANGGA LOGAM KUNINGAN & DUDUKAN ALAT */}
                            <g transform="translate(230, 275)">
                                <rect x="-14" y="-35" width="28" height="40" fill="#b45309" stroke="#451a03" strokeWidth="2" rx="2" />
                                <ellipse cx="0" cy="5" rx="55" ry="8" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                <text x="0" y="2" textAnchor="middle" fill="#fef3c7" fontSize="6" fontWeight="bold">DUDUKAN LINTANG (LATITUDE 7° LS)</text>
                            </g>

                            {/* MANGKUK BOLA LOGAM (SPHERICAL BOWL) */}
                            <g transform="translate(230, 190)">
                                <path
                                    d="M -180 30 Q -180 85 0 85 Q 180 85 180 30"
                                    fill="none"
                                    stroke="url(#brassBowlGrad)"
                                    strokeWidth="18"
                                    strokeLinecap="round"
                                />

                                {/* Alur 1 (Atas): Pias Lengkung Pendek */}
                                <path d="M -160 22 Q 0 75 160 22" fill="none" stroke="#451a03" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
                                {/* Alur 2 (Tengah): Pias Lurus */}
                                <path d="M -170 30 Q 0 83 170 30" fill="none" stroke="#451a03" strokeWidth="2.5" opacity="0.6" />
                                {/* Alur 3 (Bawah): Pias Lengkung Panjang */}
                                <path d="M -160 38 Q 0 91 160 38" fill="none" stroke="#451a03" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
                            </g>

                            {/* KERTAS PIAS BIRU KHUSUS TERPASANG DI MANGKUK */}
                            <g transform="translate(230, 190)">
                                {/* Warna kertas pias: jika basah/wet menjadi biru tua pekat kehijauan */}
                                {selectedCard === 'straight' && (
                                    <path
                                        d="M -170 30 Q 0 83 170 30"
                                        fill="none"
                                        stroke={cardWetness === 'wet' ? "#0f172a" : cardWetness === 'drying' ? "#1e293b" : "#1e3a8a"}
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                    />
                                )}
                                {selectedCard === 'long_curved' && (
                                    <path
                                        d="M -160 38 Q 0 91 160 38"
                                        fill="none"
                                        stroke={cardWetness === 'wet' ? "#0f172a" : cardWetness === 'drying' ? "#1e293b" : "#1d4ed8"}
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                    />
                                )}
                                {selectedCard === 'short_curved' && (
                                    <path
                                        d="M -160 22 Q 0 75 160 22"
                                        fill="none"
                                        stroke={cardWetness === 'wet' ? "#0f172a" : cardWetness === 'drying' ? "#1e293b" : "#2563eb"}
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                    />
                                )}

                                {/* Indikator Kertas Basah Mengkilap */}
                                {cardWetness === 'wet' && (
                                    <text x="0" y="70" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">
                                        💧 KERTAS PIAS BASAH KUYUP
                                    </text>
                                )}

                                {/* Garis Skala Jam di Kertas Pias */}
                                {[-140, -95, -48, 0, 48, 95, 140].map((xOffset, i) => {
                                    const yOffset = selectedCard === 'long_curved' ? 38 : (selectedCard === 'short_curved' ? 22 : 30);
                                    const yCurved = yOffset + (1 - Math.abs(xOffset) / 170) * 53;
                                    // Jika LAT belum dikoreksi, skala garis bergeser offset
                                    const renderedX = xOffset + (isLATCorrected ? 0 : 12);
                                    return (
                                        <line
                                            key={i}
                                            x1={renderedX}
                                            y1={yCurved - 5}
                                            x2={renderedX}
                                            y2={yCurved + 5}
                                            stroke="#93c5fd"
                                            strokeWidth="1.5"
                                        />
                                    );
                                })}

                                {/* JEJAK GOSONG / TERBAKAR (CHARRED BURN TRACE DENGAN GAYA WMO) */}
                                {burnSegments.map((seg, i) => {
                                    if (!seg.burned || i === burnSegments.length - 1) return null;
                                    const x1 = -160 + (i / 12) * 320 + latOffset;
                                    const x2 = -160 + ((i + 1) / 12) * 320 + latOffset;
                                    const yBase = selectedCard === 'long_curved' ? 38 : (selectedCard === 'short_curved' ? 22 : 30);
                                    const y1 = yBase + (1 - Math.abs(x1) / 170) * 53;
                                    const y2 = yBase + (1 - Math.abs(x2) / 170) * 53;

                                    if (seg.burnType === 'spot') {
                                        // WMO: Titik-titik bulat individual
                                        return (
                                            <circle
                                                key={i}
                                                cx={(x1 + x2) / 2}
                                                cy={(y1 + y2) / 2}
                                                r="3"
                                                fill="#27272a"
                                                stroke="#78350f"
                                                strokeWidth="1"
                                            />
                                        );
                                    }

                                    return (
                                        <line
                                            key={i}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke={seg.burnType === 'deep' ? "#09090b" : "#78350f"}
                                            strokeWidth={seg.burnType === 'deep' ? "5" : "3.5"}
                                            strokeLinecap="round"
                                            className="drop-shadow-xs"
                                        />
                                    );
                                })}
                            </g>

                            {/* BOLA KACA PEJAL BERSINAR (SOLID GLASS SPHERE 10 CM) */}
                            <g transform="translate(230, 135)">
                                <ellipse cx="0" cy="55" rx="42" ry="10" fill="#0f172a" opacity="0.25" />
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="48"
                                    fill="url(#glassSphereGrad)"
                                    stroke="#38bdf8"
                                    strokeWidth="2.5"
                                    className="drop-shadow-lg"
                                />
                                <ellipse cx="-16" cy="-16" rx="18" ry="12" fill="#ffffff" opacity="0.75" transform="rotate(-25 -16 -16)" />
                                <circle cx="18" cy="18" r="8" fill="#ffffff" opacity="0.4" />

                                {hasMorningDew && (
                                    <g opacity="0.7">
                                        <circle cx="0" cy="0" r="47" fill="#f8fafc" filter="blur(1px)" />
                                        <text x="0" y="4" textAnchor="middle" fill="#0369a1" fontSize="9" fontWeight="extrabold">EMBUN PAGI!</text>
                                    </g>
                                )}
                            </g>

                            {/* BERKAS SINAR MENGERUCUT FOKUS KE KERTAS PIAS */}
                            {currentRad > 80 && (
                                <g opacity={isCloudCovered ? 0.25 : 0.85}>
                                    <polygon
                                        points={`215,145 245,145 ${burnX},${burnY}`}
                                        fill="rgba(251, 191, 36, 0.35)"
                                    />
                                    <line x1="230" y1="145" x2={burnX} y2={burnY} stroke="#f59e0b" strokeWidth="2.5" />
                                </g>
                            )}

                            {/* TITIK API PUTIH MENYILAU ATAU UAP EVAPORASI AIR */}
                            {isBurningActive && (
                                <g transform={`translate(${burnX}, ${burnY})`}>
                                    <circle cx="0" cy="0" r="12" fill="url(#focusPointGlow)" className="animate-ping" />
                                    <circle cx="0" cy="0" r="5" fill="#ffffff" />
                                    <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
                                    
                                    <path
                                        d="M 0 -2 Q -4 -12 0 -20 T 4 -28"
                                        fill="none"
                                        stroke="#94a3b8"
                                        strokeWidth="2"
                                        strokeDasharray="2 3"
                                        className="animate-pulse"
                                        opacity="0.8"
                                    />
                                    <text x="0" y="-12" textAnchor="middle" fill="#78350f" fontSize="6" fontWeight="black">🔥</text>
                                </g>
                            )}

                            {/* EFEK UAP EVAPORASI JIKA KERTAS SEDANG MENGERING (DRYING) */}
                            {cardWetness === 'drying' && (
                                <g transform={`translate(${burnX}, ${burnY})`}>
                                    <circle cx="0" cy="0" r="4" fill="#38bdf8" opacity="0.6" />
                                    {/* Asap uap air putih mengepul */}
                                    <path
                                        d="M -3 0 Q -8 -15 0 -25 T 3 -35"
                                        fill="none"
                                        stroke="#ffffff"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        className="animate-pulse"
                                    />
                                    <text x="0" y="-14" textAnchor="middle" fill="#0284c7" fontSize="6" fontWeight="bold">💨 Uap Air</text>
                                </g>
                            )}
                        </svg>

                        {/* FLOATING CONTROLS SLIDER WAKTU DI BAWAH KANVAS */}
                        <div className="mt-3 p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl border border-slate-700/80 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                                    <span>🕒</span> Lintasan Waktu Matahari:
                                </span>
                                <span className="font-mono font-black text-amber-400">
                                    Pukul {formattedTime} WIB {isLATCorrected ? '(LAT Selaras)' : '(LAT Melenceng!)'}
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
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>06:00 (Terbit)</span>
                                <span>08:00 (Mulai Hitung)</span>
                                <span className="text-amber-400 font-bold">12:00 (Zenit)</span>
                                <span>16:00 (Selesai Hitung)</span>
                                <span>18:00</span>
                            </div>
                        </div>
                    </div>

                    {/* MINI-BAR KONTROL SOP PEMELIHARAAN (EMBUN, HUJAN BASAH, POROS U-S, KALIBRASI LAT) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* 1. Toggle Cuaca Hujan & Wet Card Effect */}
                        <button
                            onClick={handleRainToggle}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                cardWetness === 'wet'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : cardWetness === 'drying'
                                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{cardWetness === 'wet' ? '🌧️ Hujan (Basah)' : cardWetness === 'drying' ? '💨 Mengeringkan...' : '☀️ Kertas Kering'}</span>
                        </button>

                        {/* 2. Tombol Lap Embun Pagi */}
                        <button
                            onClick={() => setHasMorningDew(!hasMorningDew)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                hasMorningDew 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{hasMorningDew ? '🧽 Lap Kaca Buram!' : '✨ Kaca Bening'}</span>
                        </button>

                        {/* 3. Kalibrasi Poros Utara-Selatan */}
                        <button
                            onClick={() => setIsAlignedNorthSouth(!isAlignedNorthSouth)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                !isAlignedNorthSouth 
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span>{!isAlignedNorthSouth ? '🧭 Luruskan U-S!' : '✅ Poros U-S'}</span>
                        </button>

                        {/* 4. Kalibrasi LAT (Local Apparent Time) */}
                        <button
                            onClick={() => setIsLATCorrected(!isLATCorrected)}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                !isLATCorrected
                                    ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                                    : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                            }`}
                        >
                            <span>{!isLATCorrected ? '⚙️ Koreksi LAT!' : '📐 LAT Selaras'}</span>
                        </button>
                    </div>

                    {/* EDUKASI PENTINGNYA KOREKSI WAKTU MATAHARI SEJATI (LAT) */}
                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/70 text-[11px] text-purple-900 leading-relaxed flex items-start gap-2">
                        <span className="text-sm shrink-0">📐</span>
                        <div>
                            <strong>Waktu Matahari Sejati (Local Apparent Time / LAT):</strong> Garis jam 12:00 di pias Campbell Stokes harus jatuh tepat di titik kulminasi matahari tertinggi di stasiun lokal (bukan jam 12:00 WIB jam dinding). Selisih bujur Sidoarjo (112.7° BT) dengan meridian pusat WIB (105° BT) adalah ~31 menit lebih cepat!
                        </div>
                    </div>
                </div>

                {/* SISI KANAN (40% / 5 Kolom): 3 PILIHAN PIAS DEKLINASI & ATURAN ANALISIS WMO */}
                <div className="lg:col-span-5 space-y-4">
                    {/* MINI-GAME TEBAK PIAS SESUAI BULAN / GERAK SEMU MATAHARI */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📅</span> Musim & 3 Varian Kertas Pias BMKG
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cardStatus.valid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'}`}>
                                {cardStatus.valid ? '✅ Pias Sesuai' : '❌ Salah Pias'}
                            </span>
                        </div>

                        {/* 1. Pilih Bulan Kalender */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 block">Pilih Waktu Pengamatan (Deklinasi Matahari):</label>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                <button
                                    onClick={() => setSelectedMonth('mar')}
                                    className={`py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                        selectedMonth === 'mar'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Maret / Sept
                                    <span className="block text-[9px] font-normal opacity-80">(Ekuinoks)</span>
                                </button>
                                <button
                                    onClick={() => setSelectedMonth('jun')}
                                    className={`py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                        selectedMonth === 'jun'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Juni / Juli
                                    <span className="block text-[9px] font-normal opacity-80">(BBU / Utara)</span>
                                </button>
                                <button
                                    onClick={() => setSelectedMonth('des')}
                                    className={`py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                        selectedMonth === 'des'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Desember
                                    <span className="block text-[9px] font-normal opacity-80">(BBS / Selatan)</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Pilih Jenis Pias yang Dipasang */}
                        <div className="space-y-1 pt-1">
                            <label className="text-[11px] font-bold text-slate-600 block">Pilih Jenis Kertas Pias Terpasang:</label>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                <button
                                    onClick={() => setSelectedCard('straight')}
                                    className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                                        selectedCard === 'straight'
                                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    ➖ Pias Lurus
                                    <span className="block text-[9px] font-normal opacity-80">Alur Tengah</span>
                                </button>
                                <button
                                    onClick={() => setSelectedCard('long_curved')}
                                    className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                                        selectedCard === 'long_curved'
                                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    🌙 Lengkung Pjg
                                    <span className="block text-[9px] font-normal opacity-80">Alur Bawah</span>
                                </button>
                                <button
                                    onClick={() => setSelectedCard('short_curved')}
                                    className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                                        selectedCard === 'short_curved'
                                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    🌒 Lengkung Pdk
                                    <span className="block text-[9px] font-normal opacity-80">Alur Atas</span>
                                </button>
                            </div>
                        </div>

                        <p className={`text-[11px] p-2.5 rounded-xl border leading-relaxed ${cardStatus.valid ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'}`}>
                            {cardStatus.note}
                        </p>
                    </div>

                    {/* KARTU TERPADU: KALKULATOR ANALISIS LPM & ATURAN JEJAK WMO NO. 8 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📊</span> Analisis Kertas Pias (LPM BMKG)
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                                Standar 08.00 - 16.00
                            </span>
                        </div>

                        {/* Kotak Jam Efektif Terbakar vs Total Jam Baku */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Jejak Terbakar Efektif</span>
                                <span className="text-base font-black text-amber-600 font-mono">
                                    {totalEffectiveBurned} Jam
                                </span>
                                <span className="text-[9px] text-slate-500">(dari max 8 jam pengamatan)</span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block">Persentase Penyinaran</span>
                                <span className="text-base font-black text-blue-700 font-mono">
                                    {lpmPercentage}%
                                </span>
                                <span className="text-[9px] text-slate-500">LPM Harian BMKG</span>
                            </div>
                        </div>

                        {/* Rumus Baku Perhitungan LPM BMKG */}
                        <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[10.5px] text-amber-950 font-mono leading-relaxed">
                            <strong>Rumus:</strong> LPM (%) = (Jam Terbakar / 8 Jam) × 100% <br />
                            LPM = ({totalEffectiveBurned} / 8) × 100% = <strong>{lpmPercentage}%</strong>
                        </div>

                        {/* ATURAN REDUKSI JEJAK WMO GUIDE NO. 8 */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                            <span className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider block">
                                📏 Panduan Ketelitian Pembacaan WMO No. 8:
                            </span>
                            <ul className="text-[10.5px] text-slate-600 space-y-1 list-disc list-inside leading-snug">
                                <li><strong>Lubang Hitam Tembus:</strong> Terik penuh tanpa awan, dihitung 100% panjang garis.</li>
                                <li><strong>Cokelat Terbakar Permukaan:</strong> Awan tipis (Cirrus), dihitung jika garis kontinyu jelas.</li>
                                <li><strong>Titik-Titik Terputus:</strong> Celah awan Cumulus, kurangi separuh diameter titik agar tidak <em>overestimate</em>.</li>
                                <li><strong>Wet Card Effect:</strong> Kertas basah sehabis hujan menyerap energi panas untuk evaporasi air terlebih dahulu sebelum terbakar (biasanya <em>underestimate</em>).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
