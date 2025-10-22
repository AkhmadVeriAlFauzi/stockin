import React from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Button } from '@/Components/ui/button';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Daftarkan komponen-komponen Chart.js yang akan kita pakai
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Helper untuk format mata uang
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

// --- Sub-Komponen ---

const StatCard = ({ title, value, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const SalesChart = ({ salesData }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Pendapatan' },
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    const data = {
        labels: salesData.map(d => new Date(d.x).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
        datasets: [
            {
                label: 'Pendapatan',
                data: salesData.map(d => d.y),
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
            },
        ],
    };

    return <Bar options={options} data={data} />;
};

const RecentTransactions = ({ transactions }) => (
    <Card>
        <CardHeader>
            <CardTitle>Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length > 0 ? transactions.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>{order.buyer?.name || 'N/A'}</TableCell>
                            <TableCell>{new Date(order.created_at).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(order.total_price)}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan="4" className="h-24 text-center">
                                Belum ada transaksi.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const PeriodFilter = ({ activePeriod }) => {
    const periods = [
        { key: 'last_7_days', label: '7 Hari' },
        { key: 'last_30_days', label: '30 Hari' },
        { key: 'this_month', label: 'Bulan Ini' },
        { key: 'last_month', label: 'Bulan Lalu' },
    ];

    const handleFilterChange = (period) => {
        router.get('/finance', { period }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <div className="flex items-center space-x-2">
            {periods.map(period => (
                <Button
                    key={period.key}
                    variant={activePeriod === period.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange(period.key)}
                >
                    {period.label}
                </Button>
            ))}
        </div>
    );
};


// --- Komponen Utama Halaman Finance ---
export default function FinancePage({ stats, salesData, recentTransactions, filters }) {
    return (
        <MainLayout title="Finance Report">
            <Head />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    {/* <h1 className="text-2xl font-bold">Finance Report</h1> */}
                    <PeriodFilter activePeriod={filters.period} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard 
                        title="Total Pendapatan" 
                        value={formatCurrency(stats.total_revenue)} 
                        description="Dari semua order yang selesai"
                    />
                    <StatCard 
                        title="Order Selesai" 
                        value={stats.total_orders} 
                        description="Jumlah order yang sudah completed"
                    />
                    <StatCard 
                        title="Rata-rata Order" 
                        value={formatCurrency(stats.average_order_value)} 
                        description="Rata-rata nilai per transaksi"
                    />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <Card>
                            <CardContent className="pt-6">
                                <SalesChart salesData={salesData} />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <RecentTransactions transactions={recentTransactions} />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}