import React, { useState, useEffect, useRef } from 'react'; // <-- 1. Tambahkan useRef
import MainLayout from '../../../Layouts/MainLayout';
import { Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import Pagination from '../../../Components/Pagination';
import { useDebounce } from 'use-debounce';
import ProductsTable from './Partials/ProductsTable';
import PageHeader from '../../../Components/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";

export default function ManageProduct({ products, filters, categories }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    // 2. Buat "penanda" untuk render pertama
    const isInitialMount = useRef(true);

    useEffect(() => {
        // 3. Logika "penjaga":
        // Jika ini adalah render pertama, jangan lakukan apa-apa,
        // cukup ubah penandanya jadi false dan keluar.
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Efek ini sekarang HANYA akan mengirim request
        // setelah render pertama selesai.
        router.get('/products', { 
            search: debouncedSearchTerm, 
            category: categoryFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    }, [debouncedSearchTerm, categoryFilter]); // <-- Dependency tetap sama
    
    return (
        <MainLayout title="Manage Products">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <PageHeader 
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    searchPlaceholder="Search products by name"
                    addUrl="/products/create"
                    addText="Add Product"
                >
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filters" />
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
                
                <div className="overflow-x-auto">
                    <ProductsTable products={products} />
                </div>

                <Pagination links={products.links} />
            </div>
        </MainLayout>
    );
}