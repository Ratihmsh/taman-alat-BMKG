import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
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
                            Mengenal Cuaca Lebih Dekat dengan <br className="hidden md:block" />
                            <span className="text-blue-300">Taman Alat BMKG</span>
                        </h1>
                        <p className="mt-4 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 font-light">
                            Platform edukasi digital yang memberikan pengalaman imersif untuk mengeksplorasi berbagai instrumen meteorologi, klimatologi, dan geofisika.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link 
                                href="/virtual-tour" 
                                className="bg-white text-blue-900 hover:bg-blue-50 font-bold py-3 px-8 rounded-full shadow-xl transition-transform transform hover:-translate-y-1 text-lg"
                            >
                                Mulai Eksplorasi 360°
                            </Link>
                            <a 
                                href="#tentang" 
                                className="border-2 border-white/30 hover:border-white/80 text-white font-semibold py-3 px-8 rounded-full transition-colors text-lg"
                            >
                                Pelajari Lebih Lanjut
                            </a>
                        </div>
                    </div>
                </section>

                {/* Tentang Kami Section */}
                <section id="tentang" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Tentang Taman Alat</h2>
                            <div className="mt-2 w-24 h-1 bg-blue-500 mx-auto rounded"></div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2">
                                <div className="bg-blue-100 rounded-2xl h-80 w-full flex items-center justify-center shadow-inner">
                                    <span className="text-blue-400 font-medium">[Gambar Stasiun BMKG]</span>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Pusat Observasi Cuaca & Iklim</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Taman Alat BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) adalah area observasi terbuka yang dirancang khusus untuk meletakkan berbagai instrumen pengukur unsur-unsur cuaca dan iklim secara akurat dan terstandarisasi.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Melalui website ini, kami bertujuan untuk mendekatkan ilmu meteorologi kepada masyarakat, pelajar, dan akademisi dengan menghadirkan simulasi kunjungan nyata melalui teknologi Virtual Reality 360 derajat.
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
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Tinjauan 360°</h3>
                                <p className="text-gray-600">Jelajahi seluruh area taman alat seolah-olah Anda berada di lokasi secara langsung dengan kontrol penuh.</p>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Informasi Detail Alat</h3>
                                <p className="text-gray-600">Klik pada instrumen mana pun untuk melihat nama, fungsi, gambar detail, dan cara kerja alat tersebut.</p>
                            </div>
                            {/* Card 3 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Panduan Audio</h3>
                                <p className="text-gray-600">Dengarkan narasi suara yang menjelaskan spesifikasi dan kegunaan setiap alat untuk kemudahan edukasi.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <span className="font-extrabold text-2xl text-white tracking-tight mb-4 block">TamanAlat<span className="text-blue-500">BMKG</span></span>
                            <p className="text-gray-400 text-sm">Menyajikan informasi instrumen klimatologi dan meteorologi yang akurat dan mudah diakses untuk seluruh kalangan.</p>
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
                            <p className="text-sm text-gray-400">Jl. Contoh Alamat BMKG No. 123,<br />Jakarta, Indonesia<br />Email: info@bmkg.go.id</p>
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
