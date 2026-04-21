(function () {
    const SESSION_KEY = "capycodeSession";
    const PROFILE_PREFIX = "capycodeProfile::";
    const data = window.CAPYCODE_APP_DATA || {};

    document.addEventListener("DOMContentLoaded", function () {
        if (document.body.dataset.requiresAuth === "true") {
            ensureSession();
        }

        applySidebarState();
        renderSidebarNav();
        updateHud();
        renderSidebarSkins();
        bindLogout();
        bindSidebarToggle();
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
                return normalizeProfile(JSON.parse(saved), username);
            }
        } catch (error) {
            return buildDefaultProfile(username);
        }

        return buildDefaultProfile(username);
    }

    function saveProfile(profile) {
        const normalized = normalizeProfile(profile, profile.username);
        localStorage.setItem(PROFILE_PREFIX + normalized.username, JSON.stringify(normalized));
    }

    function buildDefaultProfile(username) {
        return normalizeProfile({
            username: username,
            userCode: buildUserCode(username),
            title: "Aprendiz de Capythilda",
            level: 5,
            xp: 2450,
            streak: 15,
            equippedCharacter: "CapyBlack",
            unlockedCharacters: ["CapyBlack", "CapyAqua", "CapyKing"],
            completedLevels: [1, 2, 3, 4, 5],
            completedActivities: [],
            missionProgress: {
                mission: { current: 8, total: 12 },
                order: { current: 9, total: 12 },
                template: { current: 10, total: 12 }
            }
        }, username);
    }

    function normalizeProfile(profile, fallbackUsername) {
        const username = profile && profile.username ? profile.username : fallbackUsername || "Aprendiz";
        const normalized = {
            username: username,
            userCode: profile && profile.userCode ? profile.userCode : buildUserCode(username),
            title: profile && profile.title ? profile.title : buildTitle(profile && profile.level),
            level: readNumber(profile && profile.level, 1),
            xp: readNumber(profile && profile.xp, 0),
            streak: readNumber(profile && profile.streak, 0),
            equippedCharacter: profile && profile.equippedCharacter ? profile.equippedCharacter : "CapyBlack",
            unlockedCharacters: Array.isArray(profile && profile.unlockedCharacters) ? profile.unlockedCharacters.slice() : ["CapyBlack"],
            completedLevels: Array.isArray(profile && profile.completedLevels) ? profile.completedLevels.slice() : [],
            completedActivities: Array.isArray(profile && profile.completedActivities) ? profile.completedActivities.slice() : [],
            missionProgress: {
                mission: normalizeProgress(profile && profile.missionProgress && profile.missionProgress.mission, 8, 12),
                order: normalizeProgress(profile && profile.missionProgress && profile.missionProgress.order, 9, 12),
                template: normalizeProgress(profile && profile.missionProgress && profile.missionProgress.template, 10, 12)
            }
        };

        normalized.title = buildTitle(normalized.level);
        normalized.unlockedCharacters = uniqueList(normalized.unlockedCharacters);
        normalized.completedLevels = uniqueNumberList(normalized.completedLevels);
        normalized.completedActivities = uniqueList(normalized.completedActivities);

        if (!normalized.unlockedCharacters.includes("CapyBlack")) {
            normalized.unlockedCharacters.unshift("CapyBlack");
        }

        return normalized;
    }

    function normalizeProgress(progress, defaultCurrent, defaultTotal) {
        return {
            current: readNumber(progress && progress.current, defaultCurrent),
            total: readNumber(progress && progress.total, defaultTotal)
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

    function buildTitle(level) {
        if (level >= 7) {
            return "Archimago del Bosque";
        }
        if (level >= 6) {
            return "Guardian del Portal";
        }
        if (level >= 5) {
            return "Aprendiz de Capythilda";
        }
        if (level >= 3) {
            return "Explorador Arcano";
        }
        return "Novato del Grimorio";
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

    function renderSidebarSkins() {
        const profile = getProfile();
        const equipped = getShopItem(profile.equippedCharacter);
        if (!equipped) {
            return;
        }

        document.querySelectorAll("[data-sidebar-skin]").forEach(function (element) {
            element.innerHTML = [
                "<a class=\"sidebar-skin-link\" href=\"perfil.html#profile-collection-section\">",
                "<p class=\"panel-kicker\">Skin activa</p>",
                "<div class=\"sidebar-skin-art\"><img src=\"", equipped.image, "\" alt=\"", equipped.name, "\"></div>",
                "<div class=\"sidebar-skin-copy\">",
                "<strong>", equipped.name, "</strong>",
                "<span>", equipped.perk, "</span>",
                "</div>",
                "</a>"
            ].join("");
        });
    }

    function renderSidebarNav() {
        const currentPage = window.location.pathname.split("/").pop() || "mapa.html";
        const items = [
            { href: "mapa.html", label: "Mapa", icon: "assets/nav-map.svg" },
            { href: "tienda.html", label: "Tienda", icon: "assets/nav-store.svg" },
            { href: "about.html", label: "Historia", icon: "assets/nav-story.svg" }
        ];

        document.querySelectorAll("[data-sidebar-nav]").forEach(function (nav) {
            nav.innerHTML = items.map(function (item) {
                return [
                    "<a href=\"", item.href, "\"", currentPage === item.href ? " aria-current=\"page\" class=\"is-active\"" : "", ">",
                    "<img class=\"sidebar-nav-icon\" src=\"", item.icon, "\" alt=\"\">",
                    "<span>", item.label, "</span>",
                    "</a>"
                ].join("");
            }).join("");
        });
    }

    function bindSidebarToggle() {
        const sidebar = document.querySelector("[data-app-sidebar]");
        if (!sidebar) {
            return;
        }

        const toggleButtons = document.querySelectorAll("[data-action=\"toggle-sidebar\"]");

        toggleButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                document.body.classList.toggle("sidebar-collapsed");
                localStorage.setItem("capycodeSidebarCollapsed", document.body.classList.contains("sidebar-collapsed") ? "true" : "false");
            });
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

    function completeActivity(progressKey, config) {
        const profile = getProfile();
        const progress = profile.missionProgress[progressKey];
        const activityKey = config && config.activityKey ? config.activityKey : progressKey;
        const bonusXp = config && config.bonusXp ? Number(config.bonusXp) : 0;
        const nextLevel = config && config.nextLevel ? Number(config.nextLevel) : null;
        const unlockCharacter = config && config.unlockCharacter ? config.unlockCharacter : "";
        let firstCompletion = false;

        if (progress) {
            progress.current = progress.total;
        }

        if (!profile.completedActivities.includes(activityKey)) {
            profile.completedActivities.push(activityKey);
            profile.xp += bonusXp;
            firstCompletion = true;
        }

        if (nextLevel && nextLevel > profile.level) {
            profile.level = nextLevel;
        }

        if (nextLevel && !profile.completedLevels.includes(nextLevel - 1)) {
            profile.completedLevels.push(nextLevel - 1);
        }

        if (unlockCharacter && !profile.unlockedCharacters.includes(unlockCharacter)) {
            profile.unlockedCharacters.push(unlockCharacter);
        }

        profile.title = buildTitle(profile.level);
        saveProfile(profile);
        updateHud();
        return {
            firstCompletion: firstCompletion,
            profile: profile
        };
    }

    function formatNumber(value) {
        return Number(value).toLocaleString("es-MX");
    }

    function uniqueList(items) {
        return items.filter(function (item, index) {
            return items.indexOf(item) === index;
        });
    }

    function uniqueNumberList(items) {
        return items
            .map(function (item) {
                return Number(item);
            })
            .filter(function (item, index, list) {
                return Number.isFinite(item) && list.indexOf(item) === index;
            });
    }

    function readNumber(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function applySidebarState() {
        if (localStorage.getItem("capycodeSidebarCollapsed") === "true") {
            document.body.classList.add("sidebar-collapsed");
        }
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
        updateHud: updateHud,
        completeActivity: completeActivity
    };
}());
