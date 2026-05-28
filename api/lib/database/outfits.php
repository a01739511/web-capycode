<?php

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
