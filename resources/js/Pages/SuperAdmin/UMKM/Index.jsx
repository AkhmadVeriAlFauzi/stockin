import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Pagination from '@/Components/Pagination';

// Komponen kecil untuk menampilkan status dengan warna
const StatusBadge = ({ status }) => {
    const statusClass = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700';
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusClass}`}>
            {status}
        </span>
    );
};

export default function Index({ stores }) {
    return (
        <MainLayout title="Manage UMKM">
            <Head title="Manage UMKM" />
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>UMKM (Stores)</CardTitle>
                        {/* Tombol ini belum berfungsi */}
                        <Button disabled>Add New UMKM</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Store Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Registered At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stores.data.map((store) => (
                                <TableRow key={store.id}>
                                    <TableCell className="font-medium">{store.store_name}</TableCell>
                                    <TableCell>
                                        <div>{store.user.name}</div>
                                        <div className="text-sm text-slate-500">{store.user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={store.status} />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(store.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {/* Tombol-tombol ini juga belum berfungsi */}
                                        <Button variant="outline" size="sm">View</Button>
                                        <Button variant="destructive" size="sm">Suspend</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination links={stores.links} />
                </CardContent>
            </Card>
        </MainLayout>
    );
}