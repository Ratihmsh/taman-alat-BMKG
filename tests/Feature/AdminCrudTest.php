<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Instrument;
use App\Models\TourSpot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake(['*' => Http::response(['data' => [], 'lokasi' => []], 200)]);
    }

    // ---------------------------------------------------------------------
    // Halaman render
    // ---------------------------------------------------------------------

    public function test_admin_pages_render(): void
    {
        $this->get('/admin')->assertOk();
        $this->get('/admin/instruments')->assertOk();
        $this->get('/admin/tour-spots')->assertOk();
        $this->get('/admin/content')->assertOk();
        $this->get('/admin/logs')->assertOk();
        $this->get('/admin/users')->assertOk();
    }

    public function test_public_pages_render(): void
    {
        $this->get('/')->assertOk();
        $this->get('/virtual-tour')->assertOk();
        $this->assertDatabaseHas('page_visits', ['page' => '/']);
    }

    // ---------------------------------------------------------------------
    // Instruments CRUD
    // ---------------------------------------------------------------------

    public function test_instrument_can_be_created_with_files(): void
    {
        Storage::fake('public');

        $response = $this->post('/admin/instruments', [
            'name' => 'Anemometer',
            'description' => 'Pengukur kecepatan angin',
            'function' => 'Mengukur angin',
            'working_principle' => 'Putaran baling-baling',
            'category' => 'Meteorologi',
            'status' => 'aktif',
            'pitch' => 5,
            'yaw' => 90,
            'image_path' => UploadedFile::fake()->image('alat.jpg'),
            'audio_path' => UploadedFile::fake()->create('narasi.mp3', 100, 'audio/mpeg'),
        ]);

        $response->assertRedirect(route('admin.instruments'));
        $response->assertSessionHasNoErrors();

        $instrument = Instrument::first();
        $this->assertSame('Anemometer', $instrument->name);
        Storage::disk('public')->assertExists($instrument->image_path);
        Storage::disk('public')->assertExists($instrument->audio_path);
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'create',
            'subject_id' => $instrument->id,
        ]);
    }

    public function test_instrument_requires_name(): void
    {
        $this->post('/admin/instruments', ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_instrument_can_be_updated(): void
    {
        $instrument = Instrument::create(['name' => 'Lama', 'status' => 'aktif']);

        $this->put("/admin/instruments/{$instrument->id}", [
            'name' => 'Baru',
            'category' => 'Klimatologi',
            'status' => 'nonaktif',
        ])->assertRedirect(route('admin.instruments'));

        $instrument->refresh();
        $this->assertSame('Baru', $instrument->name);
        $this->assertSame('nonaktif', $instrument->status);
    }

    public function test_instrument_status_can_be_toggled(): void
    {
        $instrument = Instrument::create(['name' => 'Higrometer', 'status' => 'aktif']);

        $this->patch("/admin/instruments/{$instrument->id}/toggle")
            ->assertRedirect(route('admin.instruments'));
        $this->assertSame('nonaktif', $instrument->fresh()->status);

        $this->patch("/admin/instruments/{$instrument->id}/toggle");
        $this->assertSame('aktif', $instrument->fresh()->status);
    }

    public function test_instrument_can_be_deleted(): void
    {
        $instrument = Instrument::create(['name' => 'Hapus Saya']);

        $this->delete("/admin/instruments/{$instrument->id}")
            ->assertRedirect(route('admin.instruments'));

        $this->assertDatabaseMissing('instruments', ['id' => $instrument->id]);
        $this->assertDatabaseHas('activity_logs', ['action' => 'delete']);
    }

    // ---------------------------------------------------------------------
    // Tour spots CRUD
    // ---------------------------------------------------------------------

    public function test_tour_spot_can_be_created(): void
    {
        Storage::fake('public');

        $response = $this->post('/admin/tour-spots', [
            'name' => 'Titik 1',
            'description' => 'Area depan',
            'is_published' => true,
            'order' => 1,
            'image_path' => UploadedFile::fake()->image('pano.jpg'),
        ]);

        $response->assertRedirect(route('admin.tour-spots'));
        $response->assertSessionHasNoErrors();

        $spot = TourSpot::first();
        $this->assertSame('Titik 1', $spot->name);
        Storage::disk('public')->assertExists($spot->image_path);
    }

    public function test_tour_spot_can_be_updated(): void
    {
        $spot = TourSpot::create(['name' => 'Awal', 'is_published' => false]);

        $this->put("/admin/tour-spots/{$spot->id}", [
            'name' => 'Diubah',
            'is_published' => true,
            'order' => 3,
        ])->assertRedirect(route('admin.tour-spots'));

        $spot->refresh();
        $this->assertSame('Diubah', $spot->name);
        $this->assertTrue($spot->is_published);
        $this->assertSame(3, $spot->order);
    }

    public function test_tour_spot_publish_toggles(): void
    {
        $spot = TourSpot::create(['name' => 'Spot', 'is_published' => false]);

        $this->patch("/admin/tour-spots/{$spot->id}/publish")
            ->assertRedirect(route('admin.tour-spots'));
        $this->assertTrue($spot->fresh()->is_published);

        $this->patch("/admin/tour-spots/{$spot->id}/publish");
        $this->assertFalse($spot->fresh()->is_published);
    }

    public function test_tour_spot_can_be_deleted(): void
    {
        $spot = TourSpot::create(['name' => 'Hapus']);

        $this->delete("/admin/tour-spots/{$spot->id}")
            ->assertRedirect(route('admin.tour-spots'));

        $this->assertDatabaseMissing('tour_spots', ['id' => $spot->id]);
    }

    // ---------------------------------------------------------------------
    // Page content
    // ---------------------------------------------------------------------

    public function test_page_content_can_be_updated(): void
    {
        $response = $this->put('/admin/content', [
            'contents' => [
                'hero_title' => 'Judul Baru',
                'footer_email' => 'baru@bmkg.go.id',
            ],
        ]);

        $response->assertRedirect(route('admin.content'));
        $this->assertDatabaseHas('page_contents', ['key' => 'hero_title', 'value' => 'Judul Baru']);
        $this->assertDatabaseHas('page_contents', ['key' => 'footer_email', 'value' => 'baru@bmkg.go.id']);
    }

    // ---------------------------------------------------------------------
    // Users CRUD
    // ---------------------------------------------------------------------

    public function test_user_can_be_created(): void
    {
        $response = $this->post('/admin/users', [
            'name' => 'Editor Baru',
            'email' => 'editor@bmkg.go.id',
            'password' => 'password123',
            'role' => 'editor',
        ]);

        $response->assertRedirect(route('admin.users'));
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', ['email' => 'editor@bmkg.go.id', 'role' => 'editor']);
    }

    public function test_user_email_must_be_unique(): void
    {
        User::factory()->create(['email' => 'ada@bmkg.go.id']);

        $this->post('/admin/users', [
            'name' => 'X',
            'email' => 'ada@bmkg.go.id',
            'password' => 'password123',
            'role' => 'editor',
        ])->assertSessionHasErrors('email');
    }

    public function test_user_role_can_be_updated(): void
    {
        $user = User::factory()->create(['role' => 'editor']);

        $this->patch("/admin/users/{$user->id}/role", ['role' => 'super'])
            ->assertRedirect();

        $this->assertSame('super', $user->fresh()->role);
    }

    public function test_user_password_can_be_reset(): void
    {
        $user = User::factory()->create();

        $this->from('/admin/users')
            ->post("/admin/users/{$user->id}/reset-password", ['password' => 'newpassword123'])
            ->assertRedirect('/admin/users');

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_user_can_be_deleted(): void
    {
        $user = User::factory()->create();

        $this->delete("/admin/users/{$user->id}")
            ->assertRedirect(route('admin.users'));

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    // ---------------------------------------------------------------------
    // Activity logs
    // ---------------------------------------------------------------------

    public function test_activity_logs_page_shows_logs(): void
    {
        ActivityLog::create(['action' => 'create', 'description' => 'Test log unik']);

        $this->get('/admin/logs')
            ->assertOk()
            ->assertSee('Test log unik');
    }
}
