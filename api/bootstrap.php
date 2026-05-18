<?php

$config = require __DIR__ . '/config.php';

date_default_timezone_set($config['app_timezone']);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/game_data.php';
require_once __DIR__ . '/lib/database.php';
require_once __DIR__ . '/lib/repositories.php';

capy_start_session($config);

$pdo = capy_db_connect($config['db_path']);
capy_db_initialize($pdo, $config, dirname(__DIR__));

return [
    'config' => $config,
    'pdo' => $pdo,
];
