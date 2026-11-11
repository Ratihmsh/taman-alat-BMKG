import { useEffect, useMemo, useRef, useState } from 'react';

const AUTO_ADVANCE_MS = 300000;

function CategoryIcon({ category, className = 'h-6 w-6' }) {
    const key = (category || '').toLowerCase();

    if (key.includes('klimatologi')) {
        return (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
                <path strokeLinecap="round" strokeWidth="1.8" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4l1.4-1.4" />
            </svg>
        );
    }

    if (key.includes('geofisika')) {
        return (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2 12h4l3 7 4-14 3 7h6" />
            </svg>
        );
    }

    if (key.includes('meteorologi')) {
        return (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6.5 18a4.5 4.5 0 01-.9-8.9A6 6 0 0117 8.7a4 4 0 01-.4 8H6.5z" />
            </svg>
        );
    }

    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 12l4-3m-4 3l-2 5" />
        </svg>
    );
}

function FeaturedVisual({ instrument }) {
    if (instrument.image_url) {
        return (
            <img
                src={instrument.image_url}
                alt={instrument.name}
                loading="lazy"
                className="h-full w-full object-cover object-center"
            />
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-white to-gray-100 text-gray-300">
            <CategoryIcon category={instrument.category} className="h-20 w-20" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                {instrument.category || 'Instrumen'}
            </span>
        </div>
    );
}

function Thumbnail({ instrument }) {
    if (instrument.image_url) {
        return <img src={instrument.image_url} alt={instrument.name} loading="lazy" className="h-full w-full object-cover" />;
    }

    return (
        <span className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <CategoryIcon category={instrument.category} className="h-5 w-5" />
        </span>
    );
}

function InfoRow({ label, value, icon }) {
    if (!value) return null;

    return (
        <div className="flex gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {icon}
            </span>
            <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-gray-700">{value}</dd>
            </div>
        </div>
    );
}

export default function InstrumentCarousel({ instruments = [] }) {
    const total = instruments.length;
    const [active, setActive] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(query.matches);

        update();
        query.addEventListener?.('change', update);
        return () => query.removeEventListener?.('change', update);
    }, []);

    useEffect(() => {
        if (total <= 1 || reducedMotion) return;

        timerRef.current = setInterval(() => {
            setActive((current) => (current + 1) % total);
        }, AUTO_ADVANCE_MS);

        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [active, total, reducedMotion]);

    const queueIndexes = useMemo(() => {
        if (total <= 1) return [];

        const indexes = [];
        for (let step = 1; step < total && indexes.length < 3; step += 1) {
            const index = (active + step) % total;
            if (index !== active && !indexes.includes(index)) indexes.push(index);
        }
        return indexes;
    }, [active, total]);

    if (total === 0) {
        return <p className="py-12 text-center text-gray-400">Belum ada data alat.</p>;
    }

    const current = instruments[active];
    const desktopQueue = queueIndexes.slice(0, 2);
    const mobileQueue = queueIndexes.slice(0, 3);

    const goTo = (index) => setActive(((index % total) + total) % total);
    const pad = (index) => String(index + 1).padStart(2, '0');

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Alat-Alat Taman BMKG"
            className="mx-auto mt-6 w-full max-w-5xl sm:mt-28"
        >
            <div className="relative">
                {desktopQueue.map((index, position) => {
                    const instrument = instruments[index];
                    const offset = (desktopQueue.length - position) * 46;

                    return (
                        <button
                            type="button"
                            key={instrument.id}
                            onClick={() => goTo(index)}
                            aria-label={`Tampilkan ${instrument.name}`}
                            className="absolute inset-x-0 hidden h-full overflow-hidden rounded-3xl border border-gray-100 bg-white text-left shadow-md transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:block"
                            style={{
                                top: -offset,
                                zIndex: 10 - position,
                                opacity: 1 - position * 0.3,
                                transform: `scale(${1 - (position + 1) * 0.035})`,
                            }}
                        >
                            <div className="flex items-center gap-3 px-6 pt-3">
                                <span className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                                    <Thumbnail instrument={instrument} />
                                </span>
                                <span className="truncate text-sm font-semibold text-gray-700">{instrument.name}</span>
                                <span className="ml-auto shrink-0 text-xs font-medium text-blue-600">{instrument.category}</span>
                            </div>
                        </button>
                    );
                })}

                <article className="relative z-20 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                    <div className="h-1 w-full bg-gray-100">
                        <div key={active} className="carousel-progress h-full bg-blue-600" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative h-64 overflow-hidden sm:h-80 md:h-full md:min-h-[24rem]">
                            <div key={active} className="carousel-fade h-full w-full">
                                <FeaturedVisual instrument={current} />
                            </div>

                            <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm backdrop-blur">
                                <CategoryIcon category={current.category} className="h-3.5 w-3.5" />
                                {current.category}
                            </span>

                            <span className="absolute bottom-5 left-5 text-4xl font-extrabold text-white drop-shadow-md">
                                {pad(active)}
                            </span>
                        </div>

                        <div className="flex flex-col p-7 sm:p-9 md:p-10">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                                Tentang Alat Ini
                            </span>

                            <div key={active} className="carousel-fade mt-3 flex flex-1 flex-col">
                                <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">{current.name}</h3>

                                {current.description && (
                                    <p className="mt-4 leading-relaxed text-gray-600">{current.description}</p>
                                )}

                                <dl className="mt-6 space-y-4">
                                    <InfoRow
                                        label="Fungsi"
                                        value={current.function}
                                        icon={
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18M5 8l7-5 7 5" />
                                            </svg>
                                        }
                                    />
                                    <InfoRow
                                        label="Cara Kerja"
                                        value={current.working_principle}
                                        icon={
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10l2.1 2.1M19.1 4.9l-2.1 2.1m-10 10l-2.1 2.1" />
                                            </svg>
                                        }
                                    />
                                </dl>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 carousel-scrollbar sm:hidden">
                {mobileQueue.map((index) => {
                    const instrument = instruments[index];
                    return (
                        <button
                            type="button"
                            key={instrument.id}
                            onClick={() => goTo(index)}
                            className="flex shrink-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
                        >
                            <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                                <Thumbnail instrument={instrument} />
                            </span>
                            <span className="text-left">
                                <span className="block whitespace-nowrap text-xs font-semibold text-gray-800">{instrument.name}</span>
                                <span className="block text-[11px] text-blue-600">{instrument.category}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    aria-label="Alat sebelumnya"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-600 shadow-sm transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums text-gray-900">
                        {pad(active)} <span className="text-gray-400">/ {pad(total - 1)}</span>
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {instruments.map((instrument, index) => (
                            <button
                                type="button"
                                key={instrument.id}
                                onClick={() => goTo(index)}
                                aria-label={`Tampilkan ${instrument.name}`}
                                aria-current={index === active}
                                className={
                                    index === active
                                        ? 'h-2 w-6 rounded-full bg-blue-600 transition-all'
                                        : 'h-2 w-2 rounded-full bg-gray-300 transition-all hover:bg-gray-400'
                                }
                            />
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    aria-label="Alat berikutnya"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-600 shadow-sm transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
