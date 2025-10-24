import React, { useEffect } from 'react'; // Import digabung jadi satu
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Wallet, 
    Settings, 
    UserCircle, 
    LogOutIcon, 
    Store, 
    LayoutGrid, 
    Shapes,
    Users
} from 'lucide-react';
import { Toaster } from '@/Components/ui/sonner'; // toast juga di-import
import { toast } from "sonner";

// === Komponen NavLink (Tidak berubah) ===
function NavLink({ href, active, children, icon: Icon }) {
    // ... kode NavLink lo udah bener
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

// === Komponen Sidebar (Tidak berubah) ===
function Sidebar() {
    // ... kode Sidebar lo udah bener
    const { url, props } = usePage();
    const { auth } = props;
    const userRole = auth.user?.role;
    const superAdminLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { href: '/manage-umkm', label: 'Manage UMKM', icon: Users },
        { href: '/manage-categories', label: 'Categories', icon: Shapes },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];
    const umkmAdminLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/products', label: 'Product', icon: Package },
        { href: '/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/store', label: 'Store Info', icon: Store },
        { href: '/finance', label: 'Finance', icon: Wallet },
    ];
    let navLinks = userRole === 'superadmin' ? superAdminLinks : umkmAdminLinks;
    return (
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col fixed h-full">
            <div className="px-3 mb-8">
                <Link href="/" className="text-2xl font-bold text-indigo-600">Stokin.</Link>
            </div>
            <nav className="flex-1 flex flex-col space-y-2">
                {navLinks.map((link) => {
                    const isActive = link.href === '/dashboard' ? url === '/dashboard' : url.startsWith(link.href);
                    return (
                        <NavLink key={link.label} href={link.href} active={isActive} icon={link.icon}>
                            {link.label}
                        </NavLink>
                    );
                })}
            </nav>
            <div className="mt-auto">
                <NavLink href="/profile" active={url.startsWith('/profile')} icon={UserCircle}>Profile</NavLink>
                <div className="border-t my-2"></div>
                <Link href="/logout" method="post" as="button" className="flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 text-slate-600 hover:bg-red-50 hover:text-red-600">
                    <LogOutIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Logout</span>
                </Link>
            </div>
        </aside>
    );
}

// === Komponen Header (Tidak berubah) ===
function Header({ title }) {
    // ... kode Header lo udah bener
    const { auth } = usePage().props;
    return (
        <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 py-4 px-8 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-slate-800">{title || 'Page'}</h1>
            <div className="flex items-center space-x-3">
                <div className="text-right">
                    <p className="font-semibold text-slate-800 text-sm">{auth.user?.name || 'Guest User'}</p>
                    {auth.user && <p className="text-xs text-slate-500 capitalize">{auth.user.role.replace('_', ' ')}</p>}
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-slate-500" />
                </div>
            </div>
        </header>
    );
}

// === Komponen Layout Utama (INI YANG DIPERBAIKI) ===
export default function MainLayout({ children, title }) {
    const { flash } = usePage().props;

    // "Pendengar" notifikasi dari backend
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

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