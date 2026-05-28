<?php

// Lectura del banco unico de preguntas y resolucion por ruta y nivel.

function capy_load_question_bank(string $projectRoot): array
{
    $datasets = [];
    foreach (['content/question-bank.json'] as $relativePath) {
        $fullPath = $projectRoot . DIRECTORY_SEPARATOR . $relativePath;
        if (!is_file($fullPath)) {
            continue;
        }

        $raw = file_get_contents($fullPath);
        if ($raw === false || trim($raw) === '') {
            continue;
        }

        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $datasets[] = $decoded;
        }
    }

    return $datasets[0] ?? ['routes' => []];
}

function capy_resolve_questions_for_level(array $questionBank, array $level, array $config): array
{
    // El banco queda indexado por ruta y por orden de nivel. Si falta una
    // entrada, se usa la ruta de algoritmos como respaldo controlado.
    $routeEntry = capy_find_question_route($questionBank, (string) ($level['route_key'] ?? ''));
    $levelEntry = capy_find_question_level($routeEntry, (int) ($level['route_order'] ?? 0));

    if (isset($levelEntry['exercises']) && is_array($levelEntry['exercises'])) {
        return capy_ensure_exercise_count($levelEntry['exercises'], $config);
    }

    $fallbackRoute = capy_find_question_route($questionBank, 'algoritmos');
    $fallbackLevel = capy_find_question_level($fallbackRoute, (int) ($level['route_order'] ?? 0));

    return isset($fallbackLevel['exercises']) && is_array($fallbackLevel['exercises'])
        ? capy_ensure_exercise_count($fallbackLevel['exercises'], $config)
        : [];
}

function capy_find_question_route(array $questionBank, string $routeKey): ?array
{
    $routes = isset($questionBank['routes']) && is_array($questionBank['routes'])
        ? $questionBank['routes']
        : [];

    foreach ($routes as $route) {
        if ((string) ($route['key'] ?? '') === $routeKey) {
            return $route;
        }
    }

    return null;
}

function capy_find_question_level(?array $routeEntry, int $routeOrder): ?array
{
    $levels = isset($routeEntry['levels']) && is_array($routeEntry['levels'])
        ? $routeEntry['levels']
        : [];

    foreach ($levels as $level) {
        if ((int) ($level['order'] ?? 0) === $routeOrder) {
            return $level;
        }
    }

    return null;
}

function capy_ensure_exercise_count(array $questions, array $config): array
{
    $clean = array_values(array_filter($questions, static function ($question) {
        return !empty($question);
    }));
    $target = (int) $config['exercises_per_level'];

    if (count($clean) >= $target) {
        return array_slice($clean, 0, $target);
    }

    if (!$clean) {
        return [];
    }

    $filled = $clean;
    $index = 0;
    while (count($filled) < $target) {
        $filled[] = $clean[$index % count($clean)];
        $index += 1;
    }

    return $filled;
}
