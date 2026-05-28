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
