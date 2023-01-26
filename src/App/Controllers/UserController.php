<?php


namespace Todo\App\Controllers;


use Todo\App\Models\User;
use Todo\App\Validator;
use Todo\view\View;

class UserController extends Controller
{
    public function index()
    {
        View::view('index');
    }

    public function authHandle()
    {
        $errors = Validator::validate($this->request, [
            'email' => 'required|email'
        ]);
        if (!empty($errors)) {
            $this->response->json([
                'error' => $errors
            ]);
            return;
        }

        $email = $this->request->post('email');
        $user = User::where([
            'email' => $email
        ])->first();
        if (empty($user)) {
            $user = User::create([
                'email' => $email
            ]);
        }

        $_SESSION['user_auth'] = true;
        $_SESSION['user_id'] = $user->id;
        $this->response->json([
            'success' => [
                'message' => 'Вы успешно авторизовались'
            ]
        ]);
    }
}