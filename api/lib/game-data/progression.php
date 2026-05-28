<?php

// Reglas de progresion que convierten rutas en niveles jugables.

function capy_difficulty_by_route_order(): array
{
    return [
        1 => 'easy',
        2 => 'easy',
        3 => 'medium',
        4 => 'medium',
        5 => 'hard',
        6 => 'hard',
        7 => 'integrative',
    ];
}

function capy_difficulty_labels(): array
{
    return [
        'easy' => 'Fácil',
        'medium' => 'Medio',
        'hard' => 'Difícil',
        'integrative' => 'Integrador',
    ];
}

function capy_difficulty_buckets(): array
{
    return [
        'easy' => 'facil',
        'medium' => 'medio',
        'hard' => 'dificil',
        'integrative' => 'integrador',
    ];
}

function capy_xp_rewards(): array
{
    return [
        'easy' => 100,
        'medium' => 200,
        'hard' => 300,
        'integrative' => 550,
    ];
}

function capy_level_anchors(): array
{
    return [
        ['x' => '16.2%', 'y' => '52%'],
        ['x' => '34.3%', 'y' => '42.2%'],
        ['x' => '33.2%', 'y' => '74.9%'],
        ['x' => '49.8%', 'y' => '59.9%'],
        ['x' => '66.5%', 'y' => '37.2%'],
        ['x' => '88.4%', 'y' => '49.8%'],
        ['x' => '77.2%', 'y' => '73.7%'],
    ];
}

function capy_total_levels(array $config): int
{
    return count(capy_route_definitions()) * (int) $config['levels_per_route'];
}

function capy_build_levels(array $config): array
{
    $levels = [];
    $anchors = capy_level_anchors();
    $difficultyByOrder = capy_difficulty_by_route_order();
    $difficultyLabels = capy_difficulty_labels();

    foreach (capy_route_definitions() as $routeIndex => $route) {
        for ($routeOrder = 1; $routeOrder <= (int) $config['levels_per_route']; $routeOrder += 1) {
            $difficulty = $difficultyByOrder[$routeOrder];
            $globalId = ($routeIndex * (int) $config['levels_per_route']) + $routeOrder;
            $anchor = $anchors[$routeOrder - 1] ?? ['x' => '50%', 'y' => '50%'];

            $levels[] = [
                'id' => $globalId,
                'route_id' => $route['id'],
                'route_key' => $route['key'],
                'route_order' => $routeOrder,
                'name' => 'Nivel ' . $routeOrder,
                'title' => 'Nivel ' . $routeOrder,
                'difficulty' => $difficulty,
                'difficulty_label' => $difficultyLabels[$difficulty],
                'content' => capy_build_level_content($route, $difficulty),
                'background_image' => $route['background_image'],
                'href' => 'nivel.html?levelId=' . $globalId,
                'anchor_x' => $anchor['x'],
                'anchor_y' => $anchor['y'],
                'story_title' => 'Eco del nivel ' . $routeOrder,
                'story_message' => capy_build_level_story($route, $routeOrder),
                'story_character_name' => $route['story_character_name'] ?? '',
                'story_character_image' => $route['story_character_image'] ?? '',
            ];
        }
    }

    return $levels;
}

function capy_build_level_content(array $route, string $difficulty): string
{
    if ($difficulty === 'integrative') {
        return 'Reto integrador de ' . $route['name'] . ' con ejercicios combinados.';
    }

    $labels = capy_difficulty_labels();
    return $route['content'] . ' Enfoque ' . strtolower($labels[$difficulty]) . '.';
}

function capy_build_level_story(array $route, int $routeOrder): string
{
    $messages = capy_story_messages();
    $routeMessages = $messages[$route['key']] ?? [];
    return $routeMessages[$routeOrder - 1] ?? ('Una nueva parte del sendero se revela en ' . $route['name'] . '.');
}
