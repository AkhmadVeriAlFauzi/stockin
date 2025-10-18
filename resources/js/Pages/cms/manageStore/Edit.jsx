import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../../Layouts/MainLayout';
import { useForm, Head } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

// --- Komponen Aktor #1: LogoUploader (VERSI UPGRADE) ---
const LogoUploader = ({ logoPreview, currentLogoUrl, onLogoChange, error }) => {
    const fileInputRef = useRef();

    return (
        <div className="md:col-span-1 space-y-2 flex flex-col items-center">
            <Label className="text-center">Store Logo</Label>
            
            <div 
                className="w-40 h-40 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group relative"
                onClick={() => fileInputRef.current.click()}
            >
                <img 
                    src={logoPreview || currentLogoUrl || 'https://via.placeholder.com/160'} 
                    alt="Logo Preview" 
                    className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">Change Logo</p>
                </div>
            </div>
            
            <Input 
                id="logo" 
                type="file" 
                ref={fileInputRef} 
                onChange={onLogoChange} 
                className="hidden" 
            />

            <Button type="button" variant="link" size="sm" onClick={() => fileInputRef.current.click()}>
                Choose a file
            </Button>
            
            <InputError message={error} />
        </div>
    );
};

// --- Komponen Aktor #2: StoreDetailsForm ---
const StoreDetailsForm = ({ data, setData, errors }) => (
    <div className="md:col-span-2 space-y-3">
        <div><Label htmlFor="name">Store Name</Label><Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} /><InputError message={errors.name} /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} /><InputError message={errors.email} /></div>
        <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} /><InputError message={errors.phone} /></div>
        <div><Label htmlFor="address">Address</Label><Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} /><InputError message={errors.address} /></div>
        <div><Label htmlFor="description">Description</Label><Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} /><InputError message={errors.description} /></div>
    </div>
);


// --- Komponen Sutradara: EditStore ---
export default function EditStore({ store }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: store.name || '',
        email: store.email || '',
        phone: store.phone || '',
        address: store.address || '',
        description: store.description || '',
        logo: null,
        _method: 'PUT',
    });
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => { if (flash && flash.success) { toast.success(flash.success); } }, [flash]);

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
            onSuccess: () => {
                reset('logo');
                setLogoPreview(null);
            },
            preserveScroll: true,
        });
    };

    return (
        <MainLayout>
            <Head title="Store Information" />
            <div className="">
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