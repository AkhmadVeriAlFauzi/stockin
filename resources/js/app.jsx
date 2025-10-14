// resources/js/app.jsx

import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  title: title => `Stokin - ${title}`,
  
  resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  
  // PERUBAHAN UTAMA ADA DI FUNGSI 'setup' INI
  setup({ el, App, props }) {
    const root = createRoot(el);
    const page = props.initialPage.component;

    // Logikanya: Jika komponen halaman punya property 'layout',
    // bungkus halaman (<App>) dengan layout tersebut.
    // Jika tidak, tampilkan halaman saja.
    root.render(
      page.layout 
        ? page.layout(<App {...props} />) 
        : <App {...props} />
    );
  },
  
  progress: {
    color: '#4B5563',
  },
});