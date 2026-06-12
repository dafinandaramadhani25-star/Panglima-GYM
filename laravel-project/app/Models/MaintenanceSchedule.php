<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceSchedule extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'item_id',
        'item_name',
        'next_service_date',
        'maintenance_type',
        'status'
    ];

    /**
     * Relasi belongsTo ke alat olahraga (GymItem)
     */
    public function gymItem(): BelongsTo
    {
        return $this->belongsTo(GymItem::class, 'item_id', 'id');
    }
}
