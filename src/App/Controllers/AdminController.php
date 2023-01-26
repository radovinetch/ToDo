<?php


namespace Todo\App\Controllers;


use Todo\App\Models\User;
use Todo\view\View;

class AdminController extends Controller
{
    public function index()
    {
        View::view('admin', [
            'users' => User::all()
        ]);
    }
}