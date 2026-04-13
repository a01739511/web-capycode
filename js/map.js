(function () {
    const root = document.getElementById("map-levels");
    const spotlight = document.getElementById("map-spotlight");
    const detailRoot = document.getElementById("map-detail");
    const data = window.CAPYCODE_APP_DATA;

    if (!root || !spotlight || !detailRoot || !data || !window.CapyCore) {
        return;
    }

    const profile = window.CapyCore.getProfile();
    const currentLevel = profile.level;

    renderLevels();
    updateSpotlight(getLevelById(currentLevel) || data.levels[0]);

    function renderLevels() {
        root.innerHTML = data.levels.map(function (level) {
            const status = resolveStatus(level.id, currentLevel);
            const href = status === "locked" ? "#" : level.href;

            return [
                "<a class=\"level-node is-", status, "\" href=\"", href, "\" data-level-id=\"", level.id, "\" style=\"left:", level.x, "; top:", level.y, ";\">",
                "<span class=\"level-orb\">", level.id, "</span>",
                "<span class=\"level-label\">", level.title, "</span>",
                "<span class=\"level-topic\">", level.topic, "</span>",
                "</a>"
            ].join("");
        }).join("");

        root.querySelectorAll("[data-level-id]").forEach(function (node) {
            node.addEventListener("mouseenter", function () {
                updateSpotlight(getLevelById(Number(node.dataset.levelId)));
            });

            node.addEventListener("focus", function () {
                updateSpotlight(getLevelById(Number(node.dataset.levelId)));
            });
        });
    }

    function updateSpotlight(level) {
        if (!level) {
            return;
        }

        const status = resolveStatus(level.id, currentLevel);
        spotlight.textContent = level.topic;

        detailRoot.innerHTML = [
            "<article class=\"map-detail-card glass-surface\">",
            "<div class=\"map-detail-art\"><img src=\"", level.image, "\" alt=\"", level.topic, "\"></div>",
            "<div class=\"map-detail-copy\">",
            "<p class=\"panel-kicker\">", status === "locked" ? "Proximamente" : "Estacion activa", "</p>",
            "<h3>", level.place, "</h3>",
            "<p class=\"map-detail-meta\"><strong>Mentor:</strong> ", level.mentor, "</p>",
            "<p class=\"map-detail-meta\"><strong>Tema:</strong> ", level.content, "</p>",
            "<p>", level.description, "</p>",
            status === "locked"
                ? "<span class=\"map-state-pill is-locked\">Bloqueado</span>"
                : "<a class=\"scene-button primary map-detail-link\" href=\"" + level.href + "\">Entrar al nivel</a>",
            "</div>",
            "</article>"
        ].join("");
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
