(function () {
    const root = document.getElementById("map-levels");
    const routeList = document.getElementById("map-route-list");
    const routeTrigger = document.getElementById("map-route-trigger");
    const routePopover = document.getElementById("map-route-popover");
    const routeOrder = document.getElementById("route-order");
    const routeTitle = document.getElementById("route-title");
    const tooltip = document.getElementById("map-tooltip");
    const stage = root ? root.closest(".map-stage") : null;
    const api = window.CapyApi;
    const LOCK_ICON_PATH = "assets/lock-icon.svg";
    const LEVEL_ORB_PATH = "assets/esfera_nivel.png";
    const ACTIVE_ROUTE_KEY = "capycodeActiveRouteIdV3";
    const UNLOCK_ALL_ROUTES_FOR_PREVIEW = Boolean(
        window.CAPYCODE_CONFIG && window.CAPYCODE_CONFIG.UNLOCK_ALL_ROUTES_FOR_PREVIEW
    );
    const FALLBACK_LAYOUT_ANCHORS = {
        sidebar: [
            { x: "16.2%", y: "52%" },
            { x: "34.3%", y: "42.2%" },
            { x: "33.2%", y: "74.9%" },
            { x: "49.8%", y: "59.9%" },
            { x: "66.5%", y: "37.2%" },
            { x: "88.4%", y: "49.8%" },
            { x: "77.2%", y: "73.7%" }
        ],
        full: [
            { x: "16.4%", y: "52.2%" },
            { x: "34.2%", y: "42%" },
            { x: "33.4%", y: "74.6%" },
            { x: "50.2%", y: "60.2%" },
            { x: "66.8%", y: "38.4%" },
            { x: "88.1%", y: "51.2%" },
            { x: "77.6%", y: "73.6%" }
        ]
    };

    if (!root || !routeList || !routeTrigger || !routePopover || !routeOrder || !routeTitle || !tooltip || !stage || !api || !window.CapyCore) {
        return;
    }

    const profile = window.CapyCore.getProfile();
    const currentLevelId = Number(profile.currentLevelId || 1);
    const totalLevels = api.getTotalLevelCountSync();
    const gameCompleted = currentLevelId === totalLevels + 1;
    const routes = api.getRoutesSync();
    let activeRoute = resolveActiveRoute();
    let activeLayoutMode = getMapLayoutMode();
    let activeNode = null;
    let activeLevel = null;

    renderRouteCopy();
    renderRouteSwitcher();
    renderLevels();
    bindRouteMenu();
    bindMapLayoutMode();

    window.addEventListener("resize", function () {
        syncMapLayoutMode();
        syncTooltipPosition();
    });
    window.addEventListener("scroll", syncTooltipPosition, true);

    function renderLevels() {
        const routeLevels = getPositionedRouteLevels();
        root.dataset.layoutMode = activeLayoutMode;

        root.innerHTML = buildAmbientOrbMarkup(routeLevels) + routeLevels.map(function (level) {
            const status = resolveStatus(level.id);
            const isLocked = status === "locked";
            const lockMarkup = isLocked
                ? "<span class=\"level-lock-badge\" aria-hidden=\"true\"><img src=\"" + LOCK_ICON_PATH + "\" alt=\"\"></span>"
                : "";

            return [
                "<a class=\"level-node is-", status, " is-order-", level.routeOrder, "\" href=\"", isLocked ? "#" : level.href, "\" data-level-id=\"", level.id, "\" data-route-order=\"", level.routeOrder, "\" aria-disabled=\"", isLocked ? "true" : "false", "\" style=\"left:", level.x, "; top:", level.y, ";\">",
                "<span class=\"level-orb-shell\">",
                "<span class=\"level-orb\">",
                "<img class=\"level-orb-image\" src=\"", LEVEL_ORB_PATH, "\" alt=\"\" aria-hidden=\"true\">",
                "<span class=\"level-orb-number\">", level.id, "</span>",
                "</span>",
                lockMarkup,
                "</span>",
                "<span class=\"level-label\">", escapeHtml(level.name), "</span>",
                "<span class=\"level-topic\">", escapeHtml(level.difficultyLabel), "</span>",
                "</a>"
            ].join("");
        }).join("");

        root.querySelectorAll("[data-level-id]").forEach(function (node) {
            const level = api.getLevelByIdSync(Number(node.dataset.levelId));

            node.addEventListener("mouseenter", function () {
                showTooltip(level, node);
            });

            node.addEventListener("mouseleave", hideTooltip);
            node.addEventListener("focus", function () {
                showTooltip(level, node);
            });
            node.addEventListener("blur", hideTooltip);

            if (resolveStatus(level.id) === "locked") {
                node.addEventListener("click", function (event) {
                    event.preventDefault();
                });
            }
        });
    }

    function buildAmbientOrbMarkup(routeLevels) {
        const occupiedAnchors = new Set(routeLevels.map(function (level) {
            return getPositionKey(level);
        }));

        return getRouteLayoutAnchors().map(function (anchor, index) {
            return Object.assign({ number: index + 1 }, anchor);
        }).filter(function (anchor) {
            return !occupiedAnchors.has(getPositionKey(anchor));
        }).map(function (anchor, index) {
            return [
                "<span class=\"ambient-level-orb is-variant-", (index % 3) + 1, "\" aria-hidden=\"true\" style=\"left:", anchor.x, "; top:", anchor.y, ";\">",
                "<span class=\"ambient-level-orb-shell\">",
                "<img class=\"ambient-level-orb-image\" src=\"", LEVEL_ORB_PATH, "\" alt=\"\">",
                "<span class=\"ambient-level-orb-core\"></span>",
                "<span class=\"ambient-level-orb-number\">", anchor.number, "</span>",
                "</span>",
                "</span>"
            ].join("");
        }).join("");
    }

    function renderRouteCopy() {
        routeOrder.textContent = "Ruta " + activeRoute.orderIndex;
        routeTitle.textContent = activeRoute.name;
        stage.style.setProperty("--map-background-image", "url(\"" + (activeRoute.backgroundImage || "assets/fondo1.png") + "\")");
    }

    function renderRouteSwitcher() {
        routeList.innerHTML = routes.map(function (routeItem) {
            const state = getRouteState(routeItem, activeRoute && activeRoute.id);

            return [
                "<button class=\"map-route-chip",
                String(routeItem.id) === String(activeRoute.id) ? " is-active" : "",
                state.isLocked ? " is-locked" : "",
                "\" type=\"button\" data-route-id=\"", routeItem.id, "\"",
                state.isSelectable ? "" : " disabled",
                ">",
                "<span class=\"map-route-chip-order\">Ruta ", routeItem.orderIndex, "</span>",
                "<strong class=\"map-route-chip-title\">", escapeHtml(routeItem.name), "</strong>",
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
                return String(routeItem.id) === String(trigger.dataset.routeId);
            });

            if (!nextRoute || !getRouteState(nextRoute).isSelectable || String(nextRoute.id) === String(activeRoute.id)) {
                return;
            }

            activeRoute = nextRoute;
            localStorage.setItem(ACTIVE_ROUTE_KEY, String(activeRoute.id));
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

        const status = resolveStatus(level.id);
        tooltip.innerHTML = [
            "<div class=\"map-tooltip-head\">",
            "<p class=\"map-tooltip-order\">", escapeHtml(level.name), "</p>",
            "<span class=\"map-state-pill is-", status, "\">", getStatusLabel(status), "</span>",
            "</div>",
            "<h3>", escapeHtml(activeRoute.name), "</h3>",
            "<div class=\"map-tooltip-meta\">",
            buildTooltipCard("Dificultad", level.difficultyLabel, ""),
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
        const gap = 6;
        const width = tooltip.offsetWidth || 210;
        const height = tooltip.offsetHeight || 120;
        const safeMargin = 8;
        const rect = anchor.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const baseX = rect.left - stageRect.left + rect.width / 2;
        const baseY = rect.top - stageRect.top + rect.height / 2;
        const positions = [
            { left: rect.right - stageRect.left + gap, top: baseY - height / 2 },
            { left: rect.left - stageRect.left - width - gap, top: baseY - height / 2 },
            { left: baseX - width / 2, top: rect.top - stageRect.top - height - gap },
            { left: baseX - width / 2, top: rect.bottom - stageRect.top + gap }
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

    function resolveStatus(levelId) {
        if (gameCompleted) {
            return "completed";
        }

        if (levelId < currentLevelId) {
            return "completed";
        }

        if (levelId === currentLevelId) {
            return "current";
        }

        return "locked";
    }

    function getStatusLabel(status) {
        if (status === "completed") {
            return "Práctica";
        }
        if (status === "current") {
            return "Actual";
        }
        return "Bloqueado";
    }

    function getPositionedRouteLevels() {
        const routeAnchors = getRouteLayoutAnchors();

        return api.getLevelsByRouteSync(activeRoute.id).slice().sort(function (left, right) {
            return left.routeOrder - right.routeOrder;
        }).map(function (level, index) {
            const anchor = routeAnchors[index];

            return Object.assign({}, level, anchor ? {
                x: anchor.x,
                y: anchor.y
            } : null);
        });
    }

    function getRouteLayoutAnchors() {
        const configuredAnchors = getConfiguredLayoutAnchors(activeLayoutMode);

        if (configuredAnchors.length) {
            return configuredAnchors;
        }

        if (activeLayoutMode !== "sidebar") {
            return FALLBACK_LAYOUT_ANCHORS[activeLayoutMode] || FALLBACK_LAYOUT_ANCHORS.sidebar;
        }

        const levels = api.getLevelsByRouteSync(activeRoute.id);
        const anchors = levels.map(function (level) {
            return { x: level.x, y: level.y };
        }).filter(isValidAnchor);

        return anchors.length ? anchors : FALLBACK_LAYOUT_ANCHORS.sidebar;
    }

    function getConfiguredLayoutAnchors(layoutMode) {
        const mapData = window.CAPYCODE_APP_DATA && window.CAPYCODE_APP_DATA.map
            ? window.CAPYCODE_APP_DATA.map
            : {};
        const layouts = mapData.levelAnchorsByLayout || {};
        const anchors = layouts[layoutMode];

        return Array.isArray(anchors)
            ? anchors.filter(isValidAnchor).map(function (anchor) {
                return { x: anchor.x, y: anchor.y };
            })
            : [];
    }

    function isValidAnchor(anchor) {
        return anchor && anchor.x && anchor.y;
    }

    function bindMapLayoutMode() {
        window.addEventListener("capycode:sidebar-state-change", syncMapLayoutMode);
        document.addEventListener("DOMContentLoaded", syncMapLayoutMode);

        if (window.MutationObserver) {
            new MutationObserver(syncMapLayoutMode).observe(document.body, {
                attributes: true,
                attributeFilter: ["class"]
            });
        }
    }

    function syncMapLayoutMode() {
        const nextLayoutMode = getMapLayoutMode();

        if (nextLayoutMode === activeLayoutMode) {
            return;
        }

        activeLayoutMode = nextLayoutMode;
        hideTooltip();
        renderLevels();
    }

    function getMapLayoutMode() {
        return document.body.classList.contains("sidebar-collapsed") ? "full" : "sidebar";
    }

    function resolveActiveRoute() {
        const storedRouteId = localStorage.getItem(ACTIVE_ROUTE_KEY);
        const storedRoute = routes.find(function (routeItem) {
            return String(routeItem.id) === String(storedRouteId);
        });

        if (storedRoute && getRouteState(storedRoute).isSelectable) {
            return storedRoute;
        }

        if (gameCompleted) {
            return routes[routes.length - 1];
        }

        const currentLevel = api.getLevelByIdSync(currentLevelId);
        const currentRoute = currentLevel && routes.find(function (routeItem) {
            return String(routeItem.id) === String(currentLevel.routeId);
        });

        return currentRoute || routes[0];
    }

    function getRouteState(routeItem, activeRouteId) {
        if (UNLOCK_ALL_ROUTES_FOR_PREVIEW) {
            if (String(routeItem.id) === String(activeRouteId || "")) {
                return { label: "Vista previa", isLocked: false, isSelectable: true };
            }

            return { label: "Disponible", isLocked: false, isSelectable: true };
        }

        const firstLevel = api.getLevelsByRouteSync(routeItem.id)[0];
        const isLocked = !gameCompleted && firstLevel && firstLevel.id > currentLevelId;
        const selectedRouteId = activeRouteId || "";

        if (String(routeItem.id) === String(selectedRouteId) && !isLocked) {
            return { label: "Actual", isLocked: false, isSelectable: true };
        }

        if (isLocked) {
            return { label: "Bloqueada", isLocked: true, isSelectable: false };
        }

        return { label: "Disponible", isLocked: false, isSelectable: true };
    }

    function buildTooltipCard(label, value, className) {
        return [
            "<article class=\"map-tooltip-card ", className, "\">",
            "<span class=\"map-tooltip-label\">", escapeHtml(label), "</span>",
            "<strong class=\"map-tooltip-value\">", escapeHtml(value), "</strong>",
            "</article>"
        ].join("");
    }

    function getPositionKey(point) {
        return [point && point.x ? point.x : "", point && point.y ? point.y : ""].join("|");
    }

    function escapeHtml(value) {
        return window.CapyCore.escapeHtml(value);
    }
}());
