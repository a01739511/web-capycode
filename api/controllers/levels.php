<?php

function capy_handle_levels_request(PDO $pdo, array $config, string $path, string $method): bool
{
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

    return false;
}
