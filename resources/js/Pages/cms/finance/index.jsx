import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import Pagination from '@/Components/Pagination';
// 1. TAMBAHKAN IKON DOWNLOAD DI SINI
import { DollarSign, Package, Wallet, Eye, Download } from 'lucide-react'; 
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount);
};

const StatCard = ({ title, value, icon, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
}));

export default function Index({ stats, transactions, filters }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(filters.month.toString());
    const [selectedYear, setSelectedYear] = useState(filters.year.toString());

    const handleFilterApply = () => {
        router.get('/finance', {
            month: selectedMonth,
            year: selectedYear,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <MainLayout title="Finance Dashboard">
            <Head title="Finance" />
            <div className="space-y-6">
                {/* Bagian Kartu Statistik */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard 
                        title="Total Pendapatan" 
                        value={formatCurrency(stats.totalRevenue)}
                        description="Dari semua pesanan yang selesai"
                        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatCard 
                        title="Pesanan Selesai" 
                        value={stats.totalOrdersCompleted}
                        description="Jumlah total pesanan yang lunas"
                        icon={<Package className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatCard 
                        title={`Pendapatan ${stats.periodName}`}
                        value={formatCurrency(stats.revenueForPeriod)}
                        description={`Data untuk periode ${stats.periodName}`}
                        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                    />
                </div>

                {/* Bagian Filter (Tetap Sama) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Laporan</CardTitle>
                        <CardDescription>Lihat data transaksi untuk periode tertentu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <Label htmlFor="month">Bulan</Label>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger id="month">
                                        <SelectValue placeholder="Pilih bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(month => (
                                            <SelectItem key={month.value} value={month.value.toString()}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 w-full">
                                <Label htmlFor="year">Tahun</Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger id="year">
                                        <SelectValue placeholder="Pilih tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(year => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilterApply} className="w-full md:w-auto">Terapkan</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Bagian Tabel Transaksi (sudah difilter) */}
                <Card>
                    {/* 2. BAGIAN INI DI-UPDATE */}
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Transaksi Terakhir ({stats.periodName})</CardTitle>
                            <CardDescription>Daftar transaksi yang sudah selesai pada periode ini.</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <a href={`/finance/export?month=${filters.month}&year=${filters.year}`}>
                                <Download className="h-4 w-4 mr-2" />
                                Export ke Excel
                            </a>
                        </Button>
                    </CardHeader>
                    {/* --------------------------- */}
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Pembeli</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((trx) => (
                                        <TableRow key={trx.id}>
                                            <TableCell className="font-medium">#{trx.id}</TableCell>
                                            <TableCell>{trx.buyer?.name || 'N/A'}</TableCell>
                                            <TableCell>{new Date(trx.created_at).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(trx.total_price)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(trx)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="5" className="text-center h-24">
                                            Tidak ada transaksi selesai pada periode ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {transactions.data.length > 0 && <Pagination links={transactions.links} className="mt-4" />}
                    </CardContent>
                </Card>
            </div>

            {/* Komponen Modal (tetap sama) */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Order #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            {new Date(selectedOrder?.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-semibold">Pembeli:</div>
                        <div>{selectedOrder?.buyer?.name || 'N/A'}</div>
                        <div className="font-semibold">Alamat Pengiriman:</div>
                        <div>{selectedOrder?.shippingAddress?.full_address || 'Alamat tidak tersedia.'}</div>
                    </div>

                    <div className="py-2 space-y-2">
                        <h4 className="font-semibold">Items Dipesan:</h4>
                        <div className="bg-slate-50 p-3 rounded-md border">
                            {selectedOrder?.items?.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span>{item.product?.name || 'Produk Dihapus'} <span className="text-slate-500">x{item.quantity}</span></span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            )) || <div>Tidak ada item.</div>}
                        </div>
                    </div>
                    
                    <div className="py-2 space-y-1 border-t pt-4">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal Items:</span>
                            <span>{formatCurrency((selectedOrder?.total_price || 0) - (selectedOrder?.shipping_cost || 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Ongkos Kirim:</span>
                            <span>{formatCurrency(selectedOrder?.shipping_cost || 0)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold mt-2">
                            <span>Grand Total:</span>
                            <span>{formatCurrency(selectedOrder?.total_price || 0)}</span>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}