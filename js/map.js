(function () {
    const root = document.getElementById("map-levels");
    const routeList = document.getElementById("map-route-list");
    const routeTrigger = document.getElementById("map-route-trigger");
    const routePopover = document.getElementById("map-route-popover");
    const routeOrder = document.getElementById("route-order");
    const routeTitle = document.getElementById("route-title");
    const tooltip = document.getElementById("map-tooltip");
    const stage = root ? root.closest(".map-stage") : null;
    const data = window.CAPYCODE_APP_DATA;
    const LOCK_ICON_PATH = "assets/lock-icon.svg";
    const LEVEL_ORB_PATH = "assets/esfera_nivel.png";
    const ACTIVE_ROUTE_KEY = "capycodeActiveRouteId";

    if (!root || !routeList || !routeTrigger || !routePopover || !routeOrder || !routeTitle || !tooltip || !stage || !data || !window.CapyCore) {
        return;
    }

    const profile = window.CapyCore.getProfile();
    const currentLevel = profile.level;
    const routes = getRoutes();
    let activeRoute = resolveActiveRoute();
    let activeNode = null;
    let activeLevel = null;

    renderRouteCopy();
    renderRouteSwitcher();
    renderLevels();
    bindRouteMenu();

    window.addEventListener("resize", syncTooltipPosition);
    window.addEventListener("scroll", syncTooltipPosition, true);

    function renderLevels() {
        root.innerHTML = getRouteLevels().map(function (level) {
            const status = resolveStatus(level.id, currentLevel);
            const href = status === "locked" ? "#" : level.href;
            const lockMarkup = status === "locked"
                ? "<span class=\"level-lock-badge\" aria-hidden=\"true\"><img src=\"" + LOCK_ICON_PATH + "\" alt=\"\"></span>"
                : "";

            return [
                "<a class=\"level-node is-", status, "\" href=\"", href, "\" data-level-id=\"", level.id, "\" aria-disabled=\"", status === "locked" ? "true" : "false", "\" style=\"left:", level.x, "; top:", level.y, ";\">",
                "<span class=\"level-orb-shell\">",
                "<span class=\"level-orb\">",
                "<img class=\"level-orb-image\" src=\"", LEVEL_ORB_PATH, "\" alt=\"\" aria-hidden=\"true\">",
                "<span class=\"level-orb-number\">", level.id, "</span>",
                "</span>",
                lockMarkup,
                "</span>",
                "<span class=\"level-label\">", level.title, "</span>",
                "<span class=\"level-topic\">", level.topic, "</span>",
                "</a>"
            ].join("");
        }).join("");

        root.querySelectorAll("[data-level-id]").forEach(function (node) {
            const level = getLevelById(Number(node.dataset.levelId));

            node.addEventListener("mouseenter", function () {
                showTooltip(level, node);
            });

            node.addEventListener("mouseleave", hideTooltip);
            node.addEventListener("focus", function () {
                showTooltip(level, node);
            });
            node.addEventListener("blur", hideTooltip);

            if (resolveStatus(level.id, currentLevel) === "locked") {
                node.addEventListener("click", function (event) {
                    event.preventDefault();
                });
            }
        });
    }

    function renderRouteCopy() {
        routeOrder.textContent = activeRoute.order || "Ruta";
        routeTitle.textContent = activeRoute.title || "Ruta";
        stage.style.setProperty("--map-background-image", "url(\"" + (activeRoute.background || data.map.background || "assets/fondo1.png") + "\")");
    }

    function renderRouteSwitcher() {
        routeList.innerHTML = routes.map(function (routeItem) {
            const state = getRouteState(routeItem, activeRoute && activeRoute.id);

            return [
                "<button class=\"map-route-chip",
                routeItem.id === activeRoute.id ? " is-active" : "",
                state.isLocked ? " is-locked" : "",
                state.isComingSoon ? " is-coming-soon" : "",
                "\" type=\"button\" data-route-id=\"", routeItem.id, "\"",
                state.isSelectable ? "" : " disabled",
                ">",
                "<span class=\"map-route-chip-order\">", routeItem.order || "Ruta", "</span>",
                "<strong class=\"map-route-chip-title\">", routeItem.title || "Ruta", "</strong>",
                "<span class=\"map-route-chip-status\">", state.label, "</span>",
                "</button>"
            ].join("");
        }).join("");
    }

    function bindRouteMenu() {
        routeTrigger.addEventListener("click", function () {
            if (routePopover.classList.contains("is-hidden")) {
                openRouteMenu();
                return;
            }

            closeRouteMenu();
        });

        routeList.addEventListener("click", function (event) {
            const trigger = event.target.closest("[data-route-id]");
            if (!trigger) {
                return;
            }

            const nextRoute = routes.find(function (routeItem) {
                return routeItem.id === trigger.dataset.routeId;
            });

            if (!nextRoute) {
                return;
            }

            const state = getRouteState(nextRoute);
            if (!state.isSelectable || nextRoute.id === activeRoute.id) {
                return;
            }

            activeRoute = nextRoute;
            localStorage.setItem(ACTIVE_ROUTE_KEY, activeRoute.id);
            hideTooltip();
            closeRouteMenu();
            renderRouteCopy();
            renderRouteSwitcher();
            renderLevels();
        });

        document.addEventListener("click", function (event) {
            if (routePopover.classList.contains("is-hidden")) {
                return;
            }

            if (event.target.closest("#map-route-trigger") || event.target.closest("#map-route-popover")) {
                return;
            }

            closeRouteMenu();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeRouteMenu();
            }
        });
    }

    function openRouteMenu() {
        routePopover.classList.remove("is-hidden");
        routePopover.setAttribute("aria-hidden", "false");
        routeTrigger.setAttribute("aria-expanded", "true");
    }

    function closeRouteMenu() {
        routePopover.classList.add("is-hidden");
        routePopover.setAttribute("aria-hidden", "true");
        routeTrigger.setAttribute("aria-expanded", "false");
    }

    function showTooltip(level, node) {
        if (!level) {
            return;
        }

        const status = resolveStatus(level.id, currentLevel);
        const statusCopy = status === "locked" ? "Bloqueado" : (status === "current" ? "Actual" : "Desbloqueado");
        tooltip.innerHTML = [
            "<div class=\"map-tooltip-head\">",
            "<p class=\"map-tooltip-order\">", level.title, "</p>",
            "<span class=\"map-state-pill is-", status, "\">", statusCopy, "</span>",
            "</div>",
            "<h3>", level.topic, "</h3>",
            "<p class=\"map-tooltip-description\">", level.description, "</p>",
            "<div class=\"map-tooltip-meta\">",
            buildTooltipCard("Contenido", level.content, "is-content is-wide"),
            "</div>"
        ].join("");
        tooltip.classList.remove("is-hidden");
        activeLevel = level;
        activeNode = node || null;
        updateTooltipPosition(node);
    }

    function updateTooltipPosition(node) {
        if (!node) {
            return;
        }

        const anchor = node.querySelector(".level-orb-shell") || node;
        const gap = 10;
        const width = tooltip.offsetWidth || 260;
        const height = tooltip.offsetHeight || 180;
        const safeMargin = 16;
        const rect = anchor.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const baseX = rect.left - stageRect.left + rect.width / 2;
        const baseY = rect.top - stageRect.top + rect.height / 2;
        const positions = [
            {
                left: rect.right - stageRect.left + gap,
                top: baseY - height / 2
            },
            {
                left: rect.left - stageRect.left - width - gap,
                top: baseY - height / 2
            },
            {
                left: baseX - width / 2,
                top: rect.top - stageRect.top - height - gap
            },
            {
                left: baseX - width / 2,
                top: rect.bottom - stageRect.top + gap
            }
        ];
        const bestPosition = positions.find(function (position) {
            return position.left >= safeMargin &&
                position.top >= safeMargin &&
                position.left + width <= stageRect.width - safeMargin &&
                position.top + height <= stageRect.height - safeMargin;
        }) || positions[0];
        const left = Math.max(safeMargin, Math.min(bestPosition.left, stageRect.width - width - safeMargin));
        const top = Math.max(safeMargin, Math.min(bestPosition.top, stageRect.height - height - safeMargin));

        tooltip.style.left = left + "px";
        tooltip.style.top = top + "px";
    }

    function hideTooltip() {
        tooltip.classList.add("is-hidden");
        activeLevel = null;
        activeNode = null;
    }

    function syncTooltipPosition() {
        if (!activeLevel || !activeNode || tooltip.classList.contains("is-hidden")) {
            return;
        }

        updateTooltipPosition(activeNode);
    }

    function resolveStatus(levelId, current) {
        if (levelId < current) {
            return "unlocked";
        }
        if (levelId === current) {
            return "current";
        }
        return "locked";
    }

    function getLevelById(id) {
        return getRouteLevels().find(function (level) {
            return level.id === id;
        }) || null;
    }

    function getRouteLevels() {
        return getRouteLevelsByRoute(activeRoute.id);
    }

    function getRouteLevelsByRoute(routeId) {
        return (data.levels || []).filter(function (level) {
            return !level.routeId || level.routeId === routeId;
        });
    }

    function getRoutes() {
        const placeholderCount = 3;
        const sourceRoutes = data.map && Array.isArray(data.map.routes) && data.map.routes.length
            ? data.map.routes.slice()
            : [Object.assign({
                id: "ruta-principal",
                order: "Ruta 1",
                title: data.map && data.map.title ? data.map.title : "Ruta",
                background: data.map && data.map.background ? data.map.background : "",
                unlockLevel: 1
            }, data.map || {})];
        const routesWithPlaceholders = sourceRoutes.slice();

        while (routesWithPlaceholders.length < placeholderCount) {
            routesWithPlaceholders.push({
                id: "ruta-proximamente-" + (routesWithPlaceholders.length + 1),
                order: "Ruta " + (routesWithPlaceholders.length + 1),
                title: "Proximamente",
                background: data.map && data.map.background ? data.map.background : "",
                unlockLevel: 999,
                isComingSoon: true
            });
        }

        return routesWithPlaceholders;
    }

    function resolveActiveRoute() {
        const storedRouteId = localStorage.getItem(ACTIVE_ROUTE_KEY);
        const storedRoute = routes.find(function (routeItem) {
            return routeItem.id === storedRouteId;
        });
        const unlockedRoutes = routes.filter(function (routeItem) {
            const state = getRouteState(routeItem, "");
            return state.isSelectable;
        });

        if (storedRoute && getRouteState(storedRoute, "").isSelectable) {
            return storedRoute;
        }

        if (unlockedRoutes.length) {
            return unlockedRoutes[unlockedRoutes.length - 1];
        }

        return routes[0];
    }

    function getRouteState(routeItem, activeRouteId) {
        const unlockLevel = Number(routeItem.unlockLevel || 1);
        const hasLevels = getRouteLevelsByRoute(routeItem.id).length > 0;
        const isComingSoon = Boolean(routeItem.isComingSoon || !hasLevels);
        const isLocked = !isComingSoon && currentLevel < unlockLevel;
        const isSelectable = !isComingSoon && !isLocked;
        const selectedRouteId = activeRouteId || "";

        if (routeItem.id === selectedRouteId && isSelectable) {
            return {
                label: "Actual",
                isLocked: false,
                isComingSoon: false,
                isSelectable: true
            };
        }

        if (isComingSoon) {
            return {
                label: "Proximamente",
                isLocked: false,
                isComingSoon: true,
                isSelectable: false
            };
        }

        if (isLocked) {
            return {
                label: "Bloqueada",
                isLocked: true,
                isComingSoon: false,
                isSelectable: false
            };
        }

        return {
            label: "Disponible",
            isLocked: false,
            isComingSoon: false,
            isSelectable: true
        };
    }

    function buildTooltipCard(label, value, className) {
        return [
            "<article class=\"map-tooltip-card ", className, "\">",
            "<span class=\"map-tooltip-label\">", label, "</span>",
            "<strong class=\"map-tooltip-value\">", value, "</strong>",
            "</article>"
        ].join("");
    }
}());
