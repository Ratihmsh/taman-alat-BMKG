import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function InformasiAlat({ instruments = [], selectedId = null }) {
    // Default to selectedId or first instrument
    const defaultInstrument = (selectedId ? instruments.find(i => i.id === Number(selectedId)) : null) 
        || (instruments.length > 0 ? instruments[0] : null);
    
    const [currentId, setCurrentId] = useState(
        selectedId ? Number(selectedId) : (defaultInstrument ? defaultInstrument.id : null)
    );
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        if (selectedId) {
            setCurrentId(Number(selectedId));
        }
    }, [selectedId]);

    const activeInstrument = instruments.find(item => item.id === currentId) || defaultInstrument || instruments[0];

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
        if (!desc) return { deskripsi: 'Belum ada deskripsi singkat.', fungsi: 'Belum ada informasi fungsi.' };
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

    const handleSelectInstrument = (id) => {
        setCurrentId(id);
        // Smoothly update URL query without full page reload
        window.history.replaceState(null, '', `/informasi-alat?id=${id}`);
    };

    return (
        <>
            <Head title={`${activeInstrument ? activeInstrument.name : 'Informasi Alat'} - Taman Alat BMKG`} />

            <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
                {/* 1. Top Navbar */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        {/* Left: BMKG Logo + Brand Info */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3 group">
                                <img 
                                    src="/images/bmkg_logo.png" 
                                    alt="BMKG Logo" 
                                    className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
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

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
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
                                <span>Virtual Tour 360°</span>
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
                    {/* Background decorative waves overlay */}
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
                            <span className="text-white font-semibold">Informasi Alat</span>
                        </nav>

                        {/* Title Row + Badge */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    Informasi Alat Utama
                                </h1>
                                <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                                    Katalog lengkap {instruments.length} instrumen meteorologi, klimatologi, dan hidrologi utama yang terpasang pada Taman Alat BMKG beserta deskripsi singkat dan fungsinya.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm px-4 py-2 rounded-full font-medium shadow-xs">
                                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                <span>Taman Alat Terbuka &bull; <strong className="text-white font-bold">{instruments.length} Alat Utama</strong></span>
                            </div>
                        </div>

                        {/* Horizontal Instrument Quick Selector Pills */}
                        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {instruments.map((inst, index) => {
                                const isSelected = inst.id === activeInstrument?.id;
                                return (
                                    <button
                                        key={inst.id}
                                        onClick={() => handleSelectInstrument(inst.id)}
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
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 3. Main Showcase Card */}
                <main className="max-w-6xl mx-auto -mt-10 sm:-mt-12 px-4 sm:px-6 relative z-20 w-full pb-12">
                    {activeInstrument ? (
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-6 sm:p-8 transition-all">
                            {/* Card Top: Category Badge & Coordinates */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                <span className="inline-block bg-[#e0f2fe] text-[#0284c7] font-bold text-[11px] sm:text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
                                    {getCategoryBadge(activeInstrument)}
                                </span>

                                <span className="text-xs text-slate-400 font-medium">
                                    Alat ke-<strong>{instruments.findIndex(i => i.id === activeInstrument.id) + 1}</strong> dari <strong>{instruments.length}</strong> Alat Utama
                                </span>
                            </div>

                            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl">
                                    {activeInstrument.name}
                                </h2>

                                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/70 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-xs">
                                    <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span>Koordinat: {getCoordinateText(activeInstrument)}</span>
                                </div>
                            </div>

                            {/* 2-Column Split: Image Showcase on Left, Description & Fungsi on Right */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                                {/* Left Column: Photo Showcase */}
                                <div className="lg:col-span-6 flex flex-col">
                                    <div className="rounded-2xl overflow-hidden relative shadow-sm group aspect-[16/11] bg-slate-100 flex items-center justify-center border border-slate-200/80">
                                        <img 
                                            src={activeInstrument.image_path || '/images/panci_penguapan.png'} 
                                            alt={activeInstrument.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                            onError={(e) => {
                                                e.target.src = '/images/panci_penguapan.png';
                                            }}
                                        />

                                        {/* Bottom-left: "Lihat gambar lainnya" button */}
                                        <button
                                            onClick={() => setShowLightbox(true)}
                                            className="absolute bottom-3 left-3 bg-black/65 hover:bg-black/85 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Lihat gambar penuh</span>
                                        </button>

                                        {/* Bottom-right: Expand Fullscreen button */}
                                        <button
                                            onClick={() => setShowLightbox(true)}
                                            className="absolute bottom-3 right-3 bg-black/65 hover:bg-black/85 backdrop-blur-md text-white p-2 rounded-xl flex items-center justify-center transition-all shadow-md cursor-pointer"
                                            title="Perbesar Gambar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Quick Next / Prev Instrument Buttons */}
                                    <div className="flex items-center justify-between gap-3 mt-4">
                                        {(() => {
                                            const currentIndex = instruments.findIndex(i => i.id === activeInstrument.id);
                                            const prevInst = currentIndex > 0 ? instruments[currentIndex - 1] : null;
                                            const nextInst = currentIndex < instruments.length - 1 ? instruments[currentIndex + 1] : null;
                                            return (
                                                <>
                                                    <button
                                                        onClick={() => prevInst && handleSelectInstrument(prevInst.id)}
                                                        disabled={!prevInst}
                                                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                                            prevInst
                                                                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer'
                                                                : 'opacity-40 border-slate-100 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <span>&larr;</span>
                                                        <span className="truncate">{prevInst ? prevInst.name.split('(')[0].trim() : 'Sebelumnya'}</span>
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => nextInst && handleSelectInstrument(nextInst.id)}
                                                        disabled={!nextInst}
                                                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                                            nextInst
                                                                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer'
                                                                : 'opacity-40 border-slate-100 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <span className="truncate">{nextInst ? nextInst.name.split('(')[0].trim() : 'Selanjutnya'}</span>
                                                        <span>&rarr;</span>
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Right Column: Deskripsi Singkat & Fungsi Card Box */}
                                <div className="lg:col-span-6 flex flex-col">
                                    <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full shadow-xs gap-5">
                                        <div className="space-y-4">
                                            {/* Deskripsi Singkat Box */}
                                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                                                <div className="flex items-center gap-2.5 mb-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                                                        📄
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                                            Deskripsi Singkat
                                                        </h3>
                                                        <span className="text-[10px] text-slate-400 font-medium">Bentuk & Karakteristik Alat</span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                                                    {activeData.deskripsi}
                                                </p>
                                            </div>

                                            {/* Fungsi Box */}
                                            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5 rounded-2xl border border-blue-200/70 shadow-2xs">
                                                <div className="flex items-center gap-2.5 mb-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                                                        🎯
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-blue-950 tracking-tight">
                                                            Fungsi Utama
                                                        </h3>
                                                        <span className="text-[10px] text-blue-600/80 font-medium">Peran Pengukuran Meteorologi</span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed text-justify">
                                                    {activeData.fungsi || "Berfungsi sebagai instrumen observasi cuaca dan iklim terstandar BMKG."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons: Detail Kerja Alat & Virtual Tour */}
                                        <div className="space-y-2.5 pt-2">
                                            <Link
                                                href={`/detail-kerja-alat?id=${activeInstrument.id}`}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-sm cursor-pointer transform hover:-translate-y-0.5"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>Detail Kerja Alat</span>
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </Link>

                                            <Link
                                                href="/virtual-tour"
                                                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7z" />
                                                    <circle cx="8" cy="12" r="2.5" />
                                                    <circle cx="16" cy="12" r="2.5" />
                                                    <path d="M10.5 12h3" />
                                                </svg>
                                                <span>Temukan di Virtual Tour 360°</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* 4. Complete Catalog Grid (10 Alat Utama) */}
                    <div className="mt-12">
                        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                    KATALOG LENGKAP
                                </span>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Daftar {instruments.length} Alat Utama Taman Alat BMKG
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    Klik salah satu alat di bawah untuk melihat rincian informasi dan fungsinya.
                                </p>
                            </div>

                            <div className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                                Total: {instruments.length} Alat
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {instruments.map((inst, index) => {
                                const isSelected = inst.id === activeInstrument?.id;
                                const parsed = parseInstrumentData(inst.description);

                                return (
                                    <div
                                        key={inst.id}
                                        onClick={() => handleSelectInstrument(inst.id)}
                                        className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all cursor-pointer group hover:shadow-lg ${
                                            isSelected 
                                                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20' 
                                                : 'border-slate-200/80 hover:border-blue-300 shadow-xs'
                                        }`}
                                    >
                                        <div>
                                            {/* Header: Index number + Category */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600'
                                                }`}>
                                                    #{index + 1}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                                    {inst.category || 'Meteorologi'}
                                                </span>
                                            </div>

                                            {/* Name */}
                                            <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
                                                {inst.name}
                                            </h4>

                                            {/* Deskripsi Singkat */}
                                            <div className="mb-3">
                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <span>📄</span> Deskripsi:
                                                </div>
                                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                    {parsed.deskripsi}
                                                </p>
                                            </div>

                                            {/* Fungsi Singkat */}
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 mb-4">
                                                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <span>🎯</span> Fungsi:
                                                </div>
                                                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                                                    {parsed.fungsi || "Alat observasi cuaca terstandar."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                                            <span className={`font-semibold ${isSelected ? 'text-blue-600 font-bold' : 'text-slate-500 group-hover:text-blue-600'}`}>
                                                {isSelected ? '✓ Sedang Ditampilkan' : 'Pilih Alat Ini'}
                                            </span>
                                            <span className="text-blue-600 transform group-hover:translate-x-1 transition-transform">
                                                &rarr;
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* 5. Image Lightbox Modal */}
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

                {/* 6. Footer */}
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
