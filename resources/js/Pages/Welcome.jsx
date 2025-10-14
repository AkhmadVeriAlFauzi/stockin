// resources/js/Pages/Welcome.jsx

import React from 'react';
// import MainLayout from '../Layouts/MainLayout'; 

export default function Welcome({ appName, phpVersion }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-black text-gray-800 mb-2">
          🚀 {appName}
        </h1>
        <p className="text-gray-600 mb-6">
          Selamat datang di setup Laravel, Inertia, React & Tailwind CSS!
        </p>

        <div className="bg-indigo-50 text-indigo-800 rounded-lg p-4">
          <p>Versi PHP kamu saat ini: <strong>{phpVersion}</strong></p>
        </div>
      </div>
    </main>
  );
}
// Welcome.layout = page => <MainLayout children={page} title="Home" />