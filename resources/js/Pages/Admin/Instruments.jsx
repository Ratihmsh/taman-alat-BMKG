import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const categories = ['Meteorologi', 'Klimatologi', 'Geofisika'];

export default function Instruments({ instruments, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
        function: '',
        working_principle: '',
        category: 'Meteorologi',
        status: 'aktif',
        pitch: '',
        yaw: '',
        image_path: null,
        audio_path: null,
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (instrument) => {
        setEditing(instrument);
        setData({
            name: instrument.name,
            description: instrument.description ?? '',
            function: instrument.function ?? '',
            working_principle: instrument.working_principle ?? '',
            category: instrument.category ?? 'Meteorologi',
            status: instrument.status ?? 'aktif',
            pitch: instrument.pitch ?? '',
            yaw: instrument.yaw ?? '',
            image_path: null,
            audio_path: null,
        });
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(`/admin/instruments/${editing.id}`, {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post('/admin/instruments', {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const applyFilters = (key, value) => {
        router.get('/admin/instruments', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        router.get('/admin/instruments', {}, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <Head title="Data Alat" />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Data Alat</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola instrumen meteorologi, klimatologi, dan geofisika.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Tambah Alat
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Cari nama/kategori alat..."
                        defaultValue={filters.search}
                        onChange={(e) => applyFilters('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filters.category}
                    onChange={(e) => applyFilters('category', e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={filters.status}
                    onChange={(e) => applyFilters('status', e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                </select>
                {(filters.search || filters.category || filters.status) && (
                    <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Reset
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-4 py-3 font-medium">Alat</th>
                                <th className="px-4 py-3 font-medium">Kategori</th>
                                <th className="px-4 py-3 font-medium">Foto</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instruments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                                        Belum ada data alat.
                                    </td>
                                </tr>
                            ) : (
                                instruments.map((instrument) => (
                                    <tr key={instrument.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-gray-900">{instrument.name}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{instrument.description}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {instrument.category ?? '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {instrument.image_path ? (
                                                <img src={instrument.image_path} alt={instrument.name} className="w-12 h-12 object-cover rounded-lg" />
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                                instrument.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {instrument.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(instrument)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <Link
                                                    href={`/admin/instruments/${instrument.id}/toggle`}
                                                    method="patch"
                                                    as="button"
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                                >
                                                    {instrument.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                </Link>
                                                <Link
                                                    href={`/admin/instruments/${instrument.id}`}
                                                    method="delete"
                                                    as="button"
                                                    onClick={(e) => {
                                                        if (!confirm(`Hapus alat "${instrument.name}"?`)) e.preventDefault();
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                                >
                                                    Hapus
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editing ? `Edit Alat: ${editing.name}` : 'Tambah Alat Baru'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
                        </div>

                        <form onSubmit={submit} encType="multipart/form-data" className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Alat *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fungsi</label>
                                    <textarea
                                        value={data.function}
                                        onChange={(e) => setData('function', e.target.value)}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cara Kerja</label>
                                    <textarea
                                        value={data.working_principle}
                                        onChange={(e) => setData('working_principle', e.target.value)}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titik Pitch (360°)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.pitch}
                                        onChange={(e) => setData('pitch', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titik Yaw (360°)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.yaw}
                                        onChange={(e) => setData('yaw', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Foto</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image_path', e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                                    />
                                    {errors.image_path && <p className="text-red-500 text-xs mt-1">{errors.image_path}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Audio Panduan</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setData('audio_path', e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                                    />
                                    {errors.audio_path && <p className="text-red-500 text-xs mt-1">{errors.audio_path}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}