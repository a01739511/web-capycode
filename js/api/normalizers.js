(function () {
    // Estas utilidades convierten cualquier estado legado o incompleto al
    // formato de usuario que hoy entiende toda la aplicacion.
    function validateUsername(username, minLength, maxLength) {
        const cleanUsername = String(username || "").trim();

        if (!cleanUsername) {
            throw new Error("Escribe un nombre de usuario.");
        }

        if (cleanUsername.length < minLength || cleanUsername.length > maxLength) {
            throw new Error("El usuario debe tener entre " + minLength + " y " + maxLength + " caracteres.");
        }

        return cleanUsername;
    }

    function validatePassword(password, minLength, maxLength) {
        const cleanPassword = String(password || "");

        if (!cleanPassword) {
            throw new Error("Escribe una contraseña.");
        }

        if (cleanPassword.length < minLength || cleanPassword.length > maxLength) {
            throw new Error("La contraseña debe tener entre " + minLength + " y " + maxLength + " caracteres.");
        }

        return cleanPassword;
    }

    function createRuntime(options) {
        const settings = options || {};
        const readNumber = settings.readNumber || defaultReadNumber;
        const uniqueList = settings.uniqueList || defaultUniqueList;
        const arrayCopy = settings.arrayCopy || defaultArrayCopy;
        const defaultOutfitId = settings.defaultOutfitId || "Capibara";
        const getNextUserId = settings.getNextUserId || function () {
            return 1;
        };
        const getTotalLevelCount = settings.getTotalLevelCount || function () {
            return 0;
        };
        const getLegacyProfile = settings.getLegacyProfile || function () {
            return null;
        };
        const getInferredUnlockedBadgeRouteIds = settings.getInferredUnlockedBadgeRouteIds || function () {
            return [];
        };
        const getDiscoveredOutfitIdsFromState = settings.getDiscoveredOutfitIdsFromState || function () {
            return [];
        };
        const migrateLegacyStarterState = settings.migrateLegacyStarterState || function (unlockedOutfitIds, currentOutfitId) {
            return {
                unlockedOutfitIds: uniqueList(arrayCopy(unlockedOutfitIds)),
                currentOutfitId: currentOutfitId || defaultOutfitId
            };
        };
        const getVisibleStreak = settings.getVisibleStreak || function () {
            return 0;
        };
        const starterDiscoveredOutfitIds = arrayCopy(settings.starterDiscoveredOutfitIds || [defaultOutfitId]);

        function buildDefaultUser(username, password) {
            return {
                id: getNextUserId(),
                username: username,
                passwordMock: password || "",
                currentLevelId: 1,
                streak: 0,
                xp: 0,
                lastCompletionAt: null,
                currentOutfitId: defaultOutfitId,
                unlockedOutfitIds: [defaultOutfitId],
                unlockedBadgeRouteIds: [],
                discoveredOutfitIds: starterDiscoveredOutfitIds.slice()
            };
        }

        function normalizeUser(user, fallbackUsername) {
            // Aqui se concentra la compatibilidad con sesiones antiguas para no
            // repartir reglas de migracion por todas las pantallas.
            const legacy = user || {};
            const username = String(legacy.username || fallbackUsername || "Aprendiz").trim() || "Aprendiz";
            const legacyProfile = getLegacyProfile(username) || {};
            const totalLevels = getTotalLevelCount();
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
                [defaultOutfitId]
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
                defaultOutfitId;
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

            if (!normalizedUnlockedOutfitIds.includes(defaultOutfitId)) {
                normalizedUnlockedOutfitIds.unshift(defaultOutfitId);
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

        return {
            buildDefaultUser: buildDefaultUser,
            normalizeUser: normalizeUser,
            getPublicUser: getPublicUser,
            normalizeBackendCachedUser: normalizeBackendCachedUser,
            getStableFallbackId: getStableFallbackId
        };
    }

    function defaultReadNumber(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function defaultUniqueList(items) {
        return (Array.isArray(items) ? items : []).filter(function (item, index, list) {
            return item && list.indexOf(item) === index;
        });
    }

    function defaultArrayCopy(value) {
        return Array.isArray(value) ? value.slice() : [];
    }

    window.CapyUserNormalizers = {
        validateUsername: validateUsername,
        validatePassword: validatePassword,
        createRuntime: createRuntime
    };
}());
