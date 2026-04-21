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

            return [
                "<article class=\"shop-item-card shop-item-tile",
                state.owned ? " is-owned" : "",
                state.equippedNow ? " is-equipped" : "",
                state.statusTone === "is-locked" ? " is-locked" : "",
                "\" data-tilt-card=\"true\" aria-label=\"Vestuario ", item.name, "\">",
                "<span class=\"shop-card-glow\" aria-hidden=\"true\"></span>",
                "<div class=\"shop-card-top\">",
                "<span class=\"shop-card-status ", state.statusTone, "\">", state.statusLabel, "</span>",
                "<span class=\"shop-card-price\">", getPriceLabel(item.price), "</span>",
                "</div>",
                "<div class=\"shop-art-frame shop-art-frame-magic\">",
                "<img src=\"", item.image, "\" alt=\"", item.name, "\">",
                "</div>",
                "<div class=\"shop-item-copy\">",
                "<span class=\"shop-item-name\">", item.name, "</span>",
                "<p class=\"shop-item-perk\">", item.perk, "</p>",
                "</div>",
                "<p class=\"shop-meta-note\">", state.metaNote, "</p>",
                "<div class=\"shop-item-actions\">",
                "<button class=\"shop-action", state.actionClass ? (" " + state.actionClass) : "", "\" type=\"button\" data-item-action-inline=\"", item.id, "\"", state.actionDisabled ? " disabled" : "", ">",
                state.actionLabel,
                "</button>",
                "<button class=\"shop-secondary-action\" type=\"button\" data-item-open=\"", item.id, "\" aria-haspopup=\"dialog\" aria-label=\"Ver detalle de ", item.name, "\">Detalle</button>",
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

        modalContentRoot.innerHTML = [
            "<div class=\"shop-modal-media\">",
            "<div class=\"shop-art-frame shop-art-frame-magic shop-art-frame-modal\">",
            "<img src=\"", item.image, "\" alt=\"", item.name, "\">",
            "</div>",
            "</div>",
            "<div class=\"shop-modal-copy\">",
            "<p class=\"panel-kicker\">Detalle del vestuario</p>",
            "<h2 id=\"shop-modal-title\">", item.name, "</h2>",
            "<p class=\"shop-modal-description\">", getItemDescription(item), "</p>",
            "<div class=\"shop-modal-tags\">",
            "<span class=\"shop-modal-tag\">", state.statusLabel, "</span>",
            "<span class=\"shop-modal-tag\">Costo: ", getPriceLabel(item.price), "</span>",
            "<span class=\"shop-modal-tag\">Afinidad: ", item.perk, "</span>",
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
            if (profile.xp < item.price) {
                return;
            }

            profile.xp -= item.price;
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
        const affordable = profile.xp >= item.price;
        const lockedPoints = Math.max(item.price - profile.xp, 0);

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
                "<a class=\"sidebar-skin-link\" href=\"perfil.html#profile-collection-section\">",
                "<p class=\"panel-kicker\">Vestuario activo</p>",
                "<div class=\"sidebar-skin-art\"><img src=\"", item.image, "\" alt=\"", item.name, "\"></div>",
                "<div class=\"sidebar-skin-copy\">",
                "<strong>", item.name, "</strong>",
                "<span>", item.perk, "</span>",
                "</div>",
                "</a>"
            ].join("");
        });
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

        return "Te faltan XP " + window.CapyCore.formatNumber(state.lockedPoints) + " para romper el sello de este vestuario.";
    }

    function getItemDescription(item) {
        const descriptions = {
            CapyBlack: "La capibara de las sombras elegantes. Camina entre runas violetas y abre el camino para los primeros aprendices del bosque.",
            CapyAqua: "Guardi&aacute;n de corrientes tranquilas que transforma cada reto en una ola de enfoque y fluidez.",
            CapyKing: "Un soberano arcano con capa real, cetro brillante y la serenidad de quien domina los salones encantados.",
            CapyExplorer: "Inventor del vapor m&iacute;stico, experto en engranajes antiguos y rutas secretas ocultas entre portales.",
            CapyCandy: "Hechicera de dulces destellos que convierte la energ&iacute;a del estudio en chispas de color y confianza.",
            CapyRuna: "Custodio de grimorios ancestrales que protege los secretos del bosque con runas antiguas y sabidur&iacute;a paciente.",
            CapySun: "Mensajera del amanecer m&aacute;gico, ideal para quienes avanzan con decisi&oacute;n y una luz serena en cada nivel.",
            CapyEarth: "Defensor del coraz&oacute;n del bosque, resistente y firme cuando las misiones exigen constancia total.",
            CapyConstelation: "Viajero estelar que lee mapas del cielo y encuentra respuestas donde otros solo ven oscuridad."
        };

        return descriptions[item.id] || ("Un vestuario de la academia con la afinidad especial de " + item.perk + ".");
    }
}());
