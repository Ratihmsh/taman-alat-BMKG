<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    public function show(Request $request)
    {
        $adm4 = $request->query('adm4', config('services.bmkg.adm4', '31.71.03.1001'));

        $data = Cache::remember('bmkg_weather_' . $adm4, 300, function () use ($adm4) {
            try {
                $response = Http::timeout(10)
                    ->acceptJson()
                    ->get('https://api.bmkg.go.id/publik/prakiraan-cuaca', [
                        'adm4' => $adm4,
                    ]);

                if ($response->successful()) {
                    return $this->extractWeather($response->json());
                }

                return $this->fallbackPayload();
            } catch (\Exception $e) {
                return $this->fallbackPayload();
            }
        });

        return response()->json($data);
    }

    protected function extractWeather(array $payload)
    {
        if (! isset($payload['lokasi']) || ! isset($payload['data'][0]['cuaca'][0])) {
            return $this->fallbackPayload();
        }

        $location = $payload['lokasi'];
        $current = $payload['data'][0]['cuaca'][0][0];

        return [
            'location' => [
                'provinsi' => $location['provinsi'] ?? null,
                'kotakab' => $location['kotkab'] ?? null,
                'kecamatan' => $location['kecamatan'] ?? null,
                'desa' => $location['desa'] ?? null,
                'lat' => $location['lat'] ?? null,
                'lon' => $location['lon'] ?? null,
            ],
            'current' => [
                'datetime' => $current['local_datetime'] ?? null,
                'analysis_date' => $current['analysis_date'] ?? null,
                'temperature' => $current['t'] ?? null,
                'humidity' => $current['hu'] ?? null,
                'wind_deg' => $current['wd_deg'] ?? null,
                'wind_direction' => $current['wd'] ?? null,
                'wind_speed' => $current['ws'] ?? null,
                'precipitation' => $current['tp'] ?? null,
                'weather_code' => $current['weather'] ?? null,
                'weather_desc' => $current['weather_desc'] ?? null,
                'icon_url' => $current['image'] ?? null,
                'cloud_cover' => $current['tcc'] ?? null,
            ],
            'source' => 'BMKG',
            'units' => [
                'temperature' => '°C',
                'humidity' => '%',
                'wind_speed' => 'm/s',
                'precipitation' => 'mm',
            ],
        ];
    }

    protected function fallbackPayload()
    {
        return [
            'location' => null,
            'current' => null,
            'source' => 'BMKG',
            'units' => [
                'temperature' => '°C',
                'humidity' => '%',
                'wind_speed' => 'm/s',
                'precipitation' => 'mm',
            ],
            'error' => 'Data cuaca tidak tersedia saat ini.',
        ];
    }
}