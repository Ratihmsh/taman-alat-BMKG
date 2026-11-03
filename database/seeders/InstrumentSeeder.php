<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Instrument;

class InstrumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Instrument::truncate();

        $instruments = [
            [
                'name' => 'Sangkar Meteorologi',
                'category' => 'Klimatologi & Suhu',
                'description' => "Bangunan kayu berbentuk rumah kecil bergisi-gisi yang dicat putih, dirancang khusus untuk melindungi peralatan termometer dari radiasi sinar matahari langsung dan hujan.\n\nFungsi:\nTempat meletakkan alat pengukur suhu dan kelembapan udara agar hasil pengukurannya akurat serta mewakili kondisi udara sekitar secara netral.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => 32.2,
                'yaw' => -36.3,
            ],
            [
                'name' => 'Psychrometer Standar',
                'category' => 'Kelembapan Udara',
                'description' => "Rangkaian dua termometer (termometer bola basah dan termometer bola kering) yang dipasang berdampingan di dalam sangkar meteorologi.\n\nFungsi:\nMengukur kelembapan relatif (relative humidity) dan titik embun udara berdasarkan selisih suhu bola kering dan bola basah.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => 32.7,
                'yaw' => 19.1,
            ],
            [
                'name' => 'High Volume Air Sampler (HV Sampler)',
                'category' => 'Kualitas Udara',
                'description' => "Alat pengambil sampel udara berukuran besar yang menyedot udara luar dalam jumlah banyak melewati kertas filter khusus selama periode tertentu.\n\nFungsi:\nMengukur tingkat konsentrasi debu/partikulat halus (seperti PM10 atau PM2.5) di udara untuk analisis kualitas udara.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => -30.8,
                'yaw' => -67.5,
            ],
            [
                'name' => 'Pyranometer',
                'category' => 'Radiasi Matahari',
                'description' => "Instrumen sensorik berbentuk kubah kaca bening dengan pelat penyerap di dalamnya yang ditempatkan di area terbuka.\n\nFungsi:\nMengukur total intensitas radiasi matahari (baik radiasi langsung maupun radiasi terhambur) yang jatuh pada permukaan datar.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => 34.8,
                'yaw' => -12.3,
            ],
            [
                'name' => 'Panci Penguapan (Open Pan Evaporimeter)',
                'category' => 'Hidrologi & Evaporasi',
                'description' => "Panci logam berukuran besar berbentuk silinder terbuka yang diisi air dan dilengkapi dengan alat pengukur tinggi permukaan air (hook gauge) serta termometer air.\n\nFungsi:\nMengukur laju penguapan air (evaporation rate) secara langsung di udara terbuka dalam jangka waktu tertentu (biasanya harian).",
                'image_path' => '/images/panci_penguapan.png',
                'audio_path' => null,
                'pitch' => -8.2,
                'yaw' => 23.5,
            ],
            [
                'name' => 'Anemometer (Otomatis dan Manual)',
                'category' => 'Angin & Kecepatan',
                'description' => "Alat pengukur cuaca yang umumnya terdiri dari baling-baling/mangkuk (cup) yang berputar mengelilingi poros vertikal, serta penunjuk arah angin (wind vane).\n\nFungsi:\nMengukur kecepatan dan arah angin. Versi manual memerlukan pencatatan langsung oleh pengamat, sedangkan versi otomatis mencatat data kecepatan angin secara terus-menerus ke dalam data logger.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => 13.4,
                'yaw' => -89.4,
            ],
            [
                'name' => 'Campbell Stokes',
                'category' => 'Penyinaran Matahari',
                'description' => "Alat berbentuk bola kaca pejal yang berfungsi sebagai lensa cembung fokus untuk membiaskan sinar matahari ke kertas pias khusus di bawahnya.\n\nFungsi:\nMengukur durasi atau lama penyinaran matahari (sunshine duration) dalam sehari berdasarkan jejak gosong/terbakar pada kertas pias.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => -0.1,
                'yaw' => 53.0,
            ],
            [
                'name' => 'Automatic Rain Gauge (ARG) / Penakar Hujan Otomatis',
                'category' => 'Curah Hujan Otomatis',
                'description' => "Alat penakar curah hujan otomatis yang umumnya menggunakan mekanisme tipping bucket (jungkitan) atau weighing sensor di dalam corong penampungnya.\n\nFungsi:\nMengukur volume dan intensitas curah hujan secara real-time dan merekam datanya secara otomatis tanpa perlu pengamatan manual.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => -8.5,
                'yaw' => -75.9,
            ],
            [
                'name' => 'Stasiun Cuaca Otomatis / Automatic Weather Station (AWS)',
                'category' => 'Observasi Otomatis',
                'description' => "Sistem terpadu gabungan dari berbagai sensor meteorologi (suhu, kelembapan, tekanan, angin, curah hujan, dll.) yang terhubung ke unit data logger dan pemancar data otomatis.\n\nFungsi:\nMemantau, mengumpulkan, dan mengirimkan berbagai parameter cuaca secara otomatis, terintegrasi, dan terus-menerus dari jarak jauh (real-time monitoring).",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => -10.9,
                'yaw' => 74.6,
            ],
            [
                'name' => 'Ombrometer',
                'category' => 'Curah Hujan Manual',
                'description' => "Alat penakar hujan konvensional (manual) berbentuk silinder/tabung dengan corong penampung air di bagian atasnya.\n\nFungsi:\nMengukur jumlah curah hujan harian secara manual dengan cara mengukur volume air yang tertampung menggunakan gelas ukur berskala.",
                'image_path' => null,
                'audio_path' => null,
                'pitch' => 27.7,
                'yaw' => 42.1,
            ],
        ];

        foreach ($instruments as $data) {
            Instrument::create($data);
        }
    }
}
