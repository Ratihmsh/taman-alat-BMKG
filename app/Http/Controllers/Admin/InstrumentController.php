<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instrument;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InstrumentController extends Controller
{
    public function index(Request $request)
    {
        $instruments = Instrument::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Admin/Instruments', [
            'instruments' => $instruments,
            'filters' => [
                'search' => $request->search ?? '',
                'category' => $request->category ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        if ($request->hasFile('image_path')) {
            $data['image_path'] = $request->file('image_path')->store('instruments', 'public');
        }
        if ($request->hasFile('audio_path')) {
            $data['audio_path'] = $request->file('audio_path')->store('instruments/audio', 'public');
        }

        $instrument = Instrument::create($data);

        ActivityLogger::record('create', Instrument::class, $instrument->id, "Menambahkan alat '{$instrument->name}'");

        return redirect()->route('admin.instruments')->with('success', 'Alat berhasil ditambahkan.');
    }

    public function update(Request $request, Instrument $instrument)
    {
        $data = $this->validateData($request);

        if ($request->hasFile('image_path')) {
            $this->deleteStoredFile($instrument->image_path);
            $data['image_path'] = $request->file('image_path')->store('instruments', 'public');
        }
        if ($request->hasFile('audio_path')) {
            $this->deleteStoredFile($instrument->audio_path);
            $data['audio_path'] = $request->file('audio_path')->store('instruments/audio', 'public');
        }

        $instrument->update($data);

        ActivityLogger::record('update', Instrument::class, $instrument->id, "Mengubah alat '{$instrument->name}'");

        return redirect()->route('admin.instruments')->with('success', 'Alat berhasil diperbarui.');
    }

    public function destroy(Instrument $instrument)
    {
        $name = $instrument->name;
        $this->deleteStoredFile($instrument->image_path);
        $this->deleteStoredFile($instrument->audio_path);
        $instrument->delete();

        ActivityLogger::record('delete', Instrument::class, $instrument->id, "Menghapus alat '{$name}'");

        return redirect()->route('admin.instruments')->with('success', 'Alat berhasil dihapus.');
    }

    public function toggle(Instrument $instrument)
    {
        $instrument->update([
            'status' => $instrument->status === 'aktif' ? 'nonaktif' : 'aktif',
        ]);

        ActivityLogger::record('update', Instrument::class, $instrument->id, "Mengubah status alat '{$instrument->name}'");

        return redirect()->route('admin.instruments')->with('success', 'Status alat diperbarui.');
    }

    protected function validateData(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'function' => 'nullable|string',
            'working_principle' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'status' => 'nullable|in:aktif,nonaktif',
            'pitch' => 'nullable|numeric',
            'yaw' => 'nullable|numeric',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'audio_path' => 'nullable|file|mimes:mp3,wav,ogg,m4a|max:20480',
        ]);
    }

    protected function deleteStoredFile(?string $path): void
    {
        if ($path && str_starts_with($path, 'instruments')) {
            Storage::disk('public')->delete($path);
        }
    }
}