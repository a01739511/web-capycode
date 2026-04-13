(function () {
    const playerRoot = document.getElementById("store-player-card");
    const gridRoot = document.getElementById("store-grid");
    const data = window.CAPYCODE_APP_DATA;

    if (!playerRoot || !gridRoot || !data || !window.CapyCore) {
        return;
    }

    renderStore();

    function renderStore() {
        const profile = window.CapyCore.getProfile();
        const equipped = data.shopItems.find(function (item) {
            return item.id === profile.equippedCharacter;
        }) || data.shopItems[0];

        playerRoot.innerHTML = [
            "<div class=\"player-summary-head\">",
            "<div class=\"player-mark\">",
            "<img src=\"assets/user-avatar.svg\" alt=\"Perfil\">",
            "</div>",
            "<div>",
            "<h2 data-player-name></h2>",
            "<p data-player-code></p>",
            "</div>",
            "</div>",
            "<p class=\"panel-kicker\">Equipado actualmente</p>",
            "<article class=\"equipped-card\">",
            "<img src=\"", equipped.image, "\" alt=\"", equipped.name, "\">",
            "<div>",
            "<span class=\"item-status\">", equipped.badge || "Equipado", "</span>",
            "<h3>", equipped.name, "</h3>",
            "<p>", equipped.perk, "</p>",
            "</div>",
            "</article>"
        ].join("");

        gridRoot.innerHTML = data.shopItems.map(function (item) {
            const owned = window.CapyCore.isUnlocked(item.id, profile);
            const equippedNow = profile.equippedCharacter === item.id;
            const affordable = profile.xp >= item.price;
            const buttonLabel = equippedNow ? "Equipado" : (owned ? "Equipar" : (affordable ? "Desbloquear" : "Bloqueado"));
            const buttonDisabled = !owned && !affordable;

            return [
                "<article class=\"shop-item-card\">",
                "<div class=\"shop-art-frame\"><img src=\"", item.image, "\" alt=\"", item.name, "\"></div>",
                "<div class=\"shop-item-meta\">",
                "<div>",
                "<h3>", item.name, "</h3>",
                "<p>", item.perk, "</p>",
                "</div>",
                "<button class=\"shop-action", equippedNow ? " is-equipped" : "", "\" data-item-id=\"", item.id, "\"", buttonDisabled ? " disabled" : "", ">",
                buttonLabel,
                "</button>",
                "<span class=\"shop-price\">XP ", window.CapyCore.formatNumber(item.price), "</span>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        gridRoot.querySelectorAll("[data-item-id]").forEach(function (button) {
            button.addEventListener("click", function () {
                handleAction(button.dataset.itemId);
            });
        });

        window.CapyCore.updateHud();
    }

    function handleAction(itemId) {
        const profile = window.CapyCore.getProfile();
        const item = data.shopItems.find(function (entry) {
            return entry.id === itemId;
        });

        if (!item) {
            return;
        }

        const owned = window.CapyCore.isUnlocked(itemId, profile);

        if (!owned) {
            if (profile.xp < item.price) {
                return;
            }

            profile.xp -= item.price;
            profile.unlockedCharacters.push(itemId);
        }

        profile.equippedCharacter = itemId;
        window.CapyCore.saveProfile(profile);
        renderStore();
    }
}());
