<?php


namespace Todo\App\Controllers;


use Todo\App\Http\Request;
use Todo\App\Http\Response;

abstract class Controller
{
    protected Request $request;
    protected Response $response;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
    }
}