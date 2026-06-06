<?php

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
