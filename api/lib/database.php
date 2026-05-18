<?php

function capy_db_connect(string $databasePath): PDO
{
    $directory = dirname($databasePath);
    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }

    $pdo = new PDO('sqlite:' . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA foreign_keys = ON');

    return $pdo;
}

function capy_db_initialize(PDO $pdo, array $config, string $projectRoot): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            current_level_id INTEGER NOT NULL DEFAULT 1,
            streak INTEGER NOT NULL DEFAULT 0,
            last_completion_at TEXT NULL,
            xp INTEGER NOT NULL DEFAULT 0,
            current_outfit_id TEXT NULL
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY,
            route_key TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            order_index INTEGER NOT NULL UNIQUE,
            background_image TEXT NOT NULL,
            content TEXT NOT NULL,
            badge_name TEXT,
            badge_description TEXT,
            badge_image TEXT
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS levels (
            id INTEGER PRIMARY KEY,
            route_id INTEGER NOT NULL,
            route_key TEXT NOT NULL,
            route_order INTEGER NOT NULL,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            difficulty_label TEXT NOT NULL,
            content TEXT NOT NULL,
            background_image TEXT NOT NULL,
            href TEXT NOT NULL,
            anchor_x TEXT NOT NULL,
            anchor_y TEXT NOT NULL,
            FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS exercises (
            id TEXT PRIMARY KEY,
            level_id INTEGER NOT NULL,
            order_index INTEGER NOT NULL,
            type TEXT NOT NULL,
            raw_type TEXT NOT NULL,
            prompt TEXT NOT NULL,
            content_data TEXT NOT NULL,
            answer_data TEXT NOT NULL,
            FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS outfits (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            tagline TEXT NOT NULL,
            cost INTEGER NOT NULL,
            image TEXT NOT NULL
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS user_outfits (
            user_id INTEGER NOT NULL,
            outfit_id TEXT NOT NULL,
            unlocked_at TEXT NOT NULL,
            PRIMARY KEY (user_id, outfit_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS user_route_badges (
            user_id INTEGER NOT NULL,
            route_id INTEGER NOT NULL,
            unlocked_at TEXT NOT NULL,
            PRIMARY KEY (user_id, route_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
        )'
    );

    if ((int) $pdo->query('SELECT COUNT(*) FROM routes')->fetchColumn() === 0) {
        capy_seed_routes($pdo);
    }

    if ((int) $pdo->query('SELECT COUNT(*) FROM levels')->fetchColumn() === 0) {
        capy_seed_levels_and_exercises($pdo, $config, $projectRoot);
    }

    if ((int) $pdo->query('SELECT COUNT(*) FROM outfits')->fetchColumn() === 0) {
        capy_seed_outfits($pdo);
    }
}

function capy_seed_routes(PDO $pdo): void
{
    $statement = $pdo->prepare(
        'INSERT INTO routes (id, route_key, name, order_index, background_image, content, badge_name, badge_description, badge_image)
         VALUES (:id, :route_key, :name, :order_index, :background_image, :content, :badge_name, :badge_description, :badge_image)'
    );

    foreach (capy_route_definitions() as $index => $route) {
        $statement->execute([
            ':id' => $route['id'],
            ':route_key' => $route['key'],
            ':name' => $route['name'],
            ':order_index' => $index + 1,
            ':background_image' => $route['background_image'],
            ':content' => $route['content'],
            ':badge_name' => null,
            ':badge_description' => null,
            ':badge_image' => $route['badge_image'] ?? null,
        ]);
    }
}

function capy_seed_levels_and_exercises(PDO $pdo, array $config, string $projectRoot): void
{
    $datasets = capy_load_question_datasets($projectRoot);
    $levels = capy_build_levels($config);

    $pdo->beginTransaction();
    try {
        $levelStatement = $pdo->prepare(
            'INSERT INTO levels (
                id, route_id, route_key, route_order, name, title, difficulty, difficulty_label,
                content, background_image, href, anchor_x, anchor_y
             ) VALUES (
                :id, :route_id, :route_key, :route_order, :name, :title, :difficulty, :difficulty_label,
                :content, :background_image, :href, :anchor_x, :anchor_y
             )'
        );

        $exerciseStatement = $pdo->prepare(
            'INSERT INTO exercises (
                id, level_id, order_index, type, raw_type, prompt, content_data, answer_data
             ) VALUES (
                :id, :level_id, :order_index, :type, :raw_type, :prompt, :content_data, :answer_data
             )'
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
            ]);

            $questions = capy_resolve_questions_for_level($datasets, $level, $config);
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

function capy_seed_outfits(PDO $pdo): void
{
    $statement = $pdo->prepare(
        'INSERT INTO outfits (id, name, description, tagline, cost, image)
         VALUES (:id, :name, :description, :tagline, :cost, :image)'
    );

    foreach (capy_outfit_definitions() as $outfit) {
        $statement->execute([
            ':id' => $outfit['id'],
            ':name' => $outfit['name'],
            ':description' => $outfit['description'],
            ':tagline' => $outfit['tagline'],
            ':cost' => $outfit['cost'],
            ':image' => $outfit['image'],
        ]);
    }
}
