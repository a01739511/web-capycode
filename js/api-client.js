(function () {
    const apiConfig = window.CapyApiConfig;
    const apiStorage = window.CapyApiStorage;
    const apiHttp = window.CapyApiHttp;
    const catalogModule = window.CapyApiCatalog;
    const userNormalizers = window.CapyUserNormalizers;
    const shopRules = window.CapyShopRules;
    const exerciseRules = window.CapyExerciseRules;
    const progressRules = window.CapyProgressRules;

    if (!apiConfig || !apiStorage || !apiHttp || !catalogModule || !userNormalizers ||
        !shopRules || !exerciseRules || !progressRules) {
        throw new Error("CapyCode necesita cargar los modulos js/api antes de js/api-client.js.");
    }

    const CONFIG = apiConfig.config;
    const BACKEND_BASE_URL = apiConfig.backendBaseUrl;
    const DATA_SOURCE = apiConfig.dataSource;
    const USERS_KEY = apiConfig.storageKeys.users;
    const SESSION_KEY = apiConfig.storageKeys.session;
    const BACKEND_USER_KEY = apiConfig.storageKeys.backendUser;
    const BACKEND_TOKEN_KEY = apiConfig.storageKeys.backendToken;
    const LEGACY_SESSION_KEY = apiConfig.storageKeys.legacySession;
    const LEGACY_PROFILE_PREFIX = apiConfig.storageKeys.legacyProfilePrefix;
    const NEXT_USER_ID_KEY = apiConfig.storageKeys.nextUserId;
    const DEFAULT_OUTFIT_ID = apiConfig.defaults.outfitId;
    const LEGACY_STARTER_OUTFIT_ID = apiConfig.defaults.legacyStarterOutfitId;
    const USERNAME_MIN_LENGTH = apiConfig.validation.usernameMinLength;
    const USERNAME_MAX_LENGTH = apiConfig.validation.usernameMaxLength;
    const PASSWORD_MIN_LENGTH = apiConfig.validation.passwordMinLength;
    const PASSWORD_MAX_LENGTH = apiConfig.validation.passwordMaxLength;
    const TOTAL_LEVELS_PER_ROUTE = apiConfig.progression.totalLevelsPerRoute;
    const EXERCISES_PER_LEVEL = apiConfig.progression.exercisesPerLevel;
    const MEXICO_TIMEZONE = apiConfig.progression.timezone;
    const OUTFIT_TRANSPARENT_IMAGES = {
        Capibara: "assets/characters/no_bg/Capibara.webp",
        CapyBlack: "assets/characters/no_bg/Capy_Black.webp",
        CapyAqua: "assets/characters/no_bg/Capy_Aqua..webp",
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

    const DIFFICULTY_BUCKETS = {
        easy: "facil",
        medium: "medio",
        hard: "dificil",
        integrative: "integrador"
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
        {
            id: 1,
            key: "algoritmos",
            name: "Algoritmo Antiguo",
            backgroundImage: "assets/world/routes/route-01-algoritmo-antiguo.webp",
            orbImage: "assets/world/orbs/route-01-algoritmo-antiguo-orb.webp",
            content: "Secuencia, selección, repetición y razonamiento algorítmico.",
            storyCharacterName: "CapyBlack",
            storyCharacterImage: "assets/characters/no_bg/Capy_Black.webp"
        },
        {
            id: 2,
            key: "tipos_de_datos",
            name: "Alquimista de Tipos",
            backgroundImage: "assets/world/routes/route-02-alquimista-de-tipos.webp",
            orbImage: "assets/world/orbs/route-02-alquimista-de-tipos-orb.webp",
            content: "Tipos primitivos, conversiones y lectura de valores.",
            storyCharacterName: "CapyRuna",
            storyCharacterImage: "assets/characters/no_bg/Capy_Runa.webp"
        },
        {
            id: 3,
            key: "expresiones",
            name: "Altar de las Expresiones",
            backgroundImage: "assets/world/routes/route-03-expresiones.webp",
            orbImage: "assets/world/orbs/route-03-expresiones-orb.webp",
            content: "Operadores aritméticos, relacionales y lógicos.",
            storyCharacterName: "CapyAqua",
            storyCharacterImage: "assets/characters/no_bg/Capy_Aqua..webp"
        },
        {
            id: 4,
            key: "condicionales",
            name: "Hechizos Condicionales",
            backgroundImage: "assets/world/routes/route-04-condicionales.webp",
            orbImage: "assets/world/orbs/route-04-condicionales-orb.webp",
            content: "Decisiones con if, else y combinaciones de condiciones.",
            storyCharacterName: "CapyConstelation",
            storyCharacterImage: "assets/characters/no_bg/Capy_Constelation.webp"
        },
        {
            id: 5,
            key: "ciclos",
            name: "Círculo de Repetición Infinita",
            backgroundImage: "assets/world/routes/route-05-ciclos.webp",
            orbImage: "assets/world/orbs/route-05-ciclos-orb.webp",
            content: "Repetición controlada con for, while, break y continue.",
            storyCharacterName: "CapyEarth",
            storyCharacterImage: "assets/characters/no_bg/Capy_Earth.webp"
        },
        {
            id: 6,
            key: "funciones",
            name: "Taller de Funciones Encantadas",
            backgroundImage: "assets/world/routes/route-06-funciones.webp",
            orbImage: "assets/world/orbs/route-06-funciones-orb.webp",
            content: "Funciones, parámetros, retorno y reutilización.",
            storyCharacterName: "CapyKing",
            storyCharacterImage: "assets/characters/no_bg/Capy_King.webp"
        },
        {
            id: 7,
            key: "estructuras_de_datos",
            name: "Biblioteca de Estructuras de Datos",
            backgroundImage: "assets/world/routes/route-07-estructuras-de-datos.webp",
            orbImage: "assets/world/orbs/route-07-estructuras-de-datos-orb.webp",
            content: "Listas, colecciones y operaciones sobre datos agrupados.",
            storyCharacterName: "CapySun",
            storyCharacterImage: "assets/characters/no_bg/Capy_Sun.webp"
        },
        {
            id: 8,
            key: "archivos_de_texto_plano",
            name: "El Archivo Perdido",
            backgroundImage: "assets/world/routes/route-08-archivos-de-texto-plano.webp",
            orbImage: "assets/world/orbs/route-08-archivos-de-texto-plano-orb.webp",
            content: "Lectura, escritura y procesamiento de archivos simples.",
            storyCharacterName: "CapyCandy",
            storyCharacterImage: "assets/characters/no_bg/Capy_Candy.webp"
        }
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
        DEFAULT_OUTFIT_ID,
        "CapyExplorer"
    ];

    const DEFAULT_OUTFITS = [
        {
            id: "Capibara",
            name: "Capibara",
            description: "La compañera base de la aventura CapyCode.",
            tagline: "Esencia capibara",
            image: "assets/characters/Capibara.webp"
        },
        {
            id: "CapyBlack",
            name: "CapyBlack",
            description: "Vestuario base de la aventura CapyCode.",
            tagline: "Sombra elegante",
            image: "assets/characters/CapyBlack.webp",
            unlockRouteId: 1
        },
        {
            id: "CapyAqua",
            name: "CapyAqua",
            description: "Tonos acuáticos para avanzar con calma.",
            tagline: "Marea tranquila",
            image: "assets/characters/CapyAqua.webp",
            unlockRouteId: 3
        },
        {
            id: "CapyKing",
            name: "CapyKing",
            description: "Corona y capa para una presencia solemne.",
            tagline: "Corona serena",
            image: "assets/characters/CapyKing.webp",
            unlockRouteId: 6
        },
        {
            id: "CapyExplorer",
            name: "CapyExplorer",
            description: "Equipo de exploración para recorrer rutas.",
            tagline: "Ruta curiosa",
            image: "assets/characters/CapyExplorer.webp"
        },
        {
            id: "CapyRuna",
            name: "CapyRuna",
            description: "Marcas antiguas para retos misteriosos.",
            tagline: "Runa paciente",
            image: "assets/characters/CapyRuna.webp",
            unlockRouteId: 2
        },
        {
            id: "CapyCandy",
            name: "CapyCandy",
            description: "Colores dulces para una colección alegre.",
            tagline: "Chispa dulce",
            image: "assets/characters/CapyCandy.webp",
            unlockRouteId: 8
        },
        {
            id: "CapySun",
            name: "CapySun",
            description: "Detalles solares para iluminar el recorrido.",
            tagline: "Amanecer claro",
            image: "assets/characters/CapySun.webp",
            unlockRouteId: 7
        },
        {
            id: "CapyEarth",
            name: "CapyEarth",
            description: "Tonos de tierra para una presencia constante.",
            tagline: "Raíz constante",
            image: "assets/characters/CapyEarth.webp",
            unlockRouteId: 5
        },
        {
            id: "CapyConstelation",
            name: "CapyConstelation",
            description: "Detalles estelares para destacar en la colección.",
            tagline: "Cielo estelar",
            image: "assets/characters/CapyConstelation.webp",
            unlockRouteId: 4
        }
    ];

    let cachedQuestionDatasets = null;
    const requestBackend = apiHttp.createRequester({
        baseUrl: BACKEND_BASE_URL,
        getToken: readBackendToken,
        clearAuth: clearBackendAuth
    });

    function isBackendMode() {
        return apiConfig.isBackendMode();
    }

    async function request(path, options) {
        return requestBackend(path, options);
    }

    function getUsers() {
        return apiStorage.readLocalJson(USERS_KEY, {});
    }

    function saveUsers(users) {
        apiStorage.writeLocalJson(USERS_KEY, users || {});
    }

    function getNextUserId() {
        const nextId = readNumber(localStorage.getItem(NEXT_USER_ID_KEY), 1);
        localStorage.setItem(NEXT_USER_ID_KEY, String(nextId + 1));
        return nextId;
    }

    function readSession() {
        try {
            const current = sessionStorage.getItem(SESSION_KEY);
            if (current) {
                return JSON.parse(current);
            }
        } catch (error) {
            sessionStorage.removeItem(SESSION_KEY);
        }

        try {
            const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
            if (!legacy) {
                return null;
            }

            const parsed = JSON.parse(legacy);
            if (!parsed || !parsed.username) {
                return null;
            }

            const migrated = {
                username: parsed.username,
                loggedInAt: parsed.loggedInAt || new Date().toISOString()
            };

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(migrated));
            localStorage.removeItem(LEGACY_SESSION_KEY);
            ensureLocalUser(parsed.username, "");
            return migrated;
        } catch (error) {
            return null;
        }
    }

    function saveSession(username) {
        const session = {
            username: username,
            loggedInAt: new Date().toISOString()
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(LEGACY_SESSION_KEY);
        clearBackendAuth();
    }

    function readBackendToken() {
        try {
            return String(localStorage.getItem(BACKEND_TOKEN_KEY) || "").trim();
        } catch (error) {
            return "";
        }
    }

    function saveBackendToken(token) {
        if (!token) {
            localStorage.removeItem(BACKEND_TOKEN_KEY);
            return "";
        }

        const normalized = String(token).trim();
        localStorage.setItem(BACKEND_TOKEN_KEY, normalized);
        return normalized;
    }

    function clearBackendAuth() {
        sessionStorage.removeItem(BACKEND_USER_KEY);
        localStorage.removeItem(BACKEND_TOKEN_KEY);
    }

    function readBackendCachedUser() {
        if (!readBackendToken()) {
            sessionStorage.removeItem(BACKEND_USER_KEY);
            return null;
        }

        try {
            const raw = sessionStorage.getItem(BACKEND_USER_KEY);
            if (!raw) {
                return null;
            }

            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.username) {
                return null;
            }

            return normalizeBackendCachedUser(parsed);
        } catch (error) {
            sessionStorage.removeItem(BACKEND_USER_KEY);
            return null;
        }
    }

    function saveBackendCachedUser(user) {
        if (!user || !user.username) {
            sessionStorage.removeItem(BACKEND_USER_KEY);
            return null;
        }

        const normalized = normalizeBackendCachedUser(user);
        sessionStorage.setItem(BACKEND_USER_KEY, JSON.stringify(normalized));
        return normalized;
    }

    function normalizeBackendCachedUser(user) {
        const normalized = getPublicUser(normalizeUser(user, user.username));
        normalized.unlockedBadgeRouteIds = uniqueList(
            (Array.isArray(user && user.unlockedBadgeRouteIds) ? user.unlockedBadgeRouteIds : [])
                .map(function (routeId) {
                    return readNumber(routeId, 0);
                })
                .filter(function (routeId) {
                    return routeId > 0;
                })
        );
        return normalized;
    }

    function syncBackendPayload(payload) {
        if (payload && payload.token) {
            saveBackendToken(payload.token);
        }

        if (payload && payload.user) {
            payload.user = saveBackendCachedUser(payload.user);
        }

        return payload;
    }

    function ensureLocalUser(username, password) {
        const users = getUsers();
        const key = normalizeUsernameKey(username);
        const existing = users[key];

        if (existing) {
            users[key] = normalizeUser(existing, username);
        } else {
            users[key] = normalizeUser(buildDefaultUser(username, password), username);
        }

        saveUsers(users);
        return users[key];
    }

    function buildDefaultUser(username, password) {
        return {
            id: getNextUserId(),
            username: username,
            passwordMock: password || "",
            currentLevelId: 1,
            streak: 0,
            xp: 0,
            lastCompletionAt: null,
            currentOutfitId: DEFAULT_OUTFIT_ID,
            unlockedOutfitIds: [DEFAULT_OUTFIT_ID],
            unlockedBadgeRouteIds: [],
            discoveredOutfitIds: STARTER_DISCOVERED_OUTFIT_IDS.slice()
        };
    }

    function getLegacyProfile(username) {
        try {
            const raw = localStorage.getItem(LEGACY_PROFILE_PREFIX + username);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function getStarterDiscoveredOutfitIds() {
        return shopRules.getStarterDiscoveredOutfitIds(STARTER_DISCOVERED_OUTFIT_IDS);
    }

    function getUnlockRouteIdForOutfit(outfitId) {
        const routeRequirements = catalogModule.OUTFIT_ROUTE_REQUIREMENTS || OUTFIT_ROUTE_REQUIREMENTS;
        return routeRequirements[String(outfitId)] || null;
    }

    function getInferredUnlockedBadgeRouteIds(currentLevelId) {
        const highestCompletedLevel = Math.max(0, Math.min(getTotalLevelCountSync(), Number(currentLevelId || 1) - 1));

        return getRoutesSync().filter(function (route) {
            return highestCompletedLevel >= route.orderIndex * TOTAL_LEVELS_PER_ROUTE;
        }).map(function (route) {
            return Number(route.id);
        });
    }

    function getDiscoveredOutfitIdsFromState(explicitIds, unlockedOutfitIds, unlockedBadgeRouteIds) {
        return shopRules.getDiscoveredOutfitIdsFromState(explicitIds, unlockedOutfitIds, unlockedBadgeRouteIds, {
            starterIds: STARTER_DISCOVERED_OUTFIT_IDS,
            getRouteRewardOutfit: getRouteRewardOutfitSync,
            uniqueList: uniqueList,
            arrayCopy: arrayCopy
        });
    }

    function migrateLegacyStarterState(unlockedOutfitIds, currentOutfitId, unlockedBadgeRouteIds) {
        return shopRules.migrateLegacyStarterState(unlockedOutfitIds, currentOutfitId, unlockedBadgeRouteIds, {
            defaultOutfitId: DEFAULT_OUTFIT_ID,
            legacyStarterOutfitId: LEGACY_STARTER_OUTFIT_ID,
            uniqueList: uniqueList,
            arrayCopy: arrayCopy
        });
    }

    function normalizeUser(user, fallbackUsername) {
        const legacy = user || {};
        const username = String(legacy.username || fallbackUsername || "Aprendiz").trim() || "Aprendiz";
        const legacyProfile = getLegacyProfile(username) || {};
        const totalLevels = getTotalLevelCountSync();
        const completedLevels = Array.isArray(legacy.completedLevels)
            ? legacy.completedLevels
            : (Array.isArray(legacyProfile.completedLevels) ? legacyProfile.completedLevels : []);
        const legacyHighest = completedLevels
            .map(Number)
            .filter(Number.isFinite)
            .reduce(function (highest, levelId) {
                return Math.max(highest, levelId);
            }, 0);
        const rawLevel = legacy.currentLevelId !== undefined
            ? legacy.currentLevelId
            : (legacy.level !== undefined ? legacy.level : (legacyProfile.level !== undefined ? legacyProfile.level : 1));
        const currentLevelId = Math.max(1, Math.min(readNumber(rawLevel, legacyHighest + 1 || 1), totalLevels + 1));
        const unlockedOutfitIds = uniqueList(
            (Array.isArray(legacy.unlockedOutfitIds) ? legacy.unlockedOutfitIds : null) ||
            (Array.isArray(legacy.unlockedCharacters) ? legacy.unlockedCharacters : null) ||
            (Array.isArray(legacyProfile.unlockedCharacters) ? legacyProfile.unlockedCharacters : null) ||
            [DEFAULT_OUTFIT_ID]
        );
        const explicitUnlockedBadgeRouteIds = uniqueList(
            (
                (Array.isArray(legacy.unlockedBadgeRouteIds) ? legacy.unlockedBadgeRouteIds : null) ||
                (Array.isArray(legacyProfile.unlockedBadgeRouteIds) ? legacyProfile.unlockedBadgeRouteIds : null) ||
                []
            ).map(function (routeId) {
                return readNumber(routeId, 0);
            }).filter(function (routeId) {
                return routeId > 0;
            })
        );
        const currentOutfitId = legacy.currentOutfitId ||
            legacy.equippedCharacter ||
            legacyProfile.equippedCharacter ||
            DEFAULT_OUTFIT_ID;
        const unlockedBadgeRouteIds = explicitUnlockedBadgeRouteIds.length
            ? explicitUnlockedBadgeRouteIds
            : getInferredUnlockedBadgeRouteIds(currentLevelId);
        const migratedStarterState = migrateLegacyStarterState(
            unlockedOutfitIds,
            currentOutfitId,
            unlockedBadgeRouteIds
        );
        const normalizedCurrentOutfitId = migratedStarterState.currentOutfitId;
        const normalizedUnlockedOutfitIds = migratedStarterState.unlockedOutfitIds;

        if (!normalizedUnlockedOutfitIds.includes(DEFAULT_OUTFIT_ID)) {
            normalizedUnlockedOutfitIds.unshift(DEFAULT_OUTFIT_ID);
        }

        if (!normalizedUnlockedOutfitIds.includes(normalizedCurrentOutfitId)) {
            normalizedUnlockedOutfitIds.push(normalizedCurrentOutfitId);
        }

        const discoveredOutfitIds = getDiscoveredOutfitIdsFromState(
            (Array.isArray(legacy.discoveredOutfitIds) ? legacy.discoveredOutfitIds : null) ||
            (Array.isArray(legacy.availableOutfitIds) ? legacy.availableOutfitIds : null) ||
            (Array.isArray(legacyProfile.discoveredOutfitIds) ? legacyProfile.discoveredOutfitIds : null) ||
            [],
            normalizedUnlockedOutfitIds,
            unlockedBadgeRouteIds
        );

        return {
            id: readNumber(legacy.id, getStableFallbackId(username)),
            username: username,
            passwordMock: legacy.passwordMock || "",
            currentLevelId: currentLevelId,
            streak: Math.max(0, readNumber(legacy.streak !== undefined ? legacy.streak : legacyProfile.streak, 0)),
            xp: Math.max(0, readNumber(legacy.xp !== undefined ? legacy.xp : legacyProfile.xp, 0)),
            lastCompletionAt: legacy.lastCompletionAt || legacy.lastCompletedAt || null,
            currentOutfitId: normalizedCurrentOutfitId,
            unlockedOutfitIds: normalizedUnlockedOutfitIds,
            unlockedBadgeRouteIds: unlockedBadgeRouteIds,
            discoveredOutfitIds: discoveredOutfitIds
        };
    }

    function getStableFallbackId(username) {
        return String(username || "Aprendiz").split("").reduce(function (sum, char) {
            return sum + char.charCodeAt(0);
        }, 0) + 1000;
    }

    function getCurrentUserSync() {
        if (isBackendMode()) {
            return readBackendCachedUser();
        }

        const session = readSession();

        if (!session || !session.username) {
            return null;
        }

        const users = getUsers();
        const key = normalizeUsernameKey(session.username);
        const normalized = normalizeUser(users[key] || buildDefaultUser(session.username, ""), session.username);

        users[key] = normalized;
        saveUsers(users);
        return getPublicUser(normalized);
    }

    function saveCurrentUserSync(user) {
        if (isBackendMode()) {
            return saveBackendCachedUser(user);
        }

        if (!user || !user.username) {
            return null;
        }

        const users = getUsers();
        const key = normalizeUsernameKey(user.username);
        const existing = users[key] || {};
        const normalized = normalizeUser(Object.assign({}, existing, user), user.username);

        users[key] = normalized;
        saveUsers(users);
        saveSession(normalized.username);
        return getPublicUser(normalized);
    }

    function getUserRecordBySession() {
        const session = readSession();
        if (!session || !session.username) {
            return null;
        }

        const users = getUsers();
        const key = normalizeUsernameKey(session.username);
        const normalized = normalizeUser(users[key] || buildDefaultUser(session.username, ""), session.username);

        users[key] = normalized;
        saveUsers(users);
        return {
            users: users,
            key: key,
            user: normalized
        };
    }

    function getPublicUser(user) {
        if (!user) {
            return null;
        }

        const publicUser = Object.assign({}, user);
        delete publicUser.passwordMock;
        publicUser.visibleStreak = getVisibleStreak(publicUser);
        publicUser.level = publicUser.currentLevelId;
        publicUser.equippedCharacter = publicUser.currentOutfitId;
        publicUser.unlockedCharacters = publicUser.unlockedOutfitIds.slice();
        publicUser.unlockedBadgeRouteIds = arrayCopy(publicUser.unlockedBadgeRouteIds);
        publicUser.discoveredOutfitIds = arrayCopy(publicUser.discoveredOutfitIds);
        publicUser.availableOutfitIds = publicUser.discoveredOutfitIds.slice();
        return publicUser;
    }

    function validateUsername(username) {
        return userNormalizers.validateUsername(username, USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH);
    }

    function validatePassword(password) {
        return userNormalizers.validatePassword(password, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH);
    }

    async function registerUser(username, password) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("auth/register", {
                method: "POST",
                body: { username: username, password: password }
            }));
        }

        const cleanUsername = validateUsername(username);
        const cleanPassword = validatePassword(password);
        const users = getUsers();
        const key = normalizeUsernameKey(cleanUsername);

        if (users[key]) {
            throw new Error("Ese usuario ya existe.");
        }

        users[key] = normalizeUser(buildDefaultUser(cleanUsername, cleanPassword), cleanUsername);
        saveUsers(users);
        saveSession(cleanUsername);

        return { ok: true, user: getPublicUser(users[key]) };
    }

    async function loginUser(username, password) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("auth/login", {
                method: "POST",
                body: { username: username, password: password }
            }));
        }

        const cleanUsername = String(username || "").trim();
        const users = getUsers();
        const key = normalizeUsernameKey(cleanUsername);
        const user = users[key];

        if (!cleanUsername || !password) {
            throw new Error("Completa usuario y contraseña.");
        }

        if (!user || !user.passwordMock || user.passwordMock !== password) {
            throw new Error("Usuario o contraseña incorrectos.");
        }

        users[key] = normalizeUser(user, cleanUsername);
        saveUsers(users);
        saveSession(user.username || cleanUsername);
        return { ok: true, user: getPublicUser(users[key]) };
    }

    async function logoutUser() {
        if (isBackendMode()) {
            try {
                await request("auth/logout", { method: "POST" });
            } finally {
                clearBackendAuth();
            }
            return { ok: true };
        }

        clearSession();
        return { ok: true };
    }

    async function getCurrentUser() {
        if (isBackendMode()) {
            return syncBackendPayload(await request("me", { method: "GET" }));
        }

        return { ok: true, user: getCurrentUserSync() };
    }

    async function updateUsername(username) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("me/username", {
                method: "PATCH",
                body: { username: username }
            }));
        }

        const cleanUsername = validateUsername(username);
        const record = getUserRecordBySession();

        if (!record) {
            throw new Error("Inicia sesión para cambiar usuario.");
        }

        const nextKey = normalizeUsernameKey(cleanUsername);
        if (nextKey !== record.key && record.users[nextKey]) {
            throw new Error("Ese usuario ya existe.");
        }

        delete record.users[record.key];
        record.user.username = cleanUsername;
        record.users[nextKey] = normalizeUser(record.user, cleanUsername);
        saveUsers(record.users);
        saveSession(cleanUsername);

        return { ok: true, user: getPublicUser(record.users[nextKey]) };
    }

    async function updatePassword(currentPassword, newPassword) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("me/password", {
                method: "PATCH",
                body: {
                    currentPassword: currentPassword,
                    newPassword: newPassword
                }
            }));
        }

        const record = getUserRecordBySession();
        if (!record) {
            throw new Error("Inicia sesión para cambiar contraseña.");
        }

        validatePassword(currentPassword);
        if (record.user.passwordMock && record.user.passwordMock !== currentPassword) {
            throw new Error("La contraseña actual no coincide.");
        }

        record.user.passwordMock = validatePassword(newPassword);
        record.users[record.key] = normalizeUser(record.user, record.user.username);
        saveUsers(record.users);

        return { ok: true, user: getPublicUser(record.users[record.key]) };
    }

    async function getRoutes() {
        if (isBackendMode()) {
            return request("routes", { method: "GET" });
        }

        return { ok: true, routes: getRoutesSync() };
    }

    async function getLevelsByRoute(routeId) {
        if (isBackendMode()) {
            return request("routes/" + encodeURIComponent(routeId) + "/levels", { method: "GET" });
        }

        return { ok: true, levels: getLevelsByRouteSync(routeId) };
    }

    async function getExercisesByLevel(levelId) {
        if (isBackendMode()) {
            return request("levels/" + encodeURIComponent(levelId) + "/exercises", { method: "GET" });
        }

        return { ok: true, exercises: await getExercisesByLevelLocal(levelId) };
    }

    async function completeLevel(levelId, answers) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("levels/" + encodeURIComponent(levelId) + "/complete", {
                method: "POST",
                body: { answers: answers || [] }
            }));
        }

        const numericLevelId = readNumber(levelId, 0);
        const level = getLevelByIdSync(numericLevelId);
        const record = getUserRecordBySession();
        const answerList = Array.isArray(answers) ? answers : [];
        const previewAllLevels = Boolean(
            window.CAPYCODE_CONFIG && window.CAPYCODE_CONFIG.UNLOCK_ALL_LEVELS_FOR_PREVIEW
        );

        if (!record) {
            throw new Error("Inicia sesión para completar niveles.");
        }

        if (!level) {
            throw new Error("Nivel no encontrado.");
        }

        const totalLevels = getTotalLevelCountSync();
        const isGameAlreadyCompleted = record.user.currentLevelId === totalLevels + 1;

        if (!previewAllLevels && !isGameAlreadyCompleted && numericLevelId > record.user.currentLevelId) {
            throw new Error("Este nivel sigue bloqueado.");
        }

        const exercises = await getExercisesByLevelLocal(numericLevelId);
        const answersByExerciseId = new Map(answerList.map(function (entry) {
            return [String(entry.exerciseId), entry.answer];
        }));
        const allCorrect = exercises.every(function (exercise) {
            return validateExerciseAnswer(exercise, answersByExerciseId.get(String(exercise.id)));
        });

        if (!allCorrect) {
            throw new Error("Hay respuestas incorrectas o incompletas.");
        }

        const isPractice = !previewAllLevels &&
            (isGameAlreadyCompleted || numericLevelId < record.user.currentLevelId);
        let reward = 0;
        let nextLevelId = previewAllLevels
            ? Math.min(numericLevelId + 1, totalLevels + 1)
            : record.user.currentLevelId;
        let badgeUnlocked = false;
        let newlyDiscoveredOutfits = [];
        let streakCelebration = null;
        let storyBeat = null;

        if (!isPractice) {
            const xpReward = catalogModule.XP_REWARD || XP_REWARD;
            reward = xpReward[level.difficulty] || 0;
            record.user.xp += reward;
            streakCelebration = updateStreakOnCompletion(record.user, new Date());
            nextLevelId = Math.min(numericLevelId + 1, totalLevels + 1);
            storyBeat = {
                title: level.storyTitle || "",
                message: level.storyMessage || "",
                characterName: level.storyCharacterName || "",
                characterImage: level.storyCharacterImage || ""
            };

            if (!previewAllLevels) {
                record.user.currentLevelId = nextLevelId;
            }

            if (level.routeOrder === TOTAL_LEVELS_PER_ROUTE) {
                const unlockedBadgeRouteIds = arrayCopy(record.user.unlockedBadgeRouteIds);
                badgeUnlocked = !unlockedBadgeRouteIds.includes(Number(level.routeId));

                if (badgeUnlocked) {
                    unlockedBadgeRouteIds.push(Number(level.routeId));
                }

                const discoveredBefore = arrayCopy(record.user.discoveredOutfitIds);
                const discoveredAfter = getDiscoveredOutfitIdsFromState(
                    discoveredBefore,
                    record.user.unlockedOutfitIds,
                    unlockedBadgeRouteIds
                );
                const routeRewardOutfit = getRouteRewardOutfitSync(level.routeId);

                record.user.unlockedBadgeRouteIds = uniqueList(unlockedBadgeRouteIds);
                record.user.discoveredOutfitIds = discoveredAfter;

                if (routeRewardOutfit &&
                    discoveredAfter.includes(routeRewardOutfit.id) &&
                    !discoveredBefore.includes(routeRewardOutfit.id)) {
                    newlyDiscoveredOutfits = [routeRewardOutfit];
                }
            }
        }

        record.users[record.key] = normalizeUser(record.user, record.user.username);
        saveUsers(record.users);

        return {
            ok: true,
            practice: isPractice,
            reward: reward,
            user: getPublicUser(record.users[record.key]),
            nextLevelId: nextLevelId,
            routeCompleted: !isPractice && level.routeOrder === TOTAL_LEVELS_PER_ROUTE,
            gameCompleted: !previewAllLevels && !isPractice && nextLevelId === totalLevels + 1,
            badgeUnlocked: badgeUnlocked,
            newlyDiscoveredOutfits: newlyDiscoveredOutfits,
            streakCelebration: streakCelebration,
            storyBeat: storyBeat
        };
    }

    async function getOutfits() {
        if (isBackendMode()) {
            return request("outfits", { method: "GET" });
        }

        return { ok: true, outfits: getOutfitsSync() };
    }

    async function unlockOutfit(outfitId) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("outfits/" + encodeURIComponent(outfitId) + "/unlock", {
                method: "POST"
            }));
        }

        const record = getUserRecordBySession();
        const outfit = getOutfitByIdSync(outfitId);

        if (!record) {
            throw new Error("Inicia sesión para comprar vestuarios.");
        }

        if (!outfit) {
            throw new Error("Vestuario no encontrado.");
        }

        if (!arrayCopy(record.user.discoveredOutfitIds).includes(outfit.id)) {
            throw new Error(getOutfitUnlockMessage(outfit));
        }

        if (record.user.unlockedOutfitIds.includes(outfit.id)) {
            return { ok: true, user: getPublicUser(record.user), outfit: outfit, alreadyUnlocked: true };
        }

        if (record.user.xp < outfit.cost) {
            throw new Error("XP insuficiente.");
        }

        record.user.xp -= outfit.cost;
        record.user.unlockedOutfitIds.push(outfit.id);
        record.users[record.key] = normalizeUser(record.user, record.user.username);
        saveUsers(record.users);

        return { ok: true, user: getPublicUser(record.users[record.key]), outfit: outfit };
    }

    async function equipOutfit(outfitId) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("outfits/" + encodeURIComponent(outfitId) + "/equip", {
                method: "POST"
            }));
        }

        const record = getUserRecordBySession();
        const outfit = getOutfitByIdSync(outfitId);

        if (!record) {
            throw new Error("Inicia sesión para equipar vestuarios.");
        }

        if (!outfit || !record.user.unlockedOutfitIds.includes(outfit.id)) {
            throw new Error("Primero desbloquea este vestuario.");
        }

        record.user.currentOutfitId = outfit.id;
        record.users[record.key] = normalizeUser(record.user, record.user.username);
        saveUsers(record.users);

        return { ok: true, user: getPublicUser(record.users[record.key]), outfit: outfit };
    }

    function getRoutesSync() {
        const routeDefinitions = catalogModule.ROUTE_DEFINITIONS || ROUTE_DEFINITIONS;
        return routeDefinitions.map(function (route, index) {
            return {
                id: route.id,
                key: route.key,
                name: route.name,
                orderIndex: index + 1,
                backgroundImage: route.backgroundImage,
                orbImage: route.orbImage || "assets/esfera_nivel.webp",
                content: route.content,
                badgeImage: route.badgeImage || ("assets/badges/badge-route-" + (index + 1) + ".svg")
            };
        });
    }

    function getAllLevelsSync() {
        const anchors = getLevelAnchors();
        const levels = [];
        const routeDefinitions = catalogModule.ROUTE_DEFINITIONS || ROUTE_DEFINITIONS;
        const difficultyByRouteOrder = catalogModule.DIFFICULTY_BY_ROUTE_ORDER || DIFFICULTY_BY_ROUTE_ORDER;

        routeDefinitions.forEach(function (route, routeIndex) {
            for (let routeOrder = 1; routeOrder <= TOTAL_LEVELS_PER_ROUTE; routeOrder += 1) {
                const difficulty = difficultyByRouteOrder[routeOrder];
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
                    content: buildLevelContent(route, routeOrder, difficulty),
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

    function getLevelsByRouteSync(routeId) {
        return getAllLevelsSync().filter(function (level) {
            return String(level.routeId) === String(routeId);
        });
    }

    function getLevelByIdSync(levelId) {
        return getAllLevelsSync().find(function (level) {
            return Number(level.id) === Number(levelId);
        }) || null;
    }

    function getRouteByIdSync(routeId) {
        return getRoutesSync().find(function (route) {
            return Number(route.id) === Number(routeId);
        }) || null;
    }

    function getRouteRewardOutfitSync(routeId) {
        return getOutfitsSync().find(function (outfit) {
            return Number(outfit.unlockRouteId) === Number(routeId);
        }) || null;
    }

    function getOutfitUnlockMessage(outfit) {
        if (!outfit || !outfit.unlockRouteId) {
            return "Este vestuario todavía no está disponible.";
        }

        const route = getRouteByIdSync(outfit.unlockRouteId);
        return route
            ? "Completa la ruta " + route.orderIndex + " para habilitar este vestuario."
            : "Completa la ruta asociada para habilitar este vestuario.";
    }

    function getCurrentRouteForUserSync(user) {
        const currentUser = user || getCurrentUserSync();
        const totalLevels = getTotalLevelCountSync();
        const safeLevelId = currentUser && currentUser.currentLevelId > totalLevels
            ? totalLevels
            : (currentUser ? currentUser.currentLevelId : 1);
        const level = getLevelByIdSync(safeLevelId);

        if (!level) {
            return null;
        }

        return getRouteByIdSync(level.routeId);
    }

    function getTotalLevelCountSync() {
        const routeDefinitions = catalogModule.ROUTE_DEFINITIONS || ROUTE_DEFINITIONS;
        return routeDefinitions.length * TOTAL_LEVELS_PER_ROUTE;
    }

    function getOutfitsSync() {
        const source = window.CAPYCODE_APP_DATA && Array.isArray(window.CAPYCODE_APP_DATA.shopItems)
            ? window.CAPYCODE_APP_DATA.shopItems
            : DEFAULT_OUTFITS;
        const outfitOrder = catalogModule.OUTFIT_ORDER || OUTFIT_ORDER;
        const outfitCosts = catalogModule.OUTFIT_COSTS || OUTFIT_COSTS;
        const defaultOutfits = catalogModule.DEFAULT_OUTFITS || DEFAULT_OUTFITS;
        const transparentImages = catalogModule.OUTFIT_TRANSPARENT_IMAGES || OUTFIT_TRANSPARENT_IMAGES;
        const sourceById = new Map(source.map(function (item) {
            return [item.id, item];
        }));

        return outfitOrder.map(function (outfitId) {
            const item = sourceById.get(outfitId) || defaultOutfits.find(function (fallback) {
                return fallback.id === outfitId;
            }) || {};

            return {
                id: outfitId,
                name: item.name || item.nombre || outfitId,
                description: item.description || item.descripcion || "Vestuario decorativo de CapyCode.",
                tagline: item.tagline || item.slogan || item.perk || item.frase || "",
                cost: outfitCosts[outfitId],
                image: item.image || ("assets/characters/" + outfitId + ".webp"),
                transparentImage: transparentImages[outfitId] || item.transparentImage || item.image || ("assets/characters/" + outfitId + ".webp"),
                unlockRouteId: readNumber(item.unlockRouteId, getUnlockRouteIdForOutfit(outfitId) || 0) || null,
                unlockRouteName: (function () {
                    const routeId = readNumber(item.unlockRouteId, getUnlockRouteIdForOutfit(outfitId) || 0);
                    const route = routeId ? getRouteByIdSync(routeId) : null;
                    return route ? route.name : "";
                }())
            };
        });
    }

    function getOutfitByIdSync(outfitId) {
        return getOutfitsSync().find(function (outfit) {
            return String(outfit.id) === String(outfitId);
        }) || null;
    }

    async function getExercisesByLevelLocal(levelId) {
        const level = getLevelByIdSync(levelId);

        if (!level) {
            return [];
        }

        const datasets = await loadQuestionDatasets();
        const questions = resolveQuestionsForLevel(datasets, level);

        return questions.slice(0, EXERCISES_PER_LEVEL).map(function (question, index) {
            return normalizeExercise(question, level, index + 1);
        });
    }

    async function loadQuestionDatasets() {
        if (cachedQuestionDatasets) {
            return cachedQuestionDatasets;
        }

        const sources = [
            "questions.json",
            "levels.json",
            "levels_algoritmos_complementado.json"
        ];
        const datasets = [];

        for (let index = 0; index < sources.length; index += 1) {
            try {
                const response = await fetch(sources[index], { cache: "no-store" });
                if (response.ok) {
                    datasets.push(await response.json());
                }
            } catch (error) {
                // Static file fetch can fail when opened directly; the JS fallback is below.
            }
        }

        if (window.CAPYCODE_QUESTIONS) {
            datasets.push(window.CAPYCODE_QUESTIONS);
        }

        cachedQuestionDatasets = datasets.length ? datasets : [{ temas: {} }];
        return cachedQuestionDatasets;
    }

    function resolveQuestionsForLevel(datasets, level) {
        for (let index = 0; index < datasets.length; index += 1) {
            const temas = datasets[index] && datasets[index].temas ? datasets[index].temas : {};
            const theme = temas[level.routeKey];
            const questions = pickQuestionsFromTheme(theme, level);

            if (questions.length) {
                return ensureExerciseCount(questions);
            }
        }

        const algorithmsDataset = datasets.find(function (dataset) {
            return dataset && dataset.temas && dataset.temas.algoritmos;
        });
        const fallbackQuestions = algorithmsDataset
            ? pickQuestionsFromTheme(algorithmsDataset.temas.algoritmos, Object.assign({}, level, { routeOrder: ((level.routeOrder - 1) % TOTAL_LEVELS_PER_ROUTE) + 1 }))
            : [];

        return ensureExerciseCount(fallbackQuestions);
    }

    function pickQuestionsFromTheme(theme, level) {
        if (!theme) {
            return [];
        }

        const directKey = "nivel_" + level.routeOrder;
        if (Array.isArray(theme[directKey])) {
            return theme[directKey].slice();
        }

        const difficulty = level.difficulty;
        const difficultyBuckets = catalogModule.DIFFICULTY_BUCKETS || DIFFICULTY_BUCKETS;
        const bucketName = difficultyBuckets[difficulty];
        const bucket = Array.isArray(theme[bucketName]) ? theme[bucketName].slice() : [];

        if (difficulty === "integrative" && !bucket.length) {
            const mixed = []
                .concat(Array.isArray(theme.facil) ? theme.facil : [])
                .concat(Array.isArray(theme.medio) ? theme.medio : [])
                .concat(Array.isArray(theme.dificil) ? theme.dificil : []);
            return mixed.length ? mixed.slice(Math.max(0, mixed.length - EXERCISES_PER_LEVEL)) : [];
        }

        if (!bucket.length) {
            return [];
        }

        const sameDifficultyOrder = getSameDifficultyOrder(level.routeOrder, difficulty);
        const chunkStart = (sameDifficultyOrder - 1) * EXERCISES_PER_LEVEL;
        const chunk = bucket.slice(chunkStart, chunkStart + EXERCISES_PER_LEVEL);

        return chunk.length === EXERCISES_PER_LEVEL ? chunk : bucket.slice(0, EXERCISES_PER_LEVEL);
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
                    options: arrayCopy(question.opciones || question.options)
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
                    code: arrayCopy(question.code)
                },
                answerData: {
                    correctValue: question.valor !== undefined ? question.valor : question.correctValue
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
                    lines: arrayCopy(question.lineas || question.lines)
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
                    lines: arrayCopy(question.lineas || question.lines)
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
                wordBank: arrayCopy(question.banco_palabras || question.wordBank)
            },
            answerData: {
                correctBlanks: Object.assign({}, question.rellenos || question.correctBlanks || {})
            }
        };
    }

    function validateExerciseAnswer(exercise, answer) {
        return exerciseRules.validateExerciseAnswer(exercise, answer);
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

    function updateStreakOnCompletion(user, date) {
        return progressRules.updateStreakOnCompletion(user, date, MEXICO_TIMEZONE);
    }

    function getVisibleStreak(user) {
        return progressRules.getVisibleStreak(user, MEXICO_TIMEZONE);
    }

    function buildLevelContent(route, routeOrder, difficulty) {
        if (difficulty === "integrative") {
            return "Reto integrador de " + route.name + " con ejercicios combinados.";
        }

        const difficultyLabels = catalogModule.DIFFICULTY_LABELS || DIFFICULTY_LABELS;
        return route.content + " Enfoque " + difficultyLabels[difficulty].toLowerCase() + ".";
    }

    function buildLevelStory(route, routeOrder) {
        const catalogStories = catalogModule.STORY_MESSAGES || {};
        const routeMessages = catalogStories[route.key] || STORY_MESSAGES[route.key] || [];
        return routeMessages[routeOrder - 1] || ("Una nueva parte del sendero se revela en " + route.name + ".");
    }

    function getLevelAnchors() {
        const anchors = window.CAPYCODE_APP_DATA &&
            window.CAPYCODE_APP_DATA.map &&
            Array.isArray(window.CAPYCODE_APP_DATA.map.levelAnchors)
            ? window.CAPYCODE_APP_DATA.map.levelAnchors
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

    function getSameDifficultyOrder(routeOrder, difficulty) {
        let count = 0;
        const difficultyByRouteOrder = catalogModule.DIFFICULTY_BY_ROUTE_ORDER || DIFFICULTY_BY_ROUTE_ORDER;
        for (let order = 1; order <= routeOrder; order += 1) {
            if (difficultyByRouteOrder[order] === difficulty) {
                count += 1;
            }
        }
        return Math.max(1, count);
    }

    function normalizeUsernameKey(username) {
        return apiStorage.normalizeUsernameKey(username);
    }

    function readNumber(value, fallback) {
        return apiStorage.readNumber(value, fallback);
    }

    function uniqueList(items) {
        return apiStorage.uniqueList(items);
    }

    function arrayCopy(value) {
        return apiStorage.arrayCopy(value);
    }

    window.CapyApi = {
        config: CONFIG,
        registerUser: registerUser,
        loginUser: loginUser,
        logoutUser: logoutUser,
        getCurrentUser: getCurrentUser,
        updateUsername: updateUsername,
        updatePassword: updatePassword,
        validateUsername: validateUsername,
        validatePassword: validatePassword,
        getRoutes: getRoutes,
        getLevelsByRoute: getLevelsByRoute,
        getExercisesByLevel: getExercisesByLevel,
        completeLevel: completeLevel,
        getOutfits: getOutfits,
        unlockOutfit: unlockOutfit,
        equipOutfit: equipOutfit,
        validateExerciseAnswer: validateExerciseAnswer,
        getCurrentUserSync: getCurrentUserSync,
        saveCurrentUserSync: saveCurrentUserSync,
        getRoutesSync: getRoutesSync,
        getAllLevelsSync: getAllLevelsSync,
        getLevelsByRouteSync: getLevelsByRouteSync,
        getLevelByIdSync: getLevelByIdSync,
        getCurrentRouteForUserSync: getCurrentRouteForUserSync,
        getTotalLevelCountSync: getTotalLevelCountSync,
        getOutfitsSync: getOutfitsSync,
        getOutfitByIdSync: getOutfitByIdSync,
        USERNAME_MIN_LENGTH: USERNAME_MIN_LENGTH,
        USERNAME_MAX_LENGTH: USERNAME_MAX_LENGTH,
        PASSWORD_MIN_LENGTH: PASSWORD_MIN_LENGTH,
        PASSWORD_MAX_LENGTH: PASSWORD_MAX_LENGTH,
        getVisibleStreak: getVisibleStreak,
        getDifficultyLabel: function (difficulty) {
            const difficultyLabels = catalogModule.DIFFICULTY_LABELS || DIFFICULTY_LABELS;
            return difficultyLabels[difficulty] || difficulty || "";
        },
        getDifficultySeconds: function (difficulty) {
            const timerSeconds = catalogModule.TIMER_SECONDS || TIMER_SECONDS;
            return timerSeconds[difficulty] || 30;
        },
        getDifficultyXp: function (difficulty) {
            const xpReward = catalogModule.XP_REWARD || XP_REWARD;
            return xpReward[difficulty] || 0;
        },
        isBackendMode: isBackendMode,
        getDataSource: function () {
            return isBackendMode() ? "backend" : "local";
        }
    };
}());
