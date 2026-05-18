<?php

function capy_find_user_by_id(PDO $pdo, int $userId): ?array
{
    $statement = $pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $statement->execute([':id' => $userId]);
    $user = $statement->fetch();
    return $user ?: null;
}

function capy_find_user_by_username(PDO $pdo, string $username): ?array
{
    $statement = $pdo->prepare('SELECT * FROM users WHERE username = :username LIMIT 1');
    $statement->execute([':username' => trim($username)]);
    $user = $statement->fetch();
    return $user ?: null;
}

function capy_create_user(PDO $pdo, string $username, string $passwordHash, array $config): array
{
    $statement = $pdo->prepare(
        'INSERT INTO users (username, password_hash, current_level_id, streak, last_completion_at, xp, current_outfit_id)
         VALUES (:username, :password_hash, 1, 0, NULL, 0, :current_outfit_id)'
    );
    $statement->execute([
        ':username' => trim($username),
        ':password_hash' => $passwordHash,
        ':current_outfit_id' => $config['default_outfit_id'],
    ]);

    $userId = (int) $pdo->lastInsertId();
    $unlockStatement = $pdo->prepare(
        'INSERT INTO user_outfits (user_id, outfit_id, unlocked_at) VALUES (:user_id, :outfit_id, :unlocked_at)'
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
    $statement = $pdo->prepare('UPDATE users SET username = :username WHERE id = :id');
    $statement->execute([
        ':username' => trim($username),
        ':id' => $userId,
    ]);
}

function capy_update_password(PDO $pdo, int $userId, string $passwordHash): void
{
    $statement = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
    $statement->execute([
        ':password_hash' => $passwordHash,
        ':id' => $userId,
    ]);
}

function capy_get_current_user(PDO $pdo): ?array
{
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
        'unlockedOutfitIds' => capy_get_unlocked_outfit_ids($pdo, (int) $user['id'], $config),
        'unlockedCharacters' => capy_get_unlocked_outfit_ids($pdo, (int) $user['id'], $config),
        'unlockedBadgeRouteIds' => capy_get_unlocked_badge_route_ids($pdo, (int) $user['id']),
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
    $statement = $pdo->prepare('SELECT outfit_id FROM user_outfits WHERE user_id = :user_id ORDER BY unlocked_at ASC');
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
    $statement = $pdo->prepare('SELECT route_id FROM user_route_badges WHERE user_id = :user_id ORDER BY route_id ASC');
    $statement->execute([':user_id' => $userId]);
    return array_map(static function ($row) {
        return (int) $row['route_id'];
    }, $statement->fetchAll());
}

function capy_get_routes(PDO $pdo, ?int $userId = null): array
{
    $rows = $pdo->query('SELECT * FROM routes ORDER BY order_index ASC')->fetchAll();
    $unlockedBadgeRouteIds = $userId ? capy_get_unlocked_badge_route_ids($pdo, $userId) : [];

    return array_map(
        static function (array $row) use ($unlockedBadgeRouteIds): array {
            return [
                'id' => (int) $row['id'],
                'key' => $row['route_key'],
                'name' => $row['name'],
                'orderIndex' => (int) $row['order_index'],
                'backgroundImage' => $row['background_image'],
                'orbImage' => $row['orb_image'] ?: 'assets/esfera_nivel.webp',
                'content' => $row['content'],
                'badgeImage' => $row['badge_image'],
                'badgeUnlocked' => in_array((int) $row['id'], $unlockedBadgeRouteIds, true),
            ];
        },
        $rows
    );
}

function capy_get_levels_by_route(PDO $pdo, $routeId): array
{
    $statement = $pdo->prepare('SELECT * FROM levels WHERE route_id = :route_id ORDER BY route_order ASC');
    $statement->execute([':route_id' => $routeId]);
    return array_map('capy_map_level_row', $statement->fetchAll());
}

function capy_get_level(PDO $pdo, int $levelId): ?array
{
    $statement = $pdo->prepare('SELECT * FROM levels WHERE id = :id LIMIT 1');
    $statement->execute([':id' => $levelId]);
    $row = $statement->fetch();
    return $row ? capy_map_level_row($row) : null;
}

function capy_map_level_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'routeId' => (int) $row['route_id'],
        'routeKey' => $row['route_key'],
        'routeOrder' => (int) $row['route_order'],
        'name' => $row['name'],
        'title' => $row['title'],
        'difficulty' => $row['difficulty'],
        'difficultyLabel' => $row['difficulty_label'],
        'content' => $row['content'],
        'backgroundImage' => $row['background_image'],
        'href' => $row['href'],
        'x' => $row['anchor_x'],
        'y' => $row['anchor_y'],
    ];
}

function capy_get_exercises_by_level(PDO $pdo, int $levelId): array
{
    $statement = $pdo->prepare('SELECT * FROM exercises WHERE level_id = :level_id ORDER BY order_index ASC');
    $statement->execute([':level_id' => $levelId]);
    $rows = $statement->fetchAll();

    return array_map(
        static function (array $row): array {
            return [
                'id' => $row['id'],
                'levelId' => (int) $row['level_id'],
                'orderIndex' => (int) $row['order_index'],
                'type' => $row['type'],
                'rawType' => $row['raw_type'],
                'prompt' => $row['prompt'],
                'contentData' => json_decode($row['content_data'], true) ?: [],
                'answerData' => json_decode($row['answer_data'], true) ?: [],
            ];
        },
        $rows
    );
}

function capy_get_outfits(PDO $pdo): array
{
    $rows = $pdo->query('SELECT * FROM outfits ORDER BY cost ASC, name ASC')->fetchAll();
    return array_map(
        static function (array $row): array {
            return [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'],
                'tagline' => $row['tagline'],
                'cost' => (int) $row['cost'],
                'image' => $row['image'],
            ];
        },
        $rows
    );
}

function capy_get_outfit(PDO $pdo, string $outfitId): ?array
{
    $statement = $pdo->prepare('SELECT * FROM outfits WHERE id = :id LIMIT 1');
    $statement->execute([':id' => $outfitId]);
    $row = $statement->fetch();

    if (!$row) {
        return null;
    }

    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'description' => $row['description'],
        'tagline' => $row['tagline'],
        'cost' => (int) $row['cost'],
        'image' => $row['image'],
    ];
}

function capy_unlock_outfit(PDO $pdo, array $user, array $outfit, array $config): array
{
    $unlockedIds = capy_get_unlocked_outfit_ids($pdo, (int) $user['id'], $config);
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
        $updateUser = $pdo->prepare('UPDATE users SET xp = :xp WHERE id = :id');
        $updateUser->execute([
            ':xp' => (int) $user['xp'] - (int) $outfit['cost'],
            ':id' => (int) $user['id'],
        ]);

        $insertUnlock = $pdo->prepare(
            'INSERT INTO user_outfits (user_id, outfit_id, unlocked_at) VALUES (:user_id, :outfit_id, :unlocked_at)'
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
    $statement = $pdo->prepare('SELECT 1 FROM user_outfits WHERE user_id = :user_id AND outfit_id = :outfit_id LIMIT 1');
    $statement->execute([
        ':user_id' => (int) $user['id'],
        ':outfit_id' => $outfit['id'],
    ]);

    if (!$statement->fetchColumn()) {
        throw new CapyHttpException(422, 'Primero desbloquea este vestuario.');
    }

    $update = $pdo->prepare('UPDATE users SET current_outfit_id = :current_outfit_id WHERE id = :id');
    $update->execute([
        ':current_outfit_id' => $outfit['id'],
        ':id' => (int) $user['id'],
    ]);

    return capy_find_user_by_id($pdo, (int) $user['id']);
}

function capy_complete_level(PDO $pdo, array $user, int $levelId, $answers, array $config): array
{
    $level = capy_get_level($pdo, $levelId);
    if (!$level) {
        throw new CapyHttpException(404, 'Nivel no encontrado.');
    }

    $totalLevels = capy_total_levels($config);
    $currentLevelId = (int) $user['current_level_id'];
    $gameAlreadyCompleted = $currentLevelId === $totalLevels + 1;

    if (!$gameAlreadyCompleted && $levelId > $currentLevelId) {
        throw new CapyHttpException(422, 'Este nivel sigue bloqueado.');
    }

    $exercises = capy_get_exercises_by_level($pdo, $levelId);
    $answersByExerciseId = [];
    foreach (is_array($answers) ? $answers : [] as $entry) {
        if (!is_array($entry) || !isset($entry['exerciseId'])) {
            continue;
        }
        $answersByExerciseId[(string) $entry['exerciseId']] = $entry['answer'] ?? null;
    }

    foreach ($exercises as $exercise) {
        $answer = $answersByExerciseId[(string) $exercise['id']] ?? null;
        if (!capy_validate_exercise_answer([
            'type' => $exercise['type'],
            'answer_data' => $exercise['answerData'],
        ], $answer)) {
            throw new CapyHttpException(422, 'Hay respuestas incorrectas o incompletas.');
        }
    }

    $practice = $gameAlreadyCompleted || $levelId < $currentLevelId;
    $reward = 0;
    $nextLevelId = $currentLevelId;
    $routeCompleted = false;
    $gameCompleted = false;
    $badgeUnlocked = false;

    if (!$practice) {
        $reward = capy_xp_rewards()[$level['difficulty']] ?? 0;
        $nextLevelId = min($levelId + 1, $totalLevels + 1);
        $routeCompleted = (int) $level['routeOrder'] === (int) $config['levels_per_route'];
        $gameCompleted = $nextLevelId === $totalLevels + 1;
        $streakState = capy_next_streak_state($user, $config);

        $pdo->beginTransaction();
        try {
            $updateUser = $pdo->prepare(
                'UPDATE users
                 SET xp = :xp, streak = :streak, last_completion_at = :last_completion_at, current_level_id = :current_level_id
                 WHERE id = :id'
            );
            $updateUser->execute([
                ':xp' => (int) $user['xp'] + $reward,
                ':streak' => $streakState['streak'],
                ':last_completion_at' => $streakState['lastCompletionAt'],
                ':current_level_id' => $nextLevelId,
                ':id' => (int) $user['id'],
            ]);

            if ($routeCompleted) {
                $badgeInsert = $pdo->prepare(
                    'INSERT OR IGNORE INTO user_route_badges (user_id, route_id, unlocked_at)
                     VALUES (:user_id, :route_id, :unlocked_at)'
                );
                $badgeInsert->execute([
                    ':user_id' => (int) $user['id'],
                    ':route_id' => (int) $level['routeId'],
                    ':unlocked_at' => capy_now_iso(),
                ]);
                $badgeUnlocked = $badgeInsert->rowCount() > 0;
            }

            $pdo->commit();
        } catch (Throwable $exception) {
            $pdo->rollBack();
            throw $exception;
        }
    }

    return [
        'practice' => $practice,
        'reward' => $reward,
        'nextLevelId' => $nextLevelId,
        'routeCompleted' => $routeCompleted,
        'gameCompleted' => $gameCompleted,
        'badgeUnlocked' => $badgeUnlocked,
        'user' => capy_find_user_by_id($pdo, (int) $user['id']),
    ];
}

function capy_next_streak_state(array $user, array $config): array
{
    $nowIso = capy_now_iso();
    $todayKey = capy_date_key($nowIso, $config['app_timezone']);
    $lastKey = !empty($user['last_completion_at']) ? capy_date_key((string) $user['last_completion_at'], $config['app_timezone']) : '';

    if ($lastKey === '') {
        $streak = 1;
    } elseif ($lastKey === $todayKey) {
        $streak = max(1, (int) $user['streak']);
    } elseif (capy_days_between_date_keys($lastKey, $todayKey) === 1) {
        $streak = max(0, (int) $user['streak']) + 1;
    } else {
        $streak = 1;
    }

    return [
        'streak' => $streak,
        'lastCompletionAt' => $nowIso,
    ];
}

function capy_now_iso(): string
{
    return (new DateTimeImmutable('now'))->format(DateTimeInterface::ATOM);
}

function capy_date_key(string $isoValue, string $timezone): string
{
    $date = new DateTimeImmutable($isoValue);
    $zoned = $date->setTimezone(new DateTimeZone($timezone));
    return $zoned->format('Y-m-d');
}

function capy_days_between_date_keys(string $leftKey, string $rightKey): int
{
    $left = DateTimeImmutable::createFromFormat('Y-m-d', $leftKey) ?: new DateTimeImmutable('1970-01-01');
    $right = DateTimeImmutable::createFromFormat('Y-m-d', $rightKey) ?: new DateTimeImmutable('1970-01-01');
    return (int) $left->diff($right)->format('%r%a');
}
