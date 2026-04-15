(function () {
    const root = document.getElementById("map-levels");
    const spotlight = document.getElementById("map-spotlight");
    const tooltip = document.getElementById("map-tooltip");
    const sidebarSkin = document.getElementById("sidebar-skin");
    const data = window.CAPYCODE_APP_DATA;

    if (!root || !spotlight || !tooltip || !sidebarSkin || !data || !window.CapyCore) {
        return;
    }

    const profile = window.CapyCore.getProfile();
    const currentLevel = profile.level;

    renderSidebarSkin();
    renderLevels();
    updateSpotlight(getLevelById(currentLevel) || data.levels[0]);

    function renderSidebarSkin() {
        const equipped = window.CapyCore.getShopItem(profile.equippedCharacter) || data.shopItems[0];

        sidebarSkin.innerHTML = [
            "<p class=\"panel-kicker\">Skin activa</p>",
            "<div class=\"sidebar-skin-art\"><img src=\"", equipped.image, "\" alt=\"", equipped.name, "\"></div>",
            "<div class=\"sidebar-skin-copy\">",
            "<strong>", equipped.name, "</strong>",
            "<span>", equipped.perk, "</span>",
            "</div>"
        ].join("");
    }

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
            const level = getLevelById(Number(node.dataset.levelId));

            node.addEventListener("mouseenter", function (event) {
                updateSpotlight(level);
                showTooltip(level, event);
            });

            node.addEventListener("mousemove", function (event) {
                updateTooltipPosition(event);
            });

            node.addEventListener("mouseleave", hideTooltip);
            node.addEventListener("focus", function (event) {
                updateSpotlight(level);
                showTooltip(level, event);
            });
            node.addEventListener("blur", hideTooltip);
        });
    }

    function updateSpotlight(level) {
        if (!level) {
            return;
        }

        spotlight.textContent = level.topic;
    }

    function showTooltip(level, event) {
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
        updateTooltipPosition(event);
    }

    function updateTooltipPosition(event) {
        const offsetX = 20;
        const offsetY = 20;
        const width = tooltip.offsetWidth || 260;
        const height = tooltip.offsetHeight || 180;
        let left = event.clientX + offsetX;
        let top = event.clientY + offsetY;

        if (left + width > window.innerWidth - 16) {
            left = event.clientX - width - 16;
        }

        if (top + height > window.innerHeight - 16) {
            top = event.clientY - height - 16;
        }

        tooltip.style.left = left + "px";
        tooltip.style.top = top + "px";
    }

    function hideTooltip() {
        tooltip.classList.add("is-hidden");
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
