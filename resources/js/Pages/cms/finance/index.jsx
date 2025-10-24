import React, { useState } from 'react'; // Diimpor untuk modal nanti
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import Pagination from '@/Components/Pagination';
import { DollarSign, Package, Wallet, Eye } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const StatCard = ({ title, value, icon, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function Index({ stats, transactions }) {
    const [selectedOrder, setSelectedOrder] = useState(null);

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
                        title="Pendapatan Bulan Ini" 
                        value={formatCurrency(stats.revenueThisMonth)}
                        description={`Per tanggal ${new Date().toLocaleDateString('id-ID')}`}
                        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                    />
                </div>

                {/* Bagian Tabel Transaksi Terbaru */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaksi Terakhir</CardTitle>
                    </CardHeader>
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
                                        // ===== BAGIAN INI DIPERBAIKI =====
                                        // Link yang membungkus TableRow dihapus
                                        <TableRow key={trx.id}>
                                            <TableCell className="font-medium">#{trx.id}</TableCell>
                                            <TableCell>{trx.buyer?.name || 'N/A'}</TableCell>
                                            <TableCell>{new Date(trx.created_at).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(trx.total_price)}</TableCell>
                                            <TableCell className="text-right">
                                                {/* Cukup satu Link di sini */}
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(trx)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        // ================================
                                    ))
                                ) : (
                                    <TableRow>
                                        {/* ColSpan disesuaikan menjadi 5 karena ada 5 kolom */}
                                        <TableCell colSpan="5" className="text-center h-24">
                                            Belum ada transaksi yang selesai.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {transactions.data.length > 0 && <Pagination links={transactions.links} className="mt-4" />}
                    </CardContent>
                </Card>
            </div>

            {/* Komponen Modal */}
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