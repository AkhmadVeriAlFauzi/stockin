import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react'; // <-- Import Link
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Pagination from '@/Components/Pagination';
import { BadgeCheck, Ban, Clock } from 'lucide-react'; // <-- Import ikon baru

// Komponen StatusBadge (DIPERBARUI)
// Sekarang dia nerima object 'store' (yang bisa jadi null)
const StatusBadge = ({ store }) => {
    let statusClass, statusText, Icon;

    if (!store) {
        statusClass = 'bg-yellow-100 text-yellow-800';
        statusText = 'Pending Setup';
        Icon = Clock;
    } else if (store.status === 'active') {
        statusClass = 'bg-green-100 text-green-800';
        statusText = 'Active';
        Icon = BadgeCheck;
    } else {
        // Asumsi status lainnya (misal 'suspended', 'inactive')
        statusClass = 'bg-red-100 text-red-800';
        statusText = store.status;
        Icon = Ban;
    }
    
    return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusClass}`}>
            <Icon className="w-3 h-3 mr-1.5" />
            {statusText}
        </span>
    );
};

// Ganti prop 'stores' jadi 'users'
export default function Index({ users }) {
    return (
        <MainLayout title="Manage UMKM">
            <Head title="Manage UMKM" />
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>UMKM (Users)</CardTitle>
                        {/* Tombol ini belum berfungsi */}
                        <Button disabled>Add New UMKM</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Store Name</TableHead>
                                <TableHead>Owner (User)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>User Registered</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Ganti 'stores.data' jadi 'users.data' */}
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {/* Pake optional chaining '?.', beri fallback jika store null */}
                                        {user.store?.store_name || <span className="text-slate-400 italic">Belum setup toko</span>}
                                    </TableCell>
                                    <TableCell>
                                        {/* Data user sekarang jadi data utama */}
                                        <div>{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        {/* Kirim seluruh object 'store' (yg bisa null) ke badge */}
                                        <StatusBadge store={user.store} />
                                    </TableCell>
                                    <TableCell>
                                        {/* Pake 'user.created_at' sebagai tgl daftar user */}
                                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {/* Logika untuk tombol: bedakan yg sudah punya toko & yg belum */}
                                        {user.store ? (
                                            <>
                                                {/* Nanti ini bisa jadi link ke /manage-umkm/{store.id} */}
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/manage-umkm/${user.store.id}/edit`}>View Store</Link>
                                                </Button>
                                                <Button variant="destructive" size="sm">Suspend</Button>
                                            </>
                                        ) : (
                                            <Button variant="outline" size="sm">
                                                Send Reminder
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {/* Ganti 'stores.links' jadi 'users.links' */}
                    <Pagination links={users.links} />
                </CardContent>
            </Card>
        </MainLayout>
    );
}
