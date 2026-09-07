<?php

namespace Database\Seeders;

use App\Models\PageContent;
use Illuminate\Database\Seeder;

class PageContentSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'hero' => [
                'hero_label' => 'Mengenal Cuaca Lebih Dekat dengan',
                'hero_title' => 'Taman Alat BMKG',
                'hero_highlight' => 'Platform Edukasi Digital',
                'hero_subtitle' => 'Platform edukasi digital yang memberikan pengalaman imersif untuk mengeksplorasi berbagai instrumen meteorologi, klimatologi, dan geofisika.',
                'hero_cta_explore' => 'Mulai Eksplorasi 360°',
                'hero_cta_about' => 'Pelajari Lebih Lanjut',
            ],
            'about' => [
                'about_title' => 'Tentang Taman Alat',
                'about_heading' => 'Pusat Observasi Cuaca & Iklim',
                'about_text1' => 'Taman Alat BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) adalah area observasi terbuka yang dirancang khusus untuk meletakkan berbagai instrumen pengukur unsur-unsur cuaca dan iklim secara akurat dan terstandarisasi.',
                'about_text2' => 'Melalui website ini, kami bertujuan untuk mendekatkan ilmu meteorologi kepada masyarakat, pelajar, dan akademisi dengan menghadirkan simulasi kunjungan nyata melalui teknologi Virtual Reality 360 derajat.',
                'about_image_alt' => 'Gambar Stasiun BMKG',
            ],
            'facilities' => [
                'facility_1_title' => 'Tinjauan 360°',
                'facility_1_desc' => 'Jelajahi seluruh area taman alat seolah-olah Anda berada di lokasi secara langsung dengan kontrol penuh.',
                'facility_2_title' => 'Informasi Detail Alat',
                'facility_2_desc' => 'Klik pada instrumen mana pun untuk melihat nama, fungsi, gambar detail, dan cara kerja alat tersebut.',
                'facility_3_title' => 'Panduan Audio',
                'facility_3_desc' => 'Dengarkan narasi suara yang menjelaskan spesifikasi dan kegunaan setiap alat untuk kemudahan edukasi.',
            ],
            'footer' => [
                'footer_tagline' => 'Menyajikan informasi instrumen klimatologi dan meteorologi yang akurat dan mudah diakses untuk seluruh kalangan.',
                'footer_address' => 'Jl. Contoh Alamat BMKG No. 123, Jakarta, Indonesia',
                'footer_email' => 'info@bmkg.go.id',
                'footer_phone' => '+62 21 1234 5678',
            ],
        ];

        foreach ($defaults as $group => $items) {
            foreach ($items as $key => $value) {
                PageContent::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'group' => $group]
                );
            }
        }
    }
}