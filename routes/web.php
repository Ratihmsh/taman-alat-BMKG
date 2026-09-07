<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\InstrumentController as AdminInstrumentController;
use App\Http\Controllers\Admin\PageContentController;
use App\Http\Controllers\Admin\TourSpotController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $contents = \App\Models\PageContent::all()->pluck('value', 'key');

    \App\Models\PageVisit::create(['page' => '/']);

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'contents' => $contents,
    ]);
});

Route::get('/virtual-tour', function () {
    $spot = \App\Models\TourSpot::where('is_published', true)
        ->orderBy('order')
        ->orderBy('id')
        ->first();

    \App\Models\PageVisit::create(['page' => '/virtual-tour']);

    return Inertia::render('VirtualTour', [
        'tourSpot' => $spot,
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Panel
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('instruments', [AdminInstrumentController::class, 'index'])->name('instruments');
    Route::post('instruments', [AdminInstrumentController::class, 'store']);
    Route::put('instruments/{instrument}', [AdminInstrumentController::class, 'update']);
    Route::delete('instruments/{instrument}', [AdminInstrumentController::class, 'destroy']);
    Route::patch('instruments/{instrument}/toggle', [AdminInstrumentController::class, 'toggle']);

    Route::get('tour-spots', [TourSpotController::class, 'index'])->name('tour-spots');
    Route::post('tour-spots', [TourSpotController::class, 'store']);
    Route::put('tour-spots/{tourSpot}', [TourSpotController::class, 'update']);
    Route::delete('tour-spots/{tourSpot}', [TourSpotController::class, 'destroy']);
    Route::patch('tour-spots/{tourSpot}/publish', [TourSpotController::class, 'publish']);

    Route::get('content', [PageContentController::class, 'index'])->name('content');
    Route::put('content', [PageContentController::class, 'update']);

    Route::get('logs', [ActivityLogController::class, 'index'])->name('logs');

    Route::get('users', [AdminUserController::class, 'index'])->name('users');
    Route::post('users', [AdminUserController::class, 'store']);
    Route::delete('users/{user}', [AdminUserController::class, 'destroy']);
    Route::patch('users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::post('users/{user}/reset-password', [AdminUserController::class, 'resetPassword']);
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
