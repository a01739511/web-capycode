(function () {
    // Este catalogo traduce contenido estatico a estructuras consistentes para
    // rutas, niveles, vestuarios y ejercicios.
    const TOTAL_LEVELS_PER_ROUTE = 7;
    const EXERCISES_PER_LEVEL = 5;
    const QUESTION_BANK_PATH = "content/question-bank.json";

    const OUTFIT_TRANSPARENT_IMAGES = {
        Capibara: "assets/characters/no_bg/Capibara.webp",
        CapyBlack: "assets/characters/no_bg/Capy_Black.webp",
        CapyAqua: "assets/characters/no_bg/Capy_Aqua.webp",
        CapyKing: "assets/characters/no_bg/Capy_King.webp",
        CapyExplorer: "assets/characters/no_bg/Capy_Explorer.webp",
        CapyCandy: "assets/characters/no_bg/Capy_Candy.webp",
        CapyRuna: "assets/characters/no_bg/Capy_Runa.webp",
        CapySun: "assets/characters/no_bg/Capy_Sun.webp",
        CapyEarth: "assets/characters/no_bg/Capy_Earth.webp",
        CapyConstelation: "assets/characters/no_bg/Capy_Constelation.webp"
    };

    const DIFFICULTY_BY_ROUTE_ORDER = {
        1: "easy",
        2: "easy",
        3: "medium",
        4: "medium",
        5: "hard",
        6: "hard",
        7: "integrative"
    };

    const DIFFICULTY_LABELS = {
        easy: "Fácil",
        medium: "Medio",
        hard: "Difícil",
        integrative: "Integrador"
    };

    const TIMER_SECONDS = {
        easy: 20,
        medium: 30,
        hard: 40,
        integrative: 50
    };

    const XP_REWARD = {
        easy: 100,
        medium: 200,
        hard: 300,
        integrative: 550
    };

    const STORY_MESSAGES = {
        algoritmos: [
            "CapyBlack te muestra un sendero de piedras antiguas: cada paso importa, y el bosque solo responde cuando el orden del viaje es claro.",
            "La neblina se aparta cuando sigues una secuencia sin dudar; por primera vez, el bosque parece obedecer tu ritmo.",
            "Una puerta de tinta viva se abre apenas lo justo: CapyBlack sonríe al ver que ya distingues cuándo avanzar y cuándo esperar.",
            "Los libros flotantes cambian de lugar, pero tú ya reconoces los patrones. El caos empieza a parecer una coreografía secreta.",
            "Las luciérnagas del archivo antiguo giran en rondas precisas. Cada repetición las vuelve menos salvajes y más tuyas.",
            "CapyBlack guarda silencio mientras observas el mapa entero. Ya no resuelves pasos sueltos: empiezas a leer la intención del camino.",
            "Al final del grimorio, una ruta dormida se ilumina. El bosque acepta que ya puedes sostener un hechizo completo sin perderte."
        ],
        tipos_de_datos: [
            "CapyRuna destapa frascos brillantes y te advierte: no toda esencia puede ocupar cualquier recipiente.",
            "Los cristales del laboratorio reaccionan distinto a cada forma. Comprendes que nombrar algo bien también es una forma de protegerlo.",
            "Una mezcla inestable chisporrotea frente a ti; CapyRuna te enseña a cambiar su naturaleza sin romper su memoria.",
            "Las burbujas del caldero forman símbolos distintos según lo que contienen. Por fin lees esas diferencias como un alquimista.",
            "Un elixir se espesa demasiado y luego se aclara. Convertirlo sin perder su propósito se vuelve parte de tu oficio.",
            "CapyRuna te deja trabajar a solas por unos segundos. El laboratorio ya no parece extraño: responde a tu criterio.",
            "Las estanterías de cristal reflejan frascos, números y nombres en perfecta armonía. La caverna reconoce que ya sabes darles forma."
        ],
        expresiones: [
            "CapyAqua hace flotar runas sobre un estanque. Cada símbolo altera la corriente como si el agua entendiera tus decisiones.",
            "Una chispa rebota entre dos pilares y descubres que comparar también transforma: no todo hechizo busca cantidad, algunos buscan verdad.",
            "Las ondas del santuario cambian de color cuando unes condiciones. El altar ya no responde al azar, sino a tus vínculos invisibles.",
            "CapyAqua deja caer una gota sobre la piedra y tú ves cómo una sola operación puede inclinar todo el ritual.",
            "Las runas más intensas exigen precisión. Una resta fuera de lugar y la marea cambia, pero ya empiezas a sentir el equilibrio.",
            "El agua del altar refleja relaciones que antes parecían ocultas. Lo que comparas revela tanto como lo que calculas.",
            "Un círculo de símbolos se cierra sobre sí mismo y el santuario se aquieta. Ahora las expresiones suenan a lenguaje, no a ruido."
        ],
        condicionales: [
            "CapyConstelation te espera ante puertas gemelas. Ninguna se abre por fuerza: solo ceden cuando eliges con intención.",
            "Una torre viva cambia de forma frente a ti. Descubres que cada respuesta crea un mundo distinto y descarta otros.",
            "Las estrellas del techo parpadean en secuencia cuando eliges entre varios caminos. Ya no dudas tanto antes de decidir.",
            "CapyConstelation te observa desde la sombra correcta. Aprendes que una condición bien puesta evita perderte en puertas falsas.",
            "La torre te obliga a pensar antes de actuar. Cada ramificación tiene un precio, y tú ya sabes leerlo.",
            "Los pasillos cambian cuando pronuncias el criterio exacto. Elegir deja de ser un impulso y se vuelve una estrategia.",
            "La última cámara solo responde a quien puede juzgar sin titubeos. Al salir, las puertas se alinean detrás de ti como un juramento."
        ],
        ciclos: [
            "CapyEarth marca un ritmo con su bastón. En este círculo, repetir no es estancarse: es aprender a sostener el pulso.",
            "Las piedras antiguas giran bajo tus pies y comprendes que algunos caminos se dominan solo al insistir con calma.",
            "Una vuelta más, otra más, hasta que el eco de tus pasos se vuelve familiar. CapyEarth asiente cuando reconoces el momento de romper.",
            "La espiral encantada quiere arrastrarte para siempre, pero tú ya sabes omitir lo que distrae sin salirte del camino.",
            "Los anillos del claro responden mejor a cada repetición. Lo que antes parecía cansancio ahora parece disciplina.",
            "CapyEarth te deja avanzar sin guía. Sabes continuar cuando conviene y detenerte cuando el bosque ya entregó lo necesario.",
            "En el centro del círculo, el suelo deja de girar. Has demostrado que puedes repetir sin perder el propósito de la travesía."
        ],
        funciones: [
            "CapyKing abre el taller como si levantara un telón. Aquí cada hechizo puede volver a llamarse cuando la historia lo necesita.",
            "Las herramientas encantadas repiten formas con elegancia. Descubres que una buena forja permite reutilizar la misma chispa muchas veces.",
            "CapyKing insiste en que todo hechizo debe saber qué recibe y qué devuelve. La forja premia la claridad.",
            "Una pieza incompleta queda suspendida en el aire hasta que decides qué debe retornar. Entonces cae en su sitio exacto.",
            "Reusar un encantamiento deja de parecer trampa y empieza a sentirse como artesanía refinada.",
            "El taller resuena con ecos de tus propias creaciones. Ya no copias rituales: empiezas a diseñarlos.",
            "Cuando la última pieza encaja, CapyKing inclina la corona. Has probado que puedes construir magia reutilizable, no solo improvisarla."
        ],
        estructuras_de_datos: [
            "CapySun te recibe entre estantes vivientes. Las listas se mueven como constelaciones pequeñas buscando una mano firme.",
            "Un conjunto de criaturas de papel se ordena al tocarlas. Comprendes que guardar muchas cosas también exige un mapa.",
            "CapySun señala serpientes de palabras que se enrollan unas dentro de otras. Ya no te intimidan las colecciones complejas.",
            "La biblioteca cambia cuando accedes al lugar exacto. Cada índice correcto enciende una lámpara distinta.",
            "Las estanterías susurran nombres, grupos y subgrupos. Lo importante ya no es solo guardar, sino saber cómo volver a encontrar.",
            "CapySun te deja reorganizar una sala completa. El desorden empieza a obedecer una estructura visible para ti.",
            "Desde el balcón más alto ves la biblioteca como una red luminosa. Has aprendido a moverte dentro de muchas piezas sin perderte."
        ],
        archivos_de_texto_plano: [
            "CapyCandy te guía bajo tierra hasta un archivo que respira polvo y memoria. Aquí nada quiere olvidarse.",
            "Los pergaminos flotan alrededor de tu lámpara. Aprendes que leer también es escuchar lo que el pasado quiso conservar.",
            "Una bóveda se abre apenas cuando dejas una marca nueva. Escribir en el archivo se siente como conversar con generaciones antiguas.",
            "CapyCandy ordena cintas y etiquetas mientras tú distingues entre añadir, reemplazar y preservar. La memoria tiene reglas.",
            "Cada línea guardada parece una voz distinta. Empiezas a notar que un archivo no solo contiene datos, también conserva intenciones.",
            "El archivo perdido deja de parecer ruina y empieza a sentirse como un taller de memoria. Ya puedes tocarlo sin romperlo.",
            "En la cámara final, varios registros se unen en un mismo relato. CapyCandy sonríe: ahora sabes leer, guardar y reconstruir historia."
        ]
    };

    const ROUTE_DEFINITIONS = [
        buildRoute(1, "algoritmos", "Algoritmo Antiguo", "assets/world/routes/route-01-algoritmo-antiguo.webp", "assets/world/orbs/route-01-algoritmo-antiguo-orb.webp", "Secuencia, selección, repetición y razonamiento algorítmico.", "CapyBlack", "assets/characters/no_bg/Capy_Black.webp"),
        buildRoute(2, "tipos_de_datos", "Alquimista de Tipos", "assets/world/routes/route-02-alquimista-de-tipos.webp", "assets/world/orbs/route-02-alquimista-de-tipos-orb.webp", "Tipos primitivos, conversiones y lectura de valores.", "CapyRuna", "assets/characters/no_bg/Capy_Runa.webp"),
        buildRoute(3, "expresiones", "Altar de las Expresiones", "assets/world/routes/route-03-expresiones.webp", "assets/world/orbs/route-03-expresiones-orb.webp", "Operadores aritméticos, relacionales y lógicos.", "CapyAqua", "assets/characters/no_bg/Capy_Aqua.webp"),
        buildRoute(4, "condicionales", "Hechizos Condicionales", "assets/world/routes/route-04-condicionales.webp", "assets/world/orbs/route-04-condicionales-orb.webp", "Decisiones con if, else y combinaciones de condiciones.", "CapyConstelation", "assets/characters/no_bg/Capy_Constelation.webp"),
        buildRoute(5, "ciclos", "Círculo de Repetición Infinita", "assets/world/routes/route-05-ciclos.webp", "assets/world/orbs/route-05-ciclos-orb.webp", "Repetición controlada con for, while, break y continue.", "CapyEarth", "assets/characters/no_bg/Capy_Earth.webp"),
        buildRoute(6, "funciones", "Taller de Funciones Encantadas", "assets/world/routes/route-06-funciones.webp", "assets/world/orbs/route-06-funciones-orb.webp", "Funciones, parámetros, retorno y reutilización.", "CapyKing", "assets/characters/no_bg/Capy_King.webp"),
        buildRoute(7, "estructuras_de_datos", "Biblioteca de Estructuras de Datos", "assets/world/routes/route-07-estructuras-de-datos.webp", "assets/world/orbs/route-07-estructuras-de-datos-orb.webp", "Listas, colecciones y operaciones sobre datos agrupados.", "CapySun", "assets/characters/no_bg/Capy_Sun.webp"),
        buildRoute(8, "archivos_de_texto_plano", "El Archivo Perdido", "assets/world/routes/route-08-archivos-de-texto-plano.webp", "assets/world/orbs/route-08-archivos-de-texto-plano-orb.webp", "Lectura, escritura y procesamiento de archivos simples.", "CapyCandy", "assets/characters/no_bg/Capy_Candy.webp")
    ];

    const OUTFIT_COSTS = {
        Capibara: 0,
        CapyBlack: 0,
        CapyAqua: 300,
        CapyKing: 750,
        CapyExplorer: 1200,
        CapyRuna: 1800,
        CapyCandy: 2000,
        CapySun: 2200,
        CapyEarth: 2600,
        CapyConstelation: 2900
    };

    const OUTFIT_ORDER = [
        "Capibara",
        "CapyBlack",
        "CapyAqua",
        "CapyKing",
        "CapyExplorer",
        "CapyRuna",
        "CapyCandy",
        "CapySun",
        "CapyEarth",
        "CapyConstelation"
    ];

    const OUTFIT_ROUTE_REQUIREMENTS = {
        CapyBlack: 1,
        CapyAqua: 3,
        CapyKing: 6,
        CapyRuna: 2,
        CapyCandy: 8,
        CapySun: 7,
        CapyEarth: 5,
        CapyConstelation: 4
    };

    const STARTER_DISCOVERED_OUTFIT_IDS = [
        "Capibara",
        "CapyExplorer"
    ];

    const DEFAULT_OUTFITS = [
        outfit("Capibara", "Capibara", "La compañera base de la aventura CapyCode.", "Esencia capibara", "assets/characters/Capibara.webp"),
        outfit("CapyBlack", "CapyBlack", "Vestuario base de la aventura CapyCode.", "Sombra elegante", "assets/characters/CapyBlack.webp", 1),
        outfit("CapyAqua", "CapyAqua", "Tonos acuáticos para avanzar con calma.", "Marea tranquila", "assets/characters/CapyAqua.webp", 3),
        outfit("CapyKing", "CapyKing", "Corona y capa para una presencia solemne.", "Corona serena", "assets/characters/CapyKing.webp", 6),
        outfit("CapyExplorer", "CapyExplorer", "Equipo de exploración para recorrer rutas.", "Ruta curiosa", "assets/characters/CapyExplorer.webp"),
        outfit("CapyRuna", "CapyRuna", "Marcas antiguas para retos misteriosos.", "Runa paciente", "assets/characters/CapyRuna.webp", 2),
        outfit("CapyCandy", "CapyCandy", "Colores dulces para una colección alegre.", "Chispa dulce", "assets/characters/CapyCandy.webp", 8),
        outfit("CapySun", "CapySun", "Detalles solares para iluminar el recorrido.", "Amanecer claro", "assets/characters/CapySun.webp", 7),
        outfit("CapyEarth", "CapyEarth", "Tonos de tierra para una presencia constante.", "Raíz constante", "assets/characters/CapyEarth.webp", 5),
        outfit("CapyConstelation", "CapyConstelation", "Detalles estelares para destacar en la colección.", "Cielo estelar", "assets/characters/CapyConstelation.webp", 4)
    ];

    function buildRoute(id, key, name, backgroundImage, orbImage, content, characterName, characterImage) {
        return {
            id: id,
            key: key,
            name: name,
            backgroundImage: backgroundImage,
            orbImage: orbImage,
            content: content,
            storyCharacterName: characterName,
            storyCharacterImage: characterImage
        };
    }

    function outfit(id, name, description, tagline, image, unlockRouteId) {
        return {
            id: id,
            name: name,
            description: description,
            tagline: tagline,
            image: image,
            unlockRouteId: unlockRouteId || null
        };
    }

    function createRuntime(options) {
        const settings = options || {};
        const appDataProvider = settings.appDataProvider || function () {
            return window.CAPYCODE_APP_DATA || {};
        };
        const questionsProvider = settings.questionsProvider || function () {
            return window.CAPYCODE_QUESTIONS || null;
        };
        const readNumber = settings.readNumber || defaultReadNumber;
        const arrayCopy = settings.arrayCopy || defaultArrayCopy;
        let cachedQuestionBank = null;

        function getRoutes() {
            return ROUTE_DEFINITIONS.map(function (route, index) {
                return {
                    id: route.id,
                    key: route.key,
                    name: route.name,
                    orderIndex: index + 1,
                    backgroundImage: route.backgroundImage,
                    orbImage: route.orbImage || "assets/esfera_nivel.webp",
                    content: route.content,
                    badgeImage: route.badgeImage || ("assets/badges/badge-route-" + (index + 1) + ".svg"),
                    storyCharacterName: route.storyCharacterName || "",
                    storyCharacterImage: route.storyCharacterImage || ""
                };
            });
        }

        function getAllLevels() {
            const anchors = getLevelAnchors();
            const levels = [];

            ROUTE_DEFINITIONS.forEach(function (route, routeIndex) {
                for (let routeOrder = 1; routeOrder <= TOTAL_LEVELS_PER_ROUTE; routeOrder += 1) {
                    const difficulty = DIFFICULTY_BY_ROUTE_ORDER[routeOrder];
                    const globalId = routeIndex * TOTAL_LEVELS_PER_ROUTE + routeOrder;
                    const anchor = anchors[routeOrder - 1] || {};

                    levels.push({
                        id: globalId,
                        routeId: route.id,
                        routeKey: route.key,
                        routeOrder: routeOrder,
                        name: "Nivel " + routeOrder,
                        title: "Nivel " + routeOrder,
                        difficulty: difficulty,
                        difficultyLabel: DIFFICULTY_LABELS[difficulty],
                        content: buildLevelContent(route, difficulty),
                        backgroundImage: route.backgroundImage,
                        href: "nivel.html?levelId=" + globalId,
                        x: anchor.x || "50%",
                        y: anchor.y || "50%",
                        storyTitle: "Eco del nivel " + routeOrder,
                        storyMessage: buildLevelStory(route, routeOrder),
                        storyCharacterName: route.storyCharacterName || "",
                        storyCharacterImage: route.storyCharacterImage || ""
                    });
                }
            });

            return levels;
        }

        function getLevelsByRoute(routeId) {
            return getAllLevels().filter(function (level) {
                return String(level.routeId) === String(routeId);
            });
        }

        function getLevelById(levelId) {
            return getAllLevels().find(function (level) {
                return Number(level.id) === Number(levelId);
            }) || null;
        }

        function getRouteById(routeId) {
            return getRoutes().find(function (route) {
                return Number(route.id) === Number(routeId);
            }) || null;
        }

        function getTotalLevelCount() {
            return ROUTE_DEFINITIONS.length * TOTAL_LEVELS_PER_ROUTE;
        }

        function getOutfits() {
            const sourceData = appDataProvider();
            const source = sourceData && Array.isArray(sourceData.shopItems)
                ? sourceData.shopItems
                : DEFAULT_OUTFITS;
            const sourceById = new Map(source.map(function (item) {
                return [item.id, item];
            }));

            return OUTFIT_ORDER.map(function (outfitId) {
                const item = sourceById.get(outfitId) || DEFAULT_OUTFITS.find(function (fallback) {
                    return fallback.id === outfitId;
                }) || {};

                return {
                    id: outfitId,
                    name: item.name || item.nombre || outfitId,
                    description: item.description || item.descripcion || "Vestuario decorativo de CapyCode.",
                    tagline: item.tagline || item.slogan || item.perk || item.frase || "",
                    cost: OUTFIT_COSTS[outfitId],
                    image: item.image || ("assets/characters/" + outfitId + ".webp"),
                    transparentImage: OUTFIT_TRANSPARENT_IMAGES[outfitId] || item.transparentImage || item.image || ("assets/characters/" + outfitId + ".webp"),
                    unlockRouteId: readNumber(item.unlockRouteId, getUnlockRouteIdForOutfit(outfitId) || 0) || null,
                    unlockRouteName: (function () {
                        const routeId = readNumber(item.unlockRouteId, getUnlockRouteIdForOutfit(outfitId) || 0);
                        const route = routeId ? getRouteById(routeId) : null;
                        return route ? route.name : "";
                    }())
                };
            });
        }

        function getOutfitById(outfitId) {
            return getOutfits().find(function (outfit) {
                return String(outfit.id) === String(outfitId);
            }) || null;
        }

        function getRouteRewardOutfit(routeId) {
            return getOutfits().find(function (outfit) {
                return Number(outfit.unlockRouteId) === Number(routeId);
            }) || null;
        }

        function getCurrentRouteForUser(user) {
            const totalLevels = getTotalLevelCount();
            const safeLevelId = user && user.currentLevelId > totalLevels
                ? totalLevels
                : (user ? user.currentLevelId : 1);
            const level = getLevelById(safeLevelId);

            return level ? getRouteById(level.routeId) : null;
        }

        function getOutfitUnlockMessage(outfit) {
            if (!outfit || !outfit.unlockRouteId) {
                return "Este vestuario todavía no está disponible.";
            }

            const route = getRouteById(outfit.unlockRouteId);
            return route
                ? "Completa la ruta " + route.orderIndex + " para habilitar este vestuario."
                : "Completa la ruta asociada para habilitar este vestuario.";
        }

        async function getExercisesByLevel(levelId) {
            const level = getLevelById(levelId);

            if (!level) {
                return [];
            }

            const questionBank = await loadQuestionBank();
            const questions = resolveQuestionsForLevel(questionBank, level);

            return questions.slice(0, EXERCISES_PER_LEVEL).map(function (question, index) {
                return normalizeExercise(question, level, index + 1);
            });
        }

        async function loadQuestionBank() {
            if (cachedQuestionBank) {
                return cachedQuestionBank;
            }

            const providedBank = questionsProvider();
            if (providedBank && Array.isArray(providedBank.routes)) {
                cachedQuestionBank = providedBank;
                return cachedQuestionBank;
            }

            try {
                const response = await fetch(QUESTION_BANK_PATH, { cache: "no-store" });
                if (response.ok) {
                    cachedQuestionBank = await response.json();
                    window.CAPYCODE_QUESTIONS = cachedQuestionBank;
                    return cachedQuestionBank;
                }
            } catch (error) {
                // Al abrir un HTML sin servidor, el fetch puede fallar.
            }

            cachedQuestionBank = { routes: [] };
            return cachedQuestionBank;
        }

        function resolveQuestionsForLevel(questionBank, level) {
            const routeEntry = findQuestionRoute(questionBank, level.routeKey);
            const levelEntry = findQuestionLevel(routeEntry, level.routeOrder);

            if (levelEntry && Array.isArray(levelEntry.exercises)) {
                return ensureExerciseCount(levelEntry.exercises);
            }

            const fallbackRoute = findQuestionRoute(questionBank, "algoritmos");
            const fallbackLevel = findQuestionLevel(fallbackRoute, level.routeOrder);
            return fallbackLevel && Array.isArray(fallbackLevel.exercises)
                ? ensureExerciseCount(fallbackLevel.exercises)
                : [];
        }

        function findQuestionRoute(questionBank, routeKey) {
            const routes = questionBank && Array.isArray(questionBank.routes)
                ? questionBank.routes
                : [];

            return routes.find(function (route) {
                return String(route.key) === String(routeKey);
            }) || null;
        }

        function findQuestionLevel(routeEntry, routeOrder) {
            const levels = routeEntry && Array.isArray(routeEntry.levels)
                ? routeEntry.levels
                : [];

            return levels.find(function (entry) {
                return Number(entry.order) === Number(routeOrder);
            }) || null;
        }

        function ensureExerciseCount(questions) {
            const clean = Array.isArray(questions) ? questions.filter(Boolean) : [];

            if (clean.length >= EXERCISES_PER_LEVEL) {
                return clean.slice(0, EXERCISES_PER_LEVEL);
            }

            if (!clean.length) {
                return [];
            }

            const filled = clean.slice();
            let index = 0;

            while (filled.length < EXERCISES_PER_LEVEL) {
                filled.push(clean[index % clean.length]);
                index += 1;
            }

            return filled;
        }

        function normalizeExercise(question, level, orderIndex) {
            const type = mapExerciseType(question.tipo || question.type);
            const baseId = [level.id, orderIndex, question.tipo || question.type || "exercise"].join("-");
            const context = normalizeExerciseContext(question.context);

            if (type === "MultipleChoiceExercise") {
                return {
                    id: baseId,
                    levelId: level.id,
                    orderIndex: orderIndex,
                    type: type,
                    rawType: question.tipo || question.type,
                    prompt: question.prompt || question.enunciado || "",
                    contentData: {
                        code: arrayCopy(question.code),
                        options: arrayCopy(question.opciones || question.options),
                        context: context
                    },
                    answerData: {
                        correctOptionIds: arrayCopy(question.correct_ids || question.correctOptionIds)
                    }
                };
            }

            if (type === "NumericAnswerExercise") {
                return {
                    id: baseId,
                    levelId: level.id,
                    orderIndex: orderIndex,
                    type: type,
                    rawType: question.tipo || question.type,
                    prompt: question.prompt || question.enunciado || "",
                    contentData: {
                        code: arrayCopy(question.code),
                        context: context
                    },
                    answerData: {
                        correctValue: question.value !== undefined
                            ? question.value
                            : (question.valor !== undefined ? question.valor : question.correctValue)
                    }
                };
            }

            if (type === "LineSelectionExercise") {
                return {
                    id: baseId,
                    levelId: level.id,
                    orderIndex: orderIndex,
                    type: type,
                    rawType: question.tipo || question.type,
                    prompt: question.prompt || question.enunciado || "",
                    contentData: {
                        lines: arrayCopy(question.lineas || question.lines),
                        context: context
                    },
                    answerData: {
                        correctLineIds: arrayCopy(question.correct_ids || question.correctLineIds)
                    }
                };
            }

            if (type === "LineOrderingExercise") {
                return {
                    id: baseId,
                    levelId: level.id,
                    orderIndex: orderIndex,
                    type: type,
                    rawType: question.tipo || question.type,
                    prompt: question.prompt || question.enunciado || "",
                    contentData: {
                        lines: arrayCopy(question.lineas || question.lines),
                        context: context
                    },
                    answerData: {
                        correctLineOrder: arrayCopy(question.orden_correcto || question.correctLineOrder)
                    }
                };
            }

            return {
                id: baseId,
                levelId: level.id,
                orderIndex: orderIndex,
                type: "FillBlanksExercise",
                rawType: question.tipo || question.type,
                prompt: question.prompt || question.enunciado || "",
                contentData: {
                    template: arrayCopy(question.plantilla || question.template),
                    wordBank: arrayCopy(question.banco_palabras || question.wordBank),
                    context: context
                },
                answerData: {
                    correctBlanks: Object.assign({}, question.rellenos || question.correctBlanks || {})
                }
            };
        }

        function normalizeExerciseContext(value) {
            if (!value || typeof value !== "object") {
                return null;
            }

            const rules = arrayCopy(value.rules).map(function (entry) {
                return String(entry || "").trim();
            }).filter(Boolean);
            const canonicalFlow = arrayCopy(value.canonicalFlow).map(function (entry) {
                return String(entry || "").trim();
            }).filter(Boolean);
            const scene = String(value.scene || "").trim();
            const task = String(value.task || "").trim();
            const acceptance = String(value.acceptance || "").trim();
            const commonPitfall = String(value.commonPitfall || "").trim();

            if (!scene && !task && !rules.length && !acceptance && !commonPitfall && !canonicalFlow.length) {
                return null;
            }

            return {
                scene: scene,
                task: task,
                rules: rules,
                acceptance: acceptance,
                commonPitfall: commonPitfall,
                canonicalFlow: canonicalFlow
            };
        }

        function mapExerciseType(type) {
            if (type === "opcion_multiple" || type === "MultipleChoiceExercise") {
                return "MultipleChoiceExercise";
            }
            if (type === "respuesta_numerica" || type === "NumericAnswerExercise") {
                return "NumericAnswerExercise";
            }
            if (type === "seleccionar_lineas" || type === "LineSelectionExercise") {
                return "LineSelectionExercise";
            }
            if (type === "ordenar_lineas" || type === "LineOrderingExercise") {
                return "LineOrderingExercise";
            }
            return "FillBlanksExercise";
        }

        function getLevelAnchors() {
            const appData = appDataProvider();
            const anchors = appData &&
                appData.map &&
                Array.isArray(appData.map.levelAnchors)
                ? appData.map.levelAnchors
                : [];

            return anchors.length ? anchors : [
                { x: "16.2%", y: "52%" },
                { x: "34.3%", y: "42.2%" },
                { x: "33.2%", y: "74.9%" },
                { x: "49.8%", y: "59.9%" },
                { x: "66.5%", y: "37.2%" },
                { x: "88.4%", y: "49.8%" },
                { x: "77.2%", y: "73.7%" }
            ];
        }

        return {
            getRoutes: getRoutes,
            getAllLevels: getAllLevels,
            getLevelsByRoute: getLevelsByRoute,
            getLevelById: getLevelById,
            getRouteById: getRouteById,
            getRouteRewardOutfit: getRouteRewardOutfit,
            getCurrentRouteForUser: getCurrentRouteForUser,
            getTotalLevelCount: getTotalLevelCount,
            getOutfits: getOutfits,
            getOutfitById: getOutfitById,
            getOutfitUnlockMessage: getOutfitUnlockMessage,
            getExercisesByLevel: getExercisesByLevel,
            getDifficultyLabel: function (difficulty) {
                return DIFFICULTY_LABELS[difficulty] || difficulty || "";
            },
            getDifficultySeconds: function (difficulty) {
                return TIMER_SECONDS[difficulty] || 30;
            },
            getDifficultyXp: function (difficulty) {
                return XP_REWARD[difficulty] || 0;
            }
        };
    }

    function getUnlockRouteIdForOutfit(outfitId) {
        return OUTFIT_ROUTE_REQUIREMENTS[String(outfitId)] || null;
    }

    function buildLevelContent(route, difficulty) {
        if (difficulty === "integrative") {
            return "Reto integrador de " + route.name + " con ejercicios combinados.";
        }

        return route.content + " Enfoque " + DIFFICULTY_LABELS[difficulty].toLowerCase() + ".";
    }

    function buildLevelStory(route, routeOrder) {
        const routeMessages = STORY_MESSAGES[route.key] || [];
        return routeMessages[routeOrder - 1] || ("Una nueva parte del sendero se revela en " + route.name + ".");
    }

    function defaultReadNumber(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function defaultArrayCopy(value) {
        return Array.isArray(value) ? value.slice() : [];
    }

    window.CapyApiCatalog = {
        TOTAL_LEVELS_PER_ROUTE: TOTAL_LEVELS_PER_ROUTE,
        EXERCISES_PER_LEVEL: EXERCISES_PER_LEVEL,
        OUTFIT_TRANSPARENT_IMAGES: OUTFIT_TRANSPARENT_IMAGES,
        DIFFICULTY_BY_ROUTE_ORDER: DIFFICULTY_BY_ROUTE_ORDER,
        DIFFICULTY_LABELS: DIFFICULTY_LABELS,
        TIMER_SECONDS: TIMER_SECONDS,
        XP_REWARD: XP_REWARD,
        STORY_MESSAGES: STORY_MESSAGES,
        ROUTE_DEFINITIONS: ROUTE_DEFINITIONS,
        OUTFIT_COSTS: OUTFIT_COSTS,
        OUTFIT_ORDER: OUTFIT_ORDER,
        OUTFIT_ROUTE_REQUIREMENTS: OUTFIT_ROUTE_REQUIREMENTS,
        STARTER_DISCOVERED_OUTFIT_IDS: STARTER_DISCOVERED_OUTFIT_IDS,
        DEFAULT_OUTFITS: DEFAULT_OUTFITS,
        createRuntime: createRuntime
    };
}());
