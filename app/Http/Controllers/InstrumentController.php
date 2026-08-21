<?php

namespace App\Http\Controllers;

use App\Models\Instrument;
use Illuminate\Http\Request;

class InstrumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instruments = Instrument::all();
        return response()->json($instruments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'image_path' => 'nullable|string',
            'audio_path' => 'nullable|string',
            'pitch' => 'nullable|numeric',
            'yaw' => 'nullable|numeric',
        ]);

        $instrument = Instrument::create($validated);
        return response()->json($instrument, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Instrument $instrument)
    {
        return response()->json($instrument);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Instrument $instrument)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'image_path' => 'nullable|string',
            'audio_path' => 'nullable|string',
            'pitch' => 'nullable|numeric',
            'yaw' => 'nullable|numeric',
        ]);

        $instrument->update($validated);
        return response()->json($instrument);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Instrument $instrument)
    {
        $instrument->delete();
        return response()->json(null, 204);
    }
}
