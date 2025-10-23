import React, { useState, useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, router } from '@inertiajs/react'; // <-- Tambahkan router
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Pagination from '@/Components/Pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import CategoryForm from './Partials/CategoryForm';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

export default function Index({ categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (!isModalOpen) {
            reset();
            setEditingCategory(null);
            clearErrors();
        }
    }, [isModalOpen]);

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            // Proses Update dengan URL langsung
            put(`/manage-categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Category updated successfully!');
                },
            });
        } else {
            // Proses Create dengan URL langsung
            post('/manage-categories', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Category created successfully!');
                },
            });
        }
    };

    const handleDelete = (categoryId) => {
        // Proses Delete dengan URL langsung
        router.delete(`/manage-categories/${categoryId}`, {
            onSuccess: () => toast.success('Category deleted successfully!'),
        });
    };

    return (
        <MainLayout title="Manage Categories">
            <Head title="Manage Product Categories" />
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Product Categories</CardTitle>
                        <Button onClick={() => setIsModalOpen(true)}>Add New Category</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell>{categories.from + index}</TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.description || '-'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEditClick(category)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the category.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(category.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination links={categories.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                            <DialogDescription>
                                {editingCategory ? 'Update the details of the category.' : 'Fill in the details for the new category.'}
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm data={data} setData={setData} errors={errors} />
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}