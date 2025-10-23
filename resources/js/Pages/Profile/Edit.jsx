import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit() {
    return (
        <MainLayout title="Profile">
            <Head title="Profile" />

            <div className="py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Nanti bisa tambah form update info profile di sini */}
                    <UpdatePasswordForm />
                </div>
            </div>
        </MainLayout>
    );
}