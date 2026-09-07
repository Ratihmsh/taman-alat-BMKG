import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

const groupConfig = {
    hero: {
        title: 'Hero Section',
        description: 'Judul, subjudul, dan tombol pada bagian atas halaman.',
        fields: [
            { key: 'hero_label', label: 'Label Pembuka', type: 'text' },
            { key: 'hero_title', label: 'Judul', type: 'text' },
            { key: 'hero_highlight', label: 'Teks Sorotan', type: 'text' },
            { key: 'hero_subtitle', label: 'Deskripsi', type: 'textarea' },
            { key: 'hero_cta_explore', label: 'Teks Tombol 1 (Eksplorasi)', type: 'text' },
            { key: 'hero_cta_about', label: 'Teks Tombol 2 (Pelajari)', type: 'text' },
        ],
    },
    about: {
        title: 'Tentang Taman Alat',
        description: 'Konten pada section "Tentang Taman Alat".',
        fields: [
            { key: 'about_title', label: 'Judul Section', type: 'text' },
            { key: 'about_heading', label: 'Sub Judul', type: 'text' },
            { key: 'about_text1', label: 'Paragraf 1', type: 'textarea' },
            { key: 'about_text2', label: 'Paragraf 2', type: 'textarea' },
            { key: 'about_image_alt', label: 'Alt Teks Gambar', type: 'text' },
        ],
    },
    facilities: {
        title: 'Fasilitas Edukasi',
        description: 'Kartu-kartu pada section "Fasilitas Edukasi".',
        fields: [
            { key: 'facility_1_title', label: 'Kartu 1 — Judul', type: 'text' },
            { key: 'facility_1_desc', label: 'Kartu 1 — Deskripsi', type: 'textarea' },
            { key: 'facility_2_title', label: 'Kartu 2 — Judul', type: 'text' },
            { key: 'facility_2_desc', label: 'Kartu 2 — Deskripsi', type: 'textarea' },
            { key: 'facility_3_title', label: 'Kartu 3 — Judul', type: 'text' },
            { key: 'facility_3_desc', label: 'Kartu 3 — Deskripsi', type: 'textarea' },
        ],
    },
    footer: {
        title: 'Footer',
        description: 'Tagline dan informasi kontak di footer.',
        fields: [
            { key: 'footer_tagline', label: 'Tagline', type: 'textarea' },
            { key: 'footer_address', label: 'Alamat', type: 'textarea' },
            { key: 'footer_email', label: 'Email', type: 'text' },
            { key: 'footer_phone', label: 'Telepon', type: 'text' },
        ],
    },
};

export default function PageContent({ groups }) {
    const { data, setData, put, processing, errors } = useForm({
        contents: Object.fromEntries(
            Object.entries(groups).flatMap(([g, fields]) =>
                Object.entries(fields).map(([key, value]) => [key, value]),
            ),
        ),
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/content');
    };

    const updateField = (key, value) => {
        setData('contents', { ...data.contents, [key]: value });
    };

    return (
        <AdminLayout>
            <Head title="Konten Halaman" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Konten Halaman</h1>
                <p className="text-gray-500 text-sm mt-1">Perbarui teks pada landing page Taman Alat BMKG.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {Object.entries(groupConfig).map(([group, config]) => (
                    <div key={group} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900">{config.title}</h2>
                        <p className="text-sm text-gray-500 mb-5">{config.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {config.fields.map((field) => (
                                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={data.contents[field.key] ?? ''}
                                            onChange={(e) => updateField(field.key, e.target.value)}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={data.contents[field.key] ?? ''}
                                            onChange={(e) => updateField(field.key, e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                    {errors.contents && errors.contents[field.key] && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contents[field.key]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}