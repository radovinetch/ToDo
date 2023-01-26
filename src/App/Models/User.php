<?php


namespace Todo\App\Models;


use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['id', 'email'];

    public function tasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }
}