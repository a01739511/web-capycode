(function () {
    if (window.CAPYCODE_MOBILE_DOWNLOAD_ONLY) {
        return;
    }

    const data = window.CAPYCODE_APP_DATA || {};
    const api = window.CapyApi;

    if (!api) {
        return;
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (document.body.dataset.requiresAuth === "true" && !ensureSession()) {
            return;
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
        if (getSession()) {
            return true;
        }

        if (api.isBackendMode()) {
            api.getCurrentUser().then(function (response) {
                if (response && response.user) {
                    api.saveCurrentUserSync(response.user);
                    window.location.reload();
                    return;
                }

                window.location.href = "iniciar_sesion.html";
            }).catch(function () {
                window.location.href = "iniciar_sesion.html";
            });
            return false;
        }

        window.location.href = "iniciar_sesion.html";
        return false;
    }

    function getSession() {
        return api.getCurrentUserSync();
    }

    function saveSession(username) {
        api.saveCurrentUserSync({
            username: username
        });
    }

    function logout() {
        api.logoutUser().finally(function () {
            window.location.href = "iniciar_sesion.html";
        });
    }

    function getProfile() {
        return api.getCurrentUserSync() || buildGuestProfile();
    }

    function saveProfile(profile) {
        return api.saveCurrentUserSync(profile);
    }

    function buildGuestProfile() {
        return {
            id: 0,
            username: "Aprendiz",
            currentLevelId: 1,
            level: 1,
            xp: 0,
            streak: 0,
            visibleStreak: 0,
            lastCompletionAt: null,
            currentOutfitId: "CapyBlack",
            equippedCharacter: "CapyBlack",
            unlockedOutfitIds: ["CapyBlack"],
            unlockedCharacters: ["CapyBlack"],
            discoveredOutfitIds: ["CapyBlack", "CapyExplorer"],
            unlockedBadgeRouteIds: []
        };
    }

    function updateHud() {
        const profile = getProfile();
        const totalLevels = api.getTotalLevelCountSync();
        const route = api.getCurrentRouteForUserSync(profile);
        const completedGame = profile.currentLevelId === totalLevels + 1;
        const routeTitle = completedGame ? "Juego completado" : (route ? route.name : "Ruta actual");
        const levelCopy = completedGame ? "Completado" : "Nivel " + profile.currentLevelId;

        document.querySelectorAll("[data-player-name]").forEach(function (element) {
            element.textContent = profile.username;
        });

        document.querySelectorAll("[data-player-code]").forEach(function (element) {
            element.textContent = "U" + String(profile.id || 0).padStart(4, "0");
        });

        document.querySelectorAll("[data-player-title]").forEach(function (element) {
            element.textContent = routeTitle;
        });

        document.querySelectorAll("[data-player-level]").forEach(function (element) {
            element.textContent = levelCopy;
        });

        document.querySelectorAll("[data-player-xp]").forEach(function (element) {
            element.textContent = formatNumber(profile.xp);
        });

        document.querySelectorAll("[data-player-streak]").forEach(function (element) {
            element.textContent = String(profile.visibleStreak || 0);
        });

    }

    function bindLogout() {
        document.querySelectorAll("[data-action=\"logout\"]").forEach(function (button) {
            button.addEventListener("click", logout);
        });
    }

    function renderSidebarSkins() {
        const profile = getProfile();
        const equipped = api.getOutfitByIdSync(profile.currentOutfitId || profile.equippedCharacter);
        if (!equipped) {
            return;
        }

        document.querySelectorAll("[data-sidebar-skin]").forEach(function (element) {
            element.innerHTML = [
                "<a class=\"sidebar-skin-link\" data-interactive-tilt=\"sidebar-card\" href=\"perfil.html#profile-collection-section\">",
                "<p class=\"panel-kicker\">Vestuario activo</p>",
                "<div class=\"sidebar-skin-art\"><img src=\"", escapeAttribute(equipped.image), "\" alt=\"", escapeAttribute(equipped.name), "\"></div>",
                "<div class=\"sidebar-skin-copy\">",
                "<strong>", escapeHtml(equipped.name), "</strong>",
                "<span>", escapeHtml(equipped.tagline), "</span>",
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
                    notifySidebarStateChange();
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
                group: "Navegacion",
                order: 1,
                displayOnly: true
            },
            {
                id: "focus-previous",
                key: "Tab",
                shiftKey: true,
                label: "Control anterior",
                description: "Regresa al control interactivo previo.",
                group: "Navegacion",
                order: 2,
                displayOnly: true
            },
            {
                id: "activate-focused",
                key: "Enter",
                label: "Activar",
                description: "Activa el boton o enlace enfocado.",
                group: "Navegacion",
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
                id: "nav-tutorial",
                key: "u",
                label: "Tutorial",
                description: "Abre la página de tutorial.",
                group: "Atajos globales",
                order: 12,
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
                order: 13,
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
                order: 14,
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
                description: "Reinicia el intento del nivel.",
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
        return api.getOutfitByIdSync(id);
    }

    function getItemName(item) {
        return item && item.name ? item.name : "";
    }

    function getItemSlogan(item) {
        return item && item.tagline ? item.tagline : "";
    }

    function getItemCost(item) {
        return item && Number.isFinite(Number(item.cost)) ? Number(item.cost) : 0;
    }

    function isUnlocked(itemId, profile) {
        const currentProfile = profile || getProfile();
        const unlocked = currentProfile.unlockedOutfitIds || currentProfile.unlockedCharacters || [];
        return unlocked.includes(itemId);
    }

    function completeActivity() {
        return {
            firstCompletion: false,
            profile: getProfile()
        };
    }

    function completeLevel(levelId, config) {
        const profile = getProfile();
        const reward = config && config.bonusXp ? Number(config.bonusXp) : 0;
        profile.currentLevelId = Math.max(profile.currentLevelId || 1, Number(levelId) + 1);
        profile.level = profile.currentLevelId;
        profile.xp += Number.isFinite(reward) ? reward : 0;
        saveProfile(profile);
        updateHud();
        return {
            firstCompletion: true,
            profile: profile
        };
    }

    function getTotalPlayableLevels() {
        return api.getTotalLevelCountSync();
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("es-MX");
    }

    function applySidebarState() {
        if (localStorage.getItem("capycodeSidebarCollapsed") === "true") {
            document.body.classList.add("sidebar-collapsed");
        }

        notifySidebarStateChange();
    }

    function notifySidebarStateChange() {
        window.dispatchEvent(new CustomEvent("capycode:sidebar-state-change", {
            detail: {
                collapsed: document.body.classList.contains("sidebar-collapsed")
            }
        }));
    }

    function escapeHtml(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
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
        refreshInteractiveTilts: refreshInteractiveTilts,
        renderSidebarSkins: renderSidebarSkins,
        escapeHtml: escapeHtml,
        escapeAttribute: escapeAttribute,
        getTotalPlayableLevels: getTotalPlayableLevels
    };
}());
