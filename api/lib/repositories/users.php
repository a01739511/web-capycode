<?php

// Consultas y transformaciones relacionadas con usuarios y su estado publico.

function capy_find_user_by_id(PDO $pdo, int $userId): ?array
{
    $statement = $pdo->prepare('SELECT * FROM ' . capy_table('users') . ' WHERE id = :id LIMIT 1');
    $statement->execute([':id' => $userId]);
    $user = $statement->fetch();
    return $user ?: null;
}

function capy_find_user_by_username(PDO $pdo, string $username): ?array
{
    $statement = $pdo->prepare('SELECT * FROM ' . capy_table('users') . ' WHERE username = :username LIMIT 1');
    $statement->execute([':username' => trim($username)]);
    $user = $statement->fetch();
    return $user ?: null;
}

function capy_create_user(PDO $pdo, string $username, string $passwordHash, array $config): array
{
    $statement = $pdo->prepare(
        'INSERT INTO ' . capy_table('users') . ' (username, password_hash, current_level_id, streak, last_completion_at, xp, current_outfit_id)
         VALUES (:username, :password_hash, 1, 0, NULL, 0, :current_outfit_id)'
    );
    $statement->execute([
        ':username' => trim($username),
        ':password_hash' => $passwordHash,
        ':current_outfit_id' => $config['default_outfit_id'],
    ]);

    $userId = (int) $pdo->lastInsertId();
    $unlockStatement = $pdo->prepare(
        'INSERT INTO ' . capy_table('user_outfits') . ' (user_id, outfit_id, unlocked_at) VALUES (:user_id, :outfit_id, :unlocked_at)'
    );
    $unlockStatement->execute([
        ':user_id' => $userId,
        ':outfit_id' => $config['default_outfit_id'],
        ':unlocked_at' => capy_now_iso(),
    ]);

    return capy_find_user_by_id($pdo, $userId);
}

function capy_update_username(PDO $pdo, int $userId, string $username): void
{
    $statement = $pdo->prepare('UPDATE ' . capy_table('users') . ' SET username = :username WHERE id = :id');
    $statement->execute([
        ':username' => trim($username),
        ':id' => $userId,
    ]);
}

function capy_update_password(PDO $pdo, int $userId, string $passwordHash): void
{
    $statement = $pdo->prepare('UPDATE ' . capy_table('users') . ' SET password_hash = :password_hash WHERE id = :id');
    $statement->execute([
        ':password_hash' => $passwordHash,
        ':id' => $userId,
    ]);
}

function capy_get_current_user(PDO $pdo): ?array
{
    $apiToken = capy_extract_api_token();
    if ($apiToken !== '') {
        $user = capy_find_user_by_api_token($pdo, $apiToken);
        if ($user) {
            return $user;
        }
    }

    $userId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : 0;
    return $userId > 0 ? capy_find_user_by_id($pdo, $userId) : null;
}

function capy_require_current_user(PDO $pdo): array
{
    $user = capy_get_current_user($pdo);
    if (!$user) {
        throw new CapyHttpException(401, 'Inicia sesión para continuar.');
    }

    return $user;
}

function capy_get_public_user(PDO $pdo, array $user, array $config): array
{
    $unlockedOutfitIds = capy_get_unlocked_outfit_ids($pdo, (int) $user['id'], $config);
    $unlockedBadgeRouteIds = capy_get_unlocked_badge_route_ids($pdo, (int) $user['id']);
    $publicUser = [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'currentLevelId' => (int) $user['current_level_id'],
        'level' => (int) $user['current_level_id'],
        'streak' => (int) $user['streak'],
        'visibleStreak' => capy_get_visible_streak($user, $config),
        'xp' => (int) $user['xp'],
        'lastCompletionAt' => $user['last_completion_at'],
        'currentOutfitId' => $user['current_outfit_id'] ?: $config['default_outfit_id'],
        'equippedCharacter' => $user['current_outfit_id'] ?: $config['default_outfit_id'],
        'unlockedOutfitIds' => $unlockedOutfitIds,
        'unlockedCharacters' => $unlockedOutfitIds,
        'unlockedBadgeRouteIds' => $unlockedBadgeRouteIds,
        'discoveredOutfitIds' => capy_get_discovered_outfit_ids($unlockedOutfitIds, $unlockedBadgeRouteIds),
        'availableOutfitIds' => capy_get_discovered_outfit_ids($unlockedOutfitIds, $unlockedBadgeRouteIds),
    ];

    return $publicUser;
}

function capy_get_visible_streak(array $user, array $config): int
{
    if (empty($user['last_completion_at'])) {
        return 0;
    }

    $lastKey = capy_date_key((string) $user['last_completion_at'], $config['app_timezone']);
    $todayKey = capy_date_key(capy_now_iso(), $config['app_timezone']);
    $dayGap = capy_days_between_date_keys($lastKey, $todayKey);

    return $dayGap <= 1 ? (int) $user['streak'] : 0;
}

function capy_get_unlocked_outfit_ids(PDO $pdo, int $userId, array $config): array
{
    $statement = $pdo->prepare('SELECT outfit_id FROM ' . capy_table('user_outfits') . ' WHERE user_id = :user_id ORDER BY unlocked_at ASC');
    $statement->execute([':user_id' => $userId]);
    $items = array_map(static function ($row) {
        return (string) $row['outfit_id'];
    }, $statement->fetchAll());

    if (!in_array($config['default_outfit_id'], $items, true)) {
        array_unshift($items, $config['default_outfit_id']);
    }

    return array_values(array_unique($items));
}

function capy_get_unlocked_badge_route_ids(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare('SELECT route_id FROM ' . capy_table('user_route_badges') . ' WHERE user_id = :user_id ORDER BY route_id ASC');
    $statement->execute([':user_id' => $userId]);
    return array_map(static function ($row) {
        return (int) $row['route_id'];
    }, $statement->fetchAll());
}

function capy_get_outfit_definition_map(): array
{
    $definitions = [];

    foreach (capy_outfit_definitions() as $outfit) {
        $definitions[(string) $outfit['id']] = $outfit;
    }

    return $definitions;
}

function capy_get_route_reward_outfit_by_route_id(int $routeId): ?array
{
    foreach (capy_outfit_definitions() as $outfit) {
        if ((int) ($outfit['unlock_route_id'] ?? 0) === $routeId) {
            return $outfit;
        }
    }

    return null;
}

function capy_get_route_name_by_id(int $routeId): string
{
    foreach (capy_route_definitions() as $route) {
        if ((int) $route['id'] === $routeId) {
            return (string) $route['name'];
        }
    }

    return '';
}

function capy_get_discovered_outfit_ids(array $unlockedOutfitIds, array $unlockedBadgeRouteIds): array
{
    $discovered = array_values(array_unique(array_merge(
        capy_starter_discovered_outfit_ids(),
        array_map('strval', $unlockedOutfitIds)
    )));

    foreach ($unlockedBadgeRouteIds as $routeId) {
        $outfit = capy_get_route_reward_outfit_by_route_id((int) $routeId);
        if ($outfit && !in_array($outfit['id'], $discovered, true)) {
            $discovered[] = $outfit['id'];
        }
    }

    return array_values(array_unique($discovered));
}
