<?php

// Reglas de compra, desbloqueo y equipamiento de vestuarios.

function capy_get_outfits(PDO $pdo): array
{
    $rows = $pdo->query('SELECT * FROM ' . capy_table('outfits') . ' ORDER BY cost ASC, name ASC')->fetchAll();
    $definitionMap = capy_get_outfit_definition_map();
    $routeNameById = [];

    foreach (capy_route_definitions() as $route) {
        $routeNameById[(int) $route['id']] = (string) $route['name'];
    }

    return array_map(
        static function (array $row) use ($definitionMap, $routeNameById): array {
            $definition = $definitionMap[(string) $row['id']] ?? [];
            $unlockRouteId = (int) ($definition['unlock_route_id'] ?? 0);
            return [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'],
                'tagline' => $row['tagline'],
                'cost' => (int) $row['cost'],
                'image' => $row['image'],
                'unlockRouteId' => $unlockRouteId > 0 ? $unlockRouteId : null,
                'unlockRouteName' => $unlockRouteId > 0 ? ($routeNameById[$unlockRouteId] ?? '') : '',
            ];
        },
        $rows
    );
}

function capy_get_outfit(PDO $pdo, string $outfitId): ?array
{
    $statement = $pdo->prepare('SELECT * FROM ' . capy_table('outfits') . ' WHERE id = :id LIMIT 1');
    $statement->execute([':id' => $outfitId]);
    $row = $statement->fetch();

    if (!$row) {
        return null;
    }

    $definitionMap = capy_get_outfit_definition_map();
    $definition = $definitionMap[(string) $row['id']] ?? [];
    $unlockRouteId = (int) ($definition['unlock_route_id'] ?? 0);
    $unlockRouteName = $unlockRouteId > 0 ? capy_get_route_name_by_id($unlockRouteId) : '';

    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'description' => $row['description'],
        'tagline' => $row['tagline'],
        'cost' => (int) $row['cost'],
        'image' => $row['image'],
        'unlockRouteId' => $unlockRouteId > 0 ? $unlockRouteId : null,
        'unlockRouteName' => $unlockRouteName,
    ];
}

function capy_unlock_outfit(PDO $pdo, array $user, array $outfit, array $config): array
{
    $unlockedIds = capy_get_unlocked_outfit_ids($pdo, (int) $user['id'], $config);
    $unlockedBadgeRouteIds = capy_get_unlocked_badge_route_ids($pdo, (int) $user['id']);
    $discoveredOutfitIds = capy_get_discovered_outfit_ids($unlockedIds, $unlockedBadgeRouteIds);

    if (!in_array($outfit['id'], $discoveredOutfitIds, true)) {
        if (!empty($outfit['unlockRouteId'])) {
            throw new CapyHttpException(422, 'Completa la ruta ' . (int) $outfit['unlockRouteId'] . ' para habilitar este vestuario.');
        }

        throw new CapyHttpException(422, 'Este vestuario todavía no está disponible.');
    }

    if (in_array($outfit['id'], $unlockedIds, true)) {
        return [
            'alreadyUnlocked' => true,
            'user' => $user,
        ];
    }

    if ((int) $user['xp'] < (int) $outfit['cost']) {
        throw new CapyHttpException(422, 'XP insuficiente.');
    }

    $pdo->beginTransaction();
    try {
        $updateUser = $pdo->prepare('UPDATE ' . capy_table('users') . ' SET xp = :xp WHERE id = :id');
        $updateUser->execute([
            ':xp' => (int) $user['xp'] - (int) $outfit['cost'],
            ':id' => (int) $user['id'],
        ]);

        $insertUnlock = $pdo->prepare(
            'INSERT INTO ' . capy_table('user_outfits') . ' (user_id, outfit_id, unlocked_at) VALUES (:user_id, :outfit_id, :unlocked_at)'
        );
        $insertUnlock->execute([
            ':user_id' => (int) $user['id'],
            ':outfit_id' => $outfit['id'],
            ':unlocked_at' => capy_now_iso(),
        ]);

        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }

    return [
        'alreadyUnlocked' => false,
        'user' => capy_find_user_by_id($pdo, (int) $user['id']),
    ];
}

function capy_equip_outfit(PDO $pdo, array $user, array $outfit): array
{
    $statement = $pdo->prepare('SELECT 1 FROM ' . capy_table('user_outfits') . ' WHERE user_id = :user_id AND outfit_id = :outfit_id LIMIT 1');
    $statement->execute([
        ':user_id' => (int) $user['id'],
        ':outfit_id' => $outfit['id'],
    ]);

    if (!$statement->fetchColumn()) {
        throw new CapyHttpException(422, 'Primero desbloquea este vestuario.');
    }

    $update = $pdo->prepare('UPDATE ' . capy_table('users') . ' SET current_outfit_id = :current_outfit_id WHERE id = :id');
    $update->execute([
        ':current_outfit_id' => $outfit['id'],
        ':id' => (int) $user['id'],
    ]);

    return capy_find_user_by_id($pdo, (int) $user['id']);
}
