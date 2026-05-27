<?php

function capy_handle_auth_request(PDO $pdo, array $config, string $path, string $method): bool
{
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

    return false;
}
