(function () {
    const gridRoot = document.getElementById("store-grid");
    const modalRoot = document.getElementById("shop-modal");
    const modalContentRoot = document.getElementById("shop-modal-content");
    const data = window.CAPYCODE_APP_DATA;
    let activeItemId = "";

    if (!gridRoot || !modalRoot || !modalContentRoot || !data || !window.CapyCore) {
        return;
    }

    renderStore();
    bindEvents();

    function renderStore() {
        const profile = window.CapyCore.getProfile();

        gridRoot.innerHTML = data.shopItems.map(function (item) {
            const state = getItemState(item, profile);
            const itemName = getItemName(item);
            const itemSlogan = getItemSlogan(item);

            return [
                "<article class=\"shop-item-card shop-item-tile",
                state.owned ? " is-owned" : "",
                state.equippedNow ? " is-equipped" : "",
                state.statusTone === "is-locked" ? " is-locked" : "",
                "\" data-tilt-card=\"true\" aria-label=\"Vestuario ", itemName, "\">",
                "<span class=\"shop-card-glow\" aria-hidden=\"true\"></span>",
                "<div class=\"shop-card-top\">",
                "<span class=\"shop-card-status ", state.statusTone, "\">", state.statusLabel, "</span>",
                "<span class=\"shop-card-price\">", getPriceLabel(getItemCost(item)), "</span>",
                "</div>",
                "<div class=\"shop-art-frame shop-art-frame-magic\">",
                "<img src=\"", item.image, "\" alt=\"", itemName, "\">",
                "</div>",
                "<div class=\"shop-item-copy\">",
                "<span class=\"shop-item-name\">", itemName, "</span>",
                "<p class=\"shop-item-perk\">", itemSlogan, "</p>",
                "</div>",
                "<p class=\"shop-meta-note\">", state.metaNote, "</p>",
                "<div class=\"shop-item-actions\">",
                "<button class=\"shop-action", state.actionClass ? (" " + state.actionClass) : "", "\" type=\"button\" data-item-action-inline=\"", item.id, "\"", state.actionDisabled ? " disabled" : "", ">",
                state.actionLabel,
                "</button>",
                "<button class=\"shop-secondary-action\" type=\"button\" data-item-open=\"", item.id, "\" aria-haspopup=\"dialog\" aria-label=\"Ver detalle de ", itemName, "\">Detalle</button>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        if (activeItemId) {
            renderModal(activeItemId);
        }

        window.CapyCore.updateHud();
        initializeTilt();
    }

    function bindEvents() {
        gridRoot.addEventListener("click", function (event) {
            const inlineAction = event.target.closest("[data-item-action-inline]");
            const trigger = event.target.closest("[data-item-open]");

            if (inlineAction) {
                handleAction(inlineAction.dataset.itemActionInline);
                return;
            }

            if (!trigger) {
                return;
            }

            openModal(trigger.dataset.itemOpen);
        });

        modalRoot.addEventListener("click", function (event) {
            const closeTrigger = event.target.closest("[data-shop-close]");
            const actionTrigger = event.target.closest("[data-item-action]");

            if (closeTrigger) {
                closeModal();
                return;
            }

            if (actionTrigger) {
                handleAction(actionTrigger.dataset.itemAction);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !modalRoot.classList.contains("is-hidden")) {
                closeModal();
            }
        });
    }

    function openModal(itemId) {
        activeItemId = itemId;
        renderModal(itemId);
        modalRoot.classList.remove("is-hidden");
        modalRoot.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-modal-open");
        if (window.CapyCore && window.CapyCore.refreshInteractiveTilts) {
            window.CapyCore.refreshInteractiveTilts();
        }

        const closeButton = modalRoot.querySelector(".shop-modal-close");
        if (closeButton) {
            closeButton.focus();
        }
    }

    function closeModal() {
        activeItemId = "";
        modalRoot.classList.add("is-hidden");
        modalRoot.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-modal-open");
    }

    function renderModal(itemId) {
        const profile = window.CapyCore.getProfile();
        const item = data.shopItems.find(function (entry) {
            return entry.id === itemId;
        });

        if (!item) {
            return;
        }

        const state = getItemState(item, profile);
        const itemName = getItemName(item);
        const itemSlogan = getItemSlogan(item);

        modalContentRoot.innerHTML = [
            "<div class=\"shop-modal-media\">",
            "<div class=\"shop-art-frame shop-art-frame-magic shop-art-frame-modal\">",
            "<img src=\"", item.image, "\" alt=\"", itemName, "\">",
            "</div>",
            "</div>",
            "<div class=\"shop-modal-copy\">",
            "<p class=\"panel-kicker\">Detalle del vestuario</p>",
            "<h2 id=\"shop-modal-title\">", itemName, "</h2>",
            "<p class=\"shop-modal-description\">", getItemDescription(item), "</p>",
            "<div class=\"shop-modal-tags\">",
            "<span class=\"shop-modal-tag\">", state.statusLabel, "</span>",
            "<span class=\"shop-modal-tag\">Costo: ", getPriceLabel(getItemCost(item)), "</span>",
            "<span class=\"shop-modal-tag\">Frase: ", itemSlogan, "</span>",
            "</div>",
            "<p class=\"shop-modal-note\">", getSupportCopy(state), "</p>",
            "<div class=\"shop-modal-actions\">",
            "<button class=\"shop-action", state.actionClass ? (" " + state.actionClass) : "", "\" type=\"button\" data-item-action=\"", item.id, "\"", state.actionDisabled ? " disabled" : "", ">",
            state.actionLabel,
            "</button>",
            "<a class=\"scene-button ghost\" href=\"p_opcionMultiple.html\">Conseguir XP</a>",
            "</div>",
            "</div>"
        ].join("");
    }

    function initializeTilt() {
        if (!window.VanillaTilt) {
            return;
        }

        gridRoot.querySelectorAll("[data-tilt-card]").forEach(function (card) {
            if (card.vanillaTilt) {
                card.vanillaTilt.destroy();
            }

            window.VanillaTilt.init(card, {
                max: 6,
                speed: 420,
                scale: 1.015,
                perspective: 1400,
                glare: false,
                gyroscope: false
            });
        });
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
            const itemCost = getItemCost(item);

            if (profile.xp < itemCost) {
                return;
            }

            profile.xp -= itemCost;
            profile.unlockedCharacters.push(itemId);
        }

        profile.equippedCharacter = itemId;
        window.CapyCore.saveProfile(profile);
        renderSidebarSkin(item);
        renderStore();
    }

    function getItemState(item, profile) {
        const owned = window.CapyCore.isUnlocked(item.id, profile);
        const equippedNow = profile.equippedCharacter === item.id;
        const itemCost = getItemCost(item);
        const affordable = profile.xp >= itemCost;
        const lockedPoints = Math.max(itemCost - profile.xp, 0);

        if (equippedNow) {
            return {
                owned: owned,
                equippedNow: equippedNow,
                affordable: affordable,
                lockedPoints: lockedPoints,
                statusLabel: "Equipado",
                statusTone: "is-equipped",
                actionLabel: "En uso",
                actionDisabled: true,
                actionClass: "is-equipped",
                metaNote: "Activo en tu perfil."
            };
        }

        if (owned) {
            return {
                owned: owned,
                equippedNow: equippedNow,
                affordable: affordable,
                lockedPoints: lockedPoints,
                statusLabel: "Desbloqueado",
                statusTone: "is-owned",
                actionLabel: "Equipar",
                actionDisabled: false,
                actionClass: "",
                metaNote: "Listo para equipar."
            };
        }

        if (affordable) {
            return {
                owned: owned,
                equippedNow: equippedNow,
                affordable: affordable,
                lockedPoints: lockedPoints,
                statusLabel: "Por comprar",
                statusTone: "is-buyable",
                actionLabel: "Comprar",
                actionDisabled: false,
                actionClass: "is-buyable",
                metaNote: "Compra disponible."
            };
        }

        return {
            owned: owned,
            equippedNow: equippedNow,
            affordable: affordable,
            lockedPoints: lockedPoints,
            statusLabel: "XP insuficiente",
            statusTone: "is-locked",
            actionLabel: "No alcanza",
            actionDisabled: true,
            actionClass: "is-locked",
            metaNote: "Te faltan XP " + window.CapyCore.formatNumber(lockedPoints) + "."
        };
    }

    function renderSidebarSkin(item) {
        document.querySelectorAll("[data-sidebar-skin]").forEach(function (element) {
            element.innerHTML = [
                "<a class=\"sidebar-skin-link\" data-interactive-tilt=\"sidebar-card\" href=\"perfil.html#profile-collection-section\">",
                "<p class=\"panel-kicker\">Vestuario activo</p>",
                "<div class=\"sidebar-skin-art\"><img src=\"", item.image, "\" alt=\"", getItemName(item), "\"></div>",
                "<div class=\"sidebar-skin-copy\">",
                "<strong>", getItemName(item), "</strong>",
                "<span>", getItemSlogan(item), "</span>",
                "</div>",
                "</a>"
            ].join("");
        });

        window.CapyCore.refreshInteractiveTilts();
    }

    function getPriceLabel(price) {
        return price === 0 ? "Gratis" : "XP " + window.CapyCore.formatNumber(price);
    }

    function getSupportCopy(state) {
        if (state.equippedNow) {
            return "Este es tu vestuario activo. Puedes cerrar esta ventana y seguir explorando la colecci&oacute;n.";
        }

        if (state.owned) {
            return "Ya forma parte de tu colecci&oacute;n. Equ&iacute;palo para cambiar el estilo de tu aventura.";
        }

        if (state.affordable) {
            return "Tienes puntos suficientes para desbloquearlo ahora mismo y sumarlo a tu equipo.";
        }

        return "Te faltan XP " + window.CapyCore.formatNumber(state.lockedPoints) + " para comprar este vestuario.";
    }

    function getItemDescription(item) {
        return item.descripcion || item.description || "Un vestuario decorativo para personalizar tu aventura en CapyCode.";
    }

    function getItemName(item) {
        return window.CapyCore.getItemName ? window.CapyCore.getItemName(item) : (item.nombre || item.name);
    }

    function getItemSlogan(item) {
        return window.CapyCore.getItemSlogan ? window.CapyCore.getItemSlogan(item) : (item.slogan || item.perk || item.frase);
    }

    function getItemCost(item) {
        return window.CapyCore.getItemCost ? window.CapyCore.getItemCost(item) : Number(item.costo || item.price || 0);
    }
}());
