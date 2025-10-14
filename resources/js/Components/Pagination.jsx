import React from 'react';
import {
    Pagination as PaginationContainer,
    PaginationContent,
    PaginationItem,
} from "@/Components/ui/pagination"; // <-- Kita hanya butuh ini dari ui/pagination
import { buttonVariants } from "@/Components/ui/button"; // <-- Kita "curi" stylenya dari sini
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links = [] }) {
    if (links.length < 3) {
        return null;
    }

    return (
        <PaginationContainer className="my-4">
            <PaginationContent>
                {links.map((link, index) => {
                    const isFirst = index === 0;
                    const isLast = index === links.length - 1;
                    const isPageNumber = !isFirst && !isLast;

                    // Buat tombol Previous
                    if (isFirst) {
                        return (
                            <PaginationItem key="prev">
                                <Link
                                    href={link.url || '#'}
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "default" }),
                                        "gap-1 pl-2.5",
                                        !link.url && "cursor-not-allowed text-slate-400"
                                    )}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className='font-normal'>Previous</span>
                                </Link>
                            </PaginationItem>
                        );
                    }

                    // Buat tombol Next
                    if (isLast) {
                        return (
                            <PaginationItem key="next">
                                <Link
                                    href={link.url || '#'}
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "default" }),
                                        "gap-1 pr-2.5",
                                        !link.url && "cursor-not-allowed text-slate-400"
                                    )}
                                >
                                    <span className='font-normal'>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </PaginationItem>
                        );
                    }

                    // Buat tombol Angka
                    if (isPageNumber) {
                        return (
                            <PaginationItem key={index}>
                                <Link
                                    href={link.url}
                                    className={cn(
                                        buttonVariants({
                                            variant: link.active ? "outline" : "ghost",
                                            size: "icon",
                                        })
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </PaginationItem>
                        );
                    }
                    
                    return null;
                })}
            </PaginationContent>
        </PaginationContainer>
    );
}