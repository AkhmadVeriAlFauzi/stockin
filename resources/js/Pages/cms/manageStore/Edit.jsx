import React, { useState, useRef } from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { useForm, Head } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

// Komponen LogoUploader (dari kode lo, sudah bagus)
const LogoUploader = ({ logoPreview, currentLogoUrl, onLogoChange, error }) => {
    const fileInputRef = useRef();
    const defaultLogo = 'https://via.placeholder.com/160'; // Placeholder jika tidak ada logo

    return (
        <div className="md:col-span-1 space-y-2 flex flex-col items-center">
            <Label className="text-center">Store Logo</Label>
            <div 
                className="w-40 h-40 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group relative"
                onClick={() => fileInputRef.current.click()}
            >
                <img 
                    src={logoPreview || currentLogoUrl || defaultLogo} 
                    alt="Logo Preview" 
                    className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">Change Logo</p>
                </div>
            </div>
            <Input id="logo" type="file" ref={fileInputRef} onChange={onLogoChange} className="hidden" />
            <Button type="button" variant="link" size="sm" onClick={() => fileInputRef.current.click()}>
                Choose a file
            </Button>
            <InputError message={error} />
        </div>
    );
};

// Komponen Form Detail (sudah ditambahkan 'city')
const StoreDetailsForm = ({ data, setData, errors }) => (
    <div className="md:col-span-2 space-y-4">
        <div>
            <Label htmlFor="store_name">Store Name</Label>
            <Input id="store_name" value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} />
            <InputError message={errors.store_name} />
        </div>
        <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
            <InputError message={errors.address} />
        </div>
        <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
            <InputError message={errors.city} />
        </div>
        <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="min-h-[100px]" value={data.description} onChange={(e) => setData('description', e.target.value)} />
            <InputError message={errors.description} />
        </div>
    </div>
);

// Komponen Utama (sudah diupdate)
export default function EditStore({ store }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        store_name: store.store_name || '',
        description: store.description || '',
        address: store.address || '',
        city: store.city || '',
        logo: null,
        _method: 'PUT', // Penting untuk routing update
    });
    const [logoPreview, setLogoPreview] = useState(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/store', {
            // Karena ada file upload, Inertia otomatis handle FormData
            onSuccess: () => {
                reset('logo');
                setLogoPreview(null);
            },
            preserveScroll: true,
        });
    };

    return (
        <MainLayout title="Manage Store">
            <div className="max-w-4xl mx-auto py-8">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                            <CardDescription>Update your store's profile and settings here.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <LogoUploader 
                                logoPreview={logoPreview}
                                currentLogoUrl={store.logo_url}
                                onLogoChange={handleLogoChange}
                                error={errors.logo}
                            />
                            <StoreDetailsForm 
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end">
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