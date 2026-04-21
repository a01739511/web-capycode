(function () {
    const root = document.getElementById("map-levels");
    const spotlight = document.getElementById("map-spotlight");
    const tooltip = document.getElementById("map-tooltip");
    const stage = root ? root.closest(".map-stage") : null;
    const data = window.CAPYCODE_APP_DATA;
    const LOCK_ICON_PATH = "assets/lock-icon.svg";

    if (!root || !spotlight || !tooltip || !stage || !data || !window.CapyCore) {
        return;
    }

    const profile = window.CapyCore.getProfile();
    const currentLevel = profile.level;
    let activeNode = null;
    let activeLevel = null;

    renderLevels();
    updateSpotlight(getLevelById(currentLevel) || data.levels[0]);

    window.addEventListener("resize", syncTooltipPosition);
    window.addEventListener("scroll", syncTooltipPosition, true);

    function renderLevels() {
        root.innerHTML = data.levels.map(function (level) {
            const status = resolveStatus(level.id, currentLevel);
            const href = status === "locked" ? "#" : level.href;
            const lockMarkup = status === "locked"
                ? "<span class=\"level-lock-badge\" aria-hidden=\"true\"><img src=\"" + LOCK_ICON_PATH + "\" alt=\"\"></span>"
                : "";

            return [
                "<a class=\"level-node is-", status, "\" href=\"", href, "\" data-level-id=\"", level.id, "\" aria-disabled=\"", status === "locked" ? "true" : "false", "\" style=\"left:", level.x, "; top:", level.y, ";\">",
                "<span class=\"level-orb-shell\">",
                "<span class=\"level-orb\">", level.id, "</span>",
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
                updateSpotlight(level);
                showTooltip(level, node);
            });

            node.addEventListener("mouseleave", hideTooltip);
            node.addEventListener("focus", function () {
                updateSpotlight(level);
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

    function updateSpotlight(level) {
        if (!level) {
            return;
        }

        spotlight.textContent = level.topic;
    }

    function showTooltip(level, node) {
        if (!level) {
            return;
        }

        const status = resolveStatus(level.id, currentLevel);
        tooltip.innerHTML = [
            "<p class=\"panel-kicker\">", status === "locked" ? "Proximamente" : "Estacion activa", "</p>",
            "<h3>", level.title, "</h3>",
            "<p><strong>Lugar:</strong> ", level.place, "</p>",
            "<p><strong>Mentor:</strong> ", level.mentor, "</p>",
            "<p><strong>Tema:</strong> ", level.content, "</p>",
            status === "locked" ? "<span class=\"map-state-pill is-locked\">Bloqueado</span>" : "<span class=\"map-state-pill\">Listo para jugar</span>"
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
        return data.levels.find(function (level) {
            return level.id === id;
        }) || null;
    }
}());
