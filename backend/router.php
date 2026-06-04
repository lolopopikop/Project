<?php
// Router script for PHP built-in server

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Если запрос к существующему файлу, отдаем его
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Извлекаем путь без query string
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($path, '/');

// Устанавливаем параметр q для фреймворка
$_GET['q'] = $path;

// Подключаем index.php
require __DIR__ . '/index.php';
