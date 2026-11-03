<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/virtual-tour', function () {
    return Inertia::render('VirtualTour');
});

Route::get('/informasi-alat', function (\Illuminate\Http\Request $request) {
    $instruments = \App\Models\Instrument::all();
    return Inertia::render('InformasiAlat', [
        'instruments' => $instruments,
        'selectedId' => $request->query('id') ? (int) $request->query('id') : null,
    ]);
})->name('informasi-alat');

Route::get('/informasi-alat/{id}', function ($id) {
    $instruments = \App\Models\Instrument::all();
    return Inertia::render('InformasiAlat', [
        'instruments' => $instruments,
        'selectedId' => (int) $id,
    ]);
});

Route::get('/detail-kerja-alat', function (\Illuminate\Http\Request $request) {
    $instruments = \App\Models\Instrument::all();
    $id = $request->query('id') ? (int) $request->query('id') : null;
    $instrument = $id ? \App\Models\Instrument::find($id) : $instruments->first();

    return Inertia::render('DetailKerjaAlat', [
        'instrument' => $instrument ?: $instruments->first(),
        'instruments' => $instruments,
    ]);
})->name('detail-kerja-alat');

Route::get('/detail-kerja-alat/{id}', function ($id) {
    $instruments = \App\Models\Instrument::all();
    $instrument = \App\Models\Instrument::find((int) $id) ?: $instruments->first();

    return Inertia::render('DetailKerjaAlat', [
        'instrument' => $instrument ?: $instruments->first(),
        'instruments' => $instruments,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
