<?php
// app/Http/Controllers/WelcomeController.php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class WelcomeController extends Controller
{
    public function show()
    {
        return Inertia::render('Welcome', [
            'appName' => config('app.name'),
            'phpVersion' => PHP_VERSION
        ]);
    }
}