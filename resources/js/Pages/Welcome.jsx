import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Welcome({ contents = {} }) {
    const c = (key, fallback) => contents[key] ?? fallback;
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/api/weather')
            .then(response => {
                setWeather(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Gagal memuat data cuaca.');
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Head title="Beranda - Taman Alat BMKG" />
            
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                {/* Navbar */}
                <nav className="bg-white shadow-md fixed w-full z-50 top-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <span className="font-extrabold text-2xl text-blue-800 tracking-tight">TamanAlat<span className="text-blue-500">BMKG</span></span>
                            </div>
                            <div className="hidden md:flex items-center space-x-8">
                                <a href="#beranda" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Beranda</a>
                                <a href="#tentang" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Tentang Kami</a>
                                <a href="#fasilitas" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Fasilitas</a>
                                <Link
                                    href="/admin"
                                    className="border border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                                >
                                    Admin
                                </Link>
                                <Link 
                                    href="/virtual-tour" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold shadow-md transition-transform hover:scale-105"
                                >
                                    Virtual Tour 360°
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section id="beranda" className="pt-24 pb-12 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                            {c('hero_label', 'Mengenal Cuaca Lebih Dekat dengan')} <br className="hidden md:block" />
                            <span className="text-blue-300">{c('hero_title', 'Taman Alat BMKG')}</span>
                        </h1>
                        <p className="mt-4 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 font-light">
                            {c('hero_subtitle', 'Platform edukasi digital yang memberikan pengalaman imersif untuk mengeksplorasi berbagai instrumen meteorologi, klimatologi, dan geofisika.')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link 
                                href="/virtual-tour" 
                                className="bg-white text-blue-900 hover:bg-blue-50 font-bold py-3 px-8 rounded-full shadow-xl transition-transform transform hover:-translate-y-1 text-lg"
                            >
                                {c('hero_cta_explore', 'Mulai Eksplorasi 360°')}
                            </Link>
                            <a 
                                href="#tentang" 
                                className="border-2 border-white/30 hover:border-white/80 text-white font-semibold py-3 px-8 rounded-full transition-colors text-lg"
                            >
                                {c('hero_cta_about', 'Pelajari Lebih Lanjut')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Cuaca Hari Ini Section */}
                <section id="cuaca" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Cuaca Hari Ini</h2>
                            <div className="mt-2 w-24 h-1 bg-blue-500 mx-auto rounded"></div>
                            <p className="mt-4 text-lg text-gray-600">Pemantauan kondisi cuaca real-time dari BMKG untuk area Taman Alat.</p>
                        </div>

                        {loading && (
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat data cuaca...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                                <p className="text-red-500">{error}</p>
                            </div>
                        )}

                        {!loading && !error && weather && weather.current && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                {/* Weather Hero Card */}
                                <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-8 md:p-10">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            {weather.current.icon_url && (
                                                <img src={weather.current.icon_url} alt={weather.current.weather_desc} className="w-20 h-20 md:w-24 md:h-24" />
                                            )}
                                            <div>
                                                <p className="text-3xl md:text-5xl font-extrabold">
                                                    {weather.current.temperature}<span className="text-blue-300">°C</span>
                                                </p>
                                                <p className="text-blue-100 font-medium mt-1">{weather.current.weather_desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-blue-100 text-sm">
                                                {weather.location?.desa}, {weather.location?.kecamatan}
                                            </p>
                                            <p className="text-blue-100 text-sm">
                                                {weather.location?.kotakab}, {weather.location?.provinsi}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Suhu Udara</p>
                                            <p className="text-xl font-bold text-gray-900">{weather.current.temperature}°C</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Kelembapan</p>
                                            <p className="text-xl font-bold text-gray-900">{weather.current.humidity}%</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Angin</p>
                                            <p className="text-xl font-bold text-gray-900">{weather.current.wind_speed} km/j</p>
                                            <p className="text-sm text-gray-500">Arah: {weather.current.wind_direction} ({weather.current.wind_deg}°)</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Curah Hujan</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {weather.current.precipitation && weather.current.precipitation > 0
                                                    ? `${weather.current.precipitation} mm`
                                                    : '0 mm'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 pb-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400 border-t border-gray-100 pt-4">
                                    <p>
                                        Sumber: {weather.source ?? 'BMKG'} • {" "}
                                        <span>Terakhir diperbarui: {weather.current.analysis_date ? weather.current.analysis_date.replace('T', ' ').slice(0, 16) : '-'} WIB</span>
                                    </p>
                                    <p>Update prakiraan setiap 3 jam</p>
                                </div>
                            </div>
                        )}

                        {!loading && !error && weather && !weather.current && (
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                                <p className="text-gray-500">{weather.error ?? 'Data cuaca tidak tersedia.'}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Tentang Kami Section */}
                <section id="tentang" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{c('about_title', 'Tentang Taman Alat')}</h2>
                            <div className="mt-2 w-24 h-1 bg-blue-500 mx-auto rounded"></div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2">
                                <div className="bg-blue-100 rounded-2xl h-80 w-full flex items-center justify-center shadow-inner">
                                    <span className="text-blue-400 font-medium">[{c('about_image_alt', 'Gambar Stasiun BMKG')}]</span>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{c('about_heading', 'Pusat Observasi Cuaca & Iklim')}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {c('about_text1', 'Taman Alat BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) adalah area observasi terbuka yang dirancang khusus untuk meletakkan berbagai instrumen pengukur unsur-unsur cuaca dan iklim secara akurat dan terstandarisasi.')}
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    {c('about_text2', 'Melalui website ini, kami bertujuan untuk mendekatkan ilmu meteorologi kepada masyarakat, pelajar, dan akademisi dengan menghadirkan simulasi kunjungan nyata melalui teknologi Virtual Reality 360 derajat.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Fasilitas Section */}
                <section id="fasilitas" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Fasilitas Edukasi</h2>
                            <div className="mt-2 w-24 h-1 bg-blue-500 mx-auto rounded"></div>
                            <p className="mt-4 text-lg text-gray-600">Apa saja yang bisa Anda nikmati melalui platform ini?</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{c('facility_1_title', 'Tinjauan 360°')}</h3>
                                <p className="text-gray-600">{c('facility_1_desc', 'Jelajahi seluruh area taman alat seolah-olah Anda berada di lokasi secara langsung dengan kontrol penuh.')}</p>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{c('facility_2_title', 'Informasi Detail Alat')}</h3>
                                <p className="text-gray-600">{c('facility_2_desc', 'Klik pada instrumen mana pun untuk melihat nama, fungsi, gambar detail, dan cara kerja alat tersebut.')}</p>
                            </div>
                            {/* Card 3 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{c('facility_3_title', 'Panduan Audio')}</h3>
                                <p className="text-gray-600">{c('facility_3_desc', 'Dengarkan narasi suara yang menjelaskan spesifikasi dan kegunaan setiap alat untuk kemudahan edukasi.')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <span className="font-extrabold text-2xl text-white tracking-tight mb-4 block">TamanAlat<span className="text-blue-500">BMKG</span></span>
                            <p className="text-gray-400 text-sm">{c('footer_tagline', 'Menyajikan informasi instrumen klimatologi dan meteorologi yang akurat dan mudah diakses untuk seluruh kalangan.')}</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Tautan Cepat</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#beranda" className="hover:text-white transition-colors">Beranda</a></li>
                                <li><a href="#tentang" className="hover:text-white transition-colors">Tentang Kami</a></li>
                                <li><Link href="/virtual-tour" className="hover:text-white transition-colors">Virtual Tour 360</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
                            <p className="text-sm text-gray-400">{c('footer_address', 'Jl. Contoh Alamat BMKG No. 123, Jakarta, Indonesia')}<br />Email: {c('footer_email', 'info@bmkg.go.id')}<br />Telp: {c('footer_phone', '+62 21 1234 5678')}</p>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
                        &copy; 2026 Taman Alat Virtual Tour BMKG. Hak cipta dilindungi undang-undang.
                    </div>
                </footer>
            </div>
        </>
    );
}
