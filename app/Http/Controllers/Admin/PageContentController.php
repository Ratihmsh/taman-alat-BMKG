<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageContentController extends Controller
{
    protected array $defaultKeys = [
        'hero' => [
            'hero_label',
            'hero_title',
            'hero_highlight',
            'hero_subtitle',
            'hero_cta_explore',
            'hero_cta_about',
        ],
        'about' => [
            'about_title',
            'about_heading',
            'about_text1',
            'about_text2',
            'about_image_alt',
        ],
        'facilities' => [
            'facility_1_title',
            'facility_1_desc',
            'facility_2_title',
            'facility_2_desc',
            'facility_3_title',
            'facility_3_desc',
        ],
        'footer' => [
            'footer_address',
            'footer_email',
            'footer_phone',
            'footer_tagline',
        ],
    ];

    public function index()
    {
        $contents = PageContent::all()->pluck('value', 'key');

        $grouped = [];
        foreach ($this->defaultKeys as $group => $keys) {
            foreach ($keys as $key) {
                $grouped[$group][$key] = $contents->get($key, '');
            }
        }

        return Inertia::render('Admin/PageContent', [
            'groups' => $grouped,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'contents' => 'required|array',
            'contents.*' => 'nullable|string',
        ]);

        $changed = 0;
        foreach ($validated['contents'] as $key => $value) {
            PageContent::updateOrCreate(['key' => $key], ['value' => $value ?? '', 'group' => $this->groupOf($key)]);
            $changed++;
        }

        ActivityLogger::record('update', PageContent::class, null, "Memperbarui {$changed} konten halaman");

        return redirect()->route('admin.content')->with('success', 'Konten halaman berhasil diperbarui.');
    }

    protected function groupOf(string $key): string
    {
        foreach ($this->defaultKeys as $group => $keys) {
            if (in_array($key, $keys)) {
                return $group;
            }
        }

        return 'general';
    }
}