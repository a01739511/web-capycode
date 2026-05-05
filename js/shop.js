(function () {
    const gridRoot = document.getElementById("store-grid");
    const modalRoot = document.getElementById("shop-modal");
    const modalContentRoot = document.getElementById("shop-modal-content");
    const api = window.CapyApi;
    let activeItemId = "";

    if (!gridRoot || !modalRoot || !modalContentRoot || !api || !window.CapyCore) {
        return;
    }

    renderStore();
    bindEvents();

    function renderStore() {
        const profile = window.CapyCore.getProfile();
        const outfits = api.getOutfitsSync();

        gridRoot.innerHTML = outfits.map(function (item) {
            const state = getItemState(item, profile);

            return [
                "<article class=\"shop-item-card shop-item-tile",
                state.owned ? " is-owned" : "",
                state.equippedNow ? " is-equipped" : "",
                state.statusTone === "is-locked" ? " is-locked" : "",
                "\" data-tilt-card=\"true\" aria-label=\"Vestuario ", escapeAttribute(item.name), "\">",
                "<span class=\"shop-card-glow\" aria-hidden=\"true\"></span>",
                "<div class=\"shop-card-top\">",
                "<span class=\"shop-card-status ", state.statusTone, "\">", state.statusLabel, "</span>",
                "<span class=\"shop-card-price\">", getPriceLabel(item.cost), "</span>",
                "</div>",
                "<div class=\"shop-art-frame shop-art-frame-magic\">",
                "<img src=\"", escapeAttribute(item.image), "\" alt=\"", escapeAttribute(item.name), "\">",
                "</div>",
                "<div class=\"shop-item-copy\">",
                "<span class=\"shop-item-name\">", escapeHtml(item.name), "</span>",
                "<p class=\"shop-item-perk\">", escapeHtml(item.tagline), "</p>",
                "</div>",
                "<p class=\"shop-meta-note\">", escapeHtml(state.metaNote), "</p>",
                "<div class=\"shop-item-actions\">",
                "<button class=\"shop-action", state.actionClass ? (" " + state.actionClass) : "", "\" type=\"button\" data-item-action-inline=\"", item.id, "\"", state.actionDisabled ? " disabled" : "", ">",
                state.actionLabel,
                "</button>",
                "<button class=\"shop-secondary-action\" type=\"button\" data-item-open=\"", item.id, "\" aria-haspopup=\"dialog\" aria-label=\"Ver detalle de ", escapeAttribute(item.name), "\">Detalle</button>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        if (activeItemId) {
            renderModal(activeItemId);
        }

        window.CapyCore.updateHud();
        window.CapyCore.renderSidebarSkins();
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

            if (trigger) {
                openModal(trigger.dataset.itemOpen);
            }
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
        const item = api.getOutfitByIdSync(itemId);

        if (!item) {
            return;
        }

        const state = getItemState(item, profile);

        modalContentRoot.innerHTML = [
            "<div class=\"shop-modal-media\">",
            "<div class=\"shop-art-frame shop-art-frame-magic shop-art-frame-modal\">",
            "<img src=\"", escapeAttribute(item.image), "\" alt=\"", escapeAttribute(item.name), "\">",
            "</div>",
            "</div>",
            "<div class=\"shop-modal-copy\">",
            "<p class=\"panel-kicker\">Detalle del vestuario</p>",
            "<h2 id=\"shop-modal-title\">", escapeHtml(item.name), "</h2>",
            "<p class=\"shop-modal-description\">", escapeHtml(item.description), "</p>",
            "<div class=\"shop-modal-tags\">",
            "<span class=\"shop-modal-tag\">", state.statusLabel, "</span>",
            "<span class=\"shop-modal-tag\">Costo: ", getPriceLabel(item.cost), "</span>",
            "<span class=\"shop-modal-tag\">Frase: ", escapeHtml(item.tagline), "</span>",
            "</div>",
            "<p class=\"shop-modal-note\">", escapeHtml(getSupportCopy(state)), "</p>",
            "<div class=\"shop-modal-actions\">",
            "<button class=\"shop-action", state.actionClass ? (" " + state.actionClass) : "", "\" type=\"button\" data-item-action=\"", item.id, "\"", state.actionDisabled ? " disabled" : "", ">",
            state.actionLabel,
            "</button>",
            "<a class=\"scene-button ghost\" href=\"mapa.html\">Conseguir XP</a>",
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

    async function handleAction(itemId) {
        const profile = window.CapyCore.getProfile();
        const item = api.getOutfitByIdSync(itemId);

        if (!item) {
            return;
        }

        try {
            if (isUnlocked(item.id, profile)) {
                await api.equipOutfit(item.id);
            } else {
                await api.unlockOutfit(item.id);
            }

            renderStore();
        } catch (error) {
            showStoreMessage(error.message || "No se pudo completar la accion.");
        }
    }

    function getItemState(item, profile) {
        const owned = isUnlocked(item.id, profile);
        const equippedNow = profile.currentOutfitId === item.id || profile.equippedCharacter === item.id;
        const affordable = profile.xp >= item.cost;
        const lockedPoints = Math.max(item.cost - profile.xp, 0);

        if (equippedNow) {
            return {
                owned: owned,
                equippedNow: true,
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
                owned: true,
                equippedNow: false,
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
                owned: false,
                equippedNow: false,
                affordable: true,
                lockedPoints: 0,
                statusLabel: "Por comprar",
                statusTone: "is-buyable",
                actionLabel: "Comprar",
                actionDisabled: false,
                actionClass: "is-buyable",
                metaNote: "Compra disponible."
            };
        }

        return {
            owned: false,
            equippedNow: false,
            affordable: false,
            lockedPoints: lockedPoints,
            statusLabel: "XP insuficiente",
            statusTone: "is-locked",
            actionLabel: "No alcanza",
            actionDisabled: true,
            actionClass: "is-locked",
            metaNote: "Te faltan XP " + window.CapyCore.formatNumber(lockedPoints) + "."
        };
    }

    function getPriceLabel(price) {
        return Number(price) === 0 ? "Gratis" : "XP " + window.CapyCore.formatNumber(price);
    }

    function getSupportCopy(state) {
        if (state.equippedNow) {
            return "Este es tu vestuario activo.";
        }

        if (state.owned) {
            return "Ya forma parte de tu colección. Equípalo para cambiar el estilo.";
        }

        if (state.affordable) {
            return "Tienes XP suficiente para desbloquearlo. No se equipara automaticamente.";
        }

        return "Te faltan XP " + window.CapyCore.formatNumber(state.lockedPoints) + " para comprar este vestuario.";
    }

    function isUnlocked(itemId, profile) {
        const unlocked = profile.unlockedOutfitIds || profile.unlockedCharacters || [];
        return unlocked.includes(itemId);
    }

    function showStoreMessage(text) {
        const message = document.createElement("div");
        message.className = "store-toast";
        message.textContent = text;
        document.body.appendChild(message);

        window.setTimeout(function () {
            message.remove();
        }, 2600);
    }

    function escapeHtml(value) {
        return window.CapyCore.escapeHtml(value);
    }

    function escapeAttribute(value) {
        return window.CapyCore.escapeAttribute(value);
    }
}());
