<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\ActivityLogger;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('id')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at?->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['super', 'editor'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        ActivityLogger::record('create', User::class, $user->id, "Menambahkan admin '{$user->name}'");

        return redirect()->route('admin.users')->with('success', 'Akun admin berhasil ditambahkan.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $name = $user->name;
        $user->delete();

        ActivityLogger::record('delete', User::class, null, "Menghapus admin '{$name}'");

        return redirect()->route('admin.users')->with('success', 'Akun admin berhasil dihapus.');
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->update(['password' => Hash::make($validated['password'])]);

        ActivityLogger::record('update', User::class, $user->id, "Mereset password admin '{$user->name}'");

        return back()->with('success', "Password untuk '{$user->name}' berhasil direset.");
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['super', 'editor'])],
        ]);

        $user->update(['role' => $validated['role']]);

        ActivityLogger::record('update', User::class, $user->id, "Mengubah role admin '{$user->name}' menjadi {$validated['role']}");

        return back()->with('success', 'Role admin berhasil diperbarui.');
    }
}