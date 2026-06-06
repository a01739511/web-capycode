<?php

$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$uriPath = is_string($uriPath) ? $uriPath : '/';
$fullPath = __DIR__ . str_replace('/', DIRECTORY_SEPARATOR, $uriPath);

if ($uriPath !== '/' && is_file($fullPath)) {
    return false;
}

if ($uriPath === '/api' || strpos($uriPath, '/api/') === 0) {
    require __DIR__ . '/api/index.php';
    return true;
}

return false;
