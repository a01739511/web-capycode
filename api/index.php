<?php

$app = require __DIR__ . '/bootstrap.php';
$config = $app['config'];
$pdo = $app['pdo'];

require_once __DIR__ . '/controllers/auth.php';
require_once __DIR__ . '/controllers/user.php';
require_once __DIR__ . '/controllers/catalog.php';
require_once __DIR__ . '/controllers/levels.php';
require_once __DIR__ . '/controllers/outfits.php';

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        capy_json_response(['ok' => true], 204);
    }

    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $path = capy_request_path();

    // Cada controlador decide si conoce la ruta; las respuestas conservan el contrato original.
    capy_handle_catalog_request($pdo, $config, $path, $method);
    capy_handle_auth_request($pdo, $config, $path, $method);
    capy_handle_user_request($pdo, $config, $path, $method);
    capy_handle_levels_request($pdo, $config, $path, $method);
    capy_handle_outfits_request($pdo, $config, $path, $method);

    throw new CapyHttpException(404, 'Endpoint no encontrado.');
} catch (CapyHttpException $exception) {
    capy_json_response([
        'ok' => false,
        'error' => $exception->getMessage(),
    ], $exception->getStatusCode());
} catch (Throwable $exception) {
    capy_json_response([
        'ok' => false,
        'error' => 'La API encontró un error interno.',
        'details' => $exception->getMessage(),
    ], 500);
}
