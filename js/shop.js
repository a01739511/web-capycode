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
            const owned = window.CapyCore.isUnlocked(item.id, profile);
            const equippedNow = profile.equippedCharacter === item.id;

            return [
                "<button class=\"shop-item-card shop-item-tile",
                owned ? " is-owned" : "",
                equippedNow ? " is-equipped" : "",
                "\" type=\"button\" data-item-open=\"", item.id, "\" aria-haspopup=\"dialog\" aria-label=\"Ver detalles de ", item.name, "\">",
                "<span class=\"shop-card-glow\" aria-hidden=\"true\"></span>",
                "<div class=\"shop-art-frame shop-art-frame-magic\">",
                "<img src=\"", item.image, "\" alt=\"", item.name, "\">",
                "</div>",
                "<span class=\"shop-item-name\">", item.name, "</span>",
                "</button>"
            ].join("");
        }).join("");

        if (activeItemId) {
            renderModal(activeItemId);
        }

        window.CapyCore.updateHud();
    }

    function bindEvents() {
        gridRoot.addEventListener("click", function (event) {
            const trigger = event.target.closest("[data-item-open]");
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

        const owned = window.CapyCore.isUnlocked(item.id, profile);
        const equippedNow = profile.equippedCharacter === item.id;
        const affordable = profile.xp >= item.price;
        const buttonLabel = equippedNow ? "Equipado" : (owned ? "Equipar ahora" : (affordable ? "Desbloquear y equipar" : "Bloqueado"));
        const buttonDisabled = !owned && !affordable;
        const lockedPoints = Math.max(item.price - profile.xp, 0);
        const statusLabel = equippedNow ? "Vestuario activo" : (owned ? "Ya desbloqueado" : "Aun sellado");

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
            "<span class=\"shop-modal-tag\">", statusLabel, "</span>",
            "<span class=\"shop-modal-tag\">Costo: ", getPriceLabel(item.price), "</span>",
            "<span class=\"shop-modal-tag\">Afinidad: ", item.perk, "</span>",
            "</div>",
            "<p class=\"shop-modal-note\">", getSupportCopy(owned, equippedNow, affordable, lockedPoints), "</p>",
            "<div class=\"shop-modal-actions\">",
            "<button class=\"shop-action", equippedNow ? " is-equipped" : "", "\" type=\"button\" data-item-action=\"", item.id, "\"", buttonDisabled ? " disabled" : "", ">",
            buttonLabel,
            "</button>",
            "<a class=\"scene-button ghost\" href=\"p_opcionMultiple.html\">Conseguir XP</a>",
            "</div>",
            "</div>"
        ].join("");
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

    function getPriceLabel(price) {
        return price === 0 ? "Gratis" : "XP " + window.CapyCore.formatNumber(price);
    }

    function getSupportCopy(owned, equippedNow, affordable, lockedPoints) {
        if (equippedNow) {
            return "Este es tu compa&ntilde;ero activo. Puedes cerrar esta ventana y seguir explorando la colecci&oacute;n.";
        }

        if (owned) {
            return "Ya forma parte de tu colecci&oacute;n. Equ&iacute;palo para cambiar el estilo de tu aventura.";
        }

        if (affordable) {
            return "Tienes puntos suficientes para desbloquearlo ahora mismo y sumarlo a tu equipo.";
        }

        return "Te faltan XP " + window.CapyCore.formatNumber(lockedPoints) + " para romper el sello de este vestuario.";
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

        return descriptions[item.id] || ("Un compa&ntilde;ero de la academia con la afinidad especial de " + item.perk + ".");
    }
}());
