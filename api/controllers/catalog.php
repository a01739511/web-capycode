<?php

function capy_handle_catalog_request(PDO $pdo, array $config, string $path, string $method): bool
{
    if ($path === '/' || $path === '') {
        capy_json_response([
            'ok' => true,
            'service' => 'CapyCode API',
            'endpoints' => [
                'GET /health',
                'POST /auth/register',
                'POST /auth/login',
                'POST /auth/logout',
                'GET /me',
                'PATCH /me/username',
                'PATCH /me/password',
                'GET /routes',
                'GET /routes/{id}/levels',
                'GET /levels/{id}/exercises',
                'POST /levels/{id}/complete',
                'GET /outfits',
                'POST /outfits/{id}/unlock',
                'POST /outfits/{id}/equip',
            ],
        ]);
    }

    if ($path === '/health' && $method === 'GET') {
        capy_json_response([
            'ok' => true,
            'status' => 'healthy',
            'database' => capy_db_label($config),
            'driver' => strtolower((string) ($config['db_driver'] ?? 'sqlite')),
            'sessionActive' => isset($_SESSION['user_id']),
        ]);
    }

    if ($path === '/routes' && $method === 'GET') {
        $user = capy_get_current_user($pdo);
        capy_json_response([
            'ok' => true,
            'routes' => capy_get_routes($pdo, $user ? (int) $user['id'] : null),
        ]);
    }

    if (preg_match('#^/routes/([^/]+)/levels$#', $path, $matches) && $method === 'GET') {
        capy_json_response([
            'ok' => true,
            'levels' => capy_get_levels_by_route($pdo, $matches[1]),
        ]);
    }

    return false;
}
