import React, { useState } from 'react';
import MainLayout from '../../../Layouts/MainLayout'; // Sesuai struktur lo
import { Link, useForm, Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import InputError from '@/Components/InputError';
import { toast } from 'sonner';

export default function EditProduct({ categories, product }) {
    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        category_id: String(product.category_id) || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        image: null,
        _method: 'PUT',
        status: product.status || 'active',
        sku: product.sku || '', // Jangan lupa tambahkan sku
    });

    const [imagePreview, setImagePreview] = useState(
        product.image_url ? `${window.location.origin}${product.image_url}` : null
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/products/${product.id}`, {
            onSuccess: () => {
                toast.success('Product updated successfully!');
            },
            // Redirect diurus oleh backend, kita cukup handle notif di sini
        });
    };

    return (
        <MainLayout title="Edit Produk">
            <Head title={`Edit - ${product.name}`} />
            <div className="max-w-4xl mx-auto py-8">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Product</CardTitle>
                            <CardDescription>Update the details for "{product.name}".</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Kolom Kiri */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>
                                <div>
                                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                                    <Input id="sku" value={data.sku} onChange={(e) => setData('sku', e.target.value)} />
                                    <InputError message={errors.sku} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">Price (IDR)</Label>
                                        <Input id="price" type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} />
                                        <InputError message={errors.price} />
                                    </div>
                                    <div>
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input id="stock" type="number" value={data.stock} onChange={(e) => setData('stock', e.target.value)} />
                                        <InputError message={errors.stock} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select onValueChange={(value) => setData('category_id', value)} value={data.category_id}>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                        <SelectContent>{categories.map(category => (<SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <InputError message={errors.category_id} />
                                </div>
                            </div>

                            {/* Kolom Kanan */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} className="min-h-[150px]" />
                                    <InputError message={errors.description} />
                                </div>
                                <div>
                                    <Label htmlFor="image">New Product Image (Optional)</Label>
                                    {imagePreview && <img src={imagePreview} alt="Image Preview" className="mt-2 w-full h-40 object-cover rounded-md" />}
                                    <Input id="image" type="file" onChange={handleImageChange} className="mt-2" />
                                    <InputError message={errors.image} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-4">
                            <Button variant="outline" asChild>
                                <Link href="/products">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Product'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </MainLayout>
    );
}