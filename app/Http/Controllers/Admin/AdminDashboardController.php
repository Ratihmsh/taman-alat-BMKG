<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Instrument;
use App\Models\PageVisit;
use App\Models\TourSpot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $totalInstruments = Instrument::count();
        $activeInstruments = Instrument::where('status', 'aktif')->count();
        $totalTourSpots = TourSpot::count();
        $publishedTourSpots = TourSpot::where('is_published', true)->count();

        $todayVisits = PageVisit::whereDate('visited_at', Carbon::today())->count();
        $monthVisits = PageVisit::whereBetween('visited_at', [
            Carbon::now()->startOfMonth(),
            Carbon::now(),
        ])->count();

        $visitTrend = PageVisit::selectRaw('DATE(visited_at) as date, COUNT(*) as total')
            ->where('visited_at', '>=', Carbon::now()->subDays(13)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date')
            ->map(fn ($v, $k) => ['date' => $k, 'total' => $v])
            ->values();

        try {
            $weather = Http::timeout(8)
                ->acceptJson()
                ->get('https://api.bmkg.go.id/publik/prakiraan-cuaca', [
                    'adm4' => config('services.bmkg.adm4', '31.71.03.1001'),
                ]);

            if ($weather->successful()) {
                $raw = $weather->json();
                $current = $raw['data'][0]['cuaca'][0][0] ?? null;
                $latestWeather = $current ? [
                    'temperature' => $current['t'] ?? null,
                    'humidity' => $current['hu'] ?? null,
                    'wind_speed' => $current['ws'] ?? null,
                    'wind_direction' => $current['wd'] ?? null,
                    'weather_desc' => $current['weather_desc'] ?? null,
                    'icon_url' => $current['image'] ?? null,
                    'location' => ($raw['lokasi']['kecamatan'] ?? null) . ', ' . ($raw['lokasi']['provinsi'] ?? ''),
                    'updated_at' => $current['analysis_date'] ?? null,
                ] : null;
            }
        } catch (\Throwable) {
            $latestWeather = null;
        }

        $latestActivity = ActivityLog::with('user')
            ->latest()
            ->limit(8)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalInstruments' => $totalInstruments,
                'activeInstruments' => $activeInstruments,
                'totalTourSpots' => $totalTourSpots,
                'publishedTourSpots' => $publishedTourSpots,
                'todayVisits' => $todayVisits,
                'monthVisits' => $monthVisits,
                'visitTrend' => $visitTrend,
                'latestWeather' => $latestWeather,
            ],
            'latestActivity' => $latestActivity,
        ]);
    }
}