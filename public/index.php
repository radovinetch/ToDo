<?php

use Bramus\Router\Router;
use Todo\App\Models\Task;

session_start();

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config.php';

const TWIG_VIEWS = __DIR__ . '/../views';
const TWIG_CACHE = __DIR__ . '/../cache';

$loader = new \Twig\Loader\FilesystemLoader(TWIG_VIEWS);
$twig = new \Twig\Environment($loader, [
    //'cache' => TWIG_CACHE
]);
\Todo\view\View::setEnvironment($twig);

$capsule = new Illuminate\Database\Capsule\Manager();
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => DB_HOST,
    'database'  => DB_DATABASE,
    'username'  => DB_USER,
    'password'  => DB_PASSWORD,
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => ''
]);
$capsule->bootEloquent();

$router = new Router();

$router->setNamespace('\Todo\App\Controllers');
$router->before('GET', '/', function () {
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_auth'])) {
        header('Location: /tasks');
        exit();
    }
});
$router->before('POST', '/auth/handle', function () {
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_auth'])) {
        exit();
    }
});
$router->before('GET|POST', '/tasks|/tasks/.*', function () {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_auth'])) {
        header('Location: /');
        exit();
    }
});
$router->before('GET|POST|PUT|DELETE', '/admin|/admin/.*', function () {
    if (!empty($_SERVER['PHP_AUTH_USER']) && !empty($_SERVER['PHP_AUTH_PW'])) {
        //в этом файле данные формата username:md5hashpassword
        //для теста 2 юзера admin:admin и root:root
        $contents = file_get_contents(__DIR__ . '/../.htpasswd');
        $contents = explode(PHP_EOL, $contents);
        foreach ($contents as $userdata) {
            [$user, $password] = explode(":", $userdata);
            if ($user == $_SERVER['PHP_AUTH_USER'] && $password == md5($_SERVER['PHP_AUTH_PW'])) {
                return;
            }
        }
    }

    header('WWW-Authenticate: Basic realm="Admin"');
    header('HTTP/1.0 401 Unauthorized');

    echo 'Unauthorized';
    exit();
});

$router->get('/', 'UserController@index');
$router->get('/admin', 'AdminController@index');
$router->get('/tasks', 'TaskController@tasks');
$router->get('/tasks/getTasks', 'TaskController@getTasks');
$router->post('/tasks/create', 'TaskController@createTask');
$router->post('/tasks/edit/(\d+)', 'TaskController@editTask');
$router->post('/tasks/delete/(\d+)', 'TaskController@deleteTask');
$router->post('/tasks/complete/(\d+)', 'TaskController@completeTask');

$router->post('/auth/handle', 'UserController@authHandle');

$router->run();