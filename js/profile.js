(function () {
    const heroRoot = document.getElementById("profile-hero");
    const collectionRoot = document.getElementById("profile-collection");
    const collectionCountRoot = document.getElementById("profile-collection-count");
    const badgesRoot = document.getElementById("profile-badges");
    const api = window.CapyApi;
    let activeCollectionId = "";

    if (!heroRoot || !collectionRoot || !collectionCountRoot || !badgesRoot || !api || !window.CapyCore) {
        return;
    }

    renderProfile();
    bindCollectionActions();
    bindHeroActions();

    function renderProfile() {
        const profile = window.CapyCore.getProfile();
        const equipped = api.getOutfitByIdSync(profile.currentOutfitId) || api.getOutfitsSync()[0];
        const unlockedItems = getUnlockedItems(profile);
        const route = api.getCurrentRouteForUserSync(profile);
        const totalLevels = api.getTotalLevelCountSync();
        const isGameCompleted = profile.currentLevelId === totalLevels + 1;
        const routeCopy = isGameCompleted ? "Juego completado" : (route ? route.name : "Ruta actual");

        if (!activeCollectionId || !isUnlocked(activeCollectionId, profile)) {
            activeCollectionId = equipped.id;
        }

        heroRoot.innerHTML = [
            "<article class=\"profile-hero-card glass-surface\">",
            "<div class=\"profile-hero-copy\">",
            "<p class=\"panel-kicker\">Perfil del usuario</p>",
            "<h2 data-player-name></h2>",
            "<p class=\"profile-title\" data-player-title></p>",
            "<div class=\"profile-metrics\">",
            "<div class=\"profile-metric-card\"><span>Nivel actual</span><strong data-player-level></strong></div>",
            "<div class=\"profile-metric-card has-icon\"><img src=\"assets/hud-streak.svg\" alt=\"\" aria-hidden=\"true\"><span>Racha</span><strong data-player-streak></strong></div>",
            "<div class=\"profile-metric-card has-icon\"><img src=\"assets/hud-xp.svg\" alt=\"\" aria-hidden=\"true\"><span>XP</span><strong data-player-xp></strong></div>",
            "</div>",
            "<p class=\"profile-note\">Ruta mostrada: ", escapeHtml(routeCopy), ". Vestuario activo: ", escapeHtml(equipped.name), ".</p>",
            "<div class=\"profile-account-actions\" aria-label=\"Acciones de cuenta\">",
            "<button class=\"scene-button ghost compact\" type=\"button\" data-profile-open=\"username\">Cambiar nombre de usuario</button>",
            "<button class=\"scene-button ghost compact\" type=\"button\" data-profile-open=\"password\">Cambiar contrase&ntilde;a</button>",
            "</div>",
            "<div class=\"profile-hero-actions\">",
            "<button class=\"scene-button danger\" type=\"button\" data-action=\"logout\">Cerrar sesi&oacute;n</button>",
            "</div>",
            "</div>",
            "<div class=\"profile-hero-stage\">",
            "<div class=\"profile-hero-art-shell\">",
            "<span class=\"profile-hero-art-glow\" aria-hidden=\"true\"></span>",
            "<img src=\"", escapeAttribute(getTransparentImage(equipped)), "\" alt=\"", escapeAttribute(equipped.name), "\">",
            "</div>",
            "</div>",
            "</article>"
        ].join("");

        collectionCountRoot.textContent = unlockedItems.length + "/" + api.getOutfitsSync().length;
        renderCollection(profile);
        renderBadges(profile);
        window.CapyCore.updateHud();
    }

    function renderBadges(profile) {
        const routes = api.getRoutesSync();
        const unlockedRouteIds = getUnlockedRouteBadgeIds(profile);

        badgesRoot.innerHTML = routes.map(function (route) {
            const unlocked = unlockedRouteIds.includes(route.id);

            return [
                "<article class=\"badge-card",
                unlocked ? " is-unlocked" : " is-locked",
                "\">",
                "<div class=\"badge-card-art\">",
                "<img src=\"", escapeAttribute(route.badgeImage || "assets/tec-emblem.svg"), "\" alt=\"", escapeAttribute(route.name), "\">",
                "</div>",
                "<div class=\"badge-card-copy\">",
                "<span class=\"badge-card-state\">", unlocked ? "Encontrada" : "No encontrada", "</span>",
                "<h3>", escapeHtml(route.name), "</h3>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    function getUnlockedRouteBadgeIds(profile) {
        if (Array.isArray(profile.unlockedBadgeRouteIds) && profile.unlockedBadgeRouteIds.length) {
            return profile.unlockedBadgeRouteIds.map(Number);
        }

        const levelsPerRoute = 7;
        const highestCompletedLevel = Math.max(0, Math.min(api.getTotalLevelCountSync(), Number(profile.currentLevelId || 1) - 1));

        return api.getRoutesSync().filter(function (route) {
            return highestCompletedLevel >= route.orderIndex * levelsPerRoute;
        }).map(function (route) {
            return Number(route.id);
        });
    }

    function renderCollection(profile) {
        const unlockedItems = getUnlockedItems(profile);

        if (!unlockedItems.length) {
            collectionRoot.innerHTML = "<p class=\"profile-note\">Aún no hay vestuarios desbloqueados.</p>";
            return;
        }

        const currentIndex = Math.max(0, unlockedItems.findIndex(function (item) {
            return item.id === activeCollectionId;
        }));
        const currentItem = unlockedItems[currentIndex] || unlockedItems[0];
        const previousItem = unlockedItems[(currentIndex - 1 + unlockedItems.length) % unlockedItems.length] || currentItem;
        const nextItem = unlockedItems[(currentIndex + 1) % unlockedItems.length] || currentItem;
        const hasMultipleItems = unlockedItems.length > 1;
        const hasSideItems = unlockedItems.length > 2;
        const equippedNow = currentItem.id === profile.currentOutfitId;

        collectionRoot.innerHTML = [
            "<div class=\"collection-carousel-main",
            !hasMultipleItems ? " has-single-item" : (!hasSideItems ? " has-two-items" : ""),
            "\">",
            hasMultipleItems ? "<button class=\"collection-nav\" type=\"button\" data-collection-nav=\"prev\" aria-label=\"Mostrar vestuario anterior\">&#8249;</button>" : "",
            hasSideItems ? buildSideCard(previousItem, "prev") : "",
            "<article class=\"collection-focus-card", equippedNow ? " is-equipped" : "", "\" data-interactive-tilt=\"shop-card\">",
            "<span class=\"collection-focus-glow\" aria-hidden=\"true\"></span>",
            "<div class=\"collection-focus-art\">",
            "<img src=\"", escapeAttribute(getTransparentImage(currentItem)), "\" alt=\"", escapeAttribute(currentItem.name), "\">",
            "</div>",
            "<div class=\"collection-focus-copy\">",
            "<div class=\"collection-focus-summary\">",
            "<span class=\"collection-status\">", equippedNow ? "Equipado" : "Desbloqueado", "</span>",
            "<h3>", escapeHtml(currentItem.name), "</h3>",
            "<p class=\"collection-focus-perk\">", escapeHtml(currentItem.tagline), "</p>",
            "<p class=\"collection-focus-description\">", escapeHtml(currentItem.description), "</p>",
            "</div>",
            "<div class=\"collection-focus-actions\">",
            "<div class=\"collection-focus-price-block\">",
            "<span class=\"collection-focus-price-label\">", currentItem.cost === 0 ? "Estado" : "Costo", "</span>",
            "<strong>", currentItem.cost === 0 ? "Vestuario base" : ("XP " + window.CapyCore.formatNumber(currentItem.cost)), "</strong>",
            "</div>",
            "<button class=\"shop-action", equippedNow ? " is-equipped" : "", "\" type=\"button\" data-collection-equip=\"", currentItem.id, "\"", equippedNow ? " disabled" : "", ">",
            equippedNow ? "Equipado" : "Equipar",
            "</button>",
            "</div>",
            "</div>",
            "</article>",
            hasSideItems ? buildSideCard(nextItem, "next") : "",
            hasMultipleItems ? "<button class=\"collection-nav\" type=\"button\" data-collection-nav=\"next\" aria-label=\"Mostrar vestuario siguiente\">&#8250;</button>" : "",
            "</div>",
            hasMultipleItems ? "<div class=\"collection-carousel-dots\">" : "",
            hasMultipleItems ? unlockedItems.map(function (item) {
                return [
                    "<button class=\"collection-dot", item.id === currentItem.id ? " is-active" : "", "\" type=\"button\" data-collection-select=\"", item.id, "\" aria-label=\"Ver ", escapeAttribute(item.name), "\"></button>"
                ].join("");
            }).join("") : "",
            hasMultipleItems ? "</div>" : ""
        ].join("");

        window.CapyCore.refreshInteractiveTilts();
    }

    function buildSideCard(item, variant) {
        return [
            "<button class=\"collection-side-card is-", variant, "\" type=\"button\" data-collection-select=\"", item.id, "\" aria-label=\"Ver ", escapeAttribute(item.name), "\">",
            "<div class=\"collection-side-art\">",
            "<img src=\"", escapeAttribute(getTransparentImage(item)), "\" alt=\"", escapeAttribute(item.name), "\">",
            "</div>",
            "<div class=\"collection-side-copy\">",
            "<h4>", escapeHtml(item.name), "</h4>",
            "<p>", escapeHtml(item.tagline), "</p>",
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
            const profileDialogButton = event.target.closest("[data-profile-open]");

            if (logoutButton) {
                window.CapyCore.logout();
                return;
            }

            if (profileDialogButton) {
                openProfileDialog(profileDialogButton.dataset.profileOpen);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeProfileDialog();
            }
        });
    }

    function openProfileDialog(type) {
        closeProfileDialog();

        const profile = window.CapyCore.getProfile();
        const overlay = document.createElement("div");
        overlay.className = "profile-dialog-overlay";
        overlay.dataset.profileDialog = type;
        overlay.innerHTML = type === "password" ? buildPasswordDialog() : buildUsernameDialog(profile);

        document.body.appendChild(overlay);
        document.body.classList.add("is-modal-open");

        overlay.addEventListener("click", function (event) {
            if (event.target.closest("[data-profile-close]") || event.target === overlay) {
                closeProfileDialog();
            }
        });

        overlay.addEventListener("submit", async function (event) {
            event.preventDefault();
            const form = event.target.closest("[data-profile-form]");
            if (!form) {
                return;
            }

            if (form.dataset.profileForm === "password") {
                await submitPasswordForm(form, overlay);
                return;
            }

            await submitUsernameForm(form, overlay);
        });

        const firstInput = overlay.querySelector("input");
        if (firstInput) {
            firstInput.focus();
            firstInput.select();
        }
    }

    function closeProfileDialog() {
        document.querySelectorAll("[data-profile-dialog]").forEach(function (overlay) {
            overlay.remove();
        });
        document.body.classList.remove("is-modal-open");
    }

    function buildUsernameDialog(profile) {
        return [
            "<section class=\"profile-dialog-card glass-surface\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"profile-dialog-title\">",
            "<button class=\"profile-dialog-close\" type=\"button\" aria-label=\"Cerrar\" data-profile-close>&times;</button>",
            "<p class=\"panel-kicker\">Cuenta</p>",
            "<h2 id=\"profile-dialog-title\">Cambiar usuario</h2>",
            "<p class=\"profile-dialog-copy\">Usa un nombre unico de entre " + api.USERNAME_MIN_LENGTH + " y " + api.USERNAME_MAX_LENGTH + " caracteres.</p>",
            "<form class=\"profile-dialog-form\" data-profile-form=\"username\">",
            "<label>Nuevo usuario",
            "<input class=\"magic-input\" name=\"username\" value=\"", escapeAttribute(profile.username), "\" autocomplete=\"username\" minlength=\"", api.USERNAME_MIN_LENGTH, "\" maxlength=\"", api.USERNAME_MAX_LENGTH, "\">",
            "</label>",
            "<p class=\"profile-form-message\" data-profile-message></p>",
            "<div class=\"profile-dialog-actions\">",
            "<button class=\"scene-button ghost\" type=\"button\" data-profile-close>Cancelar</button>",
            "<button class=\"scene-button primary\" type=\"submit\">Guardar</button>",
            "</div>",
            "</form>",
            "</section>"
        ].join("");
    }

    function buildPasswordDialog() {
        return [
            "<section class=\"profile-dialog-card glass-surface\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"profile-dialog-title\">",
            "<button class=\"profile-dialog-close\" type=\"button\" aria-label=\"Cerrar\" data-profile-close>&times;</button>",
            "<p class=\"panel-kicker\">Seguridad</p>",
            "<h2 id=\"profile-dialog-title\">Cambiar contrase&ntilde;a</h2>",
            "<p class=\"profile-dialog-copy\">Confirma tu contrasena actual y escribe una nueva de entre " + api.PASSWORD_MIN_LENGTH + " y " + api.PASSWORD_MAX_LENGTH + " caracteres.</p>",
            "<form class=\"profile-dialog-form\" data-profile-form=\"password\">",
            "<label>Contrase&ntilde;a actual",
            "<input class=\"magic-input\" name=\"currentPassword\" type=\"password\" autocomplete=\"current-password\" minlength=\"", api.PASSWORD_MIN_LENGTH, "\" maxlength=\"", api.PASSWORD_MAX_LENGTH, "\">",
            "</label>",
            "<label>Nueva contrase&ntilde;a",
            "<input class=\"magic-input\" name=\"newPassword\" type=\"password\" autocomplete=\"new-password\" minlength=\"", api.PASSWORD_MIN_LENGTH, "\" maxlength=\"", api.PASSWORD_MAX_LENGTH, "\">",
            "</label>",
            "<p class=\"profile-form-message\" data-profile-message></p>",
            "<div class=\"profile-dialog-actions\">",
            "<button class=\"scene-button ghost\" type=\"button\" data-profile-close>Cancelar</button>",
            "<button class=\"scene-button primary\" type=\"submit\">Guardar</button>",
            "</div>",
            "</form>",
            "</section>"
        ].join("");
    }

    async function submitUsernameForm(form, overlay) {
        const formData = new FormData(form);
        const username = String(formData.get("username") || "").trim();

        try {
            api.validateUsername(username);
            setFormBusy(form, true);
            await api.updateUsername(username);
            closeProfileDialog();
            renderProfile();
            showProfileToast("Usuario actualizado.");
        } catch (error) {
            showProfileMessage(overlay, error.message || "No se pudo actualizar.", "error");
        } finally {
            setFormBusy(form, false);
        }
    }

    async function submitPasswordForm(form, overlay) {
        const formData = new FormData(form);
        const currentPassword = String(formData.get("currentPassword") || "");
        const newPassword = String(formData.get("newPassword") || "");

        try {
            api.validatePassword(currentPassword);
            api.validatePassword(newPassword);
            setFormBusy(form, true);
            await api.updatePassword(currentPassword, newPassword);
            closeProfileDialog();
            showProfileToast("Contraseña actualizada.");
        } catch (error) {
            showProfileMessage(overlay, error.message || "No se pudo actualizar.", "error");
        } finally {
            setFormBusy(form, false);
        }
    }

    function showProfileMessage(overlay, text, tone) {
        const message = overlay && overlay.querySelector("[data-profile-message]");
        if (!message) {
            return;
        }

        message.textContent = text;
        message.className = "profile-form-message is-" + tone;
    }

    function showProfileToast(text) {
        const toast = document.createElement("div");
        toast.className = "store-toast";
        toast.textContent = text;
        document.body.appendChild(toast);
        window.setTimeout(function () {
            toast.remove();
        }, 2200);
    }

    function setFormBusy(form, isBusy) {
        form.querySelectorAll("input, button").forEach(function (control) {
            control.disabled = isBusy;
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

    async function equipItem(itemId) {
        try {
            await api.equipOutfit(itemId);
            activeCollectionId = itemId;
            window.CapyCore.renderSidebarSkins();
            renderProfile();
        } catch (error) {
            showProfileToast(error.message || "No se pudo equipar.");
        }
    }

    function getUnlockedItems(profile) {
        return api.getOutfitsSync().filter(function (item) {
            return isUnlocked(item.id, profile);
        });
    }

    function isUnlocked(itemId, profile) {
        const unlocked = profile.unlockedOutfitIds || profile.unlockedCharacters || [];
        return unlocked.includes(itemId);
    }

    function getTransparentImage(item) {
        return item.transparentImage || item.image;
    }

    function escapeHtml(value) {
        return window.CapyCore.escapeHtml(value);
    }

    function escapeAttribute(value) {
        return window.CapyCore.escapeAttribute(value);
    }
}());
