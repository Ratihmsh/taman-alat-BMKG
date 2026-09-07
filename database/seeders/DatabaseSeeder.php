<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Instrument;
use App\Models\TourSpot;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PageContentSeeder::class,
        ]);

        User::updateOrCreate(
            ['email' => 'admin@bmkg.go.id'],
            [
                'name' => 'Administrator',
                'email' => 'admin@bmkg.go.id',
                'password' => Hash::make('password'),
                'role' => 'super',
            ]
        );

        $categories = [
            ['name' => 'Meteorologi', 'description' => 'Alat pengamatan unsur meteorologi.'],
            ['name' => 'Klimatologi', 'description' => 'Alat pengamatan unsur iklim.'],
            ['name' => 'Geofisika', 'description' => 'Alat pengamatan fenomena geofisika.'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['name' => $category['name']], $category);
        }

        $instruments = [
            [
                'name' => 'Termometer Ruang',
                'description' => 'Mengukur suhu udara di dalam sangkar meteorologi.',
                'function' => 'Mengukur suhu udara sekitar.',
                'working_principle' => 'Mengandalkan pemuaian zat cair (alkohol/air raksa) akibat perubahan suhu.',
                'category' => 'Meteorologi',
                'status' => 'aktif',
            ],
            [
                'name' => 'Barometer Digital',
                'description' => 'Mengukur tekanan udara atmosfer.',
                'function' => 'Mengukur tekanan udara.',
                'working_principle' => 'Sensor tekanan digital mengubah tekanan udara menjadi sinyal listrik.',
                'category' => 'Meteorologi',
                'status' => 'aktif',
            ],
            [
                'name' => 'Anemometer',
                'description' => 'Mengukur kecepatan dan arah angin.',
                'function' => 'Mengukur kecepatan angin.',
                'working_principle' => 'Baling-baling berputar sebanding dengan kecepatan angin.',
                'category' => 'Meteorologi',
                'status' => 'aktif',
            ],
            [
                'name' => 'Hygrometer',
                'description' => 'Mengukur kelembapan udara.',
                'function' => 'Mengukur kelembapan relatif udara.',
                'working_principle' => 'Menggunakan prinsip rambut manusia yang memuai saat udara lembap.',
                'category' => 'Klimatologi',
                'status' => 'aktif',
            ],
            [
                'name' => 'Seismometer',
                'description' => 'Mencatat getaran tanah akibat gempa bumi.',
                'function' => 'Merekam aktivitas seismik.',
                'working_principle' => 'Massa pendulum yang diam merekam gerakan tanah relatif terhadap kerangka.',
                'category' => 'Geofisika',
                'status' => 'aktif',
            ],
        ];

        foreach ($instruments as $instrument) {
            Instrument::updateOrCreate(['name' => $instrument['name']], $instrument);
        }

        TourSpot::updateOrCreate(
            ['name' => 'Area Utama Taman Alat'],
            [
                'name' => 'Area Utama Taman Alat',
                'description' => 'Pemandangan 360° area utama Taman Alat BMKG.',
                'is_published' => true,
                'order' => 1,
                'image_path' => 'https://pannellum.org/images/alma.jpg',
            ]
        );
    }
}