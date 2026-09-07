import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Pannellum } from 'pannellum-react';
import { useState } from 'react';

export default function TourSpots({ tourSpots, instruments }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [previewSpot, setPreviewSpot] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        is_published: true,
        order: 0,
        image_path: null,
    });

    const openCreate = () => {
        setEditing(null);
        reset({ order: tourSpots.length + 1 });
        setShowModal(true);
    };

    const openEdit = (spot) => {
        setEditing(spot);
        setData({
            name: spot.name,
            description: spot.description ?? '',
            is_published: spot.is_published,
            order: spot.order ?? 0,
            image_path: null,
        });
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => setShowModal(false);
        if (editing) {
            put(`/admin/tour-spots/${editing.id}`, { onSuccess });
        } else {
            post('/admin/tour-spots', { onSuccess });
        }
    };

    return (
        <AdminLayout>
            <Head title="Virtual Tour" />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Virtual Tour 360°</h1>
                    <p className="text-gray-500 text-sm mt-1">Upload gambar 360° dan atur titik lokasi tur.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Tambah Titik Tur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tourSpots.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center text-gray-400">
                        Belum ada titik tur. Tambahkan titik tur pertama Anda.
                    </div>
                ) : (
                    tourSpots.map((spot) => (
                        <div key={spot.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="relative h-44 bg-gray-900">
                                {spot.image_path && (
                                    <img src={spot.image_path} alt={spot.name} className="w-full h-full object-cover" />
                                )}
                                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    spot.is_published ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                }`}>
                                    {spot.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900">{spot.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{spot.description || 'Tanpa deskripsi.'}</p>
                                <p className="text-xs text-gray-400 mt-2">Urutan: {spot.order ?? 0}</p>

                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                    <button
                                        onClick={() => setPreviewSpot(spot)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                    >
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => openEdit(spot)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <Link
                                        href={`/admin/tour-spots/${spot.id}/publish`}
                                        method="patch"
                                        as="button"
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                    >
                                        {spot.is_published ? 'Tarik' : 'Publikasikan'}
                                    </Link>
                                    <Link
                                        href={`/admin/tour-spots/${spot.id}`}
                                        method="delete"
                                        as="button"
                                        onClick={(e) => {
                                            if (!confirm(`Hapus titik tur "${spot.name}"?`)) e.preventDefault();
                                        }}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                        Hapus
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Hotspot yang Terhubung ke Alat</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Hotspot pada gambar 360° ditentukan dari kolom <b>Pitch</b> dan <b>Yaw</b> pada masing-masing alat di menu
                    "Data Alat". Alat yang sedang aktif otomatis muncul sebagai hotspot pada tur.
                </p>
                {instruments.length === 0 ? (
                    <p className="text-gray-400 text-sm">Belum ada alat aktif.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-gray-500">
                                    <th className="py-2 pr-4 font-medium">Alat</th>
                                    <th className="py-2 pr-4 font-medium">Kategori</th>
                                    <th className="py-2 font-medium">Pitch / Yaw</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instruments.map((inst) => (
                                    <tr key={inst.id} className="border-b border-gray-100">
                                        <td className="py-2 pr-4 font-medium text-gray-900">{inst.name}</td>
                                        <td className="py-2 pr-4 text-gray-600">{inst.category}</td>
                                        <td className="py-2 text-gray-600">{inst.pitch ?? '-'} / {inst.yaw ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editing ? `Edit: ${editing.name}` : 'Tambah Titik Tur Baru'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
                        </div>

                        <form onSubmit={submit} encType="multipart/form-data" className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Titik *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                                    <input
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData('order', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={true}>Published</option>
                                        <option value={false}>Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar 360°</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image_path', e.target.files[0])}
                                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                                />
                                {errors.image_path && <p className="text-red-500 text-xs mt-1">{errors.image_path}</p>}
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

            {previewSpot && previewSpot.image_path && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewSpot(null)}>
                    <div className="w-full h-full max-h-screen" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-2 rounded-t-xl">
                            <span className="font-semibold">{previewSpot.name}</span>
                            <button onClick={() => setPreviewSpot(null)} className="text-gray-300 hover:text-white text-xl leading-none">×</button>
                        </div>
                        <div className="h-[calc(100%-3rem)] rounded-b-xl overflow-hidden bg-black">
                            <Pannellum
                                width="100%"
                                height="100%"
                                image={previewSpot.image_path}
                                pitch={10}
                                yaw={180}
                                hfov={110}
                                autoLoad
                            />
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}