import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Pagination from '@/Components/Pagination';
import { Store, Plus, PackageX, Pencil, Trash2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import PageHeader from '@/Components/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { toast } from 'sonner';

// Komponen untuk Halaman Setup Toko
const SetupStore = () => (
    <div className="flex justify-center items-center h-full pt-16">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-indigo-100 p-4 rounded-full w-fit">
                    <Store className="h-10 w-10 text-indigo-600" />
                </div>
                <CardTitle className="mt-4">Welcome! Let's Set Up Your Store</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-600 mb-6">
                    Before you can start adding products, you need to provide some basic information about your store.
                </p>
                <Link href="/store">
                    <Button size="lg">Go to Store Setup</Button>
                </Link>
            </CardContent>
        </Card>
    </div>
);

// Komponen untuk Tabel Produk
const ProductTable = ({ products, categories, filters }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        router.get('/products', { 
            search: debouncedSearchTerm, 
            category: categoryFilter,
        }, { preserveState: true, replace: true });
    }, [debouncedSearchTerm, categoryFilter]);
    
    const handleDelete = (productId) => {
        router.delete(`/products/${productId}`);
    };

    return (
        <Card>
            <PageHeader
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                searchPlaceholder="Search products..."
                addUrl="/products/create"
                addText="Add Product"
            >
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </PageHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products && products.data.length > 0 ? (
                            products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <img 
                                            src={product.image_url ? `${window.location.origin}${product.image_url}` : 'https://via.placeholder.com/150'} 
                                            alt={product.name}
                                            className="h-12 w-12 rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.category?.name || '-'}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/products/${product.id}/edit`}>
                                            <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
                                        </Link>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(product.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="6" className="h-48 text-center">
                                    <PackageX className="h-12 w-12 mx-auto text-slate-300" />
                                    <h3 className="text-lg font-semibold mt-2">No Products Yet</h3>
                                    <p className="text-sm text-slate-500">Click "Add Product" to get started.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {products && products.data.length > 0 && <Pagination links={products.links} />}
            </CardContent>
        </Card>
    );
};

// Komponen Utama
export default function Index({ needsSetup, products, categories, filters }) {
    return (
        <MainLayout title={needsSetup ? "Setup Store" : "Manage Products"}>
            <Head title={needsSetup ? "Setup Store" : "Manage Products"} />
            
            {needsSetup ? (
                <SetupStore />
            ) : (
                <ProductTable products={products} categories={categories} filters={filters} />
            )}
            
        </MainLayout>
    );
}