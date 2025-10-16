import React from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { useForm, Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
// import route from 'ziggy-js'; // <-- 1. HAPUS BARIS INI

export default function EditOrder({ order, statuses }) {
    const { data, setData, post, processing, errors } = useForm({
        order_status: order.order_status || '',
        shipping_resi: order.shipping_resi || '',
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // 2. UBAH BAGIAN INI: dari route() jadi string URL manual
        post(`/orders/${order.id}`, {
            preserveScroll: true,
        });
    };

    const titleCase = (str) => {
        if (!str) return '';
        return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <MainLayout title="Edit Order">
            <div className="max-w-2xl mx-auto py-12">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Order</CardTitle>
                            <CardDescription>
                                Update status and tracking for Order #{order.id} for customer <span className="font-semibold">{order.buyer?.name}</span>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Order Status Dropdown */}
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="order_status">Order Status</Label>
                                <Select
                                    id="order_status"
                                    value={data.order_status}
                                    onValueChange={(value) => setData('order_status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(status => (
                                            <SelectItem key={status} value={status}>
                                                {titleCase(status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.order_status} />
                            </div>

                            {/* Shipping Resi Input */}
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="shipping_resi">Tracking Number (Resi)</Label>
                                <Input
                                    id="shipping_resi"
                                    value={data.shipping_resi}
                                    onChange={(e) => setData('shipping_resi', e.target.value)}
                                    placeholder="e.g., JN0012345678"
                                />
                                <InputError message={errors.shipping_resi} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                {/* 3. UBAH BAGIAN INI: dari route() jadi string URL manual */}
                                <Link href={`/orders`}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </MainLayout>
    );
}