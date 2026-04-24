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
        registerDefaultHotkeys();
        refreshInteractiveTilts();
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
            title: "Novato del Grimorio",
            level: 1,
            xp: 0,
            streak: 0,
            equippedCharacter: "CapyBlack",
            unlockedCharacters: ["CapyBlack"],
            completedLevels: [],
            completedActivities: [],
            missionProgress: {
                mission: { current: 0, total: 5 },
                order: { current: 0, total: 5 },
                template: { current: 0, total: 5 }
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
                mission: normalizeProgress(profile && profile.missionProgress && profile.missionProgress.mission, 0, 5),
                order: normalizeProgress(profile && profile.missionProgress && profile.missionProgress.order, 0, 5),
                template: normalizeProgress(profile && profile.missionProgress && profile.missionProgress.template, 0, 5)
            }
        };
        const totalLevels = getTotalPlayableLevels();

        normalized.title = buildTitle(normalized.level);
        normalized.unlockedCharacters = uniqueList(normalized.unlockedCharacters);
        normalized.completedLevels = uniqueNumberList(normalized.completedLevels).filter(function (levelId) {
            return levelId >= 1 && levelId <= totalLevels;
        });
        normalized.completedActivities = uniqueList(normalized.completedActivities);

        if (normalized.completedLevels.length) {
            const highestCompleted = Math.max.apply(null, normalized.completedLevels);
            if (normalized.level <= highestCompleted) {
                normalized.level = Math.min(highestCompleted + 1, totalLevels + 1);
            }
        }

        normalized.level = Math.max(1, Math.min(normalized.level, totalLevels + 1));
        normalized.title = buildTitle(normalized.level);

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
                "<a class=\"sidebar-skin-link\" data-interactive-tilt=\"sidebar-card\" href=\"perfil.html#profile-collection-section\">",
                "<p class=\"panel-kicker\">Vestuario activo</p>",
                "<div class=\"sidebar-skin-art\"><img src=\"", equipped.image, "\" alt=\"", getItemName(equipped), "\"></div>",
                "<div class=\"sidebar-skin-copy\">",
                "<strong>", getItemName(equipped), "</strong>",
                "<span>", getItemSlogan(equipped), "</span>",
                "</div>",
                "</a>"
            ].join("");
        });

        refreshInteractiveTilts();
    }

    function renderSidebarNav() {
        const currentPage = window.location.pathname.split("/").pop() || "mapa.html";
        const items = [
            { href: "mapa.html", label: "Mapa", icon: "assets/nav-map.svg" },
            { href: "tienda.html", label: "Tienda", icon: "assets/nav-store.svg" },
            { href: "about.html", label: "Historia", icon: "assets/nav-story.svg" },
            { href: "tutorial.html", label: "Tutorial", icon: "assets/magic-wand.svg" },
            { href: "perfil.html", label: "Perfil", icon: "assets/user-avatar.svg" }
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
        let animationTimer = 0;

        toggleButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                window.clearTimeout(animationTimer);
                document.body.classList.add("sidebar-animating");

                window.requestAnimationFrame(function () {
                    document.body.classList.toggle("sidebar-collapsed");
                    localStorage.setItem("capycodeSidebarCollapsed", document.body.classList.contains("sidebar-collapsed") ? "true" : "false");
                });

                animationTimer = window.setTimeout(function () {
                    document.body.classList.remove("sidebar-animating");
                }, 420);
            });
        });
    }

    function registerDefaultHotkeys() {
        if (!window.CapyHotkeys) {
            return;
        }

        window.CapyHotkeys.register([
            {
                id: "focus-next",
                key: "Tab",
                label: "Siguiente control",
                description: "Avanza por botones, enlaces, campos y tarjetas interactivas.",
                group: "Navegación",
                order: 1,
                displayOnly: true
            },
            {
                id: "focus-previous",
                key: "Tab",
                shiftKey: true,
                label: "Control anterior",
                description: "Regresa al control interactivo previo.",
                group: "Navegación",
                order: 2,
                displayOnly: true
            },
            {
                id: "activate-focused",
                key: "Enter",
                label: "Activar",
                description: "Activa el botón o enlace enfocado.",
                group: "Navegación",
                order: 3,
                displayOnly: true
            },
            {
                id: "nav-map",
                key: "m",
                label: "Mapa",
                description: "Abre el mapa de niveles.",
                group: "Atajos globales",
                order: 10,
                action: function () {
                    window.CapyHotkeys.navigateTo("mapa.html");
                }
            },
            {
                id: "nav-store",
                key: "t",
                label: "Tienda",
                description: "Abre la tienda de vestuarios.",
                group: "Atajos globales",
                order: 11,
                action: function () {
                    window.CapyHotkeys.navigateTo("tienda.html");
                }
            },
            {
                id: "nav-story",
                key: "h",
                label: "Historia",
                description: "Abre la historia de CapyCode.",
                group: "Atajos globales",
                order: 12,
                action: function () {
                    window.CapyHotkeys.navigateTo("about.html");
                }
            },
            {
                id: "nav-tutorial",
                key: "u",
                label: "Tutorial",
                description: "Abre la página de tutorial y hotkeys.",
                group: "Atajos globales",
                order: 13,
                action: function () {
                    window.CapyHotkeys.navigateTo("tutorial.html");
                }
            },
            {
                id: "nav-profile",
                key: "p",
                label: "Perfil",
                description: "Abre el perfil del jugador.",
                group: "Atajos globales",
                order: 14,
                action: function () {
                    window.CapyHotkeys.navigateTo("perfil.html");
                }
            },
            {
                id: "toggle-sidebar",
                key: "s",
                label: "Menú lateral",
                description: "Contrae o expande la barra lateral.",
                group: "Atajos globales",
                order: 15,
                action: function () {
                    window.CapyHotkeys.clickSelector("[data-action=\"toggle-sidebar\"]");
                },
                enabled: function () {
                    return Boolean(document.querySelector("[data-action=\"toggle-sidebar\"]"));
                }
            },
            {
                id: "quiz-primary",
                key: "Enter",
                ctrlKey: true,
                label: "Comprobar",
                description: "Comprueba la respuesta en una pantalla de nivel.",
                group: "Nivel",
                order: 20,
                displayOnly: true
            },
            {
                id: "quiz-reset",
                key: "r",
                label: "Reiniciar reto",
                description: "Reinicia la pregunta actual en una pantalla de nivel.",
                group: "Nivel",
                order: 21,
                displayOnly: true
            }
        ]);

        window.CapyHotkeys.renderLists();
    }

    function refreshInteractiveTilts() {
        if (!window.VanillaTilt) {
            return;
        }

        document.querySelectorAll("[data-interactive-tilt]").forEach(function (element) {
            const tiltType = element.dataset.interactiveTilt || "";
            const options = getTiltOptions(tiltType);

            if (element.vanillaTilt) {
                element.vanillaTilt.destroy();
            }

            window.VanillaTilt.init(element, options);
        });
    }

    function getTiltOptions(tiltType) {
        if (tiltType === "profile-hero") {
            return {
                max: 5,
                speed: 420,
                scale: 1.012,
                perspective: 1500,
                glare: false,
                gyroscope: false
            };
        }

        if (tiltType === "shop-card") {
            return {
                max: 6,
                speed: 420,
                scale: 1.015,
                perspective: 1400,
                glare: false,
                gyroscope: false
            };
        }

        return {
            max: 4,
            speed: 420,
            scale: 1.01,
            perspective: 1500,
            glare: false,
            gyroscope: false
        };
    }

    function getShopItem(id) {
        return (data.shopItems || []).find(function (item) {
            return item.id === id;
        }) || null;
    }

    function getItemName(item) {
        return item && (item.nombre || item.name) ? (item.nombre || item.name) : "";
    }

    function getItemSlogan(item) {
        return item && (item.slogan || item.perk || item.frase) ? (item.slogan || item.perk || item.frase) : "";
    }

    function getItemCost(item) {
        if (!item) {
            return 0;
        }

        return readNumber(item.costo !== undefined ? item.costo : item.price, 0);
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

    function completeLevel(levelId, config) {
        const profile = getProfile();
        const numericLevelId = readNumber(levelId, 0);
        const totalLevels = getTotalPlayableLevels();
        const bonusXp = config && config.bonusXp ? Number(config.bonusXp) : 0;
        const unlockCharacter = config && config.unlockCharacter ? config.unlockCharacter : "";
        const nextLevel = Math.min(numericLevelId + 1, totalLevels + 1);
        let firstCompletion = false;

        if (numericLevelId < 1 || numericLevelId > totalLevels) {
            return {
                firstCompletion: false,
                profile: profile
            };
        }

        if (!profile.completedLevels.includes(numericLevelId)) {
            profile.completedLevels.push(numericLevelId);
            profile.xp += bonusXp;
            firstCompletion = true;
        }

        if (nextLevel > profile.level) {
            profile.level = nextLevel;
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

    function getTotalPlayableLevels() {
        return Math.max(1, Array.isArray(data.levels) ? data.levels.length : 1);
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
        getItemName: getItemName,
        getItemSlogan: getItemSlogan,
        getItemCost: getItemCost,
        isUnlocked: isUnlocked,
        formatNumber: formatNumber,
        updateHud: updateHud,
        completeActivity: completeActivity,
        completeLevel: completeLevel,
        refreshInteractiveTilts: refreshInteractiveTilts
    };
}());
