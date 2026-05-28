(function () {
    // La tienda deriva todo su estado desde el catalogo y el perfil actual para
    // que comprar y equipar usen exactamente las mismas reglas que el backend.
    const gridRoot = document.getElementById("store-grid");
    const modalRoot = document.getElementById("shop-modal");
    const modalContentRoot = document.getElementById("shop-modal-content");
    const api = window.CapyApi;
    const viewHelpers = window.CapyViewHelpers;
    const LOCK_ICON_PATH = "assets/shop-lock-icon.svg";
    const SHOP_MUSIC_SRC = "assets/audio/shop/pizza-parlor.m4a";
    const uiAudio = createShopAudioSystem();
    let activeItemId = "";

    if (!gridRoot || !modalRoot || !modalContentRoot || !api || !window.CapyCore || !viewHelpers) {
        return;
    }

    renderStore();
    bindEvents();
    startAmbientAudio();

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
                state.blockedByRoute ? " is-route-locked" : "",
                "\" data-tilt-card=\"true\" aria-label=\"Vestuario ", escapeAttribute(item.name), "\">",
                "<span class=\"shop-card-glow\" aria-hidden=\"true\"></span>",
                "<div class=\"shop-card-top\">",
                "<span class=\"shop-card-status ", state.statusTone, "\">", state.statusLabel, "</span>",
                "<span class=\"shop-card-price\">", getPriceLabel(item.cost), "</span>",
                "</div>",
                "<div class=\"shop-art-frame shop-art-frame-magic\">",
                "<img src=\"", escapeAttribute(item.image), "\" alt=\"", escapeAttribute(item.name), "\">",
                state.blockedByRoute ? buildLockedArtMarkup(state) : "",
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
            uiAudio.startMusic();
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
            uiAudio.startMusic();
            if (document.querySelector(".shop-confirm-overlay")) {
                return;
            }
            if (event.key === "Escape" && !modalRoot.classList.contains("is-hidden")) {
                closeModal();
            }
        });
    }

    function startAmbientAudio() {
        uiAudio.startMusic();
        window.setTimeout(uiAudio.startMusic, 350);
        document.addEventListener("pointerdown", uiAudio.startMusic, { once: true });
        document.addEventListener("touchstart", uiAudio.startMusic, { once: true, passive: true });
        window.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                uiAudio.startMusic();
            }
        });
        window.addEventListener("beforeunload", uiAudio.stopMusic);
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
            state.blockedByRoute ? "<span class=\"shop-modal-tag\">Se habilita en " + escapeHtml(state.unlockRouteLabel) + "</span>" : "",
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
            if (!isDiscovered(item.id, profile)) {
                throw new Error(getLockedRouteMessage(item));
            }

            if (isUnlocked(item.id, profile)) {
                await api.equipOutfit(item.id);
                uiAudio.playEquip();
            } else {
                const confirmed = await requestPurchaseConfirmation(item);
                if (!confirmed) {
                    showStoreMessage("Compra cancelada.");
                    return;
                }
                await api.unlockOutfit(item.id);
                uiAudio.playPurchase();
            }

            renderStore();
        } catch (error) {
            showStoreMessage(error.message || "No se pudo completar la acción.");
        }
    }

    function getItemState(item, profile) {
        const owned = isUnlocked(item.id, profile);
        const discovered = isDiscovered(item.id, profile);
        const equippedNow = profile.currentOutfitId === item.id || profile.equippedCharacter === item.id;
        const affordable = profile.xp >= item.cost;
        const lockedPoints = Math.max(item.cost - profile.xp, 0);
        const unlockRouteLabel = getUnlockRouteLabel(item);

        if (equippedNow) {
            return {
                owned: owned,
                discovered: true,
                equippedNow: true,
                affordable: affordable,
                lockedPoints: lockedPoints,
                blockedByRoute: false,
                unlockRouteLabel: unlockRouteLabel,
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
                discovered: true,
                equippedNow: false,
                affordable: affordable,
                lockedPoints: lockedPoints,
                blockedByRoute: false,
                unlockRouteLabel: unlockRouteLabel,
                statusLabel: "Desbloqueado",
                statusTone: "is-owned",
                actionLabel: "Equipar",
                actionDisabled: false,
                actionClass: "",
                metaNote: "Listo para equipar."
            };
        }

        if (!discovered) {
            return {
                owned: false,
                discovered: false,
                equippedNow: false,
                affordable: affordable,
                lockedPoints: lockedPoints,
                blockedByRoute: true,
                unlockRouteLabel: unlockRouteLabel,
                statusLabel: "Bloqueado",
                statusTone: "is-route-locked",
                actionLabel: "No disponible",
                actionDisabled: true,
                actionClass: "is-route-locked",
                metaNote: getLockedRouteMessage(item)
            };
        }

        if (affordable) {
            return {
                owned: false,
                discovered: true,
                equippedNow: false,
                affordable: true,
                lockedPoints: 0,
                blockedByRoute: false,
                unlockRouteLabel: unlockRouteLabel,
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
            discovered: true,
            equippedNow: false,
            affordable: false,
            lockedPoints: lockedPoints,
            blockedByRoute: false,
            unlockRouteLabel: unlockRouteLabel,
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

        if (state.blockedByRoute) {
            return state.unlockRouteLabel
                ? "Completa " + state.unlockRouteLabel + " para habilitarlo en la tienda. Después aún deberás pagar su costo en XP."
                : "Todavía no has encontrado este vestuario dentro del recorrido.";
        }

        if (state.affordable) {
            return "Tienes XP suficiente para desbloquearlo. No se equipará automáticamente.";
        }

        return "Te faltan XP " + window.CapyCore.formatNumber(state.lockedPoints) + " para comprar este vestuario.";
    }

    function isUnlocked(itemId, profile) {
        return viewHelpers.isUnlockedOutfit(profile, itemId);
    }

    function buildLockedArtMarkup(state) {
        return [
            "<span class=\"shop-art-lock\" aria-hidden=\"true\">",
            "<span class=\"shop-art-lock-badge\">",
            "<span class=\"shop-art-lock-icon\"><img src=\"", LOCK_ICON_PATH, "\" alt=\"\"></span>",
            "<span class=\"shop-art-lock-label\">Sellado</span>",
            "</span>",
            "<span class=\"shop-art-lock-copy\">",
            "<strong>", escapeHtml(state.unlockRouteLabel || "Ruta pendiente"), "</strong>",
            "<span>Completa esta ruta para habilitar la compra.</span>",
            "</span>",
            "</span>"
        ].join("");
    }

    function isDiscovered(itemId, profile) {
        return viewHelpers.isDiscoveredOutfit(profile, itemId);
    }

    function getUnlockRouteLabel(item) {
        if (!item || !item.unlockRouteId) {
            return "";
        }

        return item.unlockRouteName
            ? ("Ruta " + item.unlockRouteId + " - " + item.unlockRouteName)
            : ("Ruta " + item.unlockRouteId);
    }

    function getLockedRouteMessage(item) {
        const unlockRouteLabel = getUnlockRouteLabel(item);
        return unlockRouteLabel
            ? "Completa " + unlockRouteLabel + " para habilitar este vestuario."
            : "Este vestuario todavía no está disponible.";
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

    function requestPurchaseConfirmation(item) {
        return new Promise(function (resolve) {
            const dialog = document.createElement("div");
            dialog.className = "shop-confirm-overlay";
            dialog.setAttribute("role", "presentation");
            dialog.innerHTML = [
                "<section class=\"glass-surface shop-confirm-card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"shop-confirm-title\">",
                "<p class=\"panel-kicker\">Confirmar compra</p>",
                "<h2 id=\"shop-confirm-title\">", escapeHtml(item.name), "</h2>",
                "<p class=\"shop-confirm-copy\">Vas a desbloquear este vestuario por <strong>", getPriceLabel(item.cost), "</strong>. Esta compra gastar&aacute; tu XP actual.</p>",
                "<div class=\"shop-confirm-actions\">",
                "<button class=\"scene-button ghost\" type=\"button\" data-shop-confirm=\"cancel\">Cancelar</button>",
                "<button class=\"scene-button primary\" type=\"button\" data-shop-confirm=\"accept\">Comprar</button>",
                "</div>",
                "</section>"
            ].join("");

            function finish(confirmed) {
                document.removeEventListener("keydown", onKeydown);
                dialog.remove();
                resolve(confirmed);
            }

            function onKeydown(event) {
                if (event.key === "Escape") {
                    finish(false);
                }
            }

            dialog.addEventListener("click", function (event) {
                const action = event.target.closest("[data-shop-confirm]");
                if (action) {
                    finish(action.dataset.shopConfirm === "accept");
                    return;
                }

                if (event.target === dialog) {
                    finish(false);
                }
            });

            document.addEventListener("keydown", onKeydown);
            document.body.appendChild(dialog);

            const acceptButton = dialog.querySelector("[data-shop-confirm=\"accept\"]");
            if (acceptButton) {
                acceptButton.focus();
            }
        });
    }

    function escapeHtml(value) {
        return viewHelpers.escapeHtml(value);
    }

    function escapeAttribute(value) {
        return viewHelpers.escapeAttribute(value);
    }
    function createShopAudioSystem() {
        let context = null;
        let backgroundPlayer = null;
        let sourceNode = null;
        let gainNode = null;
        let musicRequested = false;
        const musicVolume = 0.95;
        const musicGain = 3;
        const effectGainMultiplier = 25;

        function ensureContext() {
            if (!context) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) {
                    return null;
                }
                context = new AudioContext();
            }

            if (context.state === "suspended") {
                context.resume();
            }

            return context;
        }

        function ensureMusicGraph(player) {
            const ctx = ensureContext();
            if (!ctx || sourceNode) {
                return;
            }

            sourceNode = ctx.createMediaElementSource(player);
            gainNode = ctx.createGain();
            gainNode.gain.value = musicGain;
            sourceNode.connect(gainNode);
            gainNode.connect(ctx.destination);
        }

        function createBackgroundPlayer() {
            if (backgroundPlayer) {
                return backgroundPlayer;
            }

            backgroundPlayer = new Audio(SHOP_MUSIC_SRC);
            backgroundPlayer.autoplay = true;
            backgroundPlayer.loop = true;
            backgroundPlayer.preload = "auto";
            backgroundPlayer.playsInline = true;
            backgroundPlayer.volume = musicVolume;
            return backgroundPlayer;
        }

        function startMusic() {
            musicRequested = true;
            const player = createBackgroundPlayer();
            ensureMusicGraph(player);

            if (context && context.state === "suspended") {
                const resumePromise = context.resume();
                if (resumePromise && typeof resumePromise.catch === "function") {
                    resumePromise.catch(function () {});
                }
            }

            if (!player.paused) {
                return;
            }

            const playPromise = player.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    // Browsers may block unmuted autoplay until the first user gesture.
                });
            }
        }

        function stopMusic() {
            musicRequested = false;
            if (backgroundPlayer) {
                backgroundPlayer.pause();
                backgroundPlayer.currentTime = 0;
            }
        }

        function playTone(frequency, duration, type, gainValue, delayMs) {
            const ctx = ensureContext();
            if (!ctx) {
                return;
            }

            window.setTimeout(function () {
                const oscillator = ctx.createOscillator();
                const gain = ctx.createGain();
                oscillator.type = type || "sine";
                oscillator.frequency.value = frequency;
                // Los efectos de tienda se elevan varias veces por encima del
                // ajuste original para que sigan siendo audibles sobre la musica.
                gain.gain.setValueAtTime((gainValue || 0.08) * effectGainMultiplier, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                oscillator.connect(gain);
                gain.connect(ctx.destination);
                oscillator.start();
                oscillator.stop(ctx.currentTime + duration);
            }, delayMs || 0);
        }

        return {
            startMusic: startMusic,
            stopMusic: stopMusic,
            playPurchase: function () {
                if (musicRequested) {
                    startMusic();
                }
                playTone(392, 0.12, "triangle", 0.08, 0);
                playTone(523, 0.14, "triangle", 0.08, 90);
                playTone(659, 0.18, "sine", 0.09, 180);
            },
            playEquip: function () {
                if (musicRequested) {
                    startMusic();
                }
                playTone(523, 0.1, "sine", 0.07, 0);
                playTone(659, 0.16, "sine", 0.08, 80);
            }
        };
    }
}());

