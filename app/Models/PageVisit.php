<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageVisit extends Model
{
    protected $fillable = [
        'page',
        'visited_at',
    ];

    public $timestamps = false;

    protected $casts = [
        'visited_at' => 'datetime',
    ];
}