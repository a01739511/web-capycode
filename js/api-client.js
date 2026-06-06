(function () {
    // window.CapyApi sigue siendo la fachada publica del proyecto. Este archivo
    // solo une modulos internos y decide si trabajar en local o con backend.
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
    const STORAGE_KEYS = apiConfig.storageKeys;
    const DEFAULT_OUTFIT_ID = apiConfig.defaults.outfitId;
    const LEGACY_STARTER_OUTFIT_ID = apiConfig.defaults.legacyStarterOutfitId;
    const USERNAME_MIN_LENGTH = apiConfig.validation.usernameMinLength;
    const USERNAME_MAX_LENGTH = apiConfig.validation.usernameMaxLength;
    const PASSWORD_MIN_LENGTH = apiConfig.validation.passwordMinLength;
    const PASSWORD_MAX_LENGTH = apiConfig.validation.passwordMaxLength;
    const TOTAL_LEVELS_PER_ROUTE = apiConfig.progression.totalLevelsPerRoute;
    const MEXICO_TIMEZONE = apiConfig.progression.timezone;

    const catalogRuntime = catalogModule.createRuntime({
        appDataProvider: function () {
            return window.CAPYCODE_APP_DATA || {};
        },
        questionsProvider: function () {
            return window.CAPYCODE_QUESTIONS || null;
        },
        readNumber: apiStorage.readNumber,
        arrayCopy: apiStorage.arrayCopy
    });

    const userStorage = apiStorage.createUserStorage({
        keys: STORAGE_KEYS,
        ensureLocalUser: function (username, password) {
            return ensureLocalUser(username, password);
        },
        normalizeBackendCachedUser: function (user) {
            return userRuntime.normalizeBackendCachedUser(user);
        }
    });

    const userRuntime = userNormalizers.createRuntime({
        readNumber: apiStorage.readNumber,
        uniqueList: apiStorage.uniqueList,
        arrayCopy: apiStorage.arrayCopy,
        defaultOutfitId: DEFAULT_OUTFIT_ID,
        getNextUserId: userStorage.getNextUserId,
        getTotalLevelCount: catalogRuntime.getTotalLevelCount,
        getLegacyProfile: userStorage.getLegacyProfile,
        getInferredUnlockedBadgeRouteIds: getInferredUnlockedBadgeRouteIds,
        getDiscoveredOutfitIdsFromState: getDiscoveredOutfitIdsFromState,
        migrateLegacyStarterState: migrateLegacyStarterState,
        getVisibleStreak: getVisibleStreak,
        starterDiscoveredOutfitIds: catalogModule.STARTER_DISCOVERED_OUTFIT_IDS
    });

    const requestBackend = apiHttp.createRequester({
        baseUrl: apiConfig.backendBaseUrl,
        getToken: userStorage.readBackendToken,
        clearAuth: userStorage.clearBackendAuth
    });

    function isBackendMode() {
        return apiConfig.isBackendMode();
    }

    async function request(path, options) {
        return requestBackend(path, options);
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

    function getUnlockRouteIdForOutfit(outfitId) {
        return catalogModule.OUTFIT_ROUTE_REQUIREMENTS[String(outfitId)] || null;
    }

    function getInferredUnlockedBadgeRouteIds(currentLevelId) {
        const highestCompletedLevel = Math.max(
            0,
            Math.min(catalogRuntime.getTotalLevelCount(), Number(currentLevelId || 1) - 1)
        );

        return catalogRuntime.getRoutes().filter(function (route) {
            return highestCompletedLevel >= route.orderIndex * TOTAL_LEVELS_PER_ROUTE;
        }).map(function (route) {
            return Number(route.id);
        });
    }

    function getDiscoveredOutfitIdsFromState(explicitIds, unlockedOutfitIds, unlockedBadgeRouteIds) {
        return shopRules.getDiscoveredOutfitIdsFromState(explicitIds, unlockedOutfitIds, unlockedBadgeRouteIds, {
            starterIds: catalogModule.STARTER_DISCOVERED_OUTFIT_IDS,
            getRouteRewardOutfit: catalogRuntime.getRouteRewardOutfit,
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

    function updateStreakOnCompletion(user, date) {
        return progressRules.updateStreakOnCompletion(user, date, MEXICO_TIMEZONE);
    }

    function getVisibleStreak(user) {
        return progressRules.getVisibleStreak(user, MEXICO_TIMEZONE);
    }

    function ensureLocalUser(username, password) {
        const users = userStorage.getUsers();
        const key = normalizeUsernameKey(username);
        const existing = users[key];

        if (existing) {
            users[key] = userRuntime.normalizeUser(existing, username);
        } else {
            users[key] = userRuntime.normalizeUser(userRuntime.buildDefaultUser(username, password), username);
        }

        userStorage.saveUsers(users);
        return users[key];
    }

    function syncBackendPayload(payload) {
        if (payload && payload.token) {
            userStorage.saveBackendToken(payload.token);
        }

        if (payload && payload.user) {
            payload.user = userStorage.saveBackendCachedUser(payload.user);
        }

        return payload;
    }

    function getCurrentUserSync() {
        if (isBackendMode()) {
            return userStorage.readBackendCachedUser();
        }

        const session = userStorage.readSession();
        if (!session || !session.username) {
            return null;
        }

        const users = userStorage.getUsers();
        const key = normalizeUsernameKey(session.username);
        const normalized = userRuntime.normalizeUser(
            users[key] || userRuntime.buildDefaultUser(session.username, ""),
            session.username
        );

        users[key] = normalized;
        userStorage.saveUsers(users);
        return userRuntime.getPublicUser(normalized);
    }

    function saveCurrentUserSync(user) {
        if (isBackendMode()) {
            return userStorage.saveBackendCachedUser(user);
        }

        if (!user || !user.username) {
            return null;
        }

        const users = userStorage.getUsers();
        const key = normalizeUsernameKey(user.username);
        const existing = users[key] || {};
        const normalized = userRuntime.normalizeUser(Object.assign({}, existing, user), user.username);

        users[key] = normalized;
        userStorage.saveUsers(users);
        userStorage.saveSession(normalized.username);
        return userRuntime.getPublicUser(normalized);
    }

    function getUserRecordBySession() {
        const session = userStorage.readSession();
        if (!session || !session.username) {
            return null;
        }

        const users = userStorage.getUsers();
        const key = normalizeUsernameKey(session.username);
        const normalized = userRuntime.normalizeUser(
            users[key] || userRuntime.buildDefaultUser(session.username, ""),
            session.username
        );

        users[key] = normalized;
        userStorage.saveUsers(users);
        return {
            users: users,
            key: key,
            user: normalized
        };
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
        const users = userStorage.getUsers();
        const key = normalizeUsernameKey(cleanUsername);

        if (users[key]) {
            throw new Error("Ese usuario ya existe.");
        }

        users[key] = userRuntime.normalizeUser(
            userRuntime.buildDefaultUser(cleanUsername, cleanPassword),
            cleanUsername
        );
        userStorage.saveUsers(users);
        userStorage.saveSession(cleanUsername);

        return { ok: true, user: userRuntime.getPublicUser(users[key]) };
    }

    async function loginUser(username, password) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("auth/login", {
                method: "POST",
                body: { username: username, password: password }
            }));
        }

        const cleanUsername = String(username || "").trim();
        const users = userStorage.getUsers();
        const key = normalizeUsernameKey(cleanUsername);
        const user = users[key];

        if (!cleanUsername || !password) {
            throw new Error("Completa usuario y contraseña.");
        }

        if (!user || !user.passwordMock || user.passwordMock !== password) {
            throw new Error("Usuario o contraseña incorrectos.");
        }

        users[key] = userRuntime.normalizeUser(user, cleanUsername);
        userStorage.saveUsers(users);
        userStorage.saveSession(user.username || cleanUsername);
        return { ok: true, user: userRuntime.getPublicUser(users[key]) };
    }

    async function logoutUser() {
        if (isBackendMode()) {
            try {
                await request("auth/logout", { method: "POST" });
            } finally {
                userStorage.clearBackendAuth();
            }
            return { ok: true };
        }

        userStorage.clearSession();
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
        record.users[nextKey] = userRuntime.normalizeUser(record.user, cleanUsername);
        userStorage.saveUsers(record.users);
        userStorage.saveSession(cleanUsername);

        return { ok: true, user: userRuntime.getPublicUser(record.users[nextKey]) };
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
        record.users[record.key] = userRuntime.normalizeUser(record.user, record.user.username);
        userStorage.saveUsers(record.users);

        return { ok: true, user: userRuntime.getPublicUser(record.users[record.key]) };
    }

    async function getRoutes() {
        if (isBackendMode()) {
            return request("routes", { method: "GET" });
        }

        return { ok: true, routes: catalogRuntime.getRoutes() };
    }

    async function getLevelsByRoute(routeId) {
        if (isBackendMode()) {
            return request("routes/" + encodeURIComponent(routeId) + "/levels", { method: "GET" });
        }

        return { ok: true, levels: catalogRuntime.getLevelsByRoute(routeId) };
    }

    async function getExercisesByLevel(levelId) {
        if (isBackendMode()) {
            return request("levels/" + encodeURIComponent(levelId) + "/exercises", { method: "GET" });
        }

        return { ok: true, exercises: await catalogRuntime.getExercisesByLevel(levelId) };
    }

    async function completeLevel(levelId, answers) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("levels/" + encodeURIComponent(levelId) + "/complete", {
                method: "POST",
                body: { answers: answers || [] }
            }));
        }

        const numericLevelId = readNumber(levelId, 0);
        const level = catalogRuntime.getLevelById(numericLevelId);
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

        const totalLevels = catalogRuntime.getTotalLevelCount();
        const isGameAlreadyCompleted = record.user.currentLevelId === totalLevels + 1;

        if (!previewAllLevels && !isGameAlreadyCompleted && numericLevelId > record.user.currentLevelId) {
            throw new Error("Este nivel sigue bloqueado.");
        }

        const exercises = await catalogRuntime.getExercisesByLevel(numericLevelId);
        const answersByExerciseId = new Map(answerList.map(function (entry) {
            return [String(entry.exerciseId), entry.answer];
        }));
        const allCorrect = exercises.every(function (exercise) {
            return exerciseRules.validateExerciseAnswer(exercise, answersByExerciseId.get(String(exercise.id)));
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
            reward = catalogRuntime.getDifficultyXp(level.difficulty);
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
                const routeRewardOutfit = catalogRuntime.getRouteRewardOutfit(level.routeId);

                record.user.unlockedBadgeRouteIds = uniqueList(unlockedBadgeRouteIds);
                record.user.discoveredOutfitIds = discoveredAfter;

                if (routeRewardOutfit &&
                    discoveredAfter.includes(routeRewardOutfit.id) &&
                    !discoveredBefore.includes(routeRewardOutfit.id)) {
                    newlyDiscoveredOutfits = [routeRewardOutfit];
                }
            }
        }

        record.users[record.key] = userRuntime.normalizeUser(record.user, record.user.username);
        userStorage.saveUsers(record.users);

        return {
            ok: true,
            practice: isPractice,
            reward: reward,
            user: userRuntime.getPublicUser(record.users[record.key]),
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

        return { ok: true, outfits: catalogRuntime.getOutfits() };
    }

    async function unlockOutfit(outfitId) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("outfits/" + encodeURIComponent(outfitId) + "/unlock", {
                method: "POST"
            }));
        }

        const record = getUserRecordBySession();
        const outfit = catalogRuntime.getOutfitById(outfitId);

        if (!record) {
            throw new Error("Inicia sesión para comprar vestuarios.");
        }

        if (!outfit) {
            throw new Error("Vestuario no encontrado.");
        }

        if (!arrayCopy(record.user.discoveredOutfitIds).includes(outfit.id)) {
            throw new Error(catalogRuntime.getOutfitUnlockMessage(outfit));
        }

        if (record.user.unlockedOutfitIds.includes(outfit.id)) {
            return { ok: true, user: userRuntime.getPublicUser(record.user), outfit: outfit, alreadyUnlocked: true };
        }

        if (record.user.xp < outfit.cost) {
            throw new Error("XP insuficiente.");
        }

        record.user.xp -= outfit.cost;
        record.user.unlockedOutfitIds.push(outfit.id);
        record.users[record.key] = userRuntime.normalizeUser(record.user, record.user.username);
        userStorage.saveUsers(record.users);

        return { ok: true, user: userRuntime.getPublicUser(record.users[record.key]), outfit: outfit };
    }

    async function equipOutfit(outfitId) {
        if (isBackendMode()) {
            return syncBackendPayload(await request("outfits/" + encodeURIComponent(outfitId) + "/equip", {
                method: "POST"
            }));
        }

        const record = getUserRecordBySession();
        const outfit = catalogRuntime.getOutfitById(outfitId);

        if (!record) {
            throw new Error("Inicia sesión para equipar vestuarios.");
        }

        if (!outfit || !record.user.unlockedOutfitIds.includes(outfit.id)) {
            throw new Error("Primero desbloquea este vestuario.");
        }

        record.user.currentOutfitId = outfit.id;
        record.users[record.key] = userRuntime.normalizeUser(record.user, record.user.username);
        userStorage.saveUsers(record.users);

        return { ok: true, user: userRuntime.getPublicUser(record.users[record.key]), outfit: outfit };
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
        validateExerciseAnswer: exerciseRules.validateExerciseAnswer,
        getCurrentUserSync: getCurrentUserSync,
        saveCurrentUserSync: saveCurrentUserSync,
        getRoutesSync: catalogRuntime.getRoutes,
        getAllLevelsSync: catalogRuntime.getAllLevels,
        getLevelsByRouteSync: catalogRuntime.getLevelsByRoute,
        getLevelByIdSync: catalogRuntime.getLevelById,
        getCurrentRouteForUserSync: catalogRuntime.getCurrentRouteForUser,
        getTotalLevelCountSync: catalogRuntime.getTotalLevelCount,
        getOutfitsSync: catalogRuntime.getOutfits,
        getOutfitByIdSync: catalogRuntime.getOutfitById,
        USERNAME_MIN_LENGTH: USERNAME_MIN_LENGTH,
        USERNAME_MAX_LENGTH: USERNAME_MAX_LENGTH,
        PASSWORD_MIN_LENGTH: PASSWORD_MIN_LENGTH,
        PASSWORD_MAX_LENGTH: PASSWORD_MAX_LENGTH,
        getVisibleStreak: getVisibleStreak,
        getDifficultyLabel: catalogRuntime.getDifficultyLabel,
        getDifficultySeconds: catalogRuntime.getDifficultySeconds,
        getDifficultyXp: catalogRuntime.getDifficultyXp,
        isBackendMode: isBackendMode,
        getDataSource: function () {
            return isBackendMode() ? "backend" : "local";
        }
    };
}());
