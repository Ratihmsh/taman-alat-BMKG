import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Users({ users }) {
    const [resetTarget, setResetTarget] = useState(null);

    const resetForm = useForm({
        password: '',
    });

    const submitReset = (e) => {
        e.preventDefault();
        resetForm.post(`/admin/users/${resetTarget.id}/reset-password`, {
            onSuccess: () => setResetTarget(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Pengguna" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna Admin</h1>
                <p className="text-gray-500 text-sm mt-1">Kelola akun admin dengan role super admin / editor.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-4 py-3 font-medium">Nama</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Dibuat</th>
                                <th className="px-4 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                                        Belum ada pengguna.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'super' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {user.role === 'super' ? 'Super Admin' : 'Editor'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{user.created_at}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/users/${user.id}/role`}
                                                    method="patch"
                                                    data={{ role: user.role === 'super' ? 'editor' : 'super' }}
                                                    as="button"
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                >
                                                    {user.role === 'super' ? 'Set Editor' : 'Set Super'}
                                                </Link>
                                                <button
                                                    onClick={() => setResetTarget(user)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                                >
                                                    Reset Password
                                                </button>
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    method="delete"
                                                    as="button"
                                                    onClick={(e) => {
                                                        if (!confirm(`Hapus admin "${user.name}"?`)) e.preventDefault();
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

            {resetTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setResetTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
                            <button onClick={() => setResetTarget(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
                        </div>
                        <form onSubmit={submitReset} className="px-6 py-5 space-y-4">
                            <p className="text-sm text-gray-600">
                                Atur password baru untuk <b>{resetTarget.name}</b> ({resetTarget.email}).
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru *</label>
                                <input
                                    type="password"
                                    value={resetForm.data.password}
                                    onChange={(e) => resetForm.setData('password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {resetForm.errors.password && <p className="text-red-500 text-xs mt-1">{resetForm.errors.password}</p>}
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setResetTarget(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetForm.processing}
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                                >
                                    {resetForm.processing ? 'Menyimpan...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}