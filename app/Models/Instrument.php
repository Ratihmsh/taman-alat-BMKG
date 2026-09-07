<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Instrument extends Model
{
    protected $fillable = [
        'name',
        'description',
        'function',
        'working_principle',
        'category',
        'status',
        'image_path',
        'audio_path',
        'pitch',
        'yaw',
    ];
}
