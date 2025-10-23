import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome to Stokin" />
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-5xl font-bold text-indigo-600 mb-4">Stokin.</h1>
                    <p className="text-lg text-slate-600 mb-8">
                        Your one-stop solution for food business supplies.
                    </p>
                    <div className="space-x-4">
                        <Link
                            href="/login"
                            className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-slate-50 transition"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}