import { Link, usePage } from '@inertiajs/react';

const navItems = [
    { name: 'Dashboard', href: '/admin', end: true },
    { name: 'Data Alat', href: '/admin/instruments' },
    { name: 'Virtual Tour', href: '/admin/tour-spots' },
    { name: 'Konten Halaman', href: '/admin/content' },
    { name: 'Log Aktivitas', href: '/admin/logs' },
    { name: 'Pengguna', href: '/admin/users' },
];

export default function AdminLayout({ children }) {
    const { url, auth, props } = usePage();
    const user = auth?.user ?? props?.user ?? null;
    const adminName = user?.name ?? 'Administrator';
    const flash = props?.flash ?? {};

    const isActive = (href, end = false) => {
        if (end) return url === href;
        return url.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl z-40 hidden md:flex flex-col">
                <div className="px-6 py-6 border-b border-white/10">
                    <span className="font-extrabold text-xl tracking-tight">TamanAlat<span className="text-blue-300">BMKG</span></span>
                    <p className="text-blue-300 text-xs font-medium mt-1">Admin Panel</p>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive(item.href, item.end)
                                    ? 'bg-white/15 text-white shadow-inner'
                                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="px-4 py-4 border-t border-white/10">
                    <Link
                        href={user ? route('logout') : '/'}
                        as={user ? undefined : undefined}
                        method={user ? 'post' : undefined}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-white/10 hover:text-red-200 transition-colors"
                    >
                        Logout
                    </Link>
                </div>
            </nav>

            <div className="md:pl-64">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 sm:px-8 py-4">
                        <div className="md:hidden">
                            <span className="font-extrabold text-lg text-blue-800 tracking-tight">TamanAlat<span className="text-blue-500">BMKG</span></span>
                        </div>
                        <div className="hidden md:flex items-center text-sm text-gray-500">
                            <Link href="/" className="hover:text-blue-600 transition-colors">Lihat Website</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{adminName}</p>
                                <p className="text-xs text-gray-500">{user?.role === 'super' ? 'Super Admin' : 'Editor'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            {user && (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    className="inline-flex items-center rounded-md border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    Logout
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {Object.keys(flash).length > 0 && (
                    <div className="px-4 sm:px-8 mt-4">
                        {flash.success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}

                <main className="px-4 sm:px-8 py-6">{children}</main>
            </div>
        </div>
    );
}