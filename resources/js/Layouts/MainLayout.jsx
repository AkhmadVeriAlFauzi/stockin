import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, ShoppingCart, Info, Wallet, Settings, UserCircle, LogOutIcon, StoreIcon } from 'lucide-react';
import { Toaster } from '@/Components/ui/sonner';

// === Komponen NavLink ===
function NavLink({ href, active, children, icon: Icon }) {
    const commonClasses = 'flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150';
    const activeClasses = 'bg-indigo-50 text-indigo-600 font-semibold';
    const inactiveClasses = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    
    return (
        <Link href={href} className={`${commonClasses} ${active ? activeClasses : inactiveClasses}`}>
            {Icon && <Icon className="w-5 h-5 mr-3 flex-shrink-0" />}
            <span className="truncate">{children}</span>
        </Link>
    );
}

// === Komponen Sidebar ===
function Sidebar() {
    const { url } = usePage();
    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/products', label: 'Product', icon: Package },
        { href: '/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/store', label: 'Store Info', icon: StoreIcon },
        { href: '/finance', label: 'Finance', icon: Wallet },
        { href: '/profile', label: 'Profile', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col fixed h-full">
            <div className="px-3 mb-8">
                <Link href="/" className="text-2xl font-bold text-indigo-600">Stokin.</Link>
            </div>
            <nav className="flex-1 flex flex-col space-y-2">
                {navLinks.map((link) => {
                    const isActive = url === link.href || (link.href !== '/' && url.startsWith(link.href));
                    return (
                        <NavLink key={link.label} href={link.href} active={isActive} icon={link.icon}>
                            {link.label}
                        </NavLink>
                    );
                })}
            </nav>
            <div className="mt-auto">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex items-center space-x-1 px-2 py-1 hover:bg-red-100 rounded-md w-full text-left cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <LogOutIcon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="flex-1 truncate">
                        <p className="font-semibold text-slate-800 text-sm">Logout</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}

// === Komponen Header (VERSI AMAN) ===
function Header({ title }) {
    const { auth } = usePage().props;

    return (
        <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 py-4 px-8 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-slate-800">
                {title || 'Page'}
            </h1>
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 truncate">
                    <p className="font-semibold text-slate-800 text-sm">{auth.user?.name || 'Guest User'}</p>
                    {auth.user && <p className="text-xs text-slate-500">Admin</p>}
                </div>
            </div>
        </header>
    );
}

// === Komponen Layout Utama ===
export default function MainLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                <Header title={title} />
                <main className="p-8">
                    {children}
                </main>
            </div>
            <Toaster richColors position="top-right" />
        </div>
    );
}