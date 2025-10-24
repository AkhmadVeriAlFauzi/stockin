import React from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { useForm, Head } from '@inertiajs/react';
import Pagination from '../../../Components/Pagination';
import PageHeader from '../../../Components/PageHeader';
import OrdersTable from './Partials/OrdersTable'; // <-- Ganti ke OrdersTable
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";

export default function ManageOrder({ orders, filters, statuses }) { // <-- Ganti 'products' jadi 'orders'
    console.log("DATA ORDERS DARI CONTROLLER:", orders);

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || '',
    });

    const isInitialMount = React.useRef(true);

    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            get('/orders', { preserveState: true, replace: true }); // <-- Ganti ke '/orders'
        }, 300);
        return () => clearTimeout(timer);
    }, [data]);

    return (
        <MainLayout title="Manage Orders">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <PageHeader 
                    searchTerm={data.search}
                    onSearchChange={(e) => setData('search', e.target.value)}
                    searchPlaceholder="Search by order or customer..."
                    // addUrl="/orders/create" // Kita belum buat, jadi dikomen dulu
                    // addText="Add Order"
                >
                <Select value={data.status} onValueChange={(value) => setData('status', value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filters" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map(status => (
                                <SelectItem key={status} value={status}>
                                    {/* Mengubah 'pending_payment' menjadi 'Pending Payment' */}
                                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </PageHeader>

                <div className="overflow-x-auto">
                    <OrdersTable orders={orders} /> {/* <-- Ganti ke OrdersTable & orders */}
                </div>

                <Pagination links={orders.links} /> {/* <-- Ganti ke orders.links */}
            </div>
        </MainLayout>
    );
}