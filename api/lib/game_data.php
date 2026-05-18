<?php

function capy_route_definitions(): array
{
    return [
        [
            'id' => 1,
            'key' => 'algoritmos',
            'name' => 'Algoritmo Antiguo',
            'background_image' => 'assets/world/routes/route-01-algoritmo-antiguo.png',
            'content' => 'Secuencia, selección, repetición y razonamiento algorítmico.',
            'badge_name' => 'Insignia del Algoritmo Antiguo',
            'badge_description' => 'Reconocimiento por completar la ruta de algoritmos.',
            'badge_image' => 'assets/badges/badge-route-1.svg',
        ],
        [
            'id' => 2,
            'key' => 'tipos_de_datos',
            'name' => 'Alquimista de Tipos',
            'background_image' => 'assets/world/routes/route-02-alquimista-de-tipos.jpg',
            'content' => 'Tipos primitivos, conversiones y lectura de valores.',
            'badge_name' => 'Insignia del Alquimista de Tipos',
            'badge_description' => 'Reconocimiento por completar la ruta de tipos de datos.',
            'badge_image' => 'assets/badges/badge-route-2.svg',
        ],
        [
            'id' => 3,
            'key' => 'expresiones',
            'name' => 'Altar de las Expresiones',
            'background_image' => 'assets/world/routes/route-03-expresiones.jpg',
            'content' => 'Operadores aritméticos, relacionales y lógicos.',
            'badge_name' => 'Insignia del Altar de las Expresiones',
            'badge_description' => 'Reconocimiento por completar la ruta de expresiones.',
            'badge_image' => 'assets/badges/badge-route-3.svg',
        ],
        [
            'id' => 4,
            'key' => 'condicionales',
            'name' => 'Hechizos Condicionales',
            'background_image' => 'assets/world/routes/route-04-condicionales.jpg',
            'content' => 'Decisiones con if, else y combinaciones de condiciones.',
            'badge_name' => 'Insignia de Hechizos Condicionales',
            'badge_description' => 'Reconocimiento por completar la ruta de condicionales.',
            'badge_image' => 'assets/badges/badge-route-4.svg',
        ],
        [
            'id' => 5,
            'key' => 'ciclos',
            'name' => 'Círculo de Repetición Infinita',
            'background_image' => 'assets/world/routes/route-05-ciclos.png',
            'content' => 'Repetición controlada con for, while, break y continue.',
            'badge_name' => 'Insignia del Círculo de Repetición',
            'badge_description' => 'Reconocimiento por completar la ruta de ciclos.',
            'badge_image' => 'assets/badges/badge-route-5.svg',
        ],
        [
            'id' => 6,
            'key' => 'funciones',
            'name' => 'Taller de Funciones Encantadas',
            'background_image' => 'assets/world/routes/route-06-funciones.png',
            'content' => 'Funciones, parámetros, retorno y reutilización.',
            'badge_name' => 'Insignia del Taller de Funciones',
            'badge_description' => 'Reconocimiento por completar la ruta de funciones.',
            'badge_image' => 'assets/badges/badge-route-6.svg',
        ],
        [
            'id' => 7,
            'key' => 'estructuras_de_datos',
            'name' => 'Biblioteca de Estructuras de Datos',
            'background_image' => 'assets/world/routes/route-07-estructuras-de-datos.png',
            'content' => 'Listas, colecciones y operaciones sobre datos agrupados.',
            'badge_name' => 'Insignia de la Biblioteca de Estructuras',
            'badge_description' => 'Reconocimiento por completar la ruta de estructuras de datos.',
            'badge_image' => 'assets/badges/badge-route-7.svg',
        ],
        [
            'id' => 8,
            'key' => 'archivos_de_texto_plano',
            'name' => 'El Archivo Perdido',
            'background_image' => 'assets/world/routes/route-08-archivos-de-texto-plano.jpg',
            'content' => 'Lectura, escritura y procesamiento de archivos simples.',
            'badge_name' => 'Insignia del Archivo Perdido',
            'badge_description' => 'Reconocimiento por completar la ruta de archivos de texto plano.',
            'badge_image' => 'assets/badges/badge-route-8.svg',
        ],
    ];
}

function capy_outfit_definitions(): array
{
    return [
        [
            'id' => 'CapyBlack',
            'name' => 'CapyBlack',
            'description' => 'Vestuario base de la aventura CapyCode.',
            'tagline' => 'Sombra elegante',
            'cost' => 0,
            'image' => 'assets/characters/CapyBlack.png',
        ],
        [
            'id' => 'CapyAqua',
            'name' => 'CapyAqua',
            'description' => 'Tonos acuáticos para avanzar con calma.',
            'tagline' => 'Marea tranquila',
            'cost' => 300,
            'image' => 'assets/characters/CapyAqua.png',
        ],
        [
            'id' => 'CapyKing',
            'name' => 'CapyKing',
            'description' => 'Corona y capa para una presencia solemne.',
            'tagline' => 'Corona serena',
            'cost' => 750,
            'image' => 'assets/characters/CapyKing.png',
        ],
        [
            'id' => 'CapyExplorer',
            'name' => 'CapyExplorer',
            'description' => 'Equipo de exploración para recorrer rutas.',
            'tagline' => 'Ruta curiosa',
            'cost' => 1200,
            'image' => 'assets/characters/CapyExplorer.png',
        ],
        [
            'id' => 'CapyRuna',
            'name' => 'CapyRuna',
            'description' => 'Marcas antiguas para retos misteriosos.',
            'tagline' => 'Runa paciente',
            'cost' => 1800,
            'image' => 'assets/characters/CapyRuna.png',
        ],
        [
            'id' => 'CapyCandy',
            'name' => 'CapyCandy',
            'description' => 'Colores dulces para una colección alegre.',
            'tagline' => 'Chispa dulce',
            'cost' => 2000,
            'image' => 'assets/characters/CapyCandy.png',
        ],
        [
            'id' => 'CapySun',
            'name' => 'CapySun',
            'description' => 'Detalles solares para iluminar el recorrido.',
            'tagline' => 'Amanecer claro',
            'cost' => 2200,
            'image' => 'assets/characters/CapySun.png',
        ],
        [
            'id' => 'CapyEarth',
            'name' => 'CapyEarth',
            'description' => 'Tonos de tierra para una presencia constante.',
            'tagline' => 'Raíz constante',
            'cost' => 2600,
            'image' => 'assets/characters/CapyEarth.png',
        ],
        [
            'id' => 'CapyConstelation',
            'name' => 'CapyConstelation',
            'description' => 'Detalles estelares para destacar en la colección.',
            'tagline' => 'Cielo estelar',
            'cost' => 2900,
            'image' => 'assets/characters/CapyConstelation.png',
        ],
    ];
}

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

function capy_load_question_datasets(string $projectRoot): array
{
    $datasets = [];
    foreach (['questions.json', 'levels.json', 'levels_algoritmos_complementado.json'] as $relativePath) {
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

    return $datasets ?: [['temas' => []]];
}

function capy_resolve_questions_for_level(array $datasets, array $level, array $config): array
{
    foreach ($datasets as $dataset) {
        $themes = isset($dataset['temas']) && is_array($dataset['temas']) ? $dataset['temas'] : [];
        $theme = $themes[$level['route_key']] ?? null;
        $questions = capy_pick_questions_from_theme($theme, $level, $config);

        if ($questions) {
            return capy_ensure_exercise_count($questions, $config);
        }
    }

    $fallbackQuestions = [];
    foreach ($datasets as $dataset) {
        if (!isset($dataset['temas']['algoritmos'])) {
            continue;
        }

        $fallbackQuestions = capy_pick_questions_from_theme($dataset['temas']['algoritmos'], $level, $config);
        if ($fallbackQuestions) {
            break;
        }
    }

    return capy_ensure_exercise_count($fallbackQuestions, $config);
}

function capy_pick_questions_from_theme($theme, array $level, array $config): array
{
    if (!is_array($theme)) {
        return [];
    }

    $directKey = 'nivel_' . $level['route_order'];
    if (isset($theme[$directKey]) && is_array($theme[$directKey])) {
        return array_values($theme[$directKey]);
    }

    $difficulty = $level['difficulty'];
    $bucketName = capy_difficulty_buckets()[$difficulty] ?? '';
    $bucket = isset($theme[$bucketName]) && is_array($theme[$bucketName]) ? array_values($theme[$bucketName]) : [];

    if ($difficulty === 'integrative' && !$bucket) {
        $bucket = array_merge(
            isset($theme['facil']) && is_array($theme['facil']) ? $theme['facil'] : [],
            isset($theme['medio']) && is_array($theme['medio']) ? $theme['medio'] : [],
            isset($theme['dificil']) && is_array($theme['dificil']) ? $theme['dificil'] : []
        );

        if ($bucket) {
            return array_slice($bucket, max(0, count($bucket) - (int) $config['exercises_per_level']));
        }

        return [];
    }

    if (!$bucket) {
        return [];
    }

    $sameDifficultyOrder = capy_get_same_difficulty_order((int) $level['route_order'], $difficulty);
    $chunkStart = ($sameDifficultyOrder - 1) * (int) $config['exercises_per_level'];
    $chunk = array_slice($bucket, $chunkStart, (int) $config['exercises_per_level']);

    if (count($chunk) === (int) $config['exercises_per_level']) {
        return $chunk;
    }

    return array_slice($bucket, 0, (int) $config['exercises_per_level']);
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

function capy_get_same_difficulty_order(int $routeOrder, string $difficulty): int
{
    $count = 0;
    foreach (capy_difficulty_by_route_order() as $order => $candidateDifficulty) {
        if ($order > $routeOrder) {
            break;
        }
        if ($candidateDifficulty === $difficulty) {
            $count += 1;
        }
    }

    return max(1, $count);
}

function capy_normalize_exercise(array $question, array $level, int $orderIndex): array
{
    $rawType = $question['tipo'] ?? $question['type'] ?? 'exercise';
    $type = capy_map_exercise_type((string) $rawType);
    $baseId = $level['id'] . '-' . $orderIndex . '-' . $rawType;

    if ($type === 'MultipleChoiceExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'code' => capy_array_copy($question['code'] ?? []),
                'options' => capy_array_copy($question['opciones'] ?? $question['options'] ?? []),
            ],
            'answer_data' => [
                'correctOptionIds' => capy_array_copy($question['correct_ids'] ?? $question['correctOptionIds'] ?? []),
            ],
        ];
    }

    if ($type === 'NumericAnswerExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'code' => capy_array_copy($question['code'] ?? []),
            ],
            'answer_data' => [
                'correctValue' => $question['valor'] ?? $question['correctValue'] ?? null,
            ],
        ];
    }

    if ($type === 'LineSelectionExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'lines' => capy_array_copy($question['lineas'] ?? $question['lines'] ?? []),
            ],
            'answer_data' => [
                'correctLineIds' => capy_array_copy($question['correct_ids'] ?? $question['correctLineIds'] ?? []),
            ],
        ];
    }

    if ($type === 'LineOrderingExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'lines' => capy_array_copy($question['lineas'] ?? $question['lines'] ?? []),
            ],
            'answer_data' => [
                'correctLineOrder' => capy_array_copy($question['orden_correcto'] ?? $question['correctLineOrder'] ?? []),
            ],
        ];
    }

    return [
        'id' => $baseId,
        'level_id' => $level['id'],
        'order_index' => $orderIndex,
        'type' => 'FillBlanksExercise',
        'raw_type' => $rawType,
        'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
        'content_data' => [
            'template' => capy_array_copy($question['plantilla'] ?? $question['template'] ?? []),
            'wordBank' => capy_array_copy($question['banco_palabras'] ?? $question['wordBank'] ?? []),
        ],
        'answer_data' => [
            'correctBlanks' => is_array($question['rellenos'] ?? null) ? $question['rellenos'] : (is_array($question['correctBlanks'] ?? null) ? $question['correctBlanks'] : []),
        ],
    ];
}

function capy_map_exercise_type(string $type): string
{
    if ($type === 'opcion_multiple' || $type === 'MultipleChoiceExercise') {
        return 'MultipleChoiceExercise';
    }
    if ($type === 'respuesta_numerica' || $type === 'NumericAnswerExercise') {
        return 'NumericAnswerExercise';
    }
    if ($type === 'seleccionar_lineas' || $type === 'LineSelectionExercise') {
        return 'LineSelectionExercise';
    }
    if ($type === 'ordenar_lineas' || $type === 'LineOrderingExercise') {
        return 'LineOrderingExercise';
    }

    return 'FillBlanksExercise';
}

function capy_validate_exercise_answer(array $exercise, $answer): bool
{
    if (!is_array($answer)) {
        return false;
    }

    if ($exercise['type'] === 'MultipleChoiceExercise') {
        return capy_compare_sets($answer['optionIds'] ?? [], $exercise['answer_data']['correctOptionIds'] ?? []);
    }
    if ($exercise['type'] === 'NumericAnswerExercise') {
        return (float) ($answer['value'] ?? null) === (float) ($exercise['answer_data']['correctValue'] ?? null);
    }
    if ($exercise['type'] === 'LineSelectionExercise') {
        return capy_compare_sets($answer['lineIds'] ?? [], $exercise['answer_data']['correctLineIds'] ?? []);
    }
    if ($exercise['type'] === 'LineOrderingExercise') {
        return capy_compare_arrays($answer['lineIds'] ?? [], $exercise['answer_data']['correctLineOrder'] ?? []);
    }
    if ($exercise['type'] === 'FillBlanksExercise') {
        return capy_compare_assoc($answer['blanks'] ?? [], $exercise['answer_data']['correctBlanks'] ?? []);
    }

    return false;
}

function capy_array_copy($value): array
{
    return is_array($value) ? array_values($value) : [];
}

function capy_compare_arrays($left, $right): bool
{
    if (!is_array($left) || !is_array($right) || count($left) !== count($right)) {
        return false;
    }

    foreach ($left as $index => $value) {
        if ((string) $value !== (string) $right[$index]) {
            return false;
        }
    }

    return true;
}

function capy_compare_sets($left, $right): bool
{
    $leftValues = array_map('strval', is_array($left) ? $left : []);
    $rightValues = array_map('strval', is_array($right) ? $right : []);
    sort($leftValues);
    sort($rightValues);
    return capy_compare_arrays($leftValues, $rightValues);
}

function capy_compare_assoc($left, $right): bool
{
    if (!is_array($left) || !is_array($right)) {
        return false;
    }

    ksort($left);
    ksort($right);

    if (array_keys($left) !== array_keys($right)) {
        return false;
    }

    foreach ($left as $key => $value) {
        if ((string) $value !== (string) $right[$key]) {
            return false;
        }
    }

    return true;
}
