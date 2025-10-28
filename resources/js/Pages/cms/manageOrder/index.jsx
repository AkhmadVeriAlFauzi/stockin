import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { useForm, Head, Link } from '@inertiajs/react';
import Pagination from '../../../Components/Pagination';
import PageHeader from '../../../Components/PageHeader';
import OrdersTable from './Partials/OrdersTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from '@/Components/ui/button';
import { Download, FileText, ArrowLeft, Edit, Eye } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from '@/Components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";


// --- HELPER & SUB-KOMPONEN DARI SHOW.JSX (KITA PINDAH KE SINI) ---
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const formatModalDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { 
    dateStyle: 'full', 
    timeStyle: 'short',
    hourCycle: 'h23'
});

const Badge = ({ status }) => {
    let styleClasses = '';
    switch (status) {
        case 'pending_payment': styleClasses = 'bg-yellow-100 text-yellow-800'; break;
        case 'processing': styleClasses = 'bg-blue-100 text-blue-800'; break;
        case 'shipped': styleClasses = 'bg-indigo-100 text-indigo-800'; break;
        case 'completed': styleClasses = 'bg-green-100 text-green-800'; break;
        case 'cancelled': styleClasses = 'bg-red-100 text-red-800'; break;
        case 'refunded': styleClasses = 'bg-slate-100 text-slate-700'; break;
        default: styleClasses = 'bg-slate-100 text-slate-700';
    }
    const text = (status || 'default').replace('_', ' ');
    return <span className={`capitalize px-2.5 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${styleClasses}`}>{text}</span>;
};

const InfoCard = ({ title, children }) => (
    <Card>
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent className="text-sm">{children}</CardContent>
    </Card>
);

const OrderItemsTable = ({ items }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-[10%]">Qty</TableHead>
                <TableHead className="text-right w-[25%]">Price</TableHead>
                <TableHead className="text-right w-[25%]">Subtotal</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {items?.map(item => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product?.name || 'Product Deleted'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const OrderSummary = ({ subtotal, shippingCost, totalPrice }) => (
    <div className="mt-6 pt-4 border-t flex justify-end">
        <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping:</span><span className="font-semibold">{formatCurrency(shippingCost)}</span></div>
            <div className="flex justify-between text-lg pt-2 border-t"><span>Grand Total:</span><span className="font-bold text-xl">{formatCurrency(totalPrice)}</span></div>
        </div>
    </div>
);
// --- AKHIR DARI SUB-KOMPONEN ---


export default function ManageOrder({ orders, filters, statuses }) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || '',
    });

    // State untuk modal
    const [selectedOrder, setSelectedOrder] = useState(null);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            get('/orders', { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data]);

    // Hitung subtotal & grand total untuk modal
    const modalSubtotal = selectedOrder?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
    const modalGrandTotal = modalSubtotal + Number(selectedOrder?.shipping_cost || 0);

    return (
        <MainLayout title="Manage Orders">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <PageHeader 
                    searchTerm={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    searchPlaceholder="Search by order or customer..."
                >
                    {/* --- PERBAIKAN DI SINI --- */}
                    {/* Kita bungkus kedua elemen ini dalam satu div */}
                    <div className="flex items-center gap-2 ">
                        <Select value={data.status} onValueChange={(value) => setData('status', value === 'all' ? '' : value)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Statues" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statuses.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {/* --- TOMBOL EXPORT (GANTI STYLE) --- */}
                        <Button variant="outline" asChild>
                            <a href={`/orders/export?search=${data.search}&status=${data.status}`}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </a>
                        </Button>
                        {/* --- AKHIR TOMBOL EXPORT --- */}
                    </div>
                    {/* --- AKHIR PERBAIKAN --- */}
                </PageHeader>

                <div className="overflow-x-auto">
                    {/* Kirim handler 'setSelectedOrder' ke tabel */}
                    <OrdersTable orders={orders} onViewOrder={setSelectedOrder} />
                </div>

                <Pagination links={orders.links} />
            </div>

            {/* --- MODAL DETAIL ORDER --- */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-3xl [&>button]:hidden"> {/* <-- Hapus Tombol X */}
                    <DialogHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-2xl">Order #{selectedOrder?.id}</DialogTitle>
                                <DialogDescription>
                                    {selectedOrder ? formatModalDate(selectedOrder.created_at) : '-'}
                                </DialogDescription>
                            </div>
                            <Badge status={selectedOrder?.order_status} />
                        </div>
                    </DialogHeader>
                    
                    {/* Konten Modal (dicopy dari Show.jsx) */}
                    <div className="grid lg:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-3">
                        {/* Kolom Kiri */}
                        <div className="lg:col-span-1 space-y-6">
                            <InfoCard title="Customer">
                                <p className="font-semibold">{selectedOrder?.buyer?.name || 'N/A'}</p>
                                <p className="text-slate-500">{selectedOrder?.buyer?.email || '-'}</p>
                            </InfoCard>
                            <InfoCard title="Shipping Details">
                                <p className="font-semibold">{selectedOrder?.shippingAddress?.address_line_1 || 'No Address'}</p>
                                <p className="text-slate-500">
                                    {selectedOrder?.shippingAddress ? `${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.province} ${selectedOrder.shippingAddress.postal_code}` : '-'}
                                </p>
                                <div className="mt-4 pt-4 border-t">
                                    <p>Courier: <span className="font-semibold">{selectedOrder?.shipping_courier?.toUpperCase() || 'N/A'}</span></p>
                                    <p>Resi: <span className="font-semibold">{selectedOrder?.shipping_resi || 'Not available'}</span></p>
                                </div>
                            </InfoCard>
                        </div>

                        {/* Kolom Kanan */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <OrderItemsTable items={selectedOrder?.items} />
                                    <OrderSummary 
                                        subtotal={modalSubtotal} 
                                        shippingCost={selectedOrder?.shipping_cost} 
                                        totalPrice={modalGrandTotal} 
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    {/* --- Akhir Konten Modal --- */}
                    
                    <DialogFooter className="pt-4 border-t items-end">
                        
                        <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* --- AKHIR MODAL --- */}
        </MainLayout>
    );
}

