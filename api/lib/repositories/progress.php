<?php

// Aplicacion del resultado de un nivel sobre progreso, XP y racha.

function capy_complete_level(PDO $pdo, array $user, int $levelId, $answers, array $config): array
{
    // Primero se valida que el usuario este jugando un nivel permitido y que
    // cada ejercicio llegue con una respuesta compatible con su tipo.
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
    $newlyDiscoveredOutfits = [];
    $streakCelebration = null;
    $streakState = null;
    $storyBeat = null;

    if (!$practice) {
        // Solo los avances nuevos entregan recompensa, insignias y cambios de
        // racha. Repetir niveles ya completados se trata como practica.
        $reward = capy_xp_rewards()[$level['difficulty']] ?? 0;
        $nextLevelId = min($levelId + 1, $totalLevels + 1);
        $routeCompleted = (int) $level['routeOrder'] === (int) $config['levels_per_route'];
        $gameCompleted = $nextLevelId === $totalLevels + 1;
        $storyBeat = [
            'title' => (string) ($level['storyTitle'] ?? ''),
            'message' => (string) ($level['storyMessage'] ?? ''),
            'characterName' => (string) ($level['storyCharacterName'] ?? ''),
            'characterImage' => (string) ($level['storyCharacterImage'] ?? ''),
        ];
        $streakState = capy_next_streak_state($user, $config);

        $pdo->beginTransaction();
        try {
            $updateUser = $pdo->prepare(
                'UPDATE ' . capy_table('users') . '
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
                $insertIgnore = capy_db_driver() === 'mysql' ? 'INSERT IGNORE' : 'INSERT OR IGNORE';
                $badgeInsert = $pdo->prepare(
                    $insertIgnore . ' INTO ' . capy_table('user_route_badges') . ' (user_id, route_id, unlocked_at)
                     VALUES (:user_id, :route_id, :unlocked_at)'
                );
                $badgeInsert->execute([
                    ':user_id' => (int) $user['id'],
                    ':route_id' => (int) $level['routeId'],
                    ':unlocked_at' => capy_now_iso(),
                ]);
                $badgeUnlocked = $badgeInsert->rowCount() > 0;

                if ($badgeUnlocked) {
                    $routeRewardOutfit = capy_get_route_reward_outfit_by_route_id((int) $level['routeId']);
                    if ($routeRewardOutfit) {
                        $newlyDiscoveredOutfits[] = [
                            'id' => $routeRewardOutfit['id'],
                            'name' => $routeRewardOutfit['name'],
                            'description' => $routeRewardOutfit['description'],
                            'tagline' => $routeRewardOutfit['tagline'],
                            'cost' => (int) $routeRewardOutfit['cost'],
                            'image' => $routeRewardOutfit['image'],
                            'unlockRouteId' => (int) ($routeRewardOutfit['unlock_route_id'] ?? 0),
                            'unlockRouteName' => !empty($routeRewardOutfit['unlock_route_id'])
                                ? capy_get_route_name_by_id((int) $routeRewardOutfit['unlock_route_id'])
                                : '',
                        ];
                    }
                }
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
        'newlyDiscoveredOutfits' => $newlyDiscoveredOutfits,
        'streakCelebration' => is_array($streakState) ? ($streakState['celebration'] ?? null) : $streakCelebration,
        'storyBeat' => $storyBeat,
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
        'celebration' => [
            'show' => $lastKey !== $todayKey,
            'streak' => $streak,
            'title' => 'Racha activa x' . $streak,
            'description' => $lastKey !== $todayKey
                ? 'Tu primera actividad correcta de hoy quedo registrada.'
                : '',
        ],
    ];
}
