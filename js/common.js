(function () {
    const SESSION_KEY = "capycodeSession";
    const PROFILE_PREFIX = "capycodeProfile::";
    const data = window.CAPYCODE_APP_DATA || {};

    document.addEventListener("DOMContentLoaded", function () {
        if (document.body.dataset.requiresAuth === "true") {
            ensureSession();
        }

        updateHud();
        bindLogout();
    });

    function ensureSession() {
        if (!getSession()) {
            window.location.href = "iniciar_sesion.html";
        }
    }

    function getSession() {
        try {
            const rawSession = localStorage.getItem(SESSION_KEY);
            return rawSession ? JSON.parse(rawSession) : null;
        } catch (error) {
            return null;
        }
    }

    function saveSession(username) {
        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                username: username,
                loggedInAt: new Date().toISOString()
            })
        );
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "iniciar_sesion.html";
    }

    function getProfile() {
        const session = getSession();
        const username = session && session.username ? session.username : "Aprendiz";
        const key = PROFILE_PREFIX + username;

        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            return buildDefaultProfile(username);
        }

        return buildDefaultProfile(username);
    }

    function saveProfile(profile) {
        localStorage.setItem(PROFILE_PREFIX + profile.username, JSON.stringify(profile));
    }

    function buildDefaultProfile(username) {
        return {
            username: username,
            userCode: buildUserCode(username),
            title: "Aprendiz de Capythilda",
            level: 5,
            xp: 2450,
            streak: 15,
            equippedCharacter: "CapyBlack",
            unlockedCharacters: ["CapyBlack", "CapyAqua", "CapyKing"],
            completedLevels: [1, 2, 3, 4, 5],
            missionProgress: {
                mission: { current: 8, total: 12 },
                order: { current: 9, total: 12 },
                template: { current: 10, total: 12 }
            }
        };
    }

    function buildUserCode(username) {
        const base = username
            .split("")
            .reduce(function (sum, char) {
                return sum + char.charCodeAt(0);
            }, 0);
        return "A" + String(10000000 + (base % 90000000));
    }

    function updateHud() {
        const profile = getProfile();

        document.querySelectorAll("[data-player-name]").forEach(function (element) {
            element.textContent = profile.username;
        });

        document.querySelectorAll("[data-player-code]").forEach(function (element) {
            element.textContent = profile.userCode;
        });

        document.querySelectorAll("[data-player-title]").forEach(function (element) {
            element.textContent = profile.title;
        });

        document.querySelectorAll("[data-player-level]").forEach(function (element) {
            element.textContent = "Level " + profile.level;
        });

        document.querySelectorAll("[data-player-xp]").forEach(function (element) {
            element.textContent = formatNumber(profile.xp);
        });

        document.querySelectorAll("[data-player-streak]").forEach(function (element) {
            element.textContent = String(profile.streak);
        });
    }

    function bindLogout() {
        document.querySelectorAll("[data-action=\"logout\"]").forEach(function (button) {
            button.addEventListener("click", logout);
        });
    }

    function getShopItem(id) {
        return (data.shopItems || []).find(function (item) {
            return item.id === id;
        }) || null;
    }

    function isUnlocked(itemId, profile) {
        return profile.unlockedCharacters.includes(itemId);
    }

    function formatNumber(value) {
        return Number(value).toLocaleString("es-MX");
    }

    window.CapyCore = {
        getSession: getSession,
        saveSession: saveSession,
        logout: logout,
        getProfile: getProfile,
        saveProfile: saveProfile,
        getShopItem: getShopItem,
        isUnlocked: isUnlocked,
        formatNumber: formatNumber,
        updateHud: updateHud
    };
}());
