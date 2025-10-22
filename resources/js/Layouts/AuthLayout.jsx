// resources/js/Layouts/AuthLayout.jsx

import React from 'react';
import { Link } from '@inertiajs/react';

// Ganti nama function dari GuestLayout jadi AuthLayout
export default function AuthLayout({ children }) { 
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <div>
                <Link href="/">
                    <h1 className="text-4xl font-bold text-indigo-600">Stokin.</h1>
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}