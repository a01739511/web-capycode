<?php

return [
    'db_driver' => 'sqlite',
    'db_path' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'capycode.sqlite',
    'db_host' => '127.0.0.1',
    'db_port' => 3306,
    'db_name' => '',
    'db_user' => '',
    'db_password' => '',
    'db_charset' => 'utf8mb4',
    'table_prefix' => 'capycode_',
    'app_timezone' => 'America/Mexico_City',
    'session_name' => 'CAPYCODESESSID',
    'default_outfit_id' => 'Capibara',
    'levels_per_route' => 7,
    'exercises_per_level' => 5,
];
