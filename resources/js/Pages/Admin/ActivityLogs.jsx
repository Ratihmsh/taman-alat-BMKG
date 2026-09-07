import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

const actionColor = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    other: 'bg-gray-100 text-gray-600',
};

export default function ActivityLogs({ logs, users, filters }) {
    const applyFilters = (key, value) => {
        router.get('/admin/logs', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        router.get('/admin/logs', {}, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <Head title="Log Aktivitas" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas</h1>
                <p className="text-gray-500 text-sm mt-1">Riwayat siapa yang mengakses dan mengubah apa.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 p-4 flex flex-wrap items-center gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Aksi</label>
                    <select
                        value={filters.action}
                        onChange={(e) => applyFilters('action', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Semua Aksi</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Admin</label>
                    <select
                        value={filters.user_id}
                        onChange={(e) => applyFilters('user_id', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Semua Admin</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
                    <input
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => applyFilters('date_from', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => applyFilters('date_to', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {(filters.action || filters.user_id || filters.date_from || filters.date_to) && (
                    <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium pt-4">
                        Reset
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-4 py-3 font-medium">Waktu</th>
                                <th className="px-4 py-3 font-medium">Admin</th>
                                <th className="px-4 py-3 font-medium">Aksi</th>
                                <th className="px-4 py-3 font-medium">Keterangan</th>
                                <th className="px-4 py-3 font-medium">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                                        Tidak ada log yang cocok dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {log.created_at?.replace('T', ' ').slice(0, 19)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{log.user?.name ?? 'Sistem'}</p>
                                            <p className="text-xs text-gray-500">{log.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${actionColor[log.action] ?? actionColor.other}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{log.description}</td>
                                        <td className="px-4 py-3 text-gray-400">{log.ip_address}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}