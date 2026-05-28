<?php

// Carga el catalogo jugable en BD a partir del banco canonico y la progresion
// de rutas y niveles definida por la aplicacion.

function capy_seed_levels_and_exercises(PDO $pdo, array $config, string $projectRoot): void
{
    $levelsTable = capy_table('levels');
    $exercisesTable = capy_table('exercises');
    $questionBank = capy_load_question_bank($projectRoot);
    $levels = capy_build_levels($config);

    $pdo->beginTransaction();
    try {
        $levelStatement = $pdo->prepare(
            "INSERT INTO {$levelsTable} (
                id, route_id, route_key, route_order, name, title, difficulty, difficulty_label,
                content, background_image, href, anchor_x, anchor_y, story_title, story_message, story_character_name, story_character_image
             ) VALUES (
                :id, :route_id, :route_key, :route_order, :name, :title, :difficulty, :difficulty_label,
                :content, :background_image, :href, :anchor_x, :anchor_y, :story_title, :story_message, :story_character_name, :story_character_image
             )"
        );

        $exerciseStatement = $pdo->prepare(
            "INSERT INTO {$exercisesTable} (
                id, level_id, order_index, type, raw_type, prompt, content_data, answer_data
             ) VALUES (
                :id, :level_id, :order_index, :type, :raw_type, :prompt, :content_data, :answer_data
             )"
        );

        foreach ($levels as $level) {
            $levelStatement->execute([
                ':id' => $level['id'],
                ':route_id' => $level['route_id'],
                ':route_key' => $level['route_key'],
                ':route_order' => $level['route_order'],
                ':name' => $level['name'],
                ':title' => $level['title'],
                ':difficulty' => $level['difficulty'],
                ':difficulty_label' => $level['difficulty_label'],
                ':content' => $level['content'],
                ':background_image' => $level['background_image'],
                ':href' => $level['href'],
                ':anchor_x' => $level['anchor_x'],
                ':anchor_y' => $level['anchor_y'],
                ':story_title' => $level['story_title'] ?? null,
                ':story_message' => $level['story_message'] ?? null,
                ':story_character_name' => $level['story_character_name'] ?? null,
                ':story_character_image' => $level['story_character_image'] ?? null,
            ]);

            // Cada nivel recibe su paquete estable de ejercicios ya normalizado
            // antes de insertarse en la base.
            $questions = capy_resolve_questions_for_level($questionBank, $level, $config);
            foreach ($questions as $index => $question) {
                $exercise = capy_normalize_exercise($question, $level, $index + 1);
                $exerciseStatement->execute([
                    ':id' => $exercise['id'],
                    ':level_id' => $exercise['level_id'],
                    ':order_index' => $exercise['order_index'],
                    ':type' => $exercise['type'],
                    ':raw_type' => $exercise['raw_type'],
                    ':prompt' => $exercise['prompt'],
                    ':content_data' => json_encode($exercise['content_data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ':answer_data' => json_encode($exercise['answer_data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ]);
            }
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function capy_sync_levels_and_exercises(PDO $pdo, array $config, string $projectRoot): void
{
    $levelsTable = capy_table('levels');
    $exercisesTable = capy_table('exercises');

    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM {$exercisesTable}");
        $pdo->exec("DELETE FROM {$levelsTable}");
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }

    capy_seed_levels_and_exercises($pdo, $config, $projectRoot);
}

function capy_sync_levels_and_exercises_if_needed(PDO $pdo, array $config, string $projectRoot): void
{
    $levelsTable = capy_table('levels');
    $fingerprint = capy_catalog_fingerprint($config, $projectRoot);
    $storedFingerprint = capy_get_meta_value($pdo, 'catalog_fingerprint');
    $levelCount = (int) $pdo->query("SELECT COUNT(*) FROM {$levelsTable}")->fetchColumn();

    if ($levelCount > 0 && $storedFingerprint === $fingerprint) {
        return;
    }

    capy_sync_levels_and_exercises($pdo, $config, $projectRoot);
    capy_set_meta_value($pdo, 'catalog_fingerprint', $fingerprint);
}

function capy_catalog_fingerprint(array $config, string $projectRoot): string
{
    $parts = [
        json_encode(capy_route_definitions(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        json_encode(capy_story_messages(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        json_encode(capy_build_levels($config), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ];

    foreach ([
        'content/question-bank.json',
        'api/lib/game-data/catalog.php',
        'api/lib/game-data/progression.php',
        'api/lib/game-data/questions.php',
        'api/lib/game-data/exercises.php',
    ] as $relativePath) {
        $fullPath = $projectRoot . DIRECTORY_SEPARATOR . $relativePath;
        if (is_file($fullPath)) {
            $parts[] = (string) file_get_contents($fullPath);
        }
    }

    return hash('sha256', implode("\n---\n", $parts));
}
