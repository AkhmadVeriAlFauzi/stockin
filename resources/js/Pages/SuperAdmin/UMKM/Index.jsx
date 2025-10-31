import React, { useState, useEffect, useCallback } from 'react'; // <-- 1. TAMBAH useEffect & useCallback
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react'; 
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Pagination from '@/Components/Pagination';
import { BadgeCheck, Ban, Clock, AlertTriangle} from 'lucide-react'; 
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose, 
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
// --- 2. TAMBAH IMPOR useDebouncedCallback ---
import { useDebouncedCallback } from 'use-debounce';
// ---

// ... (Komponen StatusBadge biarin aja, udah bener) ...
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
    } else if (store.status === 'pending_verification') {
        statusClass = 'bg-orange-100 text-orange-800';
        statusText = 'Pending Approval';
        Icon = AlertTriangle; 
    } else if (store.status === 'inactive') {
        statusClass = 'bg-red-100 text-red-800';
        statusText = 'Suspended';
        Icon = Ban;
    } else {
        statusClass = 'bg-gray-100 text-gray-800';
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


// --- 3. TAMBAH 'filters' DI PROPS ---
export default function Index({ users, filters }) {
    
    // --- 4. SIAPIN STATE BUAT FILTER ---
    const [filterValues, setFilterValues] = useState({
        search: filters.search || '',
        status: filters.status || '',
    });

    // --- 5. FUNGSI KIRIM FILTER (Pake useCallback) ---
    const submitFilters = useCallback(
        (values) => {
            router.get('/manage-umkm', values, { // <-- Pastiin URL ini bener
                preserveState: true,
                replace: true,
            });
        },
        [] // Dependensi kosong, fungsi ini stabil
    );

    // --- 6. BUAT FUNGSI DEBOUNCE ---
    // Ini fungsi yang bakal dipanggil 300ms SETELAH user berhenti ngetik
    const debouncedSubmit = useDebouncedCallback((values) => {
        submitFilters(values);
    }, 300); // <-- Delay 300ms

    // --- 7. UBAH HANDLER ---

    // Handle perubahan input (Search)
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...filterValues, [name]: value };
        setFilterValues(newValues);
        // Panggil fungsi debounce tiap kali ngetik
        debouncedSubmit(newValues);
    };

    // Handle perubahan Select (langsung submit, nggak perlu debounce)
    const handleStatusChange = (value) => {
        const newStatus = value === 'all' ? '' : value;
        const newFilters = { ...filterValues, status: newStatus };
        setFilterValues(newFilters);
        // Select langsung submit aja
        submitFilters(newFilters);
    };

    
    // ... (Handler handleApprove, handleSuspend, handleReactivate udah bener) ...
    const handleApprove = (url) => { router.post(url, {}, { preserveScroll: true }); };
    const handleSuspend = (url) => { router.post(url, {}, { preserveScroll: true }); };
    const handleReactivate = (url) => { router.post(url, {}, { preserveScroll: true }); };


    return (
        <MainLayout title="Manage UMKM">
            <Head title="Manage UMKM" />
            <Card>
                <CardHeader>
                    {/* --- 8. BENERIN HEADER --- */}
                    {/* (Form filter lo salah tempat, harusnya di CardContent) */}
                    <div className="flex justify-between items-center">
                        <CardTitle>UMKM (Users)</CardTitle>
                        <div className="flex gap-2">
                        {/* Status Select */}
                        <Select value={filterValues.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending_verification">Pending Approval</SelectItem>
                                <SelectItem value="inactive">Inactive/Suspended</SelectItem>
                                <SelectItem value="pending_setup">Pending Setup</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {/* Search Input */}
                        <Input
                            type="text"
                            name="search"
                            placeholder="Search by store or owner name..."
                            value={filterValues.search}
                            onChange={handleChange} // <-- onChange sekarang auto-submit
                            className="max-w-xs"
                        />
                        
                    </div> 
                    </div>
                </CardHeader>
                
                {/* --- 9. PINDAHIN FORM FILTER KE SINI --- */}
                <CardContent className="border-t pt-6">
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
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.store?.store_name || <span className="text-slate-400 italic">Belum setup toko</span>}
                                    </TableCell>
                                    <TableCell>
                                        <div>{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge store={user.store} />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        
                                        {user.store ? ( 
                                            <>
                                                {/* --- Tombol View Store (Modal) --- */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-lg">
                                                        <DialogHeader>
                                                            <div className="flex items-center gap-4">
                                                                {user.store.logo_url ? (
                                                                     <img src={user.store.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                                                                ) : (
                                                                     <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">No Logo</div>
                                                                )}
                                                                <div>
                                                                    <DialogTitle className="text-2xl">{user.store.store_name}</DialogTitle>
                                                                    <DialogDescription>
                                                                        Owned by: {user.name} ({user.email})
                                                                    </DialogDescription>
                                                                </div>
                                                            </div>
                                                        </DialogHeader>
                                                        <div className="py-4 space-y-4">
                                                            <div>
                                                                <h4 className="font-semibold text-sm">Address</h4>
                                                                <p className="text-sm text-slate-700">{user.store.address}, {user.store.city}</p>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-sm">Description</h4>
                                                                <p className="text-sm text-slate-700">{user.store.description || <span className="italic text-slate-400">No description provided.</span>}</p>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button type="button" variant="secondary">
                                                                    Close
                                                                </Button>
                                                            </DialogClose>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                {/* --- AKHIR DIALOG VIEW --- */}

                                                {/* --- Tombol Approve (Modal) --- */}
                                                {user.store.status === 'pending_verification' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Approve</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Approve this UMKM?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to approve "{user.store.store_name}"?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction asChild>
                                                                    <Button onClick={() => handleApprove(user.store.approve_url)}>
                                                                        Yes, Approve
                                                                    </Button>
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}

                                                {/* --- Tombol Suspend (Modal) --- */}
                                                {user.store.status === 'active' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">Suspend</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Suspend "{user.store.store_name}"?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will deactivate their store and hide products.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction asChild>
                                                                    <Button onClick={() => handleSuspend(user.store.suspend_url)} className="bg-red-600 hover:bg-red-700">
                                                                        Yes, Suspend
                                                                    </Button>
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}

                                                {/* --- Tombol Reactivate (Modal) --- */}
                                                {user.store.status === 'inactive' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="secondary" size="sm">Reactivate</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Reactivate "{user.store.store_name}"?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will make their store active again.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction asChild>
                                                                    <Button onClick={() => handleReactivate(user.store.reactivate_url)}>
                                                                        Yes, Reactivate
                                                                    </Button>
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </>
                                        ) : (
                                            <Button variant="outline" size="sm" disabled>
                                                (No action)
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination links={users.links} />
                </CardContent>
            </Card>
        </MainLayout>
    );
}