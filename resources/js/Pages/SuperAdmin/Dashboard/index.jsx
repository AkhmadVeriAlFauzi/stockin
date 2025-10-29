// resources/js/Pages/SuperAdmin/Dashboard/index.jsx

import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DollarSign, Store, Users, UserCheck } from 'lucide-react'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount);
};

// --- Komponen StatCard (Kita copy dari dashboard CMS) ---
const StatCard = ({ title, value, icon, description, iconColorClass }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {React.cloneElement(icon, { className: "h-4 w-4 " + iconColorClass })}
        </CardHeader>
        <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

// Custom Tooltip untuk Recharts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border rounded-lg shadow-md text-sm">
                <p className="font-semibold text-gray-700">{label}</p>
                <p className="text-green-600">{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export default function SuperAdminDashboard({ stats, recentStores, salesData }) {
    
    return (
        <MainLayout title="Dashboard Super Admin">
            <Head title="Super Admin Dashboard" />
            
            <div className="space-y-8">
                {/* 1. STATISTIK UTAMA PLATFORM */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Total Pendapatan Platform" 
                        value={formatCurrency(stats.totalPlatformRevenue)}
                        description="Dari semua UMKM yang selesai"
                        icon={<DollarSign />}
                        iconColorClass="text-green-600"
                    />
                    <StatCard 
                        title="Total UMKM Terdaftar" 
                        value={stats.totalStores.toLocaleString('id-ID')}
                        description="Jumlah toko yang sudah setup"
                        icon={<Store />}
                        iconColorClass="text-blue-600"
                    />
                    <StatCard 
                        title="Total Pengguna" 
                        value={stats.totalUsers.toLocaleString('id-ID')}
                        description="Semua role (termasuk admin & user)"
                        icon={<Users />}
                        iconColorClass="text-purple-600"
                    />
                    <StatCard 
                        title="UMKM Perlu Diapprove" 
                        value={stats.pendingUmkm.toLocaleString('id-ID')}
                        description="User UMKM yang belum setup toko"
                        icon={<UserCheck />}
                        iconColorClass="text-yellow-600"
                    />
                </div>

                {/* 2. GRAFIK DAN UMKM BARU (Grid 2 Kolom) */}
                <div className="grid gap-4 lg:grid-cols-5">
                    
                    {/* Grafik Penjualan (3/5 kolom) */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Pendapatan Platform 6 Bulan Terakhir</CardTitle>
                            <CardDescription>Total pendapatan (completed) dari semua UMKM.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis 
                                            stroke="#888888" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false}
                                            tickFormatter={(value) => formatCurrency(value)}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total" fill="#16A34A" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* UMKM Terbaru (2/5 kolom) */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className='space-y-1'>
                                <CardTitle>5 UMKM Terbaru</CardTitle>
                                <CardDescription>Toko yang baru mendaftar/setup.</CardDescription>
                            </div>
                            <Link href="/manage-umkm" className="text-sm text-blue-500 hover:underline">
                                Lihat Semua
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Toko</TableHead>
                                        <TableHead>Pemilik</TableHead>
                                        <TableHead>Tgl. Daftar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentStores.length > 0 ? (
                                        recentStores.map((store) => (
                                            <TableRow key={store.id}>
                                                <TableCell className="font-medium">{store.store_name}</TableCell>
                                                {/* --- PERBAIKAN DI SINI --- */}
                                                {/* Kita tambahin ?. (optional chaining) dan fallback 'N/A' */}
                                                <TableCell>{store.user?.name || 'N/A'}</TableCell>
                                                {/* --- AKHIR PERBAIKAN --- */}
                                                <TableCell>
                                                    {new Date(store.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan="3" className="text-center text-muted-foreground">
                                                Belum ada UMKM yang mendaftar.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}

