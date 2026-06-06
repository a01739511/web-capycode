<?php

// Lectura del catalogo jugable persistido en base de datos.

function capy_get_routes(PDO $pdo, ?int $userId = null): array
{
    $rows = $pdo->query('SELECT * FROM ' . capy_table('routes') . ' ORDER BY order_index ASC')->fetchAll();
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
    $statement = $pdo->prepare('SELECT * FROM ' . capy_table('levels') . ' WHERE route_id = :route_id ORDER BY route_order ASC');
    $statement->execute([':route_id' => $routeId]);
    return array_map('capy_map_level_row', $statement->fetchAll());
}

function capy_get_level(PDO $pdo, int $levelId): ?array
{
    $statement = $pdo->prepare('SELECT * FROM ' . capy_table('levels') . ' WHERE id = :id LIMIT 1');
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
        'storyTitle' => $row['story_title'] ?? '',
        'storyMessage' => $row['story_message'] ?? '',
        'storyCharacterName' => $row['story_character_name'] ?? '',
        'storyCharacterImage' => $row['story_character_image'] ?? '',
    ];
}

function capy_get_exercises_by_level(PDO $pdo, int $levelId): array
{
    $statement = $pdo->prepare('SELECT * FROM ' . capy_table('exercises') . ' WHERE level_id = :level_id ORDER BY order_index ASC');
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
