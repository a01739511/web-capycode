<?php

// Definicion del esquema fisico. Se mantiene en un solo lugar para que SQLite
// y MySQL creen exactamente las mismas tablas y columnas.

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
    $metaTable = capy_table('app_meta');

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
                story_title VARCHAR(255) NULL,
                story_message TEXT NULL,
                story_character_name VARCHAR(120) NULL,
                story_character_image TEXT NULL,
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

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$metaTable} (
                meta_key VARCHAR(120) NOT NULL PRIMARY KEY,
                meta_value LONGTEXT NULL
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
                story_title TEXT NULL,
                story_message TEXT NULL,
                story_character_name TEXT NULL,
                story_character_image TEXT NULL,
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

        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$metaTable} (
                meta_key TEXT PRIMARY KEY,
                meta_value TEXT NULL
             )"
        );
    }

    capy_ensure_routes_table_columns($pdo);
    capy_ensure_levels_table_columns($pdo);

    if ((int) $pdo->query("SELECT COUNT(*) FROM {$routesTable}")->fetchColumn() === 0) {
        capy_seed_routes($pdo);
    } else {
        capy_sync_routes_catalog($pdo);
    }

    capy_sync_levels_and_exercises_if_needed($pdo, $config, $projectRoot);

    if ((int) $pdo->query("SELECT COUNT(*) FROM {$outfitsTable}")->fetchColumn() === 0) {
        capy_seed_outfits($pdo);
    } else {
        capy_sync_outfits_catalog($pdo);
    }

    capy_migrate_default_outfit_state($pdo, $config);
}

function capy_ensure_levels_table_columns(PDO $pdo): void
{
    $levelsTable = capy_table('levels');
    $columns = [
        'story_title' => capy_db_driver() === 'mysql' ? 'VARCHAR(255) NULL' : 'TEXT NULL',
        'story_message' => capy_db_driver() === 'mysql' ? 'TEXT NULL' : 'TEXT NULL',
        'story_character_name' => capy_db_driver() === 'mysql' ? 'VARCHAR(120) NULL' : 'TEXT NULL',
        'story_character_image' => capy_db_driver() === 'mysql' ? 'TEXT NULL' : 'TEXT NULL',
    ];

    foreach ($columns as $columnName => $definition) {
        if (capy_db_driver() === 'mysql') {
            $statement = $pdo->prepare("SHOW COLUMNS FROM {$levelsTable} LIKE :column_name");
            $statement->execute([':column_name' => $columnName]);
            if (!$statement->fetch()) {
                $pdo->exec("ALTER TABLE {$levelsTable} ADD COLUMN {$columnName} {$definition}");
            }
            continue;
        }

        $statement = $pdo->query("PRAGMA table_info({$levelsTable})");
        $existing = array_map(static function (array $row): string {
            return (string) ($row['name'] ?? '');
        }, $statement ? $statement->fetchAll() : []);
        if (!in_array($columnName, $existing, true)) {
            $pdo->exec("ALTER TABLE {$levelsTable} ADD COLUMN {$columnName} {$definition}");
        }
    }
}
