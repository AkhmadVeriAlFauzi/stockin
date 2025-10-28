import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Pencil, Trash2, PackageX, Eye } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";


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
    return <span className={`capitalize px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${styleClasses}`}>{text}</span>;
};

// --- PERUBAHAN DI SINI ---
const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Ganti opsinya untuk menyertakan jam
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23' // Format 24 jam
    };
    // Ganti .toLocaleDateString menjadi .toLocaleString
    return new Date(dateString).toLocaleString('id-ID', options);
};
// --- AKHIR PERUBAHAN ---

// Terima prop 'onViewOrder'
const OrderTableRow = ({ order, onDeleteClick, onViewOrder }) => (
    <TableRow key={order.id}>
        <TableCell className="px-6 font-medium text-indigo-600">#{order.id}</TableCell>
        <TableCell className="px-6">{order.buyer?.name || 'N/A'}</TableCell>
        {/* Kolom ini sekarang akan menampilkan jam */}
        <TableCell className="px-6 text-slate-500">{formatDate(order.created_at)}</TableCell>
        <TableCell className="px-6 text-center">{order.items_count}</TableCell>
        <TableCell className="px-6">{(order.shipping_courier?.toUpperCase()) || '-'}</TableCell>
        <TableCell className="px-6">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_price)}</TableCell>
        <TableCell className="px-6"><Badge status={order.order_status} /></TableCell>
        <TableCell className="px-6 text-right">
            <div className="flex justify-end space-x-2">
                {/* Ganti Link jadi Button onClick */}
                <Button variant="ghost" size="icon" onClick={() => onViewOrder(order)}>
                    <Eye className="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/orders/${order.id}/edit`}><Pencil className="w-4 h-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={onDeleteClick}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </TableCell>
    </TableRow>
);

// Terima prop 'onViewOrder' dan teruskan ke 'OrderTableRow'
export default function OrdersTable({ orders, onViewOrder }) {
    const [orderToDelete, setOrderToDelete] = useState(null);

    const handleDeleteConfirm = () => {
        if (!orderToDelete) return;
        router.delete(`/orders/${orderToDelete.id}`, {
            onSuccess: () => setOrderToDelete(null),
        });
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-6">Order ID</TableHead>
                        <TableHead className="px-6">Customer</TableHead>
                        <TableHead className="px-6">Date</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead className="px-6">Courier</TableHead>
                        <TableHead className="px-6">Total</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                        <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.data.length > 0 ? (
                        orders.data.map(order => (
                            <OrderTableRow
                                key={order.id}
                                order={order}
                                onDeleteClick={() => setOrderToDelete(order)}
                                onViewOrder={onViewOrder} // <-- teruskan prop di sini
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="8" className="h-24 text-center px-6">
                                <div className="flex flex-col items-center justify-center">
                                    <PackageX className="w-12 h-12 text-slate-400 mb-3" />
                                    <h3 className="text-lg font-medium text-slate-800">No Orders Found</h3>
                                    <p className="text-sm text-slate-500 mt-1">There are no orders to display yet.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <AlertDialog open={!!orderToDelete} onOpenChange={(isOpen) => !isOpen && setOrderToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus order
                            <span className="font-bold"> #{orderToDelete?.id}</span> secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

