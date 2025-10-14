import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Pencil, Trash2, PackageX } from 'lucide-react';
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

const Badge = ({ color, children }) => ( <span className={`capitalize px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${{green: 'bg-green-100 text-green-800', gray: 'bg-slate-100 text-slate-700'}[color]}`}>{children}</span> );

const ProductTableRow = ({ product, onDeleteClick }) => (
    <TableRow key={product.id}>
        <TableCell className="px-6"><img className="h-10 w-10 rounded-md object-cover" src={product.image_url || 'https://via.placeholder.com/150'} alt={product.name} /></TableCell>
        <TableCell className="px-6">
            <div className="font-medium text-slate-900">{product.name}</div>
            <div className="text-sm text-muted-foreground">{product.sku}</div>
        </TableCell>
        <TableCell className="px-6 text-sm text-slate-600">
            {product.category?.name || '-'}
        </TableCell>
        <TableCell className="px-6">{product.stock}</TableCell>
        <TableCell className="px-6">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}</TableCell>
        <TableCell className="px-6"><Badge color={product.status === 'active' ? 'green' : 'gray'}>{product.status === 'active' ? 'Published' : 'Archived'}</Badge></TableCell>
        <TableCell className="px-6 text-right">
            <div className="flex justify-end space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/products/${product.id}/edit`}><Pencil className="w-4 h-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={onDeleteClick}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </TableCell>
    </TableRow>
);

export default function ProductsTable({ products }) {
    const [productToDelete, setProductToDelete] = useState(null);

    const handleDeleteConfirm = () => {
        if (!productToDelete) return;
        router.delete(`/products/${productToDelete.id}`, {
            onSuccess: () => setProductToDelete(null),
        });
    };

    return (
        <>
            <Table>
                {/* 👇 HEADER HARUS SELALU ADA DI SINI, DI LUAR KONDISI 👇 */}
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] px-6">Foto</TableHead>
                        <TableHead className="px-6">Product Name</TableHead>
                        <TableHead className="px-6">Category</TableHead>
                        <TableHead className="px-6">Stock</TableHead>
                        <TableHead className="px-6">Price</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                        <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                {/* 👇 KONDISI HANYA UNTUK ISI DARI TABLE BODY 👇 */}
                <TableBody>
                    {products.data.length > 0 ? (
                        products.data.map(product => ( 
                            <ProductTableRow 
                                key={product.id} 
                                product={product} 
                                onDeleteClick={() => setProductToDelete(product)} 
                            /> 
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="7" className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <PackageX className="w-12 h-12 text-slate-400 mb-3" />
                                    <h3 className="text-lg font-medium text-slate-800">Tidak Ada Produk</h3>
                                    <p className="text-sm text-slate-500 mt-1">Belum ada data produk untuk ditampilkan.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <AlertDialog open={!!productToDelete} onOpenChange={(isOpen) => !isOpen && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk
                            <span className="font-bold"> "{productToDelete?.name}"</span> secara permanen.
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