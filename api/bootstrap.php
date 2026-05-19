<?php

$config = require __DIR__ . '/config.php';
$localConfigPath = __DIR__ . '/config.local.php';
if (is_file($localConfigPath)) {
    $localConfig = require $localConfigPath;
    if (is_array($localConfig)) {
        $config = array_replace($config, $localConfig);
    }
}

date_default_timezone_set($config['app_timezone']);

require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/game_data.php';
require_once __DIR__ . '/lib/database.php';
require_once __DIR__ . '/lib/repositories.php';

capy_set_runtime_config($config);
capy_send_cors_headers();
capy_start_session($config);

$pdo = capy_db_connect($config);
capy_db_initialize($pdo, $config, dirname(__DIR__));

return [
    'config' => $config,
    'pdo' => $pdo,
];
