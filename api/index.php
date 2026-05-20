<?php

$app = require __DIR__ . '/bootstrap.php';
$config = $app['config'];
$pdo = $app['pdo'];

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        capy_json_response(['ok' => true], 204);
    }

    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $path = capy_request_path();

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

    if ($path === '/auth/register' && $method === 'POST') {
        $body = capy_read_json_body();
        $username = capy_validate_username_or_fail((string) ($body['username'] ?? ''));
        $password = capy_validate_password_or_fail((string) ($body['password'] ?? ''));

        if (capy_find_user_by_username($pdo, $username)) {
            throw new CapyHttpException(409, 'Ese usuario ya existe.');
        }

        $user = capy_create_user($pdo, $username, password_hash($password, PASSWORD_DEFAULT), $config);
        $_SESSION['user_id'] = (int) $user['id'];
        $token = capy_issue_api_token($pdo, (int) $user['id']);

        capy_json_response([
            'ok' => true,
            'token' => $token,
            'user' => capy_get_public_user($pdo, $user, $config),
        ], 201);
    }

    if ($path === '/auth/login' && $method === 'POST') {
        $body = capy_read_json_body();
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($username === '' || $password === '') {
            throw new CapyHttpException(422, 'Completa usuario y contraseña.');
        }

        $user = capy_find_user_by_username($pdo, $username);
        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            throw new CapyHttpException(401, 'Usuario o contraseña incorrectos.');
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        $token = capy_issue_api_token($pdo, (int) $user['id']);

        capy_json_response([
            'ok' => true,
            'token' => $token,
            'user' => capy_get_public_user($pdo, $user, $config),
        ]);
    }

    if ($path === '/auth/logout' && $method === 'POST') {
        capy_revoke_api_token($pdo, capy_extract_api_token());
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
        }
        session_destroy();
        capy_json_response(['ok' => true]);
    }

    if ($path === '/me' && $method === 'GET') {
        $user = capy_require_current_user($pdo);
        capy_json_response([
            'ok' => true,
            'user' => capy_get_public_user($pdo, $user, $config),
        ]);
    }

    if ($path === '/me/username' && $method === 'PATCH') {
        $user = capy_require_current_user($pdo);
        $body = capy_read_json_body();
        $username = capy_validate_username_or_fail((string) ($body['username'] ?? ''));

        $existing = capy_find_user_by_username($pdo, $username);
        if ($existing && (int) $existing['id'] !== (int) $user['id']) {
            throw new CapyHttpException(409, 'Ese usuario ya existe.');
        }

        capy_update_username($pdo, (int) $user['id'], $username);
        $updated = capy_find_user_by_id($pdo, (int) $user['id']);

        capy_json_response([
            'ok' => true,
            'user' => capy_get_public_user($pdo, $updated, $config),
        ]);
    }

        if ($path === '/me/password' && $method === 'PATCH') {
            $user = capy_require_current_user($pdo);
            $body = capy_read_json_body();
            $currentPassword = capy_validate_password_or_fail((string) ($body['currentPassword'] ?? ''));
            $newPassword = capy_validate_password_or_fail((string) ($body['newPassword'] ?? ''));

        if (!password_verify($currentPassword, (string) $user['password_hash'])) {
            throw new CapyHttpException(422, 'La contraseña actual no coincide.');
        }

        capy_update_password($pdo, (int) $user['id'], password_hash($newPassword, PASSWORD_DEFAULT));
        $updated = capy_find_user_by_id($pdo, (int) $user['id']);

        capy_json_response([
            'ok' => true,
            'user' => capy_get_public_user($pdo, $updated, $config),
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

    if (preg_match('#^/levels/([^/]+)/exercises$#', $path, $matches) && $method === 'GET') {
        capy_json_response([
            'ok' => true,
            'exercises' => capy_get_exercises_by_level($pdo, (int) $matches[1]),
        ]);
    }

    if (preg_match('#^/levels/([^/]+)/complete$#', $path, $matches) && $method === 'POST') {
        $user = capy_require_current_user($pdo);
        $body = capy_read_json_body();
        $result = capy_complete_level($pdo, $user, (int) $matches[1], $body['answers'] ?? [], $config);

        capy_json_response([
            'ok' => true,
            'practice' => $result['practice'],
            'reward' => $result['reward'],
            'nextLevelId' => $result['nextLevelId'],
            'routeCompleted' => $result['routeCompleted'],
            'gameCompleted' => $result['gameCompleted'],
            'badgeUnlocked' => $result['badgeUnlocked'],
            'newlyDiscoveredOutfits' => $result['newlyDiscoveredOutfits'],
            'streakCelebration' => $result['streakCelebration'],
            'storyBeat' => $result['storyBeat'],
            'user' => capy_get_public_user($pdo, $result['user'], $config),
        ]);
    }

    if ($path === '/outfits' && $method === 'GET') {
        capy_json_response([
            'ok' => true,
            'outfits' => capy_get_outfits($pdo),
        ]);
    }

    if (preg_match('#^/outfits/([^/]+)/unlock$#', $path, $matches) && $method === 'POST') {
        $user = capy_require_current_user($pdo);
        $outfit = capy_get_outfit($pdo, $matches[1]);

        if (!$outfit) {
            throw new CapyHttpException(404, 'Vestuario no encontrado.');
        }

        $updated = capy_unlock_outfit($pdo, $user, $outfit, $config);

        capy_json_response([
            'ok' => true,
            'outfit' => $outfit,
            'alreadyUnlocked' => $updated['alreadyUnlocked'],
            'user' => capy_get_public_user($pdo, $updated['user'], $config),
        ]);
    }

    if (preg_match('#^/outfits/([^/]+)/equip$#', $path, $matches) && $method === 'POST') {
        $user = capy_require_current_user($pdo);
        $outfit = capy_get_outfit($pdo, $matches[1]);

        if (!$outfit) {
            throw new CapyHttpException(404, 'Vestuario no encontrado.');
        }

        $updatedUser = capy_equip_outfit($pdo, $user, $outfit);

        capy_json_response([
            'ok' => true,
            'outfit' => $outfit,
            'user' => capy_get_public_user($pdo, $updatedUser, $config),
        ]);
    }

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
