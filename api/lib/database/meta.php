<?php

function capy_get_meta_value(PDO $pdo, string $key): ?string
{
    $statement = $pdo->prepare('SELECT meta_value FROM ' . capy_table('app_meta') . ' WHERE meta_key = :meta_key LIMIT 1');
    $statement->execute([':meta_key' => $key]);
    $value = $statement->fetchColumn();
    return $value === false ? null : (string) $value;
}

function capy_set_meta_value(PDO $pdo, string $key, string $value): void
{
    $table = capy_table('app_meta');
    if (capy_db_driver() === 'mysql') {
        $statement = $pdo->prepare(
            "INSERT INTO {$table} (meta_key, meta_value)
             VALUES (:meta_key, :meta_value)
             ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)"
        );
        $statement->execute([
            ':meta_key' => $key,
            ':meta_value' => $value,
        ]);
        return;
    }

    $statement = $pdo->prepare(
        "INSERT INTO {$table} (meta_key, meta_value)
         VALUES (:meta_key, :meta_value)
         ON CONFLICT(meta_key) DO UPDATE SET meta_value = excluded.meta_value"
    );
    $statement->execute([
        ':meta_key' => $key,
        ':meta_value' => $value,
    ]);
}
