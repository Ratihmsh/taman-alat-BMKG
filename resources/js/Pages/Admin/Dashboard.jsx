import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ stats, latestActivity }) {
    const maxVisits = Math.max(1, ...stats.visitTrend.map((v) => v.total));

    const cards = [
        {
            label: 'Total Alat Terdaftar',
            value: stats.totalInstruments,
            sub: `${stats.activeInstruments} aktif`,
            icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            ),
        },
        {
            label: 'Kunjungan Hari Ini',
            value: stats.todayVisits,
            sub: `${stats.monthVisits} bulan ini`,
            icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            ),
        },
        {
            label: 'Titik Virtual Tour',
            value: stats.totalTourSpots,
            sub: `${stats.publishedTourSpots} dipublikasikan`,
            icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ),
        },
    ];

    const actionColor = {
        create: 'bg-green-100 text-green-700',
        update: 'bg-blue-100 text-blue-700',
        delete: 'bg-red-100 text-red-700',
        other: 'bg-gray-100 text-gray-600',
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Ringkasan data Taman Alat BMKG.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="text-3xl font-extrabold text-gray-900 mt-2">{card.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Trafik Pengunjung (14 hari terakhir)</h2>
                        <p className="text-xs text-gray-400">per kunjungan halaman</p>
                    </div>

                    {stats.visitTrend.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-12">Belum ada data kunjungan.</p>
                    ) : (
                        <div className="flex items-end gap-1.5 h-40">
                            {stats.visitTrend.map((item, i) => {
                                const height = Math.max(6, (item.total / maxVisits) * 100);
                                const isToday = i === stats.visitTrend.length - 1;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                        <div
                                            className={`w-full rounded-t-md transition-all ${
                                                isToday ? 'bg-blue-600' : 'bg-blue-300 group-hover:bg-blue-400'
                                            }`}
                                            style={{ height: `${height}%` }}
                                            title={`${item.date}: ${item.total} kunjungan`}
                                        ></div>
                                        <span className="text-[9px] text-gray-400 truncate w-full text-center">
                                            {item.date?.slice(5)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Cuaca Terakhir</h2>
                    {stats.latestWeather ? (
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                {stats.latestWeather.icon_url && (
                                    <img
                                        src={stats.latestWeather.icon_url}
                                        alt={stats.latestWeather.weather_desc}
                                        className="w-16 h-16"
                                    />
                                )}
                                <div>
                                    <p className="text-4xl font-extrabold text-gray-900">
                                        {stats.latestWeather.temperature}°C
                                    </p>
                                    <p className="text-blue-600 font-medium">{stats.latestWeather.weather_desc}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>📍 {stats.latestWeather.location}</p>
                                <p>💧 Kelembapan: {stats.latestWeather.humidity}%</p>
                                <p>💨 Angin: {stats.latestWeather.wind_speed} m/s ({stats.latestWeather.wind_direction})</p>
                                <p className="text-xs text-gray-400">
                                    Update: {stats.latestWeather.updated_at ? String(stats.latestWeather.updated_at).replace('T', ' ').slice(0, 16) : '-'} WIB
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">Data cuaca tidak tersedia.</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Aktivitas Terakhir</h2>
                {latestActivity.length === 0 ? (
                    <p className="text-gray-400 text-sm">Belum ada aktivitas tercatat.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-gray-500">
                                    <th className="py-2 pr-4 font-medium">Admin</th>
                                    <th className="py-2 pr-4 font-medium">Aksi</th>
                                    <th className="py-2 pr-4 font-medium">Keterangan</th>
                                    <th className="py-2 font-medium">Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestActivity.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-100">
                                        <td className="py-2 pr-4">{log.user?.name ?? 'Sistem'}</td>
                                        <td className="py-2 pr-4">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${actionColor[log.action] ?? actionColor.other}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4 text-gray-600">{log.description}</td>
                                        <td className="py-2 text-gray-400 whitespace-nowrap">
                                            {log.created_at}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}