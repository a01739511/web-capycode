(function () {
    const XP_REWARD = 50;
    const COMPLETION_BONUS = 50;
    const app = document.querySelector("[data-question-types]");
    const QUESTION_SCREENS = [
        { type: "opcion_multiple", page: "p_opcionMultiple.html" },
        { type: "respuesta_numerica", page: "p_respuestaNumerica.html" },
        { type: "seleccionar_lineas", page: "p_seleccionarLineas.html" },
        { type: "ordenar_lineas", page: "p_ordenarLineas.html" },
        { type: "drag_and_drop", page: "p_completarPlantilla.html" }
    ];
    const PYTHON_KEYWORDS = new Set([
        "and", "as", "assert", "break", "class", "continue", "def", "del", "elif",
        "else", "except", "False", "finally", "for", "from", "global", "if", "import",
        "in", "is", "lambda", "None", "nonlocal", "not", "or", "pass", "raise",
        "return", "True", "try", "while", "with", "yield"
    ]);
    const PYTHON_BUILTINS = new Set([
        "print", "range", "enumerate", "list", "len", "input", "int", "float",
        "str", "bool", "sum", "min", "max"
    ]);

    if (!app || !window.CapyCore) {
        return;
    }

    const session = window.CapyCore.getSession();
    if (!session) {
        window.location.href = "iniciar_sesion.html";
        return;
    }

    const state = {
        levelQuestions: [],
        questions: [],
        currentIndex: 0,
        stepIndex: 0,
        selectedOption: null,
        selectedLines: [],
        blankAnswers: {},
        activeBlankKey: "",
        orderItems: [],
        numericAnswer: "",
        awaitingNext: false,
        isResolving: false
    };
    let answerPopupTimer = 0;

    const elements = {
        stage: document.querySelector(".game-stage"),
        missionLabel: document.getElementById("mission-label"),
        progressRatio: document.getElementById("progress-ratio"),
        progressFill: document.getElementById("progress-fill"),
        questionTitle: document.getElementById("question-title"),
        questionContent: document.getElementById("question-content"),
        feedback: document.getElementById("feedback-message"),
        primaryAction: document.getElementById("primary-action-button"),
        secondaryAction: document.getElementById("secondary-action-button")
    };

    const questionTypes = app.dataset.questionTypes.split(",").map(function (item) {
        return item.trim();
    });
    const searchParams = new URLSearchParams(window.location.search);
    const themeKey = searchParams.get("tema") || "algoritmos";
    const totalRouteLevels = Math.max(1, ((window.CAPYCODE_APP_DATA && window.CAPYCODE_APP_DATA.levels) || []).length);
    const levelId = normalizeLevelId(searchParams.get("level"), totalRouteLevels);
    const levelKey = "nivel_" + levelId;
    const levelMeta = getLevelMeta(levelId);

    elements.primaryAction.addEventListener("click", onPrimaryAction);
    registerGameHotkeys();

    start();

    async function start() {
        const dataset = await loadQuestions();
        state.levelQuestions = getQuestionsForLevel(dataset);

        if (!state.levelQuestions.length) {
            renderEmptyState("No hay preguntas configuradas para esta pantalla.");
            return;
        }

        state.stepIndex = normalizeStepIndex(searchParams.get("step"), state.levelQuestions.length);
        state.questions = [state.levelQuestions[state.stepIndex]];
        state.currentIndex = 0;

        if (!state.questions[0]) {
            renderEmptyState("No se pudo encontrar la pregunta solicitada.");
            return;
        }

        if (!questionTypes.includes(state.questions[0].tipo)) {
            window.location.replace(buildQuestionPageUrl(state.questions[0].tipo, state.stepIndex));
            return;
        }

        renderQuestion();
        renderProgress();
        window.CapyCore.updateHud();
    }

    async function loadQuestions() {
        const sources = [
            "levels_algoritmos_complementado.json",
            "questions.json"
        ];

        for (let index = 0; index < sources.length; index += 1) {
            try {
                const response = await fetch(sources[index], { cache: "no-store" });
                if (!response.ok) {
                    continue;
                }
                return await response.json();
            } catch (error) {
                continue;
            }
        }

        return window.CAPYCODE_QUESTIONS || { temas: {} };
    }

    function getQuestionsForLevel(dataset) {
        const temas = dataset && dataset.temas ? dataset.temas : {};
        const theme = temas[themeKey] || {};
        const normalizedLevels = normalizeThemeLevels(theme);
        const selectedQuestions = normalizedLevels[levelKey] || [];

        return selectedQuestions.map(function (question, index) {
            return Object.assign({}, question, {
                tema: themeKey,
                nivel: levelKey,
                uid: [themeKey, levelKey, index, question.tipo].join("-")
            });
        });
    }

    function normalizeThemeLevels(theme) {
        const keys = Object.keys(theme || {});
        const hasDirectLevels = keys.some(function (key) {
            return /^nivel_\d+$/.test(key);
        });

        if (hasDirectLevels) {
            return theme;
        }

        const groupedLevels = {};
        let nextLevel = 1;

        ["facil", "medio", "dificil", "integrador"].forEach(function (bucket) {
            const questions = Array.isArray(theme[bucket]) ? theme[bucket] : [];

            for (let index = 0; index < questions.length; index += 5) {
                groupedLevels["nivel_" + nextLevel] = questions.slice(index, index + 5);
                nextLevel += 1;
            }
        });

        return groupedLevels;
    }

    function normalizeLevelId(rawLevel, maxLevel) {
        const parsed = Number(rawLevel);

        if (!Number.isFinite(parsed)) {
            return 1;
        }

        return Math.max(1, Math.min(Math.trunc(parsed), maxLevel));
    }

    function normalizeStepIndex(rawStep, totalQuestions) {
        const parsed = Number(rawStep);

        if (!Number.isFinite(parsed)) {
            return 0;
        }

        return Math.max(0, Math.min(Math.trunc(parsed) - 1, Math.max(0, totalQuestions - 1)));
    }

    function getLevelMeta(id) {
        return ((window.CAPYCODE_APP_DATA && window.CAPYCODE_APP_DATA.levels) || []).find(function (level) {
            return Number(level.id) === Number(id);
        }) || null;
    }

    function renderQuestion() {
        const question = state.questions[state.currentIndex];
        state.selectedOption = null;
        state.selectedLines = [];
        state.blankAnswers = {};
        state.activeBlankKey = "";
        state.orderItems = [];
        state.numericAnswer = "";
        state.awaitingNext = false;
        state.isResolving = false;

        elements.questionTitle.textContent = question.prompt;
        elements.questionContent.innerHTML = "";
        elements.questionContent.classList.remove("has-internal-scroll");
        clearCompletionOverlay();
        clearAnswerPopup();
        elements.feedback.textContent = "";
        elements.feedback.className = "feedback-banner";
        elements.primaryAction.textContent = "Comprobar";
        elements.primaryAction.disabled = false;
        elements.primaryAction.style.display = "";
        app.dataset.activeQuestionType = question.tipo;

        if (elements.secondaryAction) {
            elements.secondaryAction.textContent = "Reiniciar reto";
            elements.secondaryAction.onclick = restartPage;
        }

        switch (question.tipo) {
        case "opcion_multiple":
            renderMultipleChoice(question);
            break;
        case "ordenar_lineas":
            renderOrderLines(question);
            break;
        case "drag_and_drop":
            renderTemplate(question);
            break;
        case "seleccionar_lineas":
            renderSelectLines(question);
            break;
        case "respuesta_numerica":
            renderNumeric(question);
            break;
        default:
            renderEmptyState("Este reto aun no esta soportado.");
            break;
        }
    }

    function renderMultipleChoice(question) {
        const wrapper = document.createElement("div");
        wrapper.className = Array.isArray(question.code) && question.code.length ? "numeric-layout" : "answer-stack";
        const grid = document.createElement("div");
        grid.className = "answer-stack";

        question.opciones.forEach(function (option) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-card";
            button.dataset.optionId = option.id;
            button.innerHTML = [
                "<span class=\"answer-marker\">", option.id, "</span>",
                "<span class=\"answer-card-text\">", escapeHtml(option.text), "</span>"
            ].join("");
            button.addEventListener("click", function () {
                state.selectedOption = option.id;
                grid.querySelectorAll(".answer-card").forEach(function (item) {
                    item.classList.toggle("is-selected", item.dataset.optionId === option.id);
                });
            });
            grid.appendChild(button);
        });

        if (Array.isArray(question.code) && question.code.length) {
            wrapper.appendChild(createCodeStage(question.code));
        }

        wrapper.appendChild(grid);
        elements.questionContent.appendChild(wrapper);
    }

    function renderOrderLines(question) {
        state.orderItems = question.lineas.map(function (line) {
            return { id: line.id, text: line.text };
        });

        const list = document.createElement("div");
        list.className = "sortable-list";
        list.id = "sortable-list";
        elements.questionContent.appendChild(list);
        paintSortable();
    }

    function paintSortable() {
        const list = document.getElementById("sortable-list");
        if (!list) {
            return;
        }

        list.innerHTML = "";

        state.orderItems.forEach(function (item, index) {
            const article = document.createElement("article");
            article.className = "sortable-row";
            article.draggable = true;
            article.dataset.index = String(index);
            article.innerHTML = [
                "<div class=\"drag-pill\"><img src=\"assets/menu-icon.svg\" alt=\"Mover linea\"></div>",
                "<div class=\"sortable-row-code\">",
                buildCodeLineMarkup(item.text, index + 1, state.orderItems.length),
                "</div>",
                "<div class=\"sortable-row-controls\">",
                "<button class=\"order-move-button\" type=\"button\" data-order-move=\"up\" aria-label=\"Subir linea ", index + 1, "\"", index === 0 ? " disabled" : "", ">&uarr;</button>",
                "<button class=\"order-move-button\" type=\"button\" data-order-move=\"down\" aria-label=\"Bajar linea ", index + 1, "\"", index === state.orderItems.length - 1 ? " disabled" : "", ">&darr;</button>",
                "</div>"
            ].join("");
            article.addEventListener("dragstart", handleDragStart);
            article.addEventListener("dragover", handleDragOver);
            article.addEventListener("drop", handleDrop);
            article.querySelectorAll("[data-order-move]").forEach(function (button) {
                button.addEventListener("click", function () {
                    moveOrderItem(index, button.dataset.orderMove);
                });
            });
            list.appendChild(article);
        });
    }

    function renderTemplate(question) {
        elements.questionContent.classList.add("has-internal-scroll");

        if (!state.activeBlankKey) {
            state.activeBlankKey = getFirstBlankKey(question);
        }

        const builder = document.createElement("div");
        builder.className = "template-builder";

        const stage = document.createElement("div");
        stage.className = "code-stage";
        stage.innerHTML = question.plantilla.map(function (line, index) {
            return [
                "<div class=\"template-row\">",
                "<span class=\"code-line-number\">", formatLineNumber(index + 1, question.plantilla.length), "</span>",
                "<div class=\"template-row-body code-line-content\">", buildTemplateLineMarkup(line), "</div>",
                "</div>"
            ].join("");
        }).join("");

        const bankPanel = document.createElement("div");
        bankPanel.className = "template-bank-panel";
        bankPanel.innerHTML = [
            "<div class=\"template-bank-head\">",
            "<div>",
            "<p class=\"panel-kicker\">Banco de palabras</p>",
            "<p>Toca un hueco del c&oacute;digo y luego una palabra para colocarla.</p>",
            "</div>",
            "<button class=\"template-clear-button\" type=\"button\">Vaciar hueco</button>",
            "</div>",
            "<div class=\"template-word-bank\">",
            question.banco_palabras.map(function (word) {
                const isUsed = Object.keys(state.blankAnswers).some(function (key) {
                    return state.blankAnswers[key] === word;
                });

                return [
                    "<button class=\"word-chip", isUsed ? " is-used" : "", "\" data-word=\"", escapeAttribute(word), "\" type=\"button\">",
                    escapeHtml(word),
                    "</button>"
                ].join("");
            }).join(""),
            "</div>"
        ].join("");

        builder.appendChild(stage);
        builder.appendChild(bankPanel);
        elements.questionContent.innerHTML = "";
        elements.questionContent.appendChild(builder);

        stage.querySelectorAll("[data-blank-key]").forEach(function (button) {
            button.addEventListener("click", function () {
                state.activeBlankKey = button.dataset.blankKey;
                renderTemplate(question);
            });
        });

        bankPanel.querySelectorAll("[data-word]").forEach(function (button) {
            button.addEventListener("click", function () {
                fillActiveBlank(question, button.dataset.word);
            });
        });

        bankPanel.querySelector(".template-clear-button").addEventListener("click", function () {
            clearActiveBlank(question);
        });
    }

    function renderSelectLines(question) {
        const stack = document.createElement("div");
        stack.className = "answer-stack";

        question.lineas.forEach(function (line, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-card selection-card";
            button.dataset.lineId = line.id;
            button.innerHTML = [
                "<span class=\"answer-marker\">", line.id, "</span>",
                "<div class=\"answer-card-copy\">",
                buildCodeLineMarkup(line.text, index + 1, question.lineas.length),
                "</div>"
            ].join("");
            button.addEventListener("click", function () {
                toggleSelectedLine(line.id);
                stack.querySelectorAll(".answer-card").forEach(function (item) {
                    item.classList.toggle("is-selected", state.selectedLines.includes(item.dataset.lineId));
                });
            });
            stack.appendChild(button);
        });

        elements.questionContent.appendChild(stack);
    }

    function renderNumeric(question) {
        const wrapper = document.createElement("div");
        wrapper.className = "numeric-layout";
        wrapper.appendChild(createCodeStage(question.code));

        const input = document.createElement("input");
        input.type = "number";
        input.className = "magic-input";
        input.placeholder = "Escribe tu respuesta";
        input.addEventListener("input", function () {
            state.numericAnswer = input.value;
        });

        wrapper.appendChild(input);
        elements.questionContent.appendChild(wrapper);
    }

    function onPrimaryAction() {
        if (state.isResolving) {
            return;
        }

        if (state.awaitingNext) {
            nextQuestion();
            return;
        }

        state.isResolving = true;
        const question = state.questions[state.currentIndex];
        const result = validate(question);

        if (!result.valid) {
            clearFeedback();
            showAnswerPopup("Falta completar", result.message, "error");
            releaseActionLock();
            return;
        }

        updateProfile(result.correct);
        clearFeedback();
        resetVisibleSelections(question);
        showAnswerPopup(result.correct ? "Respuesta correcta" : "Respuesta incorrecta", result.correct ? "Puedes avanzar al siguiente reto." : "Ajusta tu respuesta e intentalo otra vez.", result.correct ? "success" : "error");

        if (result.correct) {
            state.awaitingNext = true;
            state.isResolving = false;
            elements.primaryAction.textContent = getAdvanceButtonLabel();
        } else {
            elements.primaryAction.textContent = "Comprobar";
            releaseActionLock();
        }

        renderProgress();
    }

    function validate(question) {
        switch (question.tipo) {
        case "opcion_multiple":
            if (!state.selectedOption) {
                return { valid: false, message: "Selecciona una opcion antes de comprobar." };
            }
            return {
                valid: true,
                correct: question.correct_ids.includes(state.selectedOption),
                message: ""
            };
        case "ordenar_lineas":
            return {
                valid: true,
                correct: state.orderItems.map(function (item) {
                    return item.id;
                }).join("|") === question.orden_correcto.join("|"),
                message: ""
            };
        case "drag_and_drop":
            if (Object.keys(question.rellenos).some(function (key) {
                return !state.blankAnswers[key];
            })) {
                return { valid: false, message: "Completa todos los espacios antes de comprobar." };
            }
            return {
                valid: true,
                correct: Object.keys(question.rellenos).every(function (key) {
                    return question.rellenos[key] === state.blankAnswers[key];
                }),
                message: ""
            };
        case "seleccionar_lineas":
            if (!state.selectedLines.length) {
                return { valid: false, message: "Selecciona al menos una linea." };
            }
            return {
                valid: true,
                correct: sameItems(state.selectedLines, question.correct_ids),
                message: ""
            };
        case "respuesta_numerica":
            if (state.numericAnswer === "") {
                return { valid: false, message: "Escribe un numero antes de comprobar." };
            }
            return {
                valid: true,
                correct: Number(state.numericAnswer) === Number(question.valor),
                message: ""
            };
        default:
            return { valid: false, message: "Tipo de pregunta no soportado." };
        }
    }

    function updateProfile(correct) {
        const profile = window.CapyCore.getProfile();

        if (correct) {
            profile.xp += XP_REWARD;
            profile.streak += 1;
        } else {
            profile.streak = Math.max(0, profile.streak - 1);
        }

        window.CapyCore.saveProfile(profile);
        window.CapyCore.updateHud();
    }

    function nextQuestion() {
        renderCompletion();
    }

    function renderCompletion() {
        const isFinalStage = isFinalFlowStep();
        const nextPage = buildNextPageUrl();
        const nextLevelPage = buildNextLevelPageUrl();

        if (!isFinalStage) {
            window.location.href = nextPage;
            return;
        }

        const outcome = isFinalStage ? window.CapyCore.completeLevel(levelId, {
            bonusXp: COMPLETION_BONUS
        }) : null;
        const profile = outcome ? outcome.profile : window.CapyCore.getProfile();
        const equipped = (window.CAPYCODE_APP_DATA.shopItems || []).find(function (item) {
            return item.id === profile.equippedCharacter;
        });
        const headline = isFinalStage
            ? (outcome && outcome.firstCompletion ? "Nivel completado" : "Nivel dominado")
            : "Reto completado";
        const rewardCopy = isFinalStage
            ? (outcome && outcome.firstCompletion
                ? "Has ganado +" + COMPLETION_BONUS + " XP extra y el siguiente nivel ya quedo desbloqueado en el mapa."
                : "Este nivel ya estaba completado. Puedes repetirlo para seguir practicando.")
            : "Has superado esta prueba. Continua con el siguiente tipo de ejercicio para avanzar por el nivel.";
        const celebrationImage = getCelebrationCharacterImage(equipped);
        const completionKicker = isFinalStage
            ? (outcome && outcome.firstCompletion ? "Nivel superado" : "Practica completada")
            : "Reto superado";

        app.classList.add("is-complete");
        document.body.classList.add("quiz-complete");

        document.body.insertAdjacentHTML("beforeend", [
            "<div class=\"completion-overlay\" data-completion-overlay>",
            "<div class=\"completion-spotlight\" aria-hidden=\"true\"></div>",
            "<div class=\"completion-radiance\" aria-hidden=\"true\">",
            buildCelebrationBurstMarkup(),
            "</div>",
            "<div class=\"completion-confetti\" aria-hidden=\"true\">",
            buildConfettiMarkup(),
            "</div>",
            "<section class=\"completion-screen glass-surface\">",
            "<div class=\"completion-screen-copy\">",
            "<p class=\"panel-kicker\">", completionKicker, "</p>",
            "<h2>", headline, "</h2>",
            "<p class=\"completion-lead\">", rewardCopy, "</p>",
            celebrationImage ? "<div class=\"completion-screen-art\"><img src=\"" + celebrationImage + "\" alt=\"" + escapeHtml(equipped ? getItemName(equipped) : "Personaje") + "\"></div>" : "",
            "<div class=\"completion-actions\">",
            "<a class=\"magic-cta\" href=\"", nextLevelPage, "\">Siguiente nivel</a>",
            "<a class=\"scene-button ghost\" href=\"mapa.html\">Volver al mapa</a>",
            "</div>",
            "</div>",
            "</section>",
            "</div>"
        ].join(""));

        const overlayAction = document.querySelector("[data-completion-overlay] .magic-cta");
        if (overlayAction) {
            overlayAction.focus();
        }
    }

    function buildNextCtaLabel(nextPage) {
        if (nextPage === "mapa.html") {
            return "Volver al mapa";
        }
        return "Ir al siguiente reto";
    }

    function renderProgress() {
        const step = state.stepIndex + 1;
        const totalSteps = Math.max(1, state.levelQuestions.length);
        const percentage = (step / totalSteps) * 100;

        elements.missionLabel.textContent = buildMissionLabel();
        elements.progressRatio.textContent = step + "/" + totalSteps;
        animateProgressMeter(percentage);
    }

    function animateProgressMeter(percentage) {
        const nextValue = Math.max(0, Math.min(100, percentage));
        const previousValue = Number(elements.progressFill.dataset.progressValue || 0);

        elements.progressFill.dataset.progressValue = String(nextValue);

        if (!elements.progressFill.dataset.progressReady) {
            elements.progressFill.style.width = previousValue + "%";
            elements.progressFill.dataset.progressReady = "true";
            window.requestAnimationFrame(function () {
                elements.progressFill.style.width = nextValue + "%";
            });
            return;
        }

        if (Math.abs(previousValue - nextValue) < 0.01) {
            elements.progressFill.style.width = nextValue + "%";
            return;
        }

        window.requestAnimationFrame(function () {
            elements.progressFill.style.width = nextValue + "%";
        });
    }

    function restartPage() {
        clearCompletionOverlay();
        clearAnswerPopup();
        state.currentIndex = 0;
        state.questions = [state.levelQuestions[state.stepIndex]];
        state.isResolving = false;
        renderQuestion();
        renderProgress();
        elements.feedback.textContent = "";
        elements.primaryAction.style.display = "";
        elements.primaryAction.disabled = false;
    }

    function releaseActionLock() {
        elements.primaryAction.disabled = true;

        window.setTimeout(function () {
            state.isResolving = false;
            if (!state.awaitingNext) {
                elements.primaryAction.disabled = false;
            }
        }, 420);
    }

    function showAnswerPopup(title, message, type) {
        clearAnswerPopup();

        elements.feedback.insertAdjacentHTML("beforebegin", [
            "<div class=\"answer-popup ", type === "success" ? "is-success" : "is-error", "\" data-answer-popup role=\"status\" aria-live=\"polite\">",
            "<span class=\"answer-popup-icon\" aria-hidden=\"true\">", type === "success" ? "OK" : "!", "</span>",
            "<div>",
            "<strong>", escapeHtml(title), "</strong>",
            "<span>", escapeHtml(message), "</span>",
            "</div>",
            "</div>"
        ].join(""));

        answerPopupTimer = window.setTimeout(clearAnswerPopup, type === "success" ? 2600 : 3400);
    }

    function clearAnswerPopup() {
        window.clearTimeout(answerPopupTimer);
        document.querySelectorAll("[data-answer-popup]").forEach(function (popup) {
            popup.remove();
        });
    }

    function buildMissionLabel() {
        if (!levelMeta) {
            return "Ruta de algoritmos";
        }

        const parts = [levelMeta.title];

        if (levelMeta.topic) {
            parts.push(levelMeta.topic);
        }

        return parts.join(" - ");
    }

    function moveOrderItem(index, direction) {
        const offset = direction === "up" ? -1 : 1;
        const targetIndex = index + offset;

        if (targetIndex < 0 || targetIndex >= state.orderItems.length) {
            return;
        }

        const moved = state.orderItems.splice(index, 1)[0];
        state.orderItems.splice(targetIndex, 0, moved);
        paintSortable();

        window.requestAnimationFrame(function () {
            const row = document.querySelector("[data-index=\"" + targetIndex + "\"]");
            const focusTarget = row && row.querySelector("[data-order-move=\"" + direction + "\"]:not([disabled])");
            if (focusTarget) {
                focusTarget.focus();
            }
        });
    }

    function registerGameHotkeys() {
        if (!window.CapyHotkeys) {
            return;
        }

        window.CapyHotkeys.register([
            {
                id: "quiz-primary",
                key: "Enter",
                ctrlKey: true,
                label: "Comprobar",
                description: "Comprueba la respuesta o avanza cuando ya fue correcta.",
                group: "Nivel",
                order: 20,
                allowInInput: true,
                action: function () {
                    elements.primaryAction.click();
                },
                enabled: function () {
                    return !elements.primaryAction.disabled;
                }
            },
            {
                id: "quiz-reset",
                key: "r",
                label: "Reiniciar reto",
                description: "Reinicia la pregunta actual.",
                group: "Nivel",
                order: 21,
                action: function () {
                    if (elements.secondaryAction) {
                        elements.secondaryAction.click();
                    }
                },
                enabled: function () {
                    return Boolean(elements.secondaryAction);
                }
            }
        ]);
    }

    function buildNextPageUrl() {
        const nextQuestion = state.levelQuestions[state.stepIndex + 1];

        if (!nextQuestion) {
            return "mapa.html";
        }

        return buildQuestionPageUrl(nextQuestion.tipo, state.stepIndex + 1);
    }

    function buildNextLevelPageUrl() {
        const levels = (window.CAPYCODE_APP_DATA && window.CAPYCODE_APP_DATA.levels) || [];
        const nextLevel = levels.find(function (level) {
            return Number(level.id) === Number(levelId) + 1;
        });

        return nextLevel && nextLevel.href ? nextLevel.href : "mapa.html";
    }

    function buildQuestionPageUrl(questionType, stepIndex) {
        const screen = getScreenForType(questionType);
        const page = screen ? screen.page : "mapa.html";

        if (page === "mapa.html") {
            return page;
        }

        return page + buildLevelQuery(stepIndex);
    }

    function buildLevelQuery(stepIndex) {
        return "?tema=" + encodeURIComponent(themeKey) +
            "&level=" + encodeURIComponent(levelId) +
            "&step=" + encodeURIComponent(stepIndex + 1);
    }

    function getScreenForType(questionType) {
        return QUESTION_SCREENS.find(function (screen) {
            return screen.type === questionType;
        }) || null;
    }

    function isFinalFlowStep() {
        return state.stepIndex >= state.levelQuestions.length - 1;
    }

    function getAdvanceButtonLabel() {
        return isFinalFlowStep() ? "Completar nivel" : "Siguiente reto";
    }

    function renderEmptyState(message) {
        elements.questionTitle.textContent = message;
        elements.questionContent.innerHTML = "";
        elements.primaryAction.disabled = true;
    }

    function clearFeedback() {
        elements.feedback.textContent = "";
        elements.feedback.className = "feedback-banner";
    }

    function resetVisibleSelections(question) {
        elements.questionContent.querySelectorAll(".is-selected, .is-correct, .is-incorrect").forEach(function (element) {
            element.classList.remove("is-selected");
            element.classList.remove("is-correct");
            element.classList.remove("is-incorrect");
        });

        if (question.tipo === "opcion_multiple") {
            state.selectedOption = null;
        }

        if (question.tipo === "seleccionar_lineas") {
            state.selectedLines = [];
        }
    }

    function toggleSelectedLine(lineId) {
        const index = state.selectedLines.indexOf(lineId);
        if (index >= 0) {
            state.selectedLines.splice(index, 1);
            return;
        }
        state.selectedLines.push(lineId);
    }

    function fillActiveBlank(question, word) {
        let targetKey = state.activeBlankKey;

        if (!targetKey || !Object.prototype.hasOwnProperty.call(question.rellenos, targetKey)) {
            targetKey = getFirstEmptyBlank(question) || getFirstBlankKey(question);
        }

        if (!targetKey) {
            return;
        }

        state.blankAnswers[targetKey] = word;
        state.activeBlankKey = getFirstEmptyBlank(question) || targetKey;
        renderTemplate(question);
    }

    function clearActiveBlank(question) {
        if (!state.activeBlankKey) {
            return;
        }

        delete state.blankAnswers[state.activeBlankKey];
        renderTemplate(question);
    }

    function getFirstBlankKey(question) {
        return Object.keys(question.rellenos)[0] || "";
    }

    function getFirstEmptyBlank(question) {
        return Object.keys(question.rellenos).find(function (key) {
            return !state.blankAnswers[key];
        }) || "";
    }

    function buildTemplateLineMarkup(line) {
        return line.split(/(\{[^}]+\})/g).filter(Boolean).map(function (token) {
            if (token.startsWith("{") && token.endsWith("}")) {
                const key = token.slice(1, -1);
                const value = state.blankAnswers[key] || "[elige]";
                const classes = [
                    "code-blank",
                    state.blankAnswers[key] ? "is-filled" : "is-empty",
                    state.activeBlankKey === key ? "is-active" : ""
                ].filter(Boolean).join(" ");

                return [
                    "<button class=\"", classes, "\" type=\"button\" data-blank-key=\"", escapeAttribute(key), "\">",
                    escapeHtml(value),
                    "</button>"
                ].join("");
            }

            return highlightPython(token);
        }).join("");
    }

    function buildConfettiMarkup() {
        return new Array(84).fill(null).map(function (_, index) {
            const lane = (index * 37) % 100;
            const sway = ((index % 9) - 4) * 10;
            const duration = 4.2 + ((index % 11) * 0.18);
            const delay = index * -0.075;
            const size = 8 + (index % 5) * 3;

            return [
                "<span class=\"confetti-piece confetti-piece-", ((index % 8) + 1),
                index % 5 === 0 ? " is-star" : (index % 4 === 0 ? " is-dot" : (index % 3 === 0 ? " is-ribbon" : "")),
                "\" style=\"--piece-index:", index,
                "; --lane:", lane,
                "; --sway:", sway,
                "px; --duration:", duration,
                "s; --delay:", delay,
                "s; --piece-size:", size,
                "px;\"></span>"
            ].join("");
        }).join("");
    }

    function buildCelebrationBurstMarkup() {
        const rings = new Array(4).fill(null).map(function (_, index) {
            return "<span class=\"celebration-ring celebration-ring-" + (index + 1) + "\"></span>";
        }).join("");
        const rays = new Array(18).fill(null).map(function (_, index) {
            return "<span class=\"celebration-ray\" style=\"--ray-index:" + index + ";\"></span>";
        }).join("");
        const sparks = new Array(28).fill(null).map(function (_, index) {
            const distance = 110 + (index % 7) * 34;
            const duration = 1.7 + (index % 5) * 0.22;
            return "<span class=\"celebration-spark\" style=\"--spark-index:" + index + "; --spark-distance:" + distance + "px; --spark-duration:" + duration + "s;\"></span>";
        }).join("");

        return rings + rays + sparks;
    }

    function clearCompletionOverlay() {
        app.classList.remove("is-complete");
        document.body.classList.remove("quiz-complete");
        document.querySelectorAll("[data-completion-overlay]").forEach(function (overlay) {
            overlay.remove();
        });
    }

    function getCelebrationCharacterImage(equipped) {
        const imageMap = {
            CapyBlack: "assets/characters/no_bg/Capy_Black.png",
            CapyAqua: "assets/characters/no_bg/Capy_Aqua..png",
            CapyCandy: "assets/characters/no_bg/Capy_Candy.png",
            CapyConstelation: "assets/characters/no_bg/Capy_Constelation.png",
            CapyEarth: "assets/characters/no_bg/Capy_Earth.png",
            CapyExplorer: "assets/characters/no_bg/Capy_Explorer.png",
            CapyKing: "assets/characters/no_bg/Capy_King.png",
            CapyRuna: "assets/characters/no_bg/Capy_Runa.png",
            CapySun: "assets/characters/no_bg/Capy_Sun.png"
        };

        if (equipped && imageMap[equipped.id]) {
            return imageMap[equipped.id];
        }

        return equipped ? equipped.image : "";
    }

    function getItemName(item) {
        if (window.CapyCore && window.CapyCore.getItemName) {
            return window.CapyCore.getItemName(item);
        }

        return item && (item.nombre || item.name) ? (item.nombre || item.name) : "";
    }

    function createCodeStage(lines) {
        const wrapper = document.createElement("div");
        wrapper.className = "code-stage";
        wrapper.innerHTML = lines.map(function (line, index) {
            return buildCodeLineMarkup(line, index + 1, lines.length);
        }).join("");
        return wrapper;
    }

    function buildCodeLineMarkup(text, lineNumber, totalLines) {
        return [
            "<div class=\"code-line\">",
            "<span class=\"code-line-number\">", formatLineNumber(lineNumber, totalLines), "</span>",
            "<span class=\"code-line-content\">", highlightPython(text), "</span>",
            "</div>"
        ].join("");
    }

    function formatLineNumber(lineNumber, totalLines) {
        const width = String(totalLines).length;
        return String(lineNumber).padStart(width, "0");
    }

    function highlightPython(source) {
        let index = 0;
        let html = "";

        while (index < source.length) {
            const remaining = source.slice(index);
            const whitespace = remaining.match(/^\s+/);
            const comment = remaining.match(/^#.*/);
            const stringLiteral = remaining.match(/^("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
            const numberLiteral = remaining.match(/^\d+(?:\.\d+)?/);
            const identifier = remaining.match(/^[A-Za-z_][A-Za-z0-9_]*/);
            const operator = remaining.match(/^(==|!=|<=|>=|\+=|-=|\*=|\/=|%=|\/\/=|\*\*=|\/\/|\*\*|->|=|\+|-|\*|\/|%|<|>)/);
            const punctuation = remaining.match(/^[:.,()[\]{}]/);

            if (whitespace) {
                html += escapeHtml(whitespace[0]);
                index += whitespace[0].length;
                continue;
            }

            if (comment) {
                html += wrapToken("comment", comment[0]);
                break;
            }

            if (stringLiteral) {
                html += wrapToken("string", stringLiteral[0]);
                index += stringLiteral[0].length;
                continue;
            }

            if (numberLiteral) {
                html += wrapToken("number", numberLiteral[0]);
                index += numberLiteral[0].length;
                continue;
            }

            if (identifier) {
                html += wrapToken(resolveIdentifierClass(source, index, identifier[0]), identifier[0]);
                index += identifier[0].length;
                continue;
            }

            if (operator) {
                html += wrapToken("operator", operator[0]);
                index += operator[0].length;
                continue;
            }

            if (punctuation) {
                html += wrapToken("punctuation", punctuation[0]);
                index += punctuation[0].length;
                continue;
            }

            html += escapeHtml(remaining.charAt(0));
            index += 1;
        }

        return html;
    }

    function resolveIdentifierClass(source, startIndex, value) {
        const prefix = source.slice(0, startIndex);
        const suffix = source.slice(startIndex + value.length);

        if (PYTHON_KEYWORDS.has(value)) {
            return "keyword";
        }

        if (PYTHON_BUILTINS.has(value)) {
            return "builtin";
        }

        if (/\bdef\s+$/.test(prefix) || /\bclass\s+$/.test(prefix) || /^\s*\(/.test(suffix)) {
            return "function";
        }

        return "variable";
    }

    function wrapToken(type, value) {
        return "<span class=\"code-token-" + type + "\">" + escapeHtml(value) + "</span>";
    }

    function handleDragStart(event) {
        event.currentTarget.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", event.currentTarget.dataset.index);
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add("is-drop-target");
    }

    function handleDrop(event) {
        event.preventDefault();
        clearDragState();
        const fromIndex = Number(event.dataTransfer.getData("text/plain"));
        const toIndex = Number(event.currentTarget.dataset.index);

        if (Number.isNaN(fromIndex) || Number.isNaN(toIndex) || fromIndex === toIndex) {
            return;
        }

        const moved = state.orderItems.splice(fromIndex, 1)[0];
        state.orderItems.splice(toIndex, 0, moved);
        paintSortable();
    }

    document.addEventListener("dragend", clearDragState);

    function clearDragState() {
        document.querySelectorAll(".sortable-row").forEach(function (row) {
            row.classList.remove("is-dragging");
            row.classList.remove("is-drop-target");
        });
    }

    function sameItems(left, right) {
        if (left.length !== right.length) {
            return false;
        }

        return left.slice().sort().every(function (item, index) {
            return item === right.slice().sort()[index];
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, "&#96;");
    }
}());
