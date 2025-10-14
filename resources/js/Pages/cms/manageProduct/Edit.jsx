import React from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { Link, useForm, Head } from '@inertiajs/react';
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';

const InputError = ({ message }) => {
    return message ? <p className="text-sm text-red-600 mt-1">{message}</p> : null;
};

export default function EditProduct({ categories, product }) {
    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        category_id: String(product.category_id) || '', // Pastikan jadi string untuk Select
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        image: null,
        _method: 'PUT', // Trik Inertia untuk file upload pada method PUT
        status: product.status || 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // PERBAIKAN DI SINI: Ganti route() dengan URL string
        post(`/products/${product.id}`); 
    };

    return (
        <MainLayout>
            <Head title={`Edit - ${product.name}`} />
            <div className="max-w-2xl mx-auto py-12">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Product</CardTitle>
                            <CardDescription>Update the details for "{product.name}".</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Product Name */}
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                <InputError message={errors.name} />
                            </div>

                            {/* Product Image */}
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="image">New Product Image (Optional)</Label>
                                <Input id="image" type="file" onChange={(e) => setData('image', e.target.files[0])} />
                                <InputError message={errors.image} />
                                {data.image ? (
                                    <img src={URL.createObjectURL(data.image)} alt="New Preview" className="w-32 h-32 mt-4 object-cover rounded-md" />
                                ) : (
                                    product.image_url && <img src={product.image_url} alt="Current Image" className="w-32 h-32 mt-4 object-cover rounded-md" />
                                )}
                            </div>

                            {/* Category */}
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="category_id">Category</Label>
                                <Select onValueChange={(value) => setData('category_id', value)} value={data.category_id}>
                                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                    <SelectContent>{categories.map(category => ( <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem> ))}</SelectContent>
                                </Select>
                                <InputError message={errors.category_id} />
                            </div>

                            {/* ... sisa form lain (description, price, stock) ... */}
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="grid w-full items-center gap-1.5"><Label htmlFor="price">Price (IDR)</Label><Input id="price" type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} /><InputError message={errors.price} /></div>
                                <div className="grid w-full items-center gap-1.5"><Label htmlFor="stock">Stock</Label><Input id="stock" type="number" value={data.stock} onChange={(e) => setData('stock', e.target.value)} /><InputError message={errors.stock} /></div>
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label>Status</Label>
                                <RadioGroup
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                    // 👇 PERUBAHAN UTAMA CUMA DI SINI 👇
                                    className="flex items-center space-x-6 pt-2" 
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="active" id="r1" />
                                        <Label htmlFor="r1" className="font-normal cursor-pointer">
                                            Published
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="archived" id="r2" />
                                        <Label htmlFor="r2" className="font-normal cursor-pointer">
                                            Archived
                                        </Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors.status} />
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end space-x-4">
                            <Button variant="outline" asChild>
                                {/* PERBAIKAN DI SINI: Ganti route() dengan URL string */}
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