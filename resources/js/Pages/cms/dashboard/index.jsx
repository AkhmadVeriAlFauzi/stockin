// resources/js/Pages/cms/Dashboard/Index.jsx

import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DollarSign, Package, ShoppingBag, Clock } from 'lucide-react'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount);
};

// --- Komponen StatCard (Sama seperti yang lo suka, tapi ditambah warna) ---
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

export default function DashboardIndex({ stats, recentOrders, salesData }) {
    
    // Jika user belum punya toko, tampilkan pesan
    if (!stats || Object.keys(stats).length === 0) {
        return (
            <MainLayout title="Dashboard Toko">
                <Head title="Dashboard" />
                <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
                    <h2 className="text-2xl font-semibold mb-4">Toko Belum Terdaftar!</h2>
                    <p className="text-muted-foreground mb-6 text-center">
                        Kamu perlu mendaftarkan tokomu dulu untuk melihat dashboard.
                    </p>
                    {/* Gantilah ini dengan link ke halaman setup toko lo */}
                    <Link href="/store/setup">
                        <button className="bg-primary text-white px-4 py-2 rounded-lg">
                            Setup Toko Sekarang
                        </button>
                    </Link>
                </div>
            </MainLayout>
        );
    }
    
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

    return (
        <MainLayout title="Dashboard Toko">
            <Head title="Dashboard" />
            
            <div className="space-y-8">
                {/* 1. STATISTIK UTAMA */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Total Pendapatan" 
                        value={formatCurrency(stats.totalRevenue)}
                        description={`Pendapatan bulan ini: ${formatCurrency(stats.revenueThisMonth)}`}
                        icon={<DollarSign />}
                        iconColorClass="text-green-600"
                    />
                    <StatCard 
                        title="Total Orders" 
                        value={stats.totalOrders.toLocaleString('id-ID')}
                        description="Jumlah keseluruhan pesanan"
                        icon={<ShoppingBag />}
                        iconColorClass="text-blue-600"
                    />
                    <StatCard 
                        title="Produk Terdaftar" 
                        value={stats.totalProducts.toLocaleString('id-ID')}
                        description="Jumlah produk yang aktif dijual"
                        icon={<Package />}
                        iconColorClass="text-purple-600"
                    />
                    <StatCard 
                        title="Pesanan Menunggu" 
                        value={stats.pendingOrders.toLocaleString('id-ID')}
                        description="Perlu segera diproses/dicek"
                        icon={<Clock />}
                        iconColorClass="text-red-600"
                    />
                </div>

                {/* 2. GRAFIK DAN TRANSAKSI BARU (Grid 2 Kolom) */}
                <div className="grid gap-4 lg:grid-cols-5">
                    
                    {/* Grafik Penjualan (3/5 kolom) */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Penjualan 6 Bulan Terakhir</CardTitle>
                            <CardDescription>Total pendapatan per bulan.</CardDescription>
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

                    {/* Transaksi Terbaru (2/5 kolom) */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>5 Transaksi Terbaru</CardTitle>
                                <CardDescription>Pesanan terbaru dari tokomu.</CardDescription>
                            </div>
                            <Link href="/orders" className="text-sm text-blue-500 hover:underline">
                                Lihat Semua
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pembeli</TableHead>
                                        <TableHead>Jumlah</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.buyer.name}</TableCell>
                                                <TableCell>{formatCurrency(order.total_price)}</TableCell>
                                                <TableCell>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                        order.order_status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        order.order_status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {order.order_status.replace('_', ' ')}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan="3" className="text-center text-muted-foreground">
                                                Belum ada pesanan masuk.
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