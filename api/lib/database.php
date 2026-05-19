<?php

function capy_set_runtime_config(array $config): void
{
    $GLOBALS['capy_runtime_config'] = $config;
}

function capy_runtime_config(): array
{
    $config = $GLOBALS['capy_runtime_config'] ?? [];
    return is_array($config) ? $config : [];
}

function capy_db_driver(): string
{
    $driver = strtolower((string) (capy_runtime_config()['db_driver'] ?? 'sqlite'));
    return $driver === 'mysql' ? 'mysql' : 'sqlite';
}

function capy_table(string $logicalName): string
{
    $prefix = (string) (capy_runtime_config()['table_prefix'] ?? 'capycode_');
    return preg_replace('/[^a-zA-Z0-9_]/', '', $prefix . $logicalName);
}

function capy_db_label(array $config): string
{
    return strtolower((string) ($config['db_driver'] ?? 'sqlite')) === 'mysql'
        ? (string) ($config['db_name'] ?? '')
        : basename((string) ($config['db_path'] ?? 'capycode.sqlite'));
}

function capy_db_connect(array $config): PDO
{
    if (strtolower((string) ($config['db_driver'] ?? 'sqlite')) === 'mysql') {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            (string) ($config['db_host'] ?? '127.0.0.1'),
            (int) ($config['db_port'] ?? 3306),
            (string) ($config['db_name'] ?? ''),
            (string) ($config['db_charset'] ?? 'utf8mb4')
        );

        $pdo = new PDO($dsn, (string) ($config['db_user'] ?? ''), (string) ($config['db_password'] ?? ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec('SET NAMES ' . $pdo->quote((string) ($config['db_charset'] ?? 'utf8mb4')));
        return $pdo;
    }

    $databasePath = (string) ($config['db_path'] ?? '');
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
    $usersTable = capy_table('users');
    $routesTable = capy_table('routes');
    $levelsTable = capy_table('levels');
    $exercisesTable = capy_table('exercises');
    $outfitsTable = capy_table('outfits');
    $userOutfitsTable = capy_table('user_outfits');
    $userRouteBadgesTable = capy_table('user_route_badges');
    $userTokensTable = capy_table('user_tokens');

    if (capy_db_driver() === 'mysql') {
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$usersTable} (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(120) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                current_level_id INT NOT NULL DEFAULT 1,
                streak INT NOT NULL DEFAULT 0,
                last_completion_at VARCHAR(40) NULL,
                xp INT NOT NULL DEFAULT 0,
                current_outfit_id VARCHAR(120) NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$routesTable} (
                id INT NOT NULL PRIMARY KEY,
                route_key VARCHAR(120) NOT NULL UNIQUE,
                name VARCHAR(190) NOT NULL,
                order_index INT NOT NULL UNIQUE,
                background_image TEXT NOT NULL,
                orb_image TEXT NULL,
                content TEXT NOT NULL,
                badge_name TEXT NULL,
                badge_description TEXT NULL,
                badge_image TEXT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$levelsTable} (
                id INT NOT NULL PRIMARY KEY,
                route_id INT NOT NULL,
                route_key VARCHAR(120) NOT NULL,
                route_order INT NOT NULL,
                name VARCHAR(190) NOT NULL,
                title VARCHAR(255) NOT NULL,
                difficulty VARCHAR(60) NOT NULL,
                difficulty_label VARCHAR(60) NOT NULL,
                content TEXT NOT NULL,
                background_image TEXT NOT NULL,
                href VARCHAR(255) NOT NULL,
                anchor_x VARCHAR(32) NOT NULL,
                anchor_y VARCHAR(32) NOT NULL,
                CONSTRAINT fk_{$levelsTable}_route FOREIGN KEY (route_id) REFERENCES {$routesTable}(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$exercisesTable} (
                id VARCHAR(160) NOT NULL PRIMARY KEY,
                level_id INT NOT NULL,
                order_index INT NOT NULL,
                type VARCHAR(80) NOT NULL,
                raw_type VARCHAR(80) NOT NULL,
                prompt TEXT NOT NULL,
                content_data LONGTEXT NOT NULL,
                answer_data LONGTEXT NOT NULL,
                CONSTRAINT fk_{$exercisesTable}_level FOREIGN KEY (level_id) REFERENCES {$levelsTable}(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$outfitsTable} (
                id VARCHAR(120) NOT NULL PRIMARY KEY,
                name VARCHAR(190) NOT NULL,
                description TEXT NOT NULL,
                tagline VARCHAR(190) NOT NULL,
                cost INT NOT NULL,
                image TEXT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$userOutfitsTable} (
                user_id INT UNSIGNED NOT NULL,
                outfit_id VARCHAR(120) NOT NULL,
                unlocked_at VARCHAR(40) NOT NULL,
                PRIMARY KEY (user_id, outfit_id),
                CONSTRAINT fk_{$userOutfitsTable}_user FOREIGN KEY (user_id) REFERENCES {$usersTable}(id) ON DELETE CASCADE,
                CONSTRAINT fk_{$userOutfitsTable}_outfit FOREIGN KEY (outfit_id) REFERENCES {$outfitsTable}(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$userRouteBadgesTable} (
                user_id INT UNSIGNED NOT NULL,
                route_id INT NOT NULL,
                unlocked_at VARCHAR(40) NOT NULL,
                PRIMARY KEY (user_id, route_id),
                CONSTRAINT fk_{$userRouteBadgesTable}_user FOREIGN KEY (user_id) REFERENCES {$usersTable}(id) ON DELETE CASCADE,
                CONSTRAINT fk_{$userRouteBadgesTable}_route FOREIGN KEY (route_id) REFERENCES {$routesTable}(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$userTokensTable} (
                token_hash CHAR(64) NOT NULL PRIMARY KEY,
                user_id INT UNSIGNED NOT NULL,
                created_at VARCHAR(40) NOT NULL,
                last_used_at VARCHAR(40) NULL,
                revoked_at VARCHAR(40) NULL,
                CONSTRAINT fk_{$userTokensTable}_user FOREIGN KEY (user_id) REFERENCES {$usersTable}(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        );
    } else {
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$usersTable} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                current_level_id INTEGER NOT NULL DEFAULT 1,
                streak INTEGER NOT NULL DEFAULT 0,
                last_completion_at TEXT NULL,
                xp INTEGER NOT NULL DEFAULT 0,
                current_outfit_id TEXT NULL
            )"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$routesTable} (
                id INTEGER PRIMARY KEY,
                route_key TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                order_index INTEGER NOT NULL UNIQUE,
                background_image TEXT NOT NULL,
                orb_image TEXT,
                content TEXT NOT NULL,
                badge_name TEXT,
                badge_description TEXT,
                badge_image TEXT
            )"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$levelsTable} (
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
                FOREIGN KEY (route_id) REFERENCES {$routesTable}(id) ON DELETE CASCADE
            )"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$exercisesTable} (
                id TEXT PRIMARY KEY,
                level_id INTEGER NOT NULL,
                order_index INTEGER NOT NULL,
                type TEXT NOT NULL,
                raw_type TEXT NOT NULL,
                prompt TEXT NOT NULL,
                content_data TEXT NOT NULL,
                answer_data TEXT NOT NULL,
                FOREIGN KEY (level_id) REFERENCES {$levelsTable}(id) ON DELETE CASCADE
            )"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$outfitsTable} (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                tagline TEXT NOT NULL,
                cost INTEGER NOT NULL,
                image TEXT NOT NULL
            )"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$userOutfitsTable} (
                user_id INTEGER NOT NULL,
                outfit_id TEXT NOT NULL,
                unlocked_at TEXT NOT NULL,
                PRIMARY KEY (user_id, outfit_id),
                FOREIGN KEY (user_id) REFERENCES {$usersTable}(id) ON DELETE CASCADE,
                FOREIGN KEY (outfit_id) REFERENCES {$outfitsTable}(id) ON DELETE CASCADE
            )"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$userRouteBadgesTable} (
                user_id INTEGER NOT NULL,
                route_id INTEGER NOT NULL,
                unlocked_at TEXT NOT NULL,
                PRIMARY KEY (user_id, route_id),
                FOREIGN KEY (user_id) REFERENCES {$usersTable}(id) ON DELETE CASCADE,
                FOREIGN KEY (route_id) REFERENCES {$routesTable}(id) ON DELETE CASCADE
            )"
        );

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$userTokensTable} (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                last_used_at TEXT NULL,
                revoked_at TEXT NULL,
                FOREIGN KEY (user_id) REFERENCES {$usersTable}(id) ON DELETE CASCADE
            )"
        );
    }

    capy_ensure_routes_table_columns($pdo);

    if ((int) $pdo->query("SELECT COUNT(*) FROM {$routesTable}")->fetchColumn() === 0) {
        capy_seed_routes($pdo);
    } else {
        capy_sync_routes_catalog($pdo);
    }

    if ((int) $pdo->query("SELECT COUNT(*) FROM {$levelsTable}")->fetchColumn() === 0) {
        capy_seed_levels_and_exercises($pdo, $config, $projectRoot);
    }

    if ((int) $pdo->query("SELECT COUNT(*) FROM {$outfitsTable}")->fetchColumn() === 0) {
        capy_seed_outfits($pdo);
    } else {
        capy_sync_outfits_catalog($pdo);
    }

    capy_migrate_default_outfit_state($pdo, $config);
}

function capy_seed_routes(PDO $pdo): void
{
    $routesTable = capy_table('routes');
    $statement = $pdo->prepare(
        "INSERT INTO {$routesTable} (id, route_key, name, order_index, background_image, orb_image, content, badge_name, badge_description, badge_image)
         VALUES (:id, :route_key, :name, :order_index, :background_image, :orb_image, :content, :badge_name, :badge_description, :badge_image)"
    );

    foreach (capy_route_definitions() as $index => $route) {
        $statement->execute([
            ':id' => $route['id'],
            ':route_key' => $route['key'],
            ':name' => $route['name'],
            ':order_index' => $index + 1,
            ':background_image' => $route['background_image'],
            ':orb_image' => $route['orb_image'] ?? null,
            ':content' => $route['content'],
            ':badge_name' => null,
            ':badge_description' => null,
            ':badge_image' => $route['badge_image'] ?? null,
        ]);
    }
}

function capy_ensure_routes_table_columns(PDO $pdo): void
{
    $routesTable = capy_table('routes');

    if (capy_db_driver() === 'mysql') {
        $statement = $pdo->prepare("SHOW COLUMNS FROM {$routesTable} LIKE :column_name");
        $statement->execute([':column_name' => 'orb_image']);
        if (!$statement->fetch()) {
            $pdo->exec("ALTER TABLE {$routesTable} ADD COLUMN orb_image TEXT NULL");
        }
        return;
    }

    $columns = $pdo->query("PRAGMA table_info({$routesTable})")->fetchAll();
    $columnNames = array_map(static function (array $column): string {
        return (string) ($column['name'] ?? '');
    }, $columns);

    if (!in_array('orb_image', $columnNames, true)) {
        $pdo->exec("ALTER TABLE {$routesTable} ADD COLUMN orb_image TEXT");
    }
}

function capy_sync_routes_catalog(PDO $pdo): void
{
    $routesTable = capy_table('routes');
    $statement = $pdo->prepare(
        "UPDATE {$routesTable}
         SET name = :name,
             order_index = :order_index,
             background_image = :background_image,
             orb_image = :orb_image,
             content = :content,
             badge_image = :badge_image
         WHERE route_key = :route_key"
    );

    foreach (capy_route_definitions() as $index => $route) {
        $statement->execute([
            ':name' => $route['name'],
            ':order_index' => $index + 1,
            ':background_image' => $route['background_image'],
            ':orb_image' => $route['orb_image'] ?? null,
            ':content' => $route['content'],
            ':badge_image' => $route['badge_image'] ?? null,
            ':route_key' => $route['key'],
        ]);
    }
}

function capy_seed_levels_and_exercises(PDO $pdo, array $config, string $projectRoot): void
{
    $levelsTable = capy_table('levels');
    $exercisesTable = capy_table('exercises');
    $datasets = capy_load_question_datasets($projectRoot);
    $levels = capy_build_levels($config);

    $pdo->beginTransaction();
    try {
        $levelStatement = $pdo->prepare(
            "INSERT INTO {$levelsTable} (
                id, route_id, route_key, route_order, name, title, difficulty, difficulty_label,
                content, background_image, href, anchor_x, anchor_y
             ) VALUES (
                :id, :route_id, :route_key, :route_order, :name, :title, :difficulty, :difficulty_label,
                :content, :background_image, :href, :anchor_x, :anchor_y
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
    $outfitsTable = capy_table('outfits');
    $statement = $pdo->prepare(
        "INSERT INTO {$outfitsTable} (id, name, description, tagline, cost, image)
         VALUES (:id, :name, :description, :tagline, :cost, :image)"
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

function capy_sync_outfits_catalog(PDO $pdo): void
{
    $outfitsTable = capy_table('outfits');
    $sql = capy_db_driver() === 'mysql'
        ? "INSERT INTO {$outfitsTable} (id, name, description, tagline, cost, image)
           VALUES (:id, :name, :description, :tagline, :cost, :image)
           ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                tagline = VALUES(tagline),
                cost = VALUES(cost),
                image = VALUES(image)"
        : "INSERT INTO {$outfitsTable} (id, name, description, tagline, cost, image)
           VALUES (:id, :name, :description, :tagline, :cost, :image)
           ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                description = excluded.description,
                tagline = excluded.tagline,
                cost = excluded.cost,
                image = excluded.image";

    $statement = $pdo->prepare($sql);

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

function capy_migrate_default_outfit_state(PDO $pdo, array $config): void
{
    $usersTable = capy_table('users');
    $userOutfitsTable = capy_table('user_outfits');
    $userRouteBadgesTable = capy_table('user_route_badges');
    $defaultOutfitId = (string) ($config['default_outfit_id'] ?? 'Capibara');
    $legacyStarterOutfitId = 'CapyBlack';
    $now = capy_now_iso();
    $insertIgnore = capy_db_driver() === 'mysql' ? 'INSERT IGNORE' : 'INSERT OR IGNORE';

    $ensureDefaultStatement = $pdo->prepare(
        "{$insertIgnore} INTO {$userOutfitsTable} (user_id, outfit_id, unlocked_at)
         SELECT id, :outfit_id, :unlocked_at FROM {$usersTable}"
    );
    $ensureDefaultStatement->execute([
        ':outfit_id' => $defaultOutfitId,
        ':unlocked_at' => $now,
    ]);

    $setMissingCurrentStatement = $pdo->prepare(
        "UPDATE {$usersTable}
         SET current_outfit_id = :default_outfit_id
         WHERE current_outfit_id IS NULL OR TRIM(current_outfit_id) = ''"
    );
    $setMissingCurrentStatement->execute([
        ':default_outfit_id' => $defaultOutfitId,
    ]);

    $replaceLegacyStarterStatement = $pdo->prepare(
        "UPDATE {$usersTable}
         SET current_outfit_id = :default_outfit_id
         WHERE current_outfit_id = :legacy_outfit_id
           AND id NOT IN (
                SELECT user_id
                FROM {$userRouteBadgesTable}
                WHERE route_id = 1
           )"
    );
    $replaceLegacyStarterStatement->execute([
        ':default_outfit_id' => $defaultOutfitId,
        ':legacy_outfit_id' => $legacyStarterOutfitId,
    ]);

    $removeLegacyStarterUnlockStatement = $pdo->prepare(
        "DELETE FROM {$userOutfitsTable}
         WHERE outfit_id = :legacy_outfit_id
           AND user_id NOT IN (
                SELECT user_id
                FROM {$userRouteBadgesTable}
                WHERE route_id = 1
           )"
    );
    $removeLegacyStarterUnlockStatement->execute([
        ':legacy_outfit_id' => $legacyStarterOutfitId,
    ]);
}
