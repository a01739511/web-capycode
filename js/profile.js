(function () {
    const heroRoot = document.getElementById("profile-hero");
    const collectionRoot = document.getElementById("profile-collection");
    const collectionCountRoot = document.getElementById("profile-collection-count");
    const data = window.CAPYCODE_APP_DATA;
    const transparentImages = {
        CapyBlack: "assets/characters/no_bg/Capy_Black.png",
        CapyAqua: "assets/characters/no_bg/Capy_Aqua..png",
        CapyKing: "assets/characters/no_bg/Capy_King.png",
        CapyExplorer: "assets/characters/no_bg/Capy_Explorer.png",
        CapyCandy: "assets/characters/no_bg/Capy_Candy.png",
        CapyRuna: "assets/characters/no_bg/Capy_Runa.png",
        CapySun: "assets/characters/no_bg/Capy_Sun.png",
        CapyEarth: "assets/characters/no_bg/Capy_Earth.png",
        CapyConstelation: "assets/characters/no_bg/Capy_Constelation.png"
    };
    let activeCollectionId = "";

    if (!heroRoot || !collectionRoot || !collectionCountRoot || !data || !window.CapyCore) {
        return;
    }

    renderProfile();
    bindCollectionActions();
    bindHeroActions();

    function renderProfile() {
        const profile = window.CapyCore.getProfile();
        const equipped = getItemById(profile.equippedCharacter) || data.shopItems[0];
        const unlockedItems = getUnlockedItems(profile);

        if (!activeCollectionId || !window.CapyCore.isUnlocked(activeCollectionId, profile)) {
            activeCollectionId = equipped.id;
        }

        heroRoot.innerHTML = [
            "<article class=\"profile-hero-card glass-surface\">",
            "<div class=\"profile-hero-copy\">",
            "<p class=\"panel-kicker\">Perfil del aventurero</p>",
            "<h2 data-player-name></h2>",
            "<p class=\"profile-title\" data-player-title></p>",
            "<div class=\"profile-metrics\">",
            "<div><span>Nivel</span><strong>", profile.level, "</strong></div>",
            "<div><span>Racha</span><strong data-player-streak></strong></div>",
            "<div><span>XP</span><strong data-player-xp></strong></div>",
            "</div>",
            "<p class=\"profile-note\">Tu compa&ntilde;ero activo es ", equipped.name, ". Revisa tu armario, cambia de vestuario cuando quieras y sigue sumando poder para la siguiente expedici&oacute;n.</p>",
            "<div class=\"profile-hero-actions\">",
            "<a class=\"scene-button primary\" href=\"mapa.html\">Continuar aventura</a>",
            "<a class=\"scene-button ghost\" href=\"tienda.html\">Ver tienda</a>",
            "<button class=\"scene-button ghost\" type=\"button\" data-action=\"logout\">Salir</button>",
            "</div>",
            "</div>",
            "<div class=\"profile-hero-stage\">",
            "<div class=\"profile-hero-art-shell\">",
            "<span class=\"profile-hero-art-glow\" aria-hidden=\"true\"></span>",
            "<img src=\"", getTransparentImage(equipped), "\" alt=\"", equipped.name, "\">",
            "</div>",
            "</div>",
            "</article>"
        ].join("");

        collectionCountRoot.textContent = unlockedItems.length + "/" + data.shopItems.length;
        renderCollection(profile);
        window.CapyCore.updateHud();
    }

    function renderCollection(profile) {
        const unlockedItems = getUnlockedItems(profile);
        const currentIndex = Math.max(0, unlockedItems.findIndex(function (item) {
            return item.id === activeCollectionId;
        }));
        const currentItem = unlockedItems[currentIndex] || unlockedItems[0];
        const previousItem = unlockedItems[(currentIndex - 1 + unlockedItems.length) % unlockedItems.length] || currentItem;
        const nextItem = unlockedItems[(currentIndex + 1) % unlockedItems.length] || currentItem;
        const equippedNow = currentItem.id === profile.equippedCharacter;

        collectionRoot.innerHTML = [
            "<div class=\"collection-carousel-main\">",
            "<button class=\"collection-nav\" type=\"button\" data-collection-nav=\"prev\" aria-label=\"Mostrar personaje anterior\">&#8249;</button>",
            buildSideCard(previousItem, "prev"),
            "<article class=\"collection-focus-card", equippedNow ? " is-equipped" : "", "\">",
            "<div class=\"collection-focus-art\">",
            "<img src=\"", getTransparentImage(currentItem), "\" alt=\"", currentItem.name, "\">",
            "</div>",
            "<div class=\"collection-focus-copy\">",
            "<span class=\"collection-status\">", equippedNow ? "Equipado" : "Desbloqueado", "</span>",
            "<h3>", currentItem.name, "</h3>",
            "<p class=\"collection-focus-perk\">", currentItem.perk, "</p>",
            "<p class=\"collection-focus-description\">", getItemDescription(currentItem), "</p>",
            "<div class=\"collection-focus-footer\">",
            "<strong>", currentItem.price === 0 ? "Vestuario base" : ("XP " + window.CapyCore.formatNumber(currentItem.price)), "</strong>",
            "<button class=\"shop-action", equippedNow ? " is-equipped" : "", "\" type=\"button\" data-collection-equip=\"", currentItem.id, "\"", equippedNow ? " disabled" : "", ">",
            equippedNow ? "Equipado" : "Equipar",
            "</button>",
            "</div>",
            "</div>",
            "</article>",
            buildSideCard(nextItem, "next"),
            "<button class=\"collection-nav\" type=\"button\" data-collection-nav=\"next\" aria-label=\"Mostrar personaje siguiente\">&#8250;</button>",
            "</div>",
            "<div class=\"collection-carousel-dots\">",
            unlockedItems.map(function (item) {
                return [
                    "<button class=\"collection-dot", item.id === currentItem.id ? " is-active" : "", "\" type=\"button\" data-collection-select=\"", item.id, "\" aria-label=\"Ver ", item.name, "\"></button>"
                ].join("");
            }).join(""),
            "</div>"
        ].join("");
    }

    function buildSideCard(item, variant) {
        return [
            "<button class=\"collection-side-card is-", variant, "\" type=\"button\" data-collection-select=\"", item.id, "\" aria-label=\"Ver ", item.name, "\">",
            "<div class=\"collection-side-art\">",
            "<img src=\"", getTransparentImage(item), "\" alt=\"", item.name, "\">",
            "</div>",
            "<div class=\"collection-side-copy\">",
            "<h4>", item.name, "</h4>",
            "<p>", item.perk, "</p>",
            "</div>",
            "</button>"
        ].join("");
    }

    function bindCollectionActions() {
        collectionRoot.addEventListener("click", function (event) {
            const navButton = event.target.closest("[data-collection-nav]");
            const selectButton = event.target.closest("[data-collection-select]");
            const equipButton = event.target.closest("[data-collection-equip]");

            if (navButton) {
                moveSelection(navButton.dataset.collectionNav);
                return;
            }

            if (selectButton) {
                activeCollectionId = selectButton.dataset.collectionSelect;
                renderCollection(window.CapyCore.getProfile());
                return;
            }

            if (equipButton) {
                equipItem(equipButton.dataset.collectionEquip);
            }
        });
    }

    function bindHeroActions() {
        heroRoot.addEventListener("click", function (event) {
            const logoutButton = event.target.closest("[data-action=\"logout\"]");
            if (logoutButton) {
                window.CapyCore.logout();
            }
        });
    }

    function moveSelection(direction) {
        const profile = window.CapyCore.getProfile();
        const unlockedItems = getUnlockedItems(profile);
        const currentIndex = Math.max(0, unlockedItems.findIndex(function (item) {
            return item.id === activeCollectionId;
        }));
        const nextIndex = direction === "prev"
            ? (currentIndex - 1 + unlockedItems.length) % unlockedItems.length
            : (currentIndex + 1) % unlockedItems.length;

        activeCollectionId = unlockedItems[nextIndex].id;
        renderCollection(profile);
    }

    function equipItem(itemId) {
        const profile = window.CapyCore.getProfile();
        const item = getItemById(itemId);

        if (!item || !window.CapyCore.isUnlocked(itemId, profile)) {
            return;
        }

        profile.equippedCharacter = itemId;
        window.CapyCore.saveProfile(profile);
        renderSidebarSkin(item);
        renderProfile();
    }

    function getUnlockedItems(profile) {
        return data.shopItems.filter(function (item) {
            return window.CapyCore.isUnlocked(item.id, profile);
        });
    }

    function getTransparentImage(item) {
        return transparentImages[item.id] || item.image;
    }

    function getItemById(itemId) {
        return data.shopItems.find(function (item) {
            return item.id === itemId;
        }) || null;
    }

    function renderSidebarSkin(item) {
        document.querySelectorAll("[data-sidebar-skin]").forEach(function (element) {
            element.innerHTML = [
                "<a class=\"sidebar-skin-link\" href=\"perfil.html#profile-collection-section\">",
                "<p class=\"panel-kicker\">Skin activa</p>",
                "<div class=\"sidebar-skin-art\"><img src=\"", item.image, "\" alt=\"", item.name, "\"></div>",
                "<div class=\"sidebar-skin-copy\">",
                "<strong>", item.name, "</strong>",
                "<span>", item.perk, "</span>",
                "</div>",
                "</a>"
            ].join("");
        });
    }

    function getItemDescription(item) {
        const descriptions = {
            CapyBlack: "Su capa oscura abre el camino para los aventureros que apenas empiezan a dominar la magia del c&oacute;digo.",
            CapyAqua: "Una guardiana serena que canaliza corrientes antiguas para resolver retos con fluidez y calma.",
            CapyKing: "Representa liderazgo, presencia y seguridad para quienes avanzan con disciplina real.",
            CapyExplorer: "Ideal para exploradores de mecanismos, acertijos y senderos ocultos entre engranes m&iacute;sticos.",
            CapyCandy: "Una chispa dulce y veloz para recorridos ligeros llenos de energ&iacute;a y creatividad.",
            CapyRuna: "Conserva las marcas del bosque y protege la memoria de quienes estudian con paciencia.",
            CapySun: "Brilla como una gu&iacute;a luminosa para decisiones firmes en cada estaci&oacute;n del mapa.",
            CapyEarth: "Resistencia y estabilidad para aventureros que construyen paso a paso sin perder el rumbo.",
            CapyConstelation: "Trae visi&oacute;n estelar y una lectura m&aacute;s clara del camino entre portales y desaf&iacute;os."
        };

        return descriptions[item.id] || ("Un compa&ntilde;ero con la afinidad especial de " + item.perk + ".");
    }
}());
