import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import SimulasiSangkarMeteorologi from '@/Components/SimulasiAlat/SimulasiSangkarMeteorologi';
import SimulasiPsychrometerStandar from '@/Components/SimulasiAlat/SimulasiPsychrometerStandar';
import SimulasiHVSampler from '@/Components/SimulasiAlat/SimulasiHVSampler';
import SimulasiPyranometer from '@/Components/SimulasiAlat/SimulasiPyranometer';
import SimulasiPanciPenguapan from '@/Components/SimulasiAlat/SimulasiPanciPenguapan';
import SimulasiAnemometer from '@/Components/SimulasiAlat/SimulasiAnemometer';
import SimulasiCampbellStokes from '@/Components/SimulasiAlat/SimulasiCampbellStokes';

export default function DetailKerjaAlat({ instrument = null, instruments = [] }) {
    // Default instrument if none passed
    const activeInstrument = instrument || (instruments.length > 0 ? instruments[0] : null) || {
        id: 1,
        name: 'Sangkar Meteorologi',
        category: 'Klimatologi & Suhu',
        description: 'Bangunan kayu berbentuk rumah kecil bergisi-gisi yang dicat putih, dirancang khusus untuk melindungi peralatan termometer dari radiasi sinar matahari langsung dan hujan.\n\nFungsi:\nTempat meletakkan alat pengukur suhu dan kelembapan udara agar hasil pengukurannya akurat serta mewakili kondisi udara sekitar secara netral.',
        image_path: null,
        pitch: 32.2,
        yaw: -36.3,
    };

    const [showLightbox, setShowLightbox] = useState(false);

    // Coordinate formatting
    const getCoordinateText = (inst) => {
        if (!inst) return '7.4247°S, 112.7345°E';
        if (inst.pitch !== null && inst.yaw !== null) {
            return `Pitch: ${inst.pitch}°, Yaw: ${inst.yaw}°`;
        }
        return '7.4247°S, 112.7345°E';
    };

    // Category badge formatting
    const getCategoryBadge = (inst) => {
        if (!inst) return 'METEOROLOGI';
        return inst.category ? inst.category.toUpperCase() : 'METEOROLOGI';
    };

    // Category icon
    const getCategoryIcon = (category) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('evaporasi') || cat.includes('hidrologi') || cat.includes('hujan') || cat.includes('presipitasi')) return '💧';
        if (cat.includes('suhu') || cat.includes('klimat')) return '🌡️';
        if (cat.includes('angin')) return '💨';
        if (cat.includes('radiasi') || cat.includes('matahari') || cat.includes('sinar')) return '☀️';
        if (cat.includes('kualitas') || cat.includes('sampler') || cat.includes('udara')) return '🔬';
        if (cat.includes('otomatis') || cat.includes('aws') || cat.includes('arg')) return '⚡';
        return '🌤️';
    };

    // Parse description into short description and function
    const parseInstrumentData = (desc = '') => {
        if (!desc) return { deskripsi: 'Penjelasan detail instrumen sedang dipersiapkan.', fungsi: 'Fungsi pengukuran cuaca BMKG.' };
        const parts = desc.split(/Fungsi:\s*/i);
        if (parts.length > 1) {
            return {
                deskripsi: parts[0].trim(),
                fungsi: parts[1].trim(),
            };
        }
        return {
            deskripsi: desc.trim(),
            fungsi: '',
        };
    };

    const activeData = parseInstrumentData(activeInstrument?.description);

    return (
        <>
            <Head title={`DETAIL ALAT KERJA - ${activeInstrument.name}`} />

            <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
                {/* 1. Top Navbar */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        {/* Left: Brand */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3 group">
                                <img 
                                    src="/images/bmkg_logo.png" 
                                    alt="BMKG Logo" 
                                    className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="h-7 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>
                                <div>
                                    <div className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-none">
                                        TamanAlat<span className="text-blue-600">BMKG</span>
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                                        PUSAT INFORMASI OBSERVASI
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Right: Quick Links */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                href={`/informasi-alat?id=${activeInstrument.id}`}
                                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Informasi Alat</span>
                            </Link>

                            <Link
                                href="/virtual-tour"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7z" />
                                    <circle cx="8" cy="12" r="2.5" />
                                    <circle cx="16" cy="12" r="2.5" />
                                    <path d="M10.5 12h3" />
                                </svg>
                                <span className="hidden sm:inline">Virtual Tour 360°</span>
                            </Link>

                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-medium text-xs sm:text-sm px-2.5 py-2 transition-colors rounded-lg hover:bg-slate-100"
                            >
                                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                <span>Beranda</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* 2. Banner / Hero Section */}
                <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white pt-7 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg className="w-full h-full object-cover" viewBox="0 0 1200 300" preserveAspectRatio="none" fill="none">
                            <path d="M0,150 C300,250 600,50 900,180 C1100,270 1200,120 1200,120 L1200,300 L0,300 Z" fill="#ffffff"></path>
                            <path d="M0,100 C200,20 500,220 800,90 C1050,-10 1200,80 1200,80 L1200,300 L0,300 Z" fill="#ffffff" opacity="0.5"></path>
                        </svg>
                    </div>

                    <div className="max-w-6xl mx-auto relative z-10">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-xs text-blue-100 mb-3 font-medium">
                            <Link href="/" className="hover:text-white flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                </svg>
                            </Link>
                            <span className="text-blue-300/80">|</span>
                            <Link href="/" className="hover:text-white">Beranda</Link>
                            <span className="text-blue-300/80">&rsaquo;</span>
                            <Link href="/virtual-tour" className="hover:text-white">Virtual Tour</Link>
                            <span className="text-blue-300/80">&rsaquo;</span>
                            <Link href={`/informasi-alat?id=${activeInstrument.id}`} className="hover:text-white">Informasi Alat</Link>
                            <span className="text-blue-300/80">&rsaquo;</span>
                            <span className="text-white font-semibold">DETAIL ALAT KERJA</span>
                        </nav>

                        {/* Title Row */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                                    DETAIL ALAT KERJA
                                </h1>
                                <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                                    Uraian mendalam mengenai mekanisme kerja, prinsip fisika pengukuran, standar operasional WMO, dan prosedur pembacaan data observasi.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm px-4 py-2 rounded-full font-medium shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>{activeInstrument.name} &bull; {instruments.length} Alat Utama</span>
                            </div>
                        </div>

                        {/* Horizontal Instrument Quick Selector Pills */}
                        {instruments.length > 0 && (
                            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                {instruments.map((inst, index) => {
                                    const isSelected = inst.id === activeInstrument?.id;
                                    return (
                                        <Link
                                            key={inst.id}
                                            href={`/detail-kerja-alat?id=${inst.id}`}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-white text-blue-800 shadow-md scale-105'
                                                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                                            }`}
                                        >
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                isSelected ? 'bg-blue-600 text-white' : 'bg-white/20 text-white'
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <span>{inst.name.split('(')[0].trim()}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Main Detail Card */}
                <main className="max-w-6xl mx-auto -mt-10 sm:-mt-12 px-4 sm:px-6 relative z-20 w-full pb-16">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-6 sm:p-8 transition-all">
                        {/* Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
                            <div>
                                <span className="inline-block bg-[#e0f2fe] text-[#0284c7] font-bold text-[11px] sm:text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
                                    {getCategoryBadge(activeInstrument)}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {activeInstrument.name}
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/70 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-xs">
                                    <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span>Koordinat: {getCoordinateText(activeInstrument)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Two Columns Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Visual, Media, & Quick Specs */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Photo Container */}
                                <div className="rounded-2xl overflow-hidden relative shadow-sm group aspect-[4/3] bg-slate-100 flex items-center justify-center border border-slate-200/80">
                                    <img 
                                        src={activeInstrument.image_path || '/images/panci_penguapan.png'} 
                                        alt={activeInstrument.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                        onError={(e) => { e.target.src = '/images/panci_penguapan.png'; }}
                                    />
                                    
                                    <button
                                        onClick={() => setShowLightbox(true)}
                                        className="absolute bottom-3 right-3 bg-black/65 hover:bg-black/85 backdrop-blur-md text-white p-2 rounded-xl flex items-center justify-center transition-all shadow-md cursor-pointer"
                                        title="Perbesar Foto"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Audio Explanation if present */}
                                {activeInstrument.audio_path && (
                                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 shadow-xs">
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-2">
                                            <span className="text-base">🔊</span> Audio Penjelasan Resmi BMKG:
                                        </div>
                                        <audio controls className="w-full rounded-lg">
                                            <source src={activeInstrument.audio_path} type="audio/mpeg" />
                                            Browser Anda tidak mendukung pemutar audio.
                                        </audio>
                                    </div>
                                )}

                                {/* Technical Specs Highlights */}
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                        <span>⚙️</span> Spesifikasi Teknis Standar
                                    </h4>
                                    
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center py-1 border-b border-slate-150">
                                            <span className="text-slate-500 font-medium">Standar Baku</span>
                                            <span className="font-bold text-slate-800">WMO No. 8 & BMKG</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-150">
                                            <span className="text-slate-500 font-medium">Lokasi Penempatan</span>
                                            <span className="font-bold text-slate-800">Taman Alat Terbuka</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-150">
                                            <span className="text-slate-500 font-medium">Satuan Pengukuran</span>
                                            <span className="font-bold text-blue-700">SI Unit / BMKG Standard</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-150">
                                            <span className="text-slate-500 font-medium">Frekuensi Observasi</span>
                                            <span className="font-bold text-slate-800">Rutin & Terjadwal (Sinoptik)</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-slate-500 font-medium">Tipe Pencatatan</span>
                                            <span className="font-bold text-slate-800">Manual / Sensor Digital Otomatis</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Navigation Buttons */}
                                <div className="space-y-3 pt-2">
                                    <Link
                                        href="/virtual-tour"
                                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm transform hover:-translate-y-0.5"
                                    >
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7z" />
                                            <circle cx="8" cy="12" r="2.5" />
                                            <circle cx="16" cy="12" r="2.5" />
                                            <path d="M10.5 12h3" />
                                        </svg>
                                        <span>Lihat Langsung di Virtual Tour 360°</span>
                                    </Link>

                                    <Link
                                        href={`/informasi-alat?id=${activeInstrument.id}`}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-xl transition-all text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        <span>Kembali ke Informasi Alat</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Deep Dive Cara Kerja & Uraian */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Card 1: Deskripsi Singkat & Cara Kerja */}
                                <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg shadow-sm shrink-0">
                                            {getCategoryIcon(activeInstrument.category)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                                Deskripsi & Karakteristik Alat
                                            </h3>
                                            <p className="text-xs text-slate-500">Karakteristik fisik dan instalasi instrumen</p>
                                        </div>
                                    </div>

                                    <div className="text-slate-700 text-sm leading-relaxed text-justify">
                                        <p>{activeData.deskripsi}</p>
                                    </div>
                                </div>

                                {/* Card 2: Fungsi Utama Observasi */}
                                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/70 rounded-2xl p-6 sm:p-7 shadow-xs">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-xs shrink-0">
                                            🎯
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-blue-950 tracking-tight">
                                                Fungsi Utama Pengukuran
                                            </h3>
                                            <p className="text-xs text-blue-700/80">Peran instrumen dalam jaringan stasiun BMKG</p>
                                        </div>
                                    </div>

                                    <div className="text-slate-700 text-sm leading-relaxed text-justify">
                                        <p>{activeData.fungsi || "Berfungsi dalam pemantauan unsur-unsur cuaca dan iklim terstandar BMKG."}</p>
                                    </div>
                                </div>

                                {/* Card 3: Komponen & Perangkat Pelengkap */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                                    <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                                        <span>🔍</span> Komponen & Perangkat Pelengkap
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                                            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Sensor / Komponen Utama
                                            </div>
                                            <p className="text-slate-600 leading-relaxed">
                                                Elemen penerima unsur cuaca langsung yang terkalibrasi secara presisi dan tahan terhadap karat serta cuaca ekstrem.
                                            </p>
                                        </div>

                                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                                            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Alat Ukur / Indikator Skala
                                            </div>
                                            <p className="text-slate-600 leading-relaxed">
                                                Sistem pembacaan (skala manual / digital logger) dengan tingkat ketelitian tinggi sesuai standar WMO.
                                            </p>
                                        </div>

                                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                                            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Dudukan & Perlindungan
                                            </div>
                                            <p className="text-slate-600 leading-relaxed">
                                                Pondasi atau struktur pelindung yang menjaga kestabilan posisi horizontal dan mencegah pengaruh luar yang tidak representatif.
                                            </p>
                                        </div>

                                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                                            <div className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Unit Transmisi / Log Data
                                            </div>
                                            <p className="text-slate-600 leading-relaxed">
                                                Pencatatan data pengamatan berkala untuk dianalisis dan diteruskan ke sistem pengolahan data BMKG.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4: Standar Prosedur Pengamatan (SOP) */}
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                                    <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                                        <span>📋</span> Prosedur Operasional Standar (SOP) BMKG
                                    </h4>
                                    
                                    <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold shrink-0 mt-0.5">1.</span>
                                            <span><strong>Pemeriksaan Fisik:</strong> Observer memastikan kebersihan wadah/sensor, tidak terhalang rintangan, dan berada dalam kondisi siap operasi.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold shrink-0 mt-0.5">2.</span>
                                            <span><strong>Pembacaan & Kalibrasi:</strong> Melakukan pembacaan skala atau pengecekan transmisi data sensor secara teliti pada jam-jam pengamatan standar.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold shrink-0 mt-0.5">3.</span>
                                            <span><strong>Pencatatan & Log:</strong> Hasil pengamatan dicatat dalam buku pias/log harian atau dikirim otomatis ke server BMKG.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Simulation Section (Specific to Instrument) */}
                        {activeInstrument && activeInstrument.name.toLowerCase().includes('sangkar meteorologi') && (
                            <div className="mt-10 pt-8 border-t border-slate-200/80">
                                <SimulasiSangkarMeteorologi />
                            </div>
                        )}

                        {activeInstrument && activeInstrument.name.toLowerCase().includes('psychrometer') && (
                            <div className="mt-10 pt-8 border-t border-slate-200/80">
                                <SimulasiPsychrometerStandar />
                            </div>
                        )}

                        {activeInstrument && (activeInstrument.name.toLowerCase().includes('high volume') || activeInstrument.name.toLowerCase().includes('hv sampler')) && (
                            <div className="mt-10 pt-8 border-t border-slate-200/80">
                                <SimulasiHVSampler />
                            </div>
                        )}

                        {activeInstrument && activeInstrument.name.toLowerCase().includes('pyranometer') && (
                            <div className="mt-10 pt-8 border-t border-slate-200/80">
                                <SimulasiPyranometer />
                            </div>
                        )}

                        {activeInstrument && (activeInstrument.name.toLowerCase().includes('panci penguapan') || activeInstrument.name.toLowerCase().includes('evaporimeter')) && (
                            <div className="mt-10 pt-8 border-t border-slate-200/80">
                                <SimulasiPanciPenguapan />
                            </div>
                        )}

                        {activeInstrument && activeInstrument.name.toLowerCase().includes('anemometer') && (
                            <div className="mt-10 pt-8 border-t border-slate-200/80">
                                <SimulasiAnemometer />
                            </div>
                        )}

                        {activeInstrument && activeInstrument.name.toLowerCase().includes('campbell stokes') && (
                            <div className="mt-10 pt-8 border-t border-slate-200/80">
                                <SimulasiCampbellStokes />
                            </div>
                        )}
                    </div>
                </main>

                {/* 4. Image Lightbox Modal */}
                {showLightbox && (
                    <div 
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        <div 
                            className="relative max-w-4xl w-full flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowLightbox(false)}
                                className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 rounded-full text-xl cursor-pointer"
                            >
                                ✕
                            </button>
                            <img 
                                src={activeInstrument?.image_path || '/images/panci_penguapan.png'} 
                                alt={activeInstrument?.name}
                                className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/20"
                            />
                            <div className="text-white text-center mt-3 text-sm font-medium">
                                {activeInstrument?.name} &bull; Taman Alat BMKG
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Footer */}
                <footer className="bg-[#0a192f] text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <span className="font-bold text-white">Taman Alat BMKG</span> &bull; Edukasi Meteorologi, Klimatologi, dan Geofisika
                        </div>
                        <div>
                            &copy; 2025 BMKG. Hak cipta dilindungi undang-undang.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
