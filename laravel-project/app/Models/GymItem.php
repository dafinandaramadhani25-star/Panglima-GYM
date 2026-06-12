<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GymItem extends Model
{
    use HasFactory;

    // Matikan incrementing auto-number karena kita menggunakan string manual ID ("item-12345")
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'brand',
        'serial',
        'category',
        'condition',
        'location',
        'total_stock',
        'image_url',
        'qr_code_url',
        'description'
    ];

    /**
     * Relasi hasMany ke Jadwal Perawatan (Maintenance Schedules)
     */
    public function maintenanceSchedules(): HasMany
    {
        return $this->hasMany(MaintenanceSchedule::class, 'item_id', 'id');
    }
}
