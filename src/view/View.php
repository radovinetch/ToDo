<?php


namespace Todo\view;


use Twig\Environment;

class View
{
    private static ?Environment $environment = null;

    /**
     * @param Environment $environment
     */
    public static function setEnvironment(Environment $environment): void
    {
        self::$environment = $environment;
    }

    /**
     * @throws \Twig\Error\SyntaxError
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\LoaderError
     */
    public static function view(string $view, array $args = [])
    {
        $template = self::$environment->load($view . '.twig');
        echo $template->render($args);
    }
}