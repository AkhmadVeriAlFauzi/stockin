// resources/js/Pages/Auth/Register.jsx

import React, { useEffect } from 'react';
import AuthLayout from '@/Layouts/AuthLayout'; // <-- 1. Ubah import dari GuestLayout
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        // <-- 2. Ubah komponen jadi AuthLayout
        <AuthLayout> 
            <Head title="Register" />

            <form onSubmit={handleSubmit}>
                {/* ... isi form tidak berubah ... */}

                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={data.name} className="mt-1 block w-full" autoComplete="name" autoFocus onChange={(e) => setData('name', e.target.value)} required />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" value={data.email} className="mt-1 block w-full" autoComplete="username" onChange={(e) => setData('email', e.target.value)} required />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" name="password" value={data.password} className="mt-1 block w-full" autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} required />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} className="mt-1 block w-full" autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} required />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Link href="/login" className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Already registered?
                    </Link>
                    <Button className="ms-4" disabled={processing}>
                        Register
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}