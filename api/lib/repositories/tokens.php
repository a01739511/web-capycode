<?php

// Manejo de tokens para sesiones HTTP y llamadas desde frontend.

function capy_extract_api_token(): string
{
    if (!empty($_SERVER['HTTP_X_CAPY_TOKEN'])) {
        return trim((string) $_SERVER['HTTP_X_CAPY_TOKEN']);
    }

    $header = '';

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = (string) $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if ($header !== '' && preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim((string) $matches[1]);
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            if (!empty($headers['X-Capy-Token'])) {
                return trim((string) $headers['X-Capy-Token']);
            }

            if (!empty($headers['Authorization']) && preg_match('/Bearer\s+(.+)/i', (string) $headers['Authorization'], $matches)) {
                return trim((string) $matches[1]);
            }
        }
    }

    return '';
}

function capy_hash_api_token(string $token): string
{
    return hash('sha256', $token);
}

function capy_issue_api_token(PDO $pdo, int $userId): string
{
    $token = 'capy_' . bin2hex(random_bytes(24));
    $statement = $pdo->prepare(
        'INSERT INTO ' . capy_table('user_tokens') . ' (token_hash, user_id, created_at, last_used_at, revoked_at)
         VALUES (:token_hash, :user_id, :created_at, :last_used_at, NULL)'
    );
    $now = capy_now_iso();
    $statement->execute([
        ':token_hash' => capy_hash_api_token($token),
        ':user_id' => $userId,
        ':created_at' => $now,
        ':last_used_at' => $now,
    ]);

    return $token;
}

function capy_find_user_by_api_token(PDO $pdo, string $token): ?array
{
    if ($token === '') {
        return null;
    }

    $statement = $pdo->prepare(
        'SELECT u.*
         FROM ' . capy_table('user_tokens') . ' t
         INNER JOIN ' . capy_table('users') . ' u ON u.id = t.user_id
         WHERE t.token_hash = :token_hash
           AND t.revoked_at IS NULL
         LIMIT 1'
    );
    $statement->execute([
        ':token_hash' => capy_hash_api_token($token),
    ]);
    $user = $statement->fetch();

    if ($user) {
        $update = $pdo->prepare(
            'UPDATE ' . capy_table('user_tokens') . ' SET last_used_at = :last_used_at WHERE token_hash = :token_hash'
        );
        $update->execute([
            ':last_used_at' => capy_now_iso(),
            ':token_hash' => capy_hash_api_token($token),
        ]);
    }

    return $user ?: null;
}

function capy_revoke_api_token(PDO $pdo, string $token): void
{
    if ($token === '') {
        return;
    }

    $statement = $pdo->prepare(
        'UPDATE ' . capy_table('user_tokens') . '
         SET revoked_at = :revoked_at
         WHERE token_hash = :token_hash AND revoked_at IS NULL'
    );
    $statement->execute([
        ':revoked_at' => capy_now_iso(),
        ':token_hash' => capy_hash_api_token($token),
    ]);
}
