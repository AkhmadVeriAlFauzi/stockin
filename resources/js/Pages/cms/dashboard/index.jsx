import React from 'react';
import MainLayout from '../../../Layouts/MainLayout'; 

export default function Dashboard() {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
      <h1 className="text-4xl font-black text-gray-800 mb-2">
        📊 Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        Selamat datang di dashboard aplikasi!
      </p>
    </div>
  );
}

Dashboard.layout = page => <MainLayout children={page} title="Dashboard" />