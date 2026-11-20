import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { getPedomanAlat } from '@/Data/simulasiPedomanData';
import SimulasiSangkarMeteorologi from '@/Components/SimulasiAlat/SimulasiSangkarMeteorologi';
import SimulasiPsychrometerStandar from '@/Components/SimulasiAlat/SimulasiPsychrometerStandar';
import SimulasiHVSampler from '@/Components/SimulasiAlat/SimulasiHVSampler';
import SimulasiPyranometer from '@/Components/SimulasiAlat/SimulasiPyranometer';
import SimulasiPanciPenguapan from '@/Components/SimulasiAlat/SimulasiPanciPenguapan';
import SimulasiAnemometer from '@/Components/SimulasiAlat/SimulasiAnemometer';
import SimulasiCampbellStokes from '@/Components/SimulasiAlat/SimulasiCampbellStokes';
import SimulasiAutomaticRainGauge from '@/Components/SimulasiAlat/SimulasiAutomaticRainGauge';
import SimulasiAutomaticWeatherStation from '@/Components/SimulasiAlat/SimulasiAutomaticWeatherStation';
import SimulasiOmbrometer from '@/Components/SimulasiAlat/SimulasiOmbrometer';

export default function DetailKerjaAlat({ instrument = null, instruments = [] }) {
    // Default instrument if none passed
    const activeInstrument = instrument || (instruments.length > 0 ? instruments[0] : null) || {
        id: 1,
        name: 'Sangkar Meteorologi',
        category: 'Klimatologi & Suhu',
        description: 'Bangunan kayu berbentuk rumah kecil bergisi-gisi yang dicat putih, dirancang khusus untuk melindungi peralatan termometer dari radiasi sinar matahari langsung dan hujan.\n\nFungsi:\nTempat meletakkan alat pengukur suhu dan kelembapan udara agar hasil pengukurannya akurat serta mewakili kondisi udara sekitar secara netral.',
        image_path: '/videos/sangkar_meteorologi.mp4',
        pitch: 32.2,
        yaw: -36.3,
    };

    // Data pedoman & alur simulasi lengkap
    const pedoman = getPedomanAlat(activeInstrument.name);

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

    const isVideoMedia = (path) => {
        if (!path) return false;
        return /\.(mp4|webm|ogg|mov)$/i.test(path);
    };

    const activeData = parseInstrumentData(activeInstrument?.description);

    return (
        <>
            <Head title={`SIMULASI KERJA ALAT - ${activeInstrument.name}`} />

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
                        {/* <div className="flex items-center gap-2 sm:gap-4"> */}
                            {/* <Link
                                href={`/informasi-alat?id=${activeInstrument.id}`}
                                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all border border-blue-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Kembali ke Informasi Alat</span>
                            </Link> */}

                            {/* <Link
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
                            </Link> */}

                            {/* <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-medium text-xs sm:text-sm px-2.5 py-2 transition-colors rounded-lg hover:bg-slate-100"
                            >
                                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                <span>Beranda</span>
                            </Link> */}
                        {/* </div> */}
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
                            <span className="text-white font-semibold">SIMULASI KERJA ALAT</span>
                        </nav>

                        {/* Title Row */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                                    SIMULASI KERJA ALAT
                                </h1>
                                <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                                    Eksplorasi interaktif cara kerja dan mekanisme instrumen observasi cuaca BMKG secara langsung melalui simulasi virtual terstandar.
                                </p>
                            </div>

                            {/* <div className="flex items-center gap-2">
                                <Link
                                    href={`/informasi-alat?id=${activeInstrument.id}`}
                                    className="inline-flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>Kembali ke Informasi Alat</span>
                                </Link>

                                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-medium shadow-xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>{activeInstrument.name}</span>
                                </div>
                            </div> */}
                        </div>

                        {/* Horizontal Instrument Quick Selector Pills */}
                        {/* {instruments.length > 0 && (
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
                        )} */}
                    </div>
                </section>

                {/* 3. Main Content: Fokus ke Simulasi Kerja Alat dalam 1 Card Terpadu */}
                <main className="max-w-6xl mx-auto -mt-10 sm:-mt-12 px-4 sm:px-6 relative z-20 w-full pb-16">
                    {/* SATU CARD TUNGGAL UTAMA */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/90 overflow-hidden">
                        {/* 1. Header Card Terpadu (Status Alat & Audio Guide) */}
                        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-block bg-blue-600 text-white font-extrabold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                                    {getCategoryBadge(activeInstrument)}
                                </span>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                        {activeInstrument.name}
                                    </h2>
                                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                        <span>📍</span> Koordinat: {getCoordinateText(activeInstrument)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {activeInstrument.audio_path && (
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                                        <span className="text-xs font-bold text-blue-900 shrink-0">🔊 Audio:</span>
                                        <audio controls className="w-48 sm:w-60 h-7 rounded">
                                            <source src={activeInstrument.audio_path} type="audio/mpeg" />
                                        </audio>
                                    </div>
                                )}

                                <Link
                                    href={`/informasi-alat?id=${activeInstrument.id}`}
                                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-all border border-slate-200 shadow-2xs"
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>Informasi Alat</span>
                                </Link>

                                <Link
                                    href="/virtual-tour"
                                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7z" />
                                        <circle cx="8" cy="12" r="2.5" />
                                        <circle cx="16" cy="12" r="2.5" />
                                        <path d="M10.5 12h3" />
                                    </svg>
                                    <span>Virtual Tour 360°</span>
                                </Link>
                            </div>
                        </div>

                        {/* 2. Interactive Simulation Content Area (di dalam card) */}
                        <div className="p-6 sm:p-8">
                            {activeInstrument && activeInstrument.name.toLowerCase().includes('sangkar meteorologi') && (
                                <SimulasiSangkarMeteorologi />
                            )}

                            {activeInstrument && activeInstrument.name.toLowerCase().includes('psychrometer') && (
                                <SimulasiPsychrometerStandar />
                            )}

                            {activeInstrument && (activeInstrument.name.toLowerCase().includes('high volume') || activeInstrument.name.toLowerCase().includes('hv sampler')) && (
                                <SimulasiHVSampler />
                            )}

                            {activeInstrument && activeInstrument.name.toLowerCase().includes('pyranometer') && (
                                <SimulasiPyranometer />
                            )}

                            {activeInstrument && (activeInstrument.name.toLowerCase().includes('panci penguapan') || activeInstrument.name.toLowerCase().includes('evaporimeter')) && (
                                <SimulasiPanciPenguapan />
                            )}

                            {activeInstrument && activeInstrument.name.toLowerCase().includes('anemometer') && (
                                <SimulasiAnemometer />
                            )}

                            {activeInstrument && activeInstrument.name.toLowerCase().includes('campbell stokes') && (
                                <SimulasiCampbellStokes />
                            )}

                            {activeInstrument && (activeInstrument.name.toLowerCase().includes('automatic rain gauge') || activeInstrument.name.toLowerCase().includes('arg') || activeInstrument.name.toLowerCase().includes('penakar hujan otomatis')) && (
                                <SimulasiAutomaticRainGauge />
                            )}

                            {activeInstrument && (activeInstrument.name.toLowerCase().includes('automatic weather station') || activeInstrument.name.toLowerCase().includes('aws') || activeInstrument.name.toLowerCase().includes('stasiun cuaca otomatis')) && (
                                <SimulasiAutomaticWeatherStation />
                            )}

                            {activeInstrument && (activeInstrument.name.toLowerCase().includes('ombrometer') || activeInstrument.name.toLowerCase().includes('obs') || activeInstrument.name.toLowerCase().includes('penakar hujan manual')) && (
                                <SimulasiOmbrometer />
                            )}
                        </div>

                        {/* 3. Panduan Edukasi, Mekanisme Fisika & Alur Kerja (Menyatu dalam Card yang Sama) */}
                        {pedoman && (
                            <div className="border-t border-slate-200/90 p-6 sm:p-8 bg-[#fafcff] space-y-6">
                                {/* Header Panduan */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 bg-blue-100/70 text-blue-800 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-blue-200/70">
                                            <span>📘</span> Panduan Observasi & Edukasi Simulasi
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                            {pedoman.judul}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Uraian prinsip fisika atmosfer, alur tahapan interaktif, dan standar operasional observer BMKG.
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold bg-white text-slate-700 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                                        {pedoman.kategori}
                                    </span>
                                </div>

                                {/* Grid 2 Kolom: Ringkasan & Prinsip Kerja Fisika */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Deskripsi Fungsi Utama */}
                                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                                                🎯
                                            </span>
                                            <span>Tujuan & Fungsi Alat</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                                            {pedoman.ringkasan}
                                        </p>
                                    </div>

                                    {/* Prinsip Mekanisme Fisika */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/70 shadow-2xs space-y-2">
                                        <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                                            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                                                ⚙️
                                            </span>
                                            <span>Prinsip Kerja & Mekanisme Fisika</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                                            {pedoman.prinsipKerja}
                                        </p>
                                    </div>
                                </div>

                                {/* Alur Tahapan Interaksi Simulasi (Step-by-Step) */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                                        <span>🧭</span> Alur & Cara Melakukan Simulasi:
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {pedoman.alurSimulasi.map((step, idx) => (
                                            <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all">
                                                <div className="font-bold text-slate-900 text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{step.langkah.replace(/^\d+\.\s*/, '')}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed pl-8 text-justify">
                                                    {step.uraian}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Parameter & Tips Observer BMKG */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                                    {/* Parameter Terukur */}
                                    <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                                            <span>📊</span> Parameter Pengukuran Terkait
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {pedoman.parameterUtama.map((param, i) => (
                                                <div key={i} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="font-bold text-slate-800">{param.nama}</span>
                                                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100">
                                                            {param.satuan}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 leading-snug">
                                                        {param.keterangan}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tips Kunci Observer BMKG */}
                                    <div className="lg:col-span-4 p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2.5 flex flex-col justify-between shadow-2xs">
                                        <div>
                                            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                                                <span className="text-base">💡</span> Standar Baku Observer (SOP)
                                            </div>
                                            <p className="text-xs text-amber-950 leading-relaxed text-justify">
                                                {pedoman.tipsObserver}
                                            </p>
                                        </div>
                                        <div className="pt-3 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
                                            <span>🛡️ Standar Baku WMO No. 8 & BMKG</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Footer Bar Navigasi Bawah di dalam card */}
                        {/* <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4"> */}
                            {/* <Link
                                href={`/informasi-alat?id=${activeInstrument.id}`}
                                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all border border-slate-200 shadow-2xs"
                            >
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Kembali ke Informasi Alat</span>
                            </Link>

                            <Link
                                href="/virtual-tour"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7z" />
                                    <circle cx="8" cy="12" r="2.5" />
                                    <circle cx="16" cy="12" r="2.5" />
                                    <path d="M10.5 12h3" />
                                </svg>
                                <span>Lihat di Virtual Tour 360°</span>
                            </Link> */}
                        {/* </div> */}
                    </div>
                </main>

                {/* 4. Footer */}
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
