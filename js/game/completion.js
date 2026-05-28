(function () {
    // Los overlays de resultado viven aparte para que ganar, perder y celebrar
    // el progreso no contaminen la logica principal del runner.
    function buildRetryActionMarkup(label, helpers) {
        const escapeAttribute = helpers && helpers.escapeAttribute ? helpers.escapeAttribute : String;
        const escapeHtml = helpers && helpers.escapeHtml ? helpers.escapeHtml : String;

        return [
            "<button class=\"scene-button ghost icon-only-action\" type=\"button\" data-retry-level aria-label=\"", escapeAttribute(label), "\" title=\"", escapeAttribute(label), "\">",
            "<img src=\"assets/icons/retry-level.svg\" alt=\"\" aria-hidden=\"true\">",
            "<span class=\"sr-only\">", escapeHtml(label), "</span>",
            "</button>"
        ].join("");
    }

    function createRuntime(options) {
        const settings = options || {};
        const api = settings.api;
        const audio = settings.audio;
        const level = settings.level;
        const startAttempt = settings.startAttempt || function () {};
        const unlockAllLevelsForPreview = Boolean(settings.unlockAllLevelsForPreview);
        const escapeHtml = settings.escapeHtml || function (value) {
            return String(value || "");
        };
        const escapeAttribute = settings.escapeAttribute || escapeHtml;
        let answerPopupTimer = 0;

        function showCompletionOverlay(outcome) {
            clearCompletionOverlay();

            // El resultado puede venir como practica, cierre de ruta o cierre
            // total del juego; aqui se arma una sola vista con esas variantes.
            const practice = outcome && outcome.practice;
            const reward = outcome && outcome.reward ? Number(outcome.reward) : 0;
            const celebrationOutfits = getCelebrationOutfits(outcome);
            const nextHref = getNextLevelHref(outcome);
            const streakCelebration = outcome && outcome.streakCelebration;
            const storyBeat = outcome && outcome.storyBeat;
            const title = outcome && outcome.gameCompleted
                ? "Juego completado"
                : (outcome && outcome.routeCompleted ? "Ruta completada" : (practice ? "Práctica completada" : "Nivel completado"));
            const copy = outcome && outcome.gameCompleted
                ? "Terminaste todos los niveles disponibles. Desde ahora puedes repetirlos como práctica."
                : (outcome && outcome.routeCompleted ? "Se desbloqueó la siguiente ruta. Puedes continuar desde el mapa." : (practice ? "Este intento fue de práctica, por eso no modifica XP ni racha." : "Ganaste XP y avanzaste al siguiente nivel."));
            const completionKind = outcome && outcome.gameCompleted
                ? "game-completed"
                : (outcome && outcome.routeCompleted ? "route-completed" : (practice ? "practice" : "level-completed"));
            const retryMarkup = buildCompletionLeadMarkup({
                practice: practice,
                outcome: outcome
            });

            const overlay = document.createElement("div");
            overlay.className = "completion-overlay";
            overlay.innerHTML = [
                "<span class=\"completion-spotlight\" aria-hidden=\"true\"></span>",
                buildCompletionRadiance(),
                "<section class=\"completion-screen", practice ? " is-practice" : "", " is-", completionKind, "\" role=\"dialog\" aria-modal=\"true\">",
                buildConfetti(),
                "<div class=\"completion-screen-copy\">",
                "<p class=\"panel-kicker\">", practice ? "Práctica" : "Progreso guardado", "</p>",
                "<h2>", escapeHtml(title), "</h2>",
                "<p class=\"completion-subtitle\">", escapeHtml(copy), "</p>",
                reward ? "<p class=\"level-reward-pill\">+" + window.CapyCore.formatNumber(reward) + " XP</p>" : "",
                retryMarkup,
                buildCompletionDialogMarkup(storyBeat, copy, completionKind),
                buildStreakCelebrationMarkup(streakCelebration),
                buildOutfitDiscoveryShowcase(celebrationOutfits),
                "<div class=\"completion-actions is-two-actions\">",
                "<a class=\"scene-button completion-map-button\" href=\"mapa.html\">Volver al mapa</a>",
                "<a class=\"scene-button completion-next-button\" href=\"", escapeAttribute(nextHref), "\">Siguiente</a>",
                "</div>",
                "</div>",
                "</section>"
            ].join("");

            document.body.appendChild(overlay);
            document.body.classList.add("quiz-complete");

            if (celebrationOutfits.length && audio && audio.playUnlock) {
                audio.playUnlock();
            }

            bindRetryButtons(overlay);
        }

        function showGameOverOverlay() {
            clearCompletionOverlay();
            clearAnswerPopup();

            const overlay = document.createElement("div");
            overlay.className = "completion-overlay is-game-over";
            overlay.innerHTML = [
                "<span class=\"completion-spotlight\" aria-hidden=\"true\"></span>",
                buildCompletionRadiance(),
                "<section class=\"completion-screen is-game-over\" role=\"dialog\" aria-modal=\"true\">",
                "<div class=\"completion-screen-art\">",
                "<img src=\"assets/characters/Capythilda.webp\" alt=\"Capythilda\">",
                "</div>",
                "<div class=\"completion-screen-copy\">",
                "<p class=\"panel-kicker\">Tiempo agotado</p>",
                "<h2>Game Over</h2>",
                "<p class=\"completion-lead\">El intento terminó porque se agotó el tiempo del ejercicio. Puedes reiniciar el nivel o volver al mapa.</p>",
                "<div class=\"completion-actions\">",
                "<a class=\"scene-button ghost\" href=\"mapa.html\">Salir al mapa</a>",
                "<button class=\"scene-button primary\" type=\"button\" data-retry-level>Reiniciar nivel</button>",
                "</div>",
                "</div>",
                "</section>"
            ].join("");

            document.body.appendChild(overlay);
            document.body.classList.add("quiz-complete");

            if (audio && audio.playGameOver) {
                audio.playGameOver();
            }

            bindRetryButtons(overlay);
        }

        function getNextLevelHref(outcome) {
            const totalLevels = api.getTotalLevelCountSync();
            const profile = window.CapyCore.getProfile();
            const outcomeNextId = outcome && Number(outcome.nextLevelId);
            const sequentialNextId = level.id + 1;
            const nextLevelId = outcome && outcome.practice ? sequentialNextId : (outcomeNextId || sequentialNextId);

            if (!Number.isFinite(nextLevelId) || nextLevelId > totalLevels) {
                return "mapa.html";
            }

            if (!unlockAllLevelsForPreview &&
                profile.currentLevelId !== totalLevels + 1 &&
                nextLevelId > profile.currentLevelId) {
                return "mapa.html";
            }

            const nextLevel = api.getLevelByIdSync(nextLevelId);
            return nextLevel ? nextLevel.href : "mapa.html";
        }

        function buildCompletionRadiance() {
            const rings = [1, 2, 3, 4].map(function (index) {
                return "<span class=\"celebration-ring celebration-ring-" + index + "\"></span>";
            }).join("");
            const rays = Array.from({ length: 18 }).map(function (_, index) {
                return "<span class=\"celebration-ray\" style=\"--ray-index:" + index + "\"></span>";
            }).join("");
            const sparks = Array.from({ length: 22 }).map(function (_, index) {
                const distance = 90 + (index % 7) * 28;
                const duration = 2.4 + (index % 5) * 0.22;

                return [
                    "<span class=\"celebration-spark\" style=\"--spark-index:", index,
                    "; --spark-distance:", distance, "px; --spark-duration:", duration, "s\"></span>"
                ].join("");
            }).join("");

            return [
                "<div class=\"completion-radiance\" aria-hidden=\"true\">",
                rings,
                rays,
                sparks,
                "</div>"
            ].join("");
        }

        function buildConfetti() {
            return [
                "<div class=\"completion-confetti\" aria-hidden=\"true\">",
                Array.from({ length: 34 }).map(function (_, index) {
                    const pieceType = index % 11 === 0 ? " is-star" : (index % 5 === 0 ? " is-ribbon" : (index % 3 === 0 ? " is-dot" : ""));
                    return [
                        "<span class=\"confetti-piece confetti-piece-", (index % 8) + 1, pieceType,
                        "\" style=\"--piece-index:", index,
                        "; --lane:", (index * 17) % 100,
                        "; --piece-size:", 7 + (index % 4), "px",
                        "; --duration:", 4.2 + (index % 6) * 0.2, "s",
                        "; --delay:", -1 * (index % 9) * 0.22, "s\"></span>"
                    ].join("");
                }).join(""),
                "</div>"
            ].join("");
        }

        function getCelebrationOutfits(outcome) {
            if (!outcome || !Array.isArray(outcome.newlyDiscoveredOutfits)) {
                return [];
            }

            return outcome.newlyDiscoveredOutfits.filter(function (item) {
                return item && item.id && item.image;
            });
        }

        function getOutfitDiscoveryCopy(item) {
            return item && item.unlockRouteName
                ? "Ya puedes comprarlo en la tienda."
                : "Ya está disponible en la tienda.";
        }

        function buildStreakCelebrationMarkup(streakCelebration) {
            if (!streakCelebration || !streakCelebration.show) {
                return "";
            }

            return [
                "<article class=\"streak-celebration-card\" aria-label=\"", escapeAttribute(streakCelebration.title || "Racha actualizada"), "\">",
                "<img src=\"assets/hud-streak.svg\" alt=\"\" aria-hidden=\"true\">",
                "<strong>+1</strong>",
                "<span class=\"sr-only\">", escapeHtml(streakCelebration.description || "Tu racha diaria aumento en uno."), "</span>",
                "</article>"
            ].join("");
        }

        function buildCompletionDialogMarkup(storyBeat, fallbackMessage, kind) {
            const hasStoryBeat = Boolean(storyBeat && storyBeat.message);
            const characterImage = hasStoryBeat && storyBeat.characterImage
                ? storyBeat.characterImage
                : "assets/characters/Capythilda.webp";
            const characterName = hasStoryBeat && storyBeat.characterName
                ? storyBeat.characterName
                : "Capythilda";
            const message = hasStoryBeat
                ? storyBeat.message
                : fallbackMessage;

            return [
                "<article class=\"completion-dialog-card is-", escapeAttribute(kind || "level-completed"), "\">",
                "<div class=\"completion-dialog-art\">",
                "<img src=\"", escapeAttribute(characterImage), "\" alt=\"", escapeAttribute(characterName), "\">",
                "</div>",
                "<div class=\"completion-dialog-bubble\">",
                "<span>", escapeHtml(message), "</span>",
                "</div>",
                "</article>"
            ].join("");
        }

        function buildOutfitDiscoveryShowcase(outfits) {
            if (!outfits.length) {
                return "";
            }

            return [
                "<div class=\"completion-unlock-showcase\">",
                outfits.map(function (item) {
                    return [
                        "<article class=\"unlock-reward-card\">",
                        "<span class=\"unlock-reward-burst\" aria-hidden=\"true\"></span>",
                        "<div class=\"unlock-reward-art\">",
                        "<img src=\"", escapeAttribute(item.image), "\" alt=\"", escapeAttribute(item.name), "\">",
                        "</div>",
                        "<div class=\"unlock-reward-copy\">",
                        "<p class=\"unlock-reward-kicker\">Personaje encontrado</p>",
                        "<strong>", escapeHtml(item.name), "</strong>",
                        "<span>", escapeHtml(getOutfitDiscoveryCopy(item)), "</span>",
                        "<span class=\"unlock-reward-cost\">Costo: XP ", window.CapyCore.formatNumber(item.cost || 0), "</span>",
                        "</div>",
                        "</article>"
                    ].join("");
                }).join(""),
                "</div>"
            ].join("");
        }

        function clearCompletionOverlay() {
            document.querySelectorAll(".completion-overlay").forEach(function (overlay) {
                overlay.remove();
            });
            document.body.classList.remove("quiz-complete");
        }

        function showFloatingResult(type, title, detail) {
            clearAnswerPopup();

            const popup = document.createElement("div");
            popup.className = "answer-popup floating-answer-popup is-" + (type === "success" ? "success" : "error");
            popup.innerHTML = [
                "<span class=\"answer-popup-icon\">", type === "success" ? "OK" : "!", "</span>",
                "<div>",
                "<strong>", escapeHtml(title), "</strong>",
                "<span>", escapeHtml(detail), "</span>",
                "</div>"
            ].join("");

            document.body.appendChild(popup);
            answerPopupTimer = window.setTimeout(clearAnswerPopup, 2200);
        }

        function clearAnswerPopup() {
            window.clearTimeout(answerPopupTimer);
            answerPopupTimer = 0;
            document.querySelectorAll(".floating-answer-popup").forEach(function (popup) {
                popup.remove();
            });
        }

        function buildCompletionLeadMarkup(context) {
            const practice = Boolean(context && context.practice);
            const outcome = context && context.outcome;
            const needsRetryIcon = !practice && !(outcome && outcome.routeCompleted) && !(outcome && outcome.gameCompleted);

            if (!needsRetryIcon) {
                return "";
            }

            return [
                "<div class=\"completion-inline-retry\">",
                buildRetryActionMarkup("Repetir nivel", {
                    escapeAttribute: escapeAttribute,
                    escapeHtml: escapeHtml
                }),
                "</div>"
            ].join("");
        }

        function bindRetryButtons(overlay) {
            overlay.querySelectorAll("[data-retry-level]").forEach(function (button) {
                button.addEventListener("click", function () {
                    document.body.classList.remove("quiz-complete");
                    overlay.remove();
                    startAttempt("manual");
                });
            });
        }

        return {
            showCompletionOverlay: showCompletionOverlay,
            showGameOverOverlay: showGameOverOverlay,
            clearCompletionOverlay: clearCompletionOverlay,
            showFloatingResult: showFloatingResult,
            clearAnswerPopup: clearAnswerPopup
        };
    }

    window.CapyGameCompletion = {
        buildRetryActionMarkup: buildRetryActionMarkup,
        createRuntime: createRuntime
    };
}());
