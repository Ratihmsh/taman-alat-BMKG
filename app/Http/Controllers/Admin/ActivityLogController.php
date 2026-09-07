<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = ActivityLog::with('user:id,name,email')
            ->when($request->action, function ($query, $action) {
                $query->where('action', $action);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        $users = \App\Models\User::select('id', 'name')->get();

        return Inertia::render('Admin/ActivityLogs', [
            'logs' => $logs,
            'users' => $users,
            'filters' => [
                'action' => $request->action ?? '',
                'user_id' => $request->user_id ?? '',
                'date_from' => $request->date_from ?? '',
                'date_to' => $request->date_to ?? '',
            ],
        ]);
    }
}