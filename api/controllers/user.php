<?php

// Operaciones de cuenta del usuario autenticado.
function capy_handle_user_request(PDO $pdo, array $config, string $path, string $method): bool
{
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

    return false;
}
