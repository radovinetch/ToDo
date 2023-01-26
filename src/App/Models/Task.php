<?php


namespace Todo\App\Models;


use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['id', 'text', 'is_important', 'is_completed', 'created_by', 'date'];

    protected $attributes = [
        'is_important' => 0,
        'is_completed' => 0
    ];
}