<?php


namespace Todo\App\Http;


class Request
{
    private array $get;
    private array $post;

    public function __construct()
    {
        $this->get = $_GET;
        $this->post = $_POST;
    }

    public function get(string $key)
    {
        return $this->get[$key] ?? null;
    }

    public function post(string $key)
    {
        return $this->post[$key] ?? null;
    }

    /**
     * @return array
     */
    public function getAll(): array
    {
        return $this->get;
    }

    /**
     * @return array
     */
    public function postAll(): array
    {
        return $this->post;
    }
}