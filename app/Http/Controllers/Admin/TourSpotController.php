<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TourSpot;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TourSpotController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/TourSpots', [
            'tourSpots' => TourSpot::orderBy('order')->orderBy('id')->get(),
            'instruments' => \App\Models\Instrument::where('status', 'aktif')->get(['id', 'name', 'category', 'pitch', 'yaw']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        if ($request->hasFile('image_path')) {
            $data['image_path'] = $request->file('image_path')->store('tour_spots', 'public');
        }

        $spot = TourSpot::create($data);

        ActivityLogger::record('create', TourSpot::class, $spot->id, "Menambahkan titik tur '{$spot->name}'");

        return redirect()->route('admin.tour-spots')->with('success', 'Titik tur berhasil ditambahkan.');
    }

    public function update(Request $request, TourSpot $tourSpot)
    {
        $data = $this->validateData($request);

        if ($request->hasFile('image_path')) {
            $this->deleteStoredFile($tourSpot->image_path);
            $data['image_path'] = $request->file('image_path')->store('tour_spots', 'public');
        }

        $tourSpot->update($data);

        ActivityLogger::record('update', TourSpot::class, $tourSpot->id, "Mengubah titik tur '{$tourSpot->name}'");

        return redirect()->route('admin.tour-spots')->with('success', 'Titik tur berhasil diperbarui.');
    }

    public function destroy(TourSpot $tourSpot)
    {
        $name = $tourSpot->name;
        $this->deleteStoredFile($tourSpot->image_path);
        $tourSpot->delete();

        ActivityLogger::record('delete', TourSpot::class, $tourSpot->id, "Menghapus titik tur '{$name}'");

        return redirect()->route('admin.tour-spots')->with('success', 'Titik tur berhasil dihapus.');
    }

    public function publish(TourSpot $tourSpot)
    {
        $tourSpot->update([
            'is_published' => ! $tourSpot->is_published,
        ]);

        ActivityLogger::record('update', TourSpot::class, $tourSpot->id, $tourSpot->is_published
            ? "Mempublikasikan titik tur '{$tourSpot->name}'"
            : "Menarik titik tur '{$tourSpot->name}'");

        return redirect()->route('admin.tour-spots')->with('success', 'Status publikasi diperbarui.');
    }

    protected function validateData(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_published' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:20480',
        ]);
    }

    protected function deleteStoredFile(?string $path): void
    {
        if ($path && str_starts_with($path, 'tour_spots')) {
            Storage::disk('public')->delete($path);
        }
    }
}