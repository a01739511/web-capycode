<?php

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
