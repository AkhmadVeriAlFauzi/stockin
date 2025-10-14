import React from 'react';
import { Link } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Search, Plus } from 'lucide-react';

export default function PageHeader({ 
    title, 
    actions, 
    searchTerm, 
    onSearchChange, 
    searchPlaceholder = "Search...", // Default placeholder
    addUrl, 
    addText,
    children
}) {
    return (
        <div className="p-4 border-b border-slate-200 bg-white rounded-t-lg flex items-center justify-between gap-4">
            {/* Search Bar di Kiri */}
            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="pl-10"
                    />
                </div>
                {/* Slot untuk filter tambahan (seperti kategori) */}
                {children}
            </div>

            {/* Tombol Aksi di Kanan */}
            <div className="flex items-center gap-2">
                {addUrl && addText && (
                    <Button asChild>
                        <Link href={addUrl}>
                            <Plus className="w-4 h-4 mr-2" />
                            {addText}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}