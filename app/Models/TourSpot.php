<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourSpot extends Model
{
    protected $fillable = [
        'name',
        'image_path',
        'description',
        'is_published',
        'order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}