<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InstrumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Instrument::create([
            'name' => 'Alat Pengukur Curah Hujan (Ombrometer)',
            'description' => 'Berfungsi untuk mengukur jumlah curah hujan yang turun dalam periode tertentu.',
            'category' => 'Hidrologi',
            'image_path' => null,
            'audio_path' => null,
            'pitch' => 5,
            'yaw' => 150,
        ]);

        \App\Models\Instrument::create([
            'name' => 'Anemometer',
            'description' => 'Alat untuk mengukur kecepatan dan arah angin.',
            'category' => 'Meteorologi',
            'image_path' => null,
            'audio_path' => null,
            'pitch' => -10,
            'yaw' => 220,
        ]);
    }
}
