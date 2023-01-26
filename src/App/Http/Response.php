<?php


namespace Todo\App\Http;


class Response
{
    public function json(array $data)
    {
        echo json_encode($data);
    }
}