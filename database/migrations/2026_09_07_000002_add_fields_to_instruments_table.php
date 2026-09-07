<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('instruments', function (Blueprint $table) {
            $table->string('status')->default('aktif')->after('audio_path');
            $table->text('function')->nullable()->after('description');
            $table->text('working_principle')->nullable()->after('function');
        });
    }

    public function down(): void
    {
        Schema::table('instruments', function (Blueprint $table) {
            $table->dropColumn(['status', 'function', 'working_principle']);
        });
    }
};