(function () {
    // La persistencia local queda aislada aqui para que el resto del proyecto
    // no tenga que conocer claves de storage ni detalles de migracion.
    function readLocalJson(key, fallback) {
        return readJson(localStorage, key, fallback);
    }

    function writeLocalJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function readSessionJson(key, fallback) {
        return readJson(sessionStorage, key, fallback);
    }

    function writeSessionJson(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    function readJson(storage, key, fallback) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            storage.removeItem(key);
            return fallback;
        }
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

    function normalizeUsernameKey(username) {
        return String(username || "").trim().toLowerCase();
    }

    function createUserStorage(options) {
        const settings = options || {};
        const keys = settings.keys || {};
        const ensureLocalUser = settings.ensureLocalUser || function () {};
        const normalizeBackendCachedUser = settings.normalizeBackendCachedUser || function (user) {
            return user;
        };

        function getUsers() {
            return readLocalJson(keys.users, {});
        }

        function saveUsers(users) {
            writeLocalJson(keys.users, users || {});
        }

        function getNextUserId() {
            const nextId = readNumber(localStorage.getItem(keys.nextUserId), 1);
            localStorage.setItem(keys.nextUserId, String(nextId + 1));
            return nextId;
        }

        function readSession() {
            const current = readSessionJson(keys.session, null);
            if (current && current.username) {
                return current;
            }

            try {
                // Se migra la sesion vieja una sola vez y luego se guarda con
                // el formato nuevo para mantener el resto del flujo limpio.
                const raw = localStorage.getItem(keys.legacySession);
                if (!raw) {
                    return null;
                }

                const parsed = JSON.parse(raw);
                if (!parsed || !parsed.username) {
                    return null;
                }

                const migrated = {
                    username: parsed.username,
                    loggedInAt: parsed.loggedInAt || new Date().toISOString()
                };

                writeSessionJson(keys.session, migrated);
                localStorage.removeItem(keys.legacySession);
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
            writeSessionJson(keys.session, session);
            return session;
        }

        function readBackendToken() {
            try {
                return String(localStorage.getItem(keys.backendToken) || "").trim();
            } catch (error) {
                return "";
            }
        }

        function saveBackendToken(token) {
            if (!token) {
                localStorage.removeItem(keys.backendToken);
                return "";
            }

            const normalized = String(token).trim();
            localStorage.setItem(keys.backendToken, normalized);
            return normalized;
        }

        function clearBackendAuth() {
            sessionStorage.removeItem(keys.backendUser);
            localStorage.removeItem(keys.backendToken);
        }

        function clearSession() {
            sessionStorage.removeItem(keys.session);
            localStorage.removeItem(keys.legacySession);
            clearBackendAuth();
        }

        function getLegacyProfile(username) {
            try {
                const raw = localStorage.getItem(keys.legacyProfilePrefix + username);
                return raw ? JSON.parse(raw) : null;
            } catch (error) {
                return null;
            }
        }

        function readBackendCachedUser() {
            if (!readBackendToken()) {
                sessionStorage.removeItem(keys.backendUser);
                return null;
            }

            const parsed = readSessionJson(keys.backendUser, null);
            if (!parsed || !parsed.username) {
                return null;
            }

            return normalizeBackendCachedUser(parsed);
        }

        function saveBackendCachedUser(user) {
            if (!user || !user.username) {
                sessionStorage.removeItem(keys.backendUser);
                return null;
            }

            const normalized = normalizeBackendCachedUser(user);
            writeSessionJson(keys.backendUser, normalized);
            return normalized;
        }

        return {
            getUsers: getUsers,
            saveUsers: saveUsers,
            getNextUserId: getNextUserId,
            readSession: readSession,
            saveSession: saveSession,
            clearSession: clearSession,
            readBackendToken: readBackendToken,
            saveBackendToken: saveBackendToken,
            clearBackendAuth: clearBackendAuth,
            getLegacyProfile: getLegacyProfile,
            readBackendCachedUser: readBackendCachedUser,
            saveBackendCachedUser: saveBackendCachedUser
        };
    }

    window.CapyApiStorage = {
        readLocalJson: readLocalJson,
        writeLocalJson: writeLocalJson,
        readSessionJson: readSessionJson,
        writeSessionJson: writeSessionJson,
        readNumber: readNumber,
        uniqueList: uniqueList,
        arrayCopy: arrayCopy,
        normalizeUsernameKey: normalizeUsernameKey,
        createUserStorage: createUserStorage
    };
}());
