import React from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Edit, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

// Helper & Komponen kecil bisa dipindah ke file sendiri nanti jika perlu
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { dateStyle: 'full' });
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

// --- Sub-Komponen Spesialis untuk Halaman Detail Order ---

const PageActions = ({ orderId }) => (
    <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
            <Link href="/orders"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
        </Button>
        <div className="flex gap-2">
            <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> Invoice</Button>
            <Button asChild>
                <Link href={`/orders/${orderId}/edit`}><Edit className="w-4 h-4 mr-2" /> Edit Order</Link>
            </Button>
        </div>
    </div>
);

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

// --- Komponen Utama: ShowOrder (Sekarang jadi 'Sutradara') ---

export default function ShowOrder({ order }) {
    const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

    const grandTotal = subtotal + Number(order.shipping_cost || 0);

    return (
        <MainLayout title="Detail Order">
            <div className="max-w-4xl mx-auto py-12">
                <PageActions orderId={order.id} />

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri */}
                    <div className="lg:col-span-1 space-y-6">
                        <InfoCard title="Customer">
                            <p className="font-semibold">{order.buyer?.name || 'N/A'}</p>
                            <p className="text-slate-500">{order.buyer?.email || '-'}</p>
                        </InfoCard>
                        <InfoCard title="Shipping Details">
                            <p className="font-semibold">{order.shippingAddress?.address_line_1 || 'No Address'}</p>
                            <p className="text-slate-500">
                                {order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postal_code}` : '-'}
                            </p>
                            <div className="mt-4 pt-4 border-t">
                                <p>Courier: <span className="font-semibold">{order.shipping_courier?.toUpperCase() || 'N/A'}</span></p>
                                <p>Resi: <span className="font-semibold">{order.shipping_resi || 'Not available'}</span></p>
                            </div>
                        </InfoCard>
                    </div>

                    {/* Kolom Kanan */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                                        <CardDescription>{formatDate(order.created_at)}</CardDescription>
                                    </div>
                                    <Badge status={order.order_status} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <OrderItemsTable items={order.items} />
                                <OrderSummary subtotal={subtotal} shippingCost={order.shipping_cost} totalPrice={grandTotal} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}