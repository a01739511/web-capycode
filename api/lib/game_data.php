<?php

function capy_route_definitions(): array
{
    return [
        [
            'id' => 1,
            'key' => 'algoritmos',
            'name' => 'Algoritmo Antiguo',
            'background_image' => 'assets/world/routes/route-01-algoritmo-antiguo.webp',
            'orb_image' => 'assets/world/orbs/route-01-algoritmo-antiguo-orb.webp',
            'content' => 'Secuencia, selección, repetición y razonamiento algorítmico.',
            'badge_image' => 'assets/badges/badge-route-1.svg',
            'story_character_name' => 'CapyBlack',
            'story_character_image' => 'assets/characters/no_bg/Capy_Black.webp',
        ],
        [
            'id' => 2,
            'key' => 'tipos_de_datos',
            'name' => 'Alquimista de Tipos',
            'background_image' => 'assets/world/routes/route-02-alquimista-de-tipos.webp',
            'orb_image' => 'assets/world/orbs/route-02-alquimista-de-tipos-orb.webp',
            'content' => 'Tipos primitivos, conversiones y lectura de valores.',
            'badge_image' => 'assets/badges/badge-route-2.svg',
            'story_character_name' => 'CapyRuna',
            'story_character_image' => 'assets/characters/no_bg/Capy_Runa.webp',
        ],
        [
            'id' => 3,
            'key' => 'expresiones',
            'name' => 'Altar de las Expresiones',
            'background_image' => 'assets/world/routes/route-03-expresiones.webp',
            'orb_image' => 'assets/world/orbs/route-03-expresiones-orb.webp',
            'content' => 'Operadores aritméticos, relacionales y lógicos.',
            'badge_image' => 'assets/badges/badge-route-3.svg',
            'story_character_name' => 'CapyAqua',
            'story_character_image' => 'assets/characters/no_bg/Capy_Aqua..webp',
        ],
        [
            'id' => 4,
            'key' => 'condicionales',
            'name' => 'Hechizos Condicionales',
            'background_image' => 'assets/world/routes/route-04-condicionales.webp',
            'orb_image' => 'assets/world/orbs/route-04-condicionales-orb.webp',
            'content' => 'Decisiones con if, else y combinaciones de condiciones.',
            'badge_image' => 'assets/badges/badge-route-4.svg',
            'story_character_name' => 'CapyConstelation',
            'story_character_image' => 'assets/characters/no_bg/Capy_Constelation.webp',
        ],
        [
            'id' => 5,
            'key' => 'ciclos',
            'name' => 'Círculo de Repetición Infinita',
            'background_image' => 'assets/world/routes/route-05-ciclos.webp',
            'orb_image' => 'assets/world/orbs/route-05-ciclos-orb.webp',
            'content' => 'Repetición controlada con for, while, break y continue.',
            'badge_image' => 'assets/badges/badge-route-5.svg',
            'story_character_name' => 'CapyEarth',
            'story_character_image' => 'assets/characters/no_bg/Capy_Earth.webp',
        ],
        [
            'id' => 6,
            'key' => 'funciones',
            'name' => 'Taller de Funciones Encantadas',
            'background_image' => 'assets/world/routes/route-06-funciones.webp',
            'orb_image' => 'assets/world/orbs/route-06-funciones-orb.webp',
            'content' => 'Funciones, parámetros, retorno y reutilización.',
            'badge_image' => 'assets/badges/badge-route-6.svg',
            'story_character_name' => 'CapyKing',
            'story_character_image' => 'assets/characters/no_bg/Capy_King.webp',
        ],
        [
            'id' => 7,
            'key' => 'estructuras_de_datos',
            'name' => 'Biblioteca de Estructuras de Datos',
            'background_image' => 'assets/world/routes/route-07-estructuras-de-datos.webp',
            'orb_image' => 'assets/world/orbs/route-07-estructuras-de-datos-orb.webp',
            'content' => 'Listas, colecciones y operaciones sobre datos agrupados.',
            'badge_image' => 'assets/badges/badge-route-7.svg',
            'story_character_name' => 'CapySun',
            'story_character_image' => 'assets/characters/no_bg/Capy_Sun.webp',
        ],
        [
            'id' => 8,
            'key' => 'archivos_de_texto_plano',
            'name' => 'El Archivo Perdido',
            'background_image' => 'assets/world/routes/route-08-archivos-de-texto-plano.webp',
            'orb_image' => 'assets/world/orbs/route-08-archivos-de-texto-plano-orb.webp',
            'content' => 'Lectura, escritura y procesamiento de archivos simples.',
            'badge_image' => 'assets/badges/badge-route-8.svg',
            'story_character_name' => 'CapyCandy',
            'story_character_image' => 'assets/characters/no_bg/Capy_Candy.webp',
        ],
    ];
}

function capy_story_messages(): array
{
    return [
        'algoritmos' => [
            'CapyBlack te muestra un sendero de piedras antiguas: cada paso importa, y el bosque solo responde cuando el orden del viaje es claro.',
            'La neblina se aparta cuando sigues una secuencia sin dudar; por primera vez, el bosque parece obedecer tu ritmo.',
            'Una puerta de tinta viva se abre apenas lo justo: CapyBlack sonríe al ver que ya distingues cuándo avanzar y cuándo esperar.',
            'Los libros flotantes cambian de lugar, pero tú ya reconoces los patrones. El caos empieza a parecer una coreografía secreta.',
            'Las luciérnagas del archivo antiguo giran en rondas precisas. Cada repetición las vuelve menos salvajes y más tuyas.',
            'CapyBlack guarda silencio mientras observas el mapa entero. Ya no resuelves pasos sueltos: empiezas a leer la intención del camino.',
            'Al final del grimorio, una ruta dormida se ilumina. El bosque acepta que ya puedes sostener un hechizo completo sin perderte.',
        ],
        'tipos_de_datos' => [
            'CapyRuna destapa frascos brillantes y te advierte: no toda esencia puede ocupar cualquier recipiente.',
            'Los cristales del laboratorio reaccionan distinto a cada forma. Comprendes que nombrar algo bien también es una forma de protegerlo.',
            'Una mezcla inestable chisporrotea frente a ti; CapyRuna te enseña a cambiar su naturaleza sin romper su memoria.',
            'Las burbujas del caldero forman símbolos distintos según lo que contienen. Por fin lees esas diferencias como un alquimista.',
            'Un elixir se espesa demasiado y luego se aclara. Convertirlo sin perder su propósito se vuelve parte de tu oficio.',
            'CapyRuna te deja trabajar a solas por unos segundos. El laboratorio ya no parece extraño: responde a tu criterio.',
            'Las estanterías de cristal reflejan frascos, números y nombres en perfecta armonía. La caverna reconoce que ya sabes darles forma.',
        ],
        'expresiones' => [
            'CapyAqua hace flotar runas sobre un estanque. Cada símbolo altera la corriente como si el agua entendiera tus decisiones.',
            'Una chispa rebota entre dos pilares y descubres que comparar también transforma: no todo hechizo busca cantidad, algunos buscan verdad.',
            'Las ondas del santuario cambian de color cuando unes condiciones. El altar ya no responde al azar, sino a tus vínculos invisibles.',
            'CapyAqua deja caer una gota sobre la piedra y tú ves cómo una sola operación puede inclinar todo el ritual.',
            'Las runas más intensas exigen precisión. Una resta fuera de lugar y la marea cambia, pero ya empiezas a sentir el equilibrio.',
            'El agua del altar refleja relaciones que antes parecían ocultas. Lo que comparas revela tanto como lo que calculas.',
            'Un círculo de símbolos se cierra sobre sí mismo y el santuario se aquieta. Ahora las expresiones suenan a lenguaje, no a ruido.',
        ],
        'condicionales' => [
            'CapyConstelation te espera ante puertas gemelas. Ninguna se abre por fuerza: solo ceden cuando eliges con intención.',
            'Una torre viva cambia de forma frente a ti. Descubres que cada respuesta crea un mundo distinto y descarta otros.',
            'Las estrellas del techo parpadean en secuencia cuando eliges entre varios caminos. Ya no dudas tanto antes de decidir.',
            'CapyConstelation te observa desde la sombra correcta. Aprendes que una condición bien puesta evita perderte en puertas falsas.',
            'La torre te obliga a pensar antes de actuar. Cada ramificación tiene un precio, y tú ya sabes leerlo.',
            'Los pasillos cambian cuando pronuncias el criterio exacto. Elegir deja de ser un impulso y se vuelve una estrategia.',
            'La última cámara solo responde a quien puede juzgar sin titubeos. Al salir, las puertas se alinean detrás de ti como un juramento.',
        ],
        'ciclos' => [
            'CapyEarth marca un ritmo con su bastón. En este círculo, repetir no es estancarse: es aprender a sostener el pulso.',
            'Las piedras antiguas giran bajo tus pies y comprendes que algunos caminos se dominan solo al insistir con calma.',
            'Una vuelta más, otra más, hasta que el eco de tus pasos se vuelve familiar. CapyEarth asiente cuando reconoces el momento de romper.',
            'La espiral encantada quiere arrastrarte para siempre, pero tú ya sabes omitir lo que distrae sin salirte del camino.',
            'Los anillos del claro responden mejor a cada repetición. Lo que antes parecía cansancio ahora parece disciplina.',
            'CapyEarth te deja avanzar sin guía. Sabes continuar cuando conviene y detenerte cuando el bosque ya entregó lo necesario.',
            'En el centro del círculo, el suelo deja de girar. Has demostrado que puedes repetir sin perder el propósito de la travesía.',
        ],
        'funciones' => [
            'CapyKing abre el taller como si levantara un telón. Aquí cada hechizo puede volver a llamarse cuando la historia lo necesita.',
            'Las herramientas encantadas repiten formas con elegancia. Descubres que una buena forja permite reutilizar la misma chispa muchas veces.',
            'CapyKing insiste en que todo hechizo debe saber qué recibe y qué devuelve. La forja premia la claridad.',
            'Una pieza incompleta queda suspendida en el aire hasta que decides qué debe retornar. Entonces cae en su sitio exacto.',
            'Reusar un encantamiento deja de parecer trampa y empieza a sentirse como artesanía refinada.',
            'El taller resuena con ecos de tus propias creaciones. Ya no copias rituales: empiezas a diseñarlos.',
            'Cuando la última pieza encaja, CapyKing inclina la corona. Has probado que puedes construir magia reutilizable, no solo improvisarla.',
        ],
        'estructuras_de_datos' => [
            'CapySun te recibe entre estantes vivientes. Las listas se mueven como constelaciones pequeñas buscando una mano firme.',
            'Un conjunto de criaturas de papel se ordena al tocarlas. Comprendes que guardar muchas cosas también exige un mapa.',
            'CapySun señala serpientes de palabras que se enrollan unas dentro de otras. Ya no te intimidan las colecciones complejas.',
            'La biblioteca cambia cuando accedes al lugar exacto. Cada índice correcto enciende una lámpara distinta.',
            'Las estanterías susurran nombres, grupos y subgrupos. Lo importante ya no es solo guardar, sino saber cómo volver a encontrar.',
            'CapySun te deja reorganizar una sala completa. El desorden empieza a obedecer una estructura visible para ti.',
            'Desde el balcón más alto ves la biblioteca como una red luminosa. Has aprendido a moverte dentro de muchas piezas sin perderte.',
        ],
        'archivos_de_texto_plano' => [
            'CapyCandy te guía bajo tierra hasta un archivo que respira polvo y memoria. Aquí nada quiere olvidarse.',
            'Los pergaminos flotan alrededor de tu lámpara. Aprendes que leer también es escuchar lo que el pasado quiso conservar.',
            'Una bóveda se abre apenas cuando dejas una marca nueva. Escribir en el archivo se siente como conversar con generaciones antiguas.',
            'CapyCandy ordena cintas y etiquetas mientras tú distingues entre añadir, reemplazar y preservar. La memoria tiene reglas.',
            'Cada línea guardada parece una voz distinta. Empiezas a notar que un archivo no solo contiene datos, también conserva intenciones.',
            'El archivo perdido deja de parecer ruina y empieza a sentirse como un taller de memoria. Ya puedes tocarlo sin romperlo.',
            'En la cámara final, varios registros se unen en un mismo relato. CapyCandy sonríe: ahora sabes leer, guardar y reconstruir historia.',
        ],
    ];
}

function capy_outfit_definitions(): array
{
    return [
        [
            'id' => 'Capibara',
            'name' => 'Capibara',
            'description' => 'La companera base de la aventura CapyCode.',
            'tagline' => 'Esencia capibara',
            'cost' => 0,
            'image' => 'assets/characters/Capibara.webp',
        ],
        [
            'id' => 'CapyBlack',
            'name' => 'CapyBlack',
            'description' => 'Vestuario base de la aventura CapyCode.',
            'tagline' => 'Sombra elegante',
            'cost' => 0,
            'image' => 'assets/characters/CapyBlack.webp',
            'unlock_route_id' => 1,
        ],
        [
            'id' => 'CapyAqua',
            'name' => 'CapyAqua',
            'description' => 'Tonos acuáticos para avanzar con calma.',
            'tagline' => 'Marea tranquila',
            'cost' => 300,
            'image' => 'assets/characters/CapyAqua.webp',
            'unlock_route_id' => 3,
        ],
        [
            'id' => 'CapyKing',
            'name' => 'CapyKing',
            'description' => 'Corona y capa para una presencia solemne.',
            'tagline' => 'Corona serena',
            'cost' => 750,
            'image' => 'assets/characters/CapyKing.webp',
            'unlock_route_id' => 6,
        ],
        [
            'id' => 'CapyExplorer',
            'name' => 'CapyExplorer',
            'description' => 'Equipo de exploración para recorrer rutas.',
            'tagline' => 'Ruta curiosa',
            'cost' => 1200,
            'image' => 'assets/characters/CapyExplorer.webp',
        ],
        [
            'id' => 'CapyRuna',
            'name' => 'CapyRuna',
            'description' => 'Marcas antiguas para retos misteriosos.',
            'tagline' => 'Runa paciente',
            'cost' => 1800,
            'image' => 'assets/characters/CapyRuna.webp',
            'unlock_route_id' => 2,
        ],
        [
            'id' => 'CapyCandy',
            'name' => 'CapyCandy',
            'description' => 'Colores dulces para una colección alegre.',
            'tagline' => 'Chispa dulce',
            'cost' => 2000,
            'image' => 'assets/characters/CapyCandy.webp',
            'unlock_route_id' => 8,
        ],
        [
            'id' => 'CapySun',
            'name' => 'CapySun',
            'description' => 'Detalles solares para iluminar el recorrido.',
            'tagline' => 'Amanecer claro',
            'cost' => 2200,
            'image' => 'assets/characters/CapySun.webp',
            'unlock_route_id' => 7,
        ],
        [
            'id' => 'CapyEarth',
            'name' => 'CapyEarth',
            'description' => 'Tonos de tierra para una presencia constante.',
            'tagline' => 'Raíz constante',
            'cost' => 2600,
            'image' => 'assets/characters/CapyEarth.webp',
            'unlock_route_id' => 5,
        ],
        [
            'id' => 'CapyConstelation',
            'name' => 'CapyConstelation',
            'description' => 'Detalles estelares para destacar en la colección.',
            'tagline' => 'Cielo estelar',
            'cost' => 2900,
            'image' => 'assets/characters/CapyConstelation.webp',
            'unlock_route_id' => 4,
        ],
    ];
}

function capy_starter_discovered_outfit_ids(): array
{
    return [
        'Capibara',
        'CapyExplorer',
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
