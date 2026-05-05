(function () {
    const CONFIG = window.CAPYCODE_CONFIG = Object.assign({
        API_BASE_URL: "",
        DATA_SOURCE: "auto"
    }, window.CAPYCODE_CONFIG || {});

    const BACKEND_BASE_URL = String(CONFIG.API_BASE_URL || "").replace(/\/+$/, "");
    const DATA_SOURCE = String(CONFIG.DATA_SOURCE || "auto").toLowerCase();
    const USERS_KEY = "capycodeUsersV3";
    const SESSION_KEY = "capycodeSessionV3";
    const LEGACY_SESSION_KEY = "capycodeSession";
    const LEGACY_PROFILE_PREFIX = "capycodeProfile::";
    const NEXT_USER_ID_KEY = "capycodeNextUserIdV3";
    const DEFAULT_OUTFIT_ID = "CapyBlack";
    const TOTAL_LEVELS_PER_ROUTE = 7;
    const EXERCISES_PER_LEVEL = 5;
    const MEXICO_TIMEZONE = "America/Mexico_City";

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

    const ROUTE_DEFINITIONS = [
        {
            id: 1,
            key: "algoritmos",
            name: "Algoritmos",
            backgroundImage: "assets/fondo1.png",
            content: "Secuencia, selección, repetición y razonamiento algorítmico."
        },
        {
            id: 2,
            key: "tipos_de_datos",
            name: "Tipos de datos",
            backgroundImage: "assets/fondo1.png",
            content: "Tipos primitivos, conversiones y lectura de valores."
        },
        {
            id: 3,
            key: "expresiones",
            name: "Expresiones",
            backgroundImage: "assets/fondo1.png",
            content: "Operadores aritméticos, relacionales y lógicos."
        },
        {
            id: 4,
            key: "condicionales",
            name: "Condicionales",
            backgroundImage: "assets/fondo1.png",
            content: "Decisiones con if, else y combinaciones de condiciones."
        },
        {
            id: 5,
            key: "ciclos",
            name: "Ciclos",
            backgroundImage: "assets/fondo1.png",
            content: "Repetición controlada con for, while, break y continue."
        },
        {
            id: 6,
            key: "funciones",
            name: "Funciones",
            backgroundImage: "assets/fondo1.png",
            content: "Funciones, parámetros, retorno y reutilización."
        },
        {
            id: 7,
            key: "estructuras_de_datos",
            name: "Estructuras de datos",
            backgroundImage: "assets/fondo1.png",
            content: "Listas, colecciones y operaciones sobre datos agrupados."
        },
        {
            id: 8,
            key: "archivos_de_texto_plano",
            name: "Archivos de texto plano",
            backgroundImage: "assets/fondo1.png",
            content: "Lectura, escritura y procesamiento de archivos simples."
        }
    ];

    const OUTFIT_COSTS = {
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

    const DEFAULT_OUTFITS = [
        {
            id: "CapyBlack",
            name: "CapyBlack",
            description: "Vestuario base de la aventura CapyCode.",
            tagline: "Sombra elegante",
            image: "assets/characters/CapyBlack.png"
        },
        {
            id: "CapyAqua",
            name: "CapyAqua",
            description: "Tonos acuáticos para avanzar con calma.",
            tagline: "Marea tranquila",
            image: "assets/characters/CapyAqua.png"
        },
        {
            id: "CapyKing",
            name: "CapyKing",
            description: "Corona y capa para una presencia solemne.",
            tagline: "Corona serena",
            image: "assets/characters/CapyKing.png"
        },
        {
            id: "CapyExplorer",
            name: "CapyExplorer",
            description: "Equipo de exploración para recorrer rutas.",
            tagline: "Ruta curiosa",
            image: "assets/characters/CapyExplorer.png"
        },
        {
            id: "CapyRuna",
            name: "CapyRuna",
            description: "Marcas antiguas para retos misteriosos.",
            tagline: "Runa paciente",
            image: "assets/characters/CapyRuna.png"
        },
        {
            id: "CapyCandy",
            name: "CapyCandy",
            description: "Colores dulces para una colección alegre.",
            tagline: "Chispa dulce",
            image: "assets/characters/CapyCandy.png"
        },
        {
            id: "CapySun",
            name: "CapySun",
            description: "Detalles solares para iluminar el recorrido.",
            tagline: "Amanecer claro",
            image: "assets/characters/CapySun.png"
        },
        {
            id: "CapyEarth",
            name: "CapyEarth",
            description: "Tonos de tierra para una presencia constante.",
            tagline: "Raíz constante",
            image: "assets/characters/CapyEarth.png"
        },
        {
            id: "CapyConstelation",
            name: "CapyConstelation",
            description: "Detalles estelares para destacar en la colección.",
            tagline: "Cielo estelar",
            image: "assets/characters/CapyConstelation.png"
        }
    ];

    let cachedQuestionDatasets = null;

    function isBackendMode() {
        if (DATA_SOURCE === "local") {
            return false;
        }

        if (DATA_SOURCE === "backend") {
            return BACKEND_BASE_URL.length > 0;
        }

        return BACKEND_BASE_URL.length > 0;
    }

    async function request(path, options) {
        const requestOptions = options || {};
        const hasBody = requestOptions.body !== undefined;
        const init = Object.assign({}, requestOptions, {
            credentials: "include",
            headers: Object.assign({
                Accept: "application/json"
            }, hasBody ? { "Content-Type": "application/json" } : {}, requestOptions.headers || {})
        });

        if (hasBody && typeof requestOptions.body !== "string") {
            init.body = JSON.stringify(requestOptions.body);
        }

        const response = await fetch(BACKEND_BASE_URL + "/" + String(path || "").replace(/^\/+/, ""), init);
        let payload = null;

        try {
            payload = await response.json();
        } catch (error) {
            payload = null;
        }

        if (!response.ok) {
            const message = payload && payload.error ? payload.error : "La API no pudo completar la solicitud.";
            throw new Error(message);
        }

        return payload;
    }

    function getUsers() {
        try {
            const raw = localStorage.getItem(USERS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users || {}));
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
            unlockedOutfitIds: [DEFAULT_OUTFIT_ID]
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
        const currentOutfitId = legacy.currentOutfitId ||
            legacy.equippedCharacter ||
            legacyProfile.equippedCharacter ||
            DEFAULT_OUTFIT_ID;

        if (!unlockedOutfitIds.includes(DEFAULT_OUTFIT_ID)) {
            unlockedOutfitIds.unshift(DEFAULT_OUTFIT_ID);
        }

        if (!unlockedOutfitIds.includes(currentOutfitId)) {
            unlockedOutfitIds.push(currentOutfitId);
        }

        return {
            id: readNumber(legacy.id, getStableFallbackId(username)),
            username: username,
            passwordMock: legacy.passwordMock || "",
            currentLevelId: currentLevelId,
            streak: Math.max(0, readNumber(legacy.streak !== undefined ? legacy.streak : legacyProfile.streak, 0)),
            xp: Math.max(0, readNumber(legacy.xp !== undefined ? legacy.xp : legacyProfile.xp, 0)),
            lastCompletionAt: legacy.lastCompletionAt || legacy.lastCompletedAt || null,
            currentOutfitId: currentOutfitId,
            unlockedOutfitIds: unlockedOutfitIds
        };
    }

    function getStableFallbackId(username) {
        return String(username || "Aprendiz").split("").reduce(function (sum, char) {
            return sum + char.charCodeAt(0);
        }, 0) + 1000;
    }

    function getCurrentUserSync() {
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
        return publicUser;
    }

    async function registerUser(username, password) {
        if (isBackendMode()) {
            return request("auth/register", {
                method: "POST",
                body: { username: username, password: password }
            });
        }

        const cleanUsername = String(username || "").trim();
        const users = getUsers();
        const key = normalizeUsernameKey(cleanUsername);

        if (!cleanUsername || !password) {
            throw new Error("Completa usuario y contraseña.");
        }

        if (users[key]) {
            throw new Error("Ese usuario ya existe.");
        }

        users[key] = normalizeUser(buildDefaultUser(cleanUsername, password), cleanUsername);
        saveUsers(users);
        saveSession(cleanUsername);

        return { ok: true, user: getPublicUser(users[key]) };
    }

    async function loginUser(username, password) {
        if (isBackendMode()) {
            return request("auth/login", {
                method: "POST",
                body: { username: username, password: password }
            });
        }

        const cleanUsername = String(username || "").trim();
        const users = getUsers();
        const key = normalizeUsernameKey(cleanUsername);
        let user = users[key];

        if (!cleanUsername || !password) {
            throw new Error("Completa usuario y contraseña.");
        }

        if (!user) {
            user = normalizeUser(buildDefaultUser(cleanUsername, password), cleanUsername);
        } else if (!user.passwordMock) {
            user.passwordMock = password;
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
                clearSession();
            }
            return { ok: true };
        }

        clearSession();
        return { ok: true };
    }

    async function getCurrentUser() {
        if (isBackendMode()) {
            return request("me", { method: "GET" });
        }

        return { ok: true, user: getCurrentUserSync() };
    }

    async function updateUsername(username) {
        if (isBackendMode()) {
            return request("me/username", {
                method: "PATCH",
                body: { username: username }
            });
        }

        const cleanUsername = String(username || "").trim();
        const record = getUserRecordBySession();

        if (!record) {
            throw new Error("Inicia sesión para cambiar usuario.");
        }

        if (!cleanUsername) {
            throw new Error("Escribe un nombre de usuario.");
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
            return request("me/password", {
                method: "PATCH",
                body: {
                    currentPassword: currentPassword,
                    newPassword: newPassword
                }
            });
        }

        const record = getUserRecordBySession();
        if (!record) {
            throw new Error("Inicia sesión para cambiar contraseña.");
        }

        if (record.user.passwordMock && record.user.passwordMock !== currentPassword) {
            throw new Error("La contraseña actual no coincide.");
        }

        if (!newPassword || String(newPassword).length < 8) {
            throw new Error("Usa al menos 8 caracteres.");
        }

        record.user.passwordMock = String(newPassword);
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
            return request("levels/" + encodeURIComponent(levelId) + "/complete", {
                method: "POST",
                body: { answers: answers || [] }
            });
        }

        const numericLevelId = readNumber(levelId, 0);
        const level = getLevelByIdSync(numericLevelId);
        const record = getUserRecordBySession();
        const answerList = Array.isArray(answers) ? answers : [];

        if (!record) {
            throw new Error("Inicia sesión para completar niveles.");
        }

        if (!level) {
            throw new Error("Nivel no encontrado.");
        }

        const totalLevels = getTotalLevelCountSync();
        const isGameAlreadyCompleted = record.user.currentLevelId === totalLevels + 1;

        if (!isGameAlreadyCompleted && numericLevelId > record.user.currentLevelId) {
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

        const isPractice = isGameAlreadyCompleted || numericLevelId < record.user.currentLevelId;
        let reward = 0;
        let nextLevelId = record.user.currentLevelId;

        if (!isPractice) {
            reward = XP_REWARD[level.difficulty] || 0;
            record.user.xp += reward;
            updateStreakOnCompletion(record.user, new Date());
            nextLevelId = Math.min(numericLevelId + 1, totalLevels + 1);
            record.user.currentLevelId = nextLevelId;
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
            gameCompleted: !isPractice && nextLevelId === totalLevels + 1
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
            return request("outfits/" + encodeURIComponent(outfitId) + "/unlock", {
                method: "POST"
            });
        }

        const record = getUserRecordBySession();
        const outfit = getOutfitByIdSync(outfitId);

        if (!record) {
            throw new Error("Inicia sesión para comprar vestuarios.");
        }

        if (!outfit) {
            throw new Error("Vestuario no encontrado.");
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
            return request("outfits/" + encodeURIComponent(outfitId) + "/equip", {
                method: "POST"
            });
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
        return ROUTE_DEFINITIONS.map(function (route, index) {
            return {
                id: route.id,
                key: route.key,
                name: route.name,
                orderIndex: index + 1,
                backgroundImage: route.backgroundImage
            };
        });
    }

    function getAllLevelsSync() {
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
                    content: buildLevelContent(route, routeOrder, difficulty),
                    backgroundImage: route.backgroundImage,
                    href: "nivel.html?levelId=" + globalId,
                    x: anchor.x || "50%",
                    y: anchor.y || "50%"
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

        return getRoutesSync().find(function (route) {
            return String(route.id) === String(level.routeId);
        }) || null;
    }

    function getTotalLevelCountSync() {
        return ROUTE_DEFINITIONS.length * TOTAL_LEVELS_PER_ROUTE;
    }

    function getOutfitsSync() {
        const source = window.CAPYCODE_APP_DATA && Array.isArray(window.CAPYCODE_APP_DATA.shopItems)
            ? window.CAPYCODE_APP_DATA.shopItems
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
                image: item.image || ("assets/characters/" + outfitId + ".png")
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
        const bucketName = DIFFICULTY_BUCKETS[difficulty];
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
        if (!exercise || answer === undefined || answer === null) {
            return false;
        }

        if (exercise.type === "MultipleChoiceExercise") {
            return compareSets(answer.optionIds || [], exercise.answerData.correctOptionIds || []);
        }

        if (exercise.type === "NumericAnswerExercise") {
            return Number(answer.value) === Number(exercise.answerData.correctValue);
        }

        if (exercise.type === "LineSelectionExercise") {
            return compareSets(answer.lineIds || [], exercise.answerData.correctLineIds || []);
        }

        if (exercise.type === "LineOrderingExercise") {
            return compareArrays(answer.lineIds || [], exercise.answerData.correctLineOrder || []);
        }

        if (exercise.type === "FillBlanksExercise") {
            return compareObjects(answer.blanks || {}, exercise.answerData.correctBlanks || {});
        }

        return false;
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
        const nowIso = date.toISOString();
        const todayKey = getMexicoDateKey(nowIso);
        const lastKey = user.lastCompletionAt ? getMexicoDateKey(user.lastCompletionAt) : "";

        if (!lastKey) {
            user.streak = 1;
        } else if (lastKey === todayKey) {
            user.streak = Math.max(1, readNumber(user.streak, 1));
        } else if (daysBetweenDateKeys(lastKey, todayKey) === 1) {
            user.streak = Math.max(0, readNumber(user.streak, 0)) + 1;
        } else {
            user.streak = 1;
        }

        user.lastCompletionAt = nowIso;
    }

    function getVisibleStreak(user) {
        if (!user || !user.lastCompletionAt) {
            return 0;
        }

        const lastKey = getMexicoDateKey(user.lastCompletionAt);
        const todayKey = getMexicoDateKey(new Date().toISOString());
        const dayGap = daysBetweenDateKeys(lastKey, todayKey);

        return dayGap <= 1 ? readNumber(user.streak, 0) : 0;
    }

    function getMexicoDateKey(isoValue) {
        const date = isoValue ? new Date(isoValue) : new Date();
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: MEXICO_TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(date).reduce(function (accumulator, part) {
            accumulator[part.type] = part.value;
            return accumulator;
        }, {});

        return [parts.year, parts.month, parts.day].join("-");
    }

    function daysBetweenDateKeys(leftKey, rightKey) {
        const left = leftKey.split("-").map(Number);
        const right = rightKey.split("-").map(Number);
        const leftTime = Date.UTC(left[0], left[1] - 1, left[2]);
        const rightTime = Date.UTC(right[0], right[1] - 1, right[2]);

        return Math.round((rightTime - leftTime) / 86400000);
    }

    function buildLevelContent(route, routeOrder, difficulty) {
        if (difficulty === "integrative") {
            return "Reto integrador de " + route.name + " con ejercicios combinados.";
        }

        return route.content + " Enfoque " + DIFFICULTY_LABELS[difficulty].toLowerCase() + ".";
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
        for (let order = 1; order <= routeOrder; order += 1) {
            if (DIFFICULTY_BY_ROUTE_ORDER[order] === difficulty) {
                count += 1;
            }
        }
        return Math.max(1, count);
    }

    function normalizeUsernameKey(username) {
        return String(username || "").trim().toLowerCase();
    }

    function readNumber(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function uniqueList(items) {
        return (Array.isArray(items) ? items : []).filter(function (item, index, list) {
            return item && list.indexOf(item) === index;
        });
    }

    function arrayCopy(value) {
        return Array.isArray(value) ? value.slice() : [];
    }

    function compareArrays(left, right) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
            return false;
        }

        return left.every(function (item, index) {
            return String(item) === String(right[index]);
        });
    }

    function compareSets(left, right) {
        const cleanLeft = (Array.isArray(left) ? left : []).map(String).sort();
        const cleanRight = (Array.isArray(right) ? right : []).map(String).sort();
        return compareArrays(cleanLeft, cleanRight);
    }

    function compareObjects(left, right) {
        const leftKeys = Object.keys(left || {}).sort();
        const rightKeys = Object.keys(right || {}).sort();

        if (!compareArrays(leftKeys, rightKeys)) {
            return false;
        }

        return leftKeys.every(function (key) {
            return String(left[key]) === String(right[key]);
        });
    }

    window.CapyApi = {
        config: CONFIG,
        registerUser: registerUser,
        loginUser: loginUser,
        logoutUser: logoutUser,
        getCurrentUser: getCurrentUser,
        updateUsername: updateUsername,
        updatePassword: updatePassword,
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
        getVisibleStreak: getVisibleStreak,
        getDifficultyLabel: function (difficulty) {
            return DIFFICULTY_LABELS[difficulty] || difficulty || "";
        },
        getDifficultySeconds: function (difficulty) {
            return TIMER_SECONDS[difficulty] || 30;
        },
        getDifficultyXp: function (difficulty) {
            return XP_REWARD[difficulty] || 0;
        },
        isBackendMode: isBackendMode,
        getDataSource: function () {
            return isBackendMode() ? "backend" : "local";
        }
    };
}());
