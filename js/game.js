(function () {
    const app = document.querySelector("[data-level-runner=\"true\"]");
    const api = window.CapyApi;
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

    if (!app || !api || !window.CapyCore) {
        return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const levelId = normalizeLevelId(searchParams.get("levelId") || searchParams.get("level"));
    const level = api.getLevelByIdSync(levelId);
    const timerSeconds = level ? api.getDifficultySeconds(level.difficulty) : 30;

    const elements = {
        shell: app,
        stage: document.querySelector(".game-stage"),
        missionLabel: document.getElementById("mission-label"),
        progressRatio: document.getElementById("progress-ratio"),
        progressFill: document.getElementById("progress-fill"),
        questionTitle: document.getElementById("question-title"),
        questionContent: document.getElementById("question-content"),
        feedback: document.getElementById("feedback-message"),
        primaryAction: document.getElementById("primary-action-button"),
        secondaryAction: document.getElementById("secondary-action-button"),
        timer: document.getElementById("exercise-timer")
    };

    const state = {
        sourceExercises: [],
        exercises: [],
        currentIndex: 0,
        answers: [],
        selectedOptionIds: [],
        selectedLineIds: [],
        blankAnswers: {},
        activeBlankKey: "",
        orderItems: [],
        numericValue: "",
        remainingSeconds: timerSeconds,
        timerId: 0,
        locked: false,
        isCompleting: false
    };

    const audio = createAudioSystem();
    let answerPopupTimer = 0;

    if (!level) {
        renderEmptyState("Nivel no encontrado.");
        return;
    }

    elements.primaryAction.addEventListener("click", onPrimaryAction);
    document.addEventListener("pointerdown", audio.startMusic, { once: true });
    document.addEventListener("keydown", function (event) {
        audio.startMusic();

        if (event.key === "Enter" && event.ctrlKey) {
            onPrimaryAction();
        }
    });

    start();

    async function start() {
        const profile = window.CapyCore.getProfile();

        if (level.id > profile.currentLevelId && profile.currentLevelId !== api.getTotalLevelCountSync() + 1) {
            renderLockedState();
            return;
        }

        renderLevelHeader();

        try {
            const response = await api.getExercisesByLevel(level.id);
            state.sourceExercises = response.exercises || [];
        } catch (error) {
            renderEmptyState(error.message || "No se pudieron cargar los ejercicios.");
            return;
        }

        if (!state.sourceExercises.length) {
            renderEmptyState("No hay ejercicios configurados para este nivel.");
            return;
        }

        startAttempt("initial");
        window.CapyCore.updateHud();
    }

    function startAttempt(reason) {
        stopTimer();
        clearAnswerPopup();
        clearCompletionOverlay();
        state.exercises = shuffleArray(state.sourceExercises).slice(0, 5).map(prepareExerciseForAttempt);
        state.currentIndex = 0;
        state.answers = [];
        state.locked = false;
        state.isCompleting = false;

        renderQuestion();
    }

    function prepareExerciseForAttempt(exercise) {
        const cloned = JSON.parse(JSON.stringify(exercise));

        if (cloned.type === "MultipleChoiceExercise") {
            cloned.contentData.options = shuffleArray(cloned.contentData.options || []);
        }

        if (cloned.type === "LineOrderingExercise") {
            cloned.contentData.lines = shuffleArray(cloned.contentData.lines || []);
        }

        if (cloned.type === "FillBlanksExercise") {
            cloned.contentData.wordBank = shuffleArray(cloned.contentData.wordBank || []);
        }

        return cloned;
    }

    function renderLevelHeader() {
        const route = api.getRoutesSync().find(function (item) {
            return String(item.id) === String(level.routeId);
        });
        const profile = window.CapyCore.getProfile();
        const isPractice = profile.currentLevelId === api.getTotalLevelCountSync() + 1 || level.id < profile.currentLevelId;

        elements.missionLabel.textContent = [
            route ? route.name : "Ruta",
            " - ",
            level.name,
            isPractice ? " (Practica)" : ""
        ].join("");
    }

    function renderQuestion() {
        const exercise = getCurrentExercise();

        if (!exercise) {
            completeAttempt();
            return;
        }

        resetAnswerState(exercise);
        clearAnswerPopup();
        elements.questionTitle.textContent = exercise.prompt;
        elements.questionContent.innerHTML = "";
        elements.questionContent.classList.remove("has-internal-scroll");
        elements.feedback.textContent = "";
        elements.feedback.className = "feedback-banner";
        elements.primaryAction.textContent = "Comprobar";
        elements.primaryAction.disabled = false;
        elements.secondaryAction.style.display = "none";
        elements.shell.dataset.activeQuestionType = exercise.type;

        if (exercise.type === "MultipleChoiceExercise") {
            renderMultipleChoice(exercise);
        } else if (exercise.type === "NumericAnswerExercise") {
            renderNumeric(exercise);
        } else if (exercise.type === "LineSelectionExercise") {
            renderSelectLines(exercise);
        } else if (exercise.type === "LineOrderingExercise") {
            renderOrderLines(exercise);
        } else {
            renderFillBlanks(exercise);
        }

        renderProgress();
        startTimer();
    }

    function resetAnswerState(exercise) {
        state.selectedOptionIds = [];
        state.selectedLineIds = [];
        state.blankAnswers = {};
        state.activeBlankKey = "";
        state.orderItems = [];
        state.numericValue = "";
        state.remainingSeconds = timerSeconds;

        if (exercise.type === "LineOrderingExercise") {
            state.orderItems = (exercise.contentData.lines || []).map(function (line) {
                return { id: line.id, text: line.text };
            });
        }
    }

    function renderMultipleChoice(exercise) {
        const options = exercise.contentData.options || [];
        const correctCount = (exercise.answerData.correctOptionIds || []).length;
        const wrapper = document.createElement("div");
        wrapper.className = (exercise.contentData.code || []).length ? "numeric-layout" : "answer-stack";
        const grid = document.createElement("div");
        grid.className = "answer-stack";

        if ((exercise.contentData.code || []).length) {
            wrapper.appendChild(createCodeStage(exercise.contentData.code));
        }

        options.forEach(function (option) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-card";
            button.dataset.optionId = option.id;
            button.innerHTML = [
                "<span class=\"answer-marker\">", escapeHtml(option.id), "</span>",
                "<span class=\"answer-card-text\">", escapeHtml(option.text), "</span>"
            ].join("");
            button.addEventListener("click", function () {
                if (correctCount > 1) {
                    toggleListValue(state.selectedOptionIds, option.id);
                } else {
                    state.selectedOptionIds = [option.id];
                }

                grid.querySelectorAll(".answer-card").forEach(function (item) {
                    item.classList.toggle("is-selected", state.selectedOptionIds.includes(item.dataset.optionId));
                });
            });
            grid.appendChild(button);
        });

        wrapper.appendChild(grid);
        elements.questionContent.appendChild(wrapper);
    }

    function renderNumeric(exercise) {
        const wrapper = document.createElement("div");
        wrapper.className = "numeric-layout";

        if ((exercise.contentData.code || []).length) {
            wrapper.appendChild(createCodeStage(exercise.contentData.code));
        }

        const input = document.createElement("input");
        input.className = "magic-input";
        input.type = "number";
        input.inputMode = "decimal";
        input.placeholder = "Respuesta numerica";
        input.addEventListener("input", function () {
            state.numericValue = input.value;
        });

        wrapper.appendChild(input);
        elements.questionContent.appendChild(wrapper);
        input.focus();
    }

    function renderSelectLines(exercise) {
        const stack = document.createElement("div");
        stack.className = "answer-stack";

        (exercise.contentData.lines || []).forEach(function (line, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-card selection-card";
            button.dataset.lineId = line.id;
            button.innerHTML = [
                "<span class=\"answer-marker\">", escapeHtml(line.id), "</span>",
                "<div class=\"answer-card-copy\">",
                buildCodeLineMarkup(line.text, index + 1, exercise.contentData.lines.length),
                "</div>"
            ].join("");
            button.addEventListener("click", function () {
                state.selectedLineIds = [line.id];
                stack.querySelectorAll(".answer-card").forEach(function (item) {
                    item.classList.toggle("is-selected", state.selectedLineIds.includes(item.dataset.lineId));
                });
            });
            stack.appendChild(button);
        });

        elements.questionContent.appendChild(stack);
    }

    function renderOrderLines() {
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
            article.querySelectorAll("[data-order-move]").forEach(function (button) {
                button.addEventListener("click", function () {
                    moveOrderItem(index, button.dataset.orderMove);
                });
            });
            list.appendChild(article);
        });
    }

    function renderFillBlanks(exercise) {
        elements.questionContent.classList.add("has-internal-scroll");

        if (!state.activeBlankKey) {
            state.activeBlankKey = getFirstBlankKey(exercise);
        }

        const builder = document.createElement("div");
        builder.className = "template-builder";

        const stage = document.createElement("div");
        stage.className = "code-stage";
        stage.innerHTML = (exercise.contentData.template || []).map(function (line, index) {
            return [
                "<div class=\"template-row\">",
                "<span class=\"code-line-number\">", formatLineNumber(index + 1, exercise.contentData.template.length), "</span>",
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
            "<p>Toca un hueco y luego una palabra.</p>",
            "</div>",
            "<button class=\"template-clear-button\" type=\"button\">Vaciar hueco</button>",
            "</div>",
            "<div class=\"template-word-bank\">",
            (exercise.contentData.wordBank || []).map(function (word) {
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
                renderFillBlanks(exercise);
            });
        });

        bankPanel.querySelectorAll("[data-word]").forEach(function (button) {
            button.addEventListener("click", function () {
                fillActiveBlank(exercise, button.dataset.word);
            });
        });

        bankPanel.querySelector(".template-clear-button").addEventListener("click", function () {
            if (state.activeBlankKey) {
                delete state.blankAnswers[state.activeBlankKey];
            }
            renderFillBlanks(exercise);
        });
    }

    function onPrimaryAction() {
        if (state.locked || state.isCompleting) {
            return;
        }

        const exercise = getCurrentExercise();
        const answer = getCurrentAnswer(exercise);

        if (!answer) {
            showFloatingResult("error", "Respuesta incompleta", "Completa el ejercicio para comprobar.");
            audio.playIncorrect();
            return;
        }

        if (!api.validateExerciseAnswer(exercise, answer)) {
            showFloatingResult("error", "Respuesta incorrecta", "Corrige este ejercicio para poder avanzar.");
            audio.playIncorrect();
            return;
        }

        stopTimer();
        state.answers.push({
            exerciseId: exercise.id,
            answer: answer
        });
        showFloatingResult("success", "Respuesta correcta", "Avanzando al siguiente ejercicio.");
        audio.playCorrect();

        if (state.currentIndex >= state.exercises.length - 1) {
            window.setTimeout(completeAttempt, 720);
            return;
        }

        state.currentIndex += 1;
        window.setTimeout(renderQuestion, 720);
    }

    async function completeAttempt() {
        state.isCompleting = true;
        stopTimer();
        elements.primaryAction.disabled = true;

        try {
            const outcome = await api.completeLevel(level.id, state.answers);
            audio.playComplete();
            window.CapyCore.updateHud();
            window.CapyCore.renderSidebarSkins();
            showCompletionOverlay(outcome);
        } catch (error) {
            state.isCompleting = false;
            elements.primaryAction.disabled = false;
            showFloatingResult("error", "No se pudo guardar", error.message || "Intenta de nuevo.");
        }
    }

    function getCurrentAnswer(exercise) {
        if (!exercise) {
            return null;
        }

        if (exercise.type === "MultipleChoiceExercise") {
            return state.selectedOptionIds.length ? { optionIds: state.selectedOptionIds.slice() } : null;
        }

        if (exercise.type === "NumericAnswerExercise") {
            return state.numericValue !== "" ? { value: state.numericValue } : null;
        }

        if (exercise.type === "LineSelectionExercise") {
            return state.selectedLineIds.length ? { lineIds: state.selectedLineIds.slice() } : null;
        }

        if (exercise.type === "LineOrderingExercise") {
            return { lineIds: state.orderItems.map(function (item) { return item.id; }) };
        }

        if (exercise.type === "FillBlanksExercise") {
            const requiredKeys = Object.keys(exercise.answerData.correctBlanks || {});
            const hasAll = requiredKeys.every(function (key) {
                return state.blankAnswers[key] !== undefined && state.blankAnswers[key] !== "";
            });

            return hasAll ? { blanks: Object.assign({}, state.blankAnswers) } : null;
        }

        return null;
    }

    function getCurrentExercise() {
        return state.exercises[state.currentIndex] || null;
    }

    function renderProgress() {
        const current = Math.min(state.currentIndex + 1, state.exercises.length);
        const total = state.exercises.length || 5;
        const percent = total ? (current - 1) / total * 100 : 0;

        elements.progressRatio.textContent = current + "/" + total;
        elements.progressFill.style.width = Math.max(0, Math.min(100, percent)) + "%";
        renderTimer();
    }

    function startTimer() {
        stopTimer();
        state.remainingSeconds = timerSeconds;
        renderTimer();
        state.timerId = window.setInterval(function () {
            state.remainingSeconds -= 1;
            renderTimer();

            if (state.remainingSeconds <= 0) {
                stopTimer();
                state.locked = true;
                audio.playIncorrect();
                showGameOverOverlay();
            }
        }, 1000);
    }

    function stopTimer() {
        if (state.timerId) {
            window.clearInterval(state.timerId);
            state.timerId = 0;
        }
    }

    function renderTimer() {
        if (!elements.timer) {
            return;
        }

        const danger = state.remainingSeconds <= Math.max(5, Math.ceil(timerSeconds * 0.25));
        elements.timer.innerHTML = [
            "<span>Tiempo</span>",
            "<strong>", Math.max(0, state.remainingSeconds), "s</strong>"
        ].join("");
        elements.timer.classList.toggle("is-danger", danger);
    }

    function renderLockedState() {
        stopTimer();
        elements.missionLabel.textContent = "Nivel bloqueado";
        elements.questionTitle.textContent = "Este nivel aun no esta disponible";
        elements.questionContent.innerHTML = [
            "<div class=\"completion-card\">",
            "<p>Completa primero el nivel actual para desbloquearlo.</p>",
            "<a class=\"scene-button primary\" href=\"mapa.html\">Volver al mapa</a>",
            "</div>"
        ].join("");
        elements.primaryAction.style.display = "none";
        elements.secondaryAction.style.display = "none";
        elements.progressRatio.textContent = "0/5";
        elements.progressFill.style.width = "0%";
    }

    function renderEmptyState(message) {
        stopTimer();
        if (elements.missionLabel) {
            elements.missionLabel.textContent = "CapyCode";
        }
        elements.questionTitle.textContent = message;
        elements.questionContent.innerHTML = [
            "<div class=\"completion-card\">",
            "<p>", escapeHtml(message), "</p>",
            "<a class=\"scene-button primary\" href=\"mapa.html\">Volver al mapa</a>",
            "</div>"
        ].join("");
        elements.primaryAction.style.display = "none";
        elements.secondaryAction.style.display = "none";
    }

    function showCompletionOverlay(outcome) {
        clearCompletionOverlay();

        const practice = outcome && outcome.practice;
        const reward = outcome && outcome.reward ? Number(outcome.reward) : 0;
        const title = outcome && outcome.gameCompleted
            ? "Juego completado"
            : (outcome && outcome.routeCompleted ? "Ruta completada" : (practice ? "Practica completada" : "Nivel completado"));
        const copy = outcome && outcome.gameCompleted
            ? "Terminaste todos los niveles disponibles. Desde ahora puedes repetirlos como practica."
            : (outcome && outcome.routeCompleted ? "Se desbloqueo la siguiente ruta. Puedes continuar desde el mapa." : (practice ? "Este intento fue de practica, por eso no modifica XP ni racha." : "Ganaste XP y avanzaste al siguiente nivel."));

        const overlay = document.createElement("div");
        overlay.className = "completion-overlay";
        overlay.innerHTML = [
            "<span class=\"completion-spotlight\" aria-hidden=\"true\"></span>",
            buildCompletionRadiance(),
            "<section class=\"completion-screen\" role=\"dialog\" aria-modal=\"true\">",
            buildConfetti(),
            "<div class=\"completion-screen-art\">",
            "<img src=\"assets/characters/Capythilda.png\" alt=\"Capythilda\">",
            "</div>",
            "<div class=\"completion-screen-copy\">",
            "<p class=\"panel-kicker\">", practice ? "Practica" : "Progreso guardado", "</p>",
            "<h2>", escapeHtml(title), "</h2>",
            "<p class=\"completion-lead\">", escapeHtml(copy), "</p>",
            reward ? "<p class=\"level-reward-pill\">+" + window.CapyCore.formatNumber(reward) + " XP</p>" : "",
            "<div class=\"completion-actions\">",
            "<a class=\"scene-button primary\" href=\"mapa.html\">Volver al mapa</a>",
            "<button class=\"scene-button ghost\" type=\"button\" data-retry-level>Repetir nivel</button>",
            "</div>",
            "</div>",
            "</section>"
        ].join("");

        document.body.appendChild(overlay);
        document.body.classList.add("quiz-complete");
        overlay.querySelector("[data-retry-level]").addEventListener("click", function () {
            document.body.classList.remove("quiz-complete");
            overlay.remove();
            startAttempt("manual");
        });
    }

    function showGameOverOverlay() {
        clearCompletionOverlay();
        clearAnswerPopup();

        const overlay = document.createElement("div");
        overlay.className = "completion-overlay";
        overlay.innerHTML = [
            "<span class=\"completion-spotlight\" aria-hidden=\"true\"></span>",
            buildCompletionRadiance(),
            "<section class=\"completion-screen is-game-over\" role=\"dialog\" aria-modal=\"true\">",
            "<div class=\"completion-screen-art\">",
            "<img src=\"assets/characters/Capythilda.png\" alt=\"Capythilda\">",
            "</div>",
            "<div class=\"completion-screen-copy\">",
            "<p class=\"panel-kicker\">Tiempo agotado</p>",
            "<h2>Game Over</h2>",
            "<p class=\"completion-lead\">El intento termino porque se agoto el tiempo del ejercicio. Puedes reiniciar el nivel o volver al mapa.</p>",
            "<div class=\"completion-actions\">",
            "<a class=\"scene-button ghost\" href=\"mapa.html\">Salir al mapa</a>",
            "<button class=\"scene-button primary\" type=\"button\" data-retry-level>Reiniciar nivel</button>",
            "</div>",
            "</div>",
            "</section>"
        ].join("");

        document.body.appendChild(overlay);
        document.body.classList.add("quiz-complete");
        overlay.querySelector("[data-retry-level]").addEventListener("click", function () {
            document.body.classList.remove("quiz-complete");
            overlay.remove();
            startAttempt("manual");
        });
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

    function moveOrderItem(index, direction) {
        const nextIndex = direction === "up" ? index - 1 : index + 1;

        if (nextIndex < 0 || nextIndex >= state.orderItems.length) {
            return;
        }

        const nextItems = state.orderItems.slice();
        const current = nextItems[index];
        nextItems[index] = nextItems[nextIndex];
        nextItems[nextIndex] = current;
        state.orderItems = nextItems;
        paintSortable();
    }

    function fillActiveBlank(exercise, word) {
        if (!state.activeBlankKey) {
            state.activeBlankKey = getFirstBlankKey(exercise);
        }

        if (!state.activeBlankKey) {
            return;
        }

        state.blankAnswers[state.activeBlankKey] = word;
        renderFillBlanks(exercise);
    }

    function getFirstBlankKey(exercise) {
        const template = (exercise.contentData.template || []).join("\n");
        const match = template.match(/\{([^}]+)\}/);
        return match ? match[1] : "";
    }

    function buildTemplateLineMarkup(line) {
        return escapeHtml(line).replace(/\{([^}]+)\}/g, function (_, key) {
            const value = state.blankAnswers[key] || "";
            const isActive = state.activeBlankKey === key;

            return [
                "<button class=\"code-blank",
                value ? " is-filled" : " is-empty",
                isActive ? " is-active" : "",
                "\" type=\"button\" data-blank-key=\"", escapeAttribute(key), "\">",
                value ? escapeHtml(value) : escapeHtml(key),
                "</button>"
            ].join("");
        });
    }

    function createCodeStage(lines) {
        const stage = document.createElement("div");
        stage.className = "code-stage";
        stage.innerHTML = (lines || []).map(function (line, index) {
            return buildCodeLineMarkup(line, index + 1, lines.length);
        }).join("");
        return stage;
    }

    function buildCodeLineMarkup(line, lineNumber, totalLines) {
        return [
            "<div class=\"code-line\">",
            "<span class=\"code-line-number\">", formatLineNumber(lineNumber, totalLines), "</span>",
            "<code class=\"code-line-content\">", highlightPython(line), "</code>",
            "</div>"
        ].join("");
    }

    function highlightPython(line) {
        const escaped = escapeHtml(line);
        const tokens = escaped.match(/(&quot;.*?&quot;|&#039;.*?&#039;|#[^\n]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|==|!=|<=|>=|[-+*/%=<>()[\]{},.:]|[^\sA-Za-z0-9_]+)/g);

        if (!tokens) {
            return escaped;
        }

        let output = "";
        let cursor = 0;

        tokens.forEach(function (token) {
            const index = escaped.indexOf(token, cursor);
            if (index > cursor) {
                output += escaped.slice(cursor, index);
            }

            output += wrapToken(token);
            cursor = index + token.length;
        });

        output += escaped.slice(cursor);
        return output;
    }

    function wrapToken(token) {
        if (/^#/.test(token)) {
            return "<span class=\"code-token-comment\">" + token + "</span>";
        }
        if (/^(&quot;|&#039;)/.test(token)) {
            return "<span class=\"code-token-string\">" + token + "</span>";
        }
        if (/^\d/.test(token)) {
            return "<span class=\"code-token-number\">" + token + "</span>";
        }
        if (PYTHON_KEYWORDS.has(token)) {
            return "<span class=\"code-token-keyword\">" + token + "</span>";
        }
        if (PYTHON_BUILTINS.has(token)) {
            return "<span class=\"code-token-builtin\">" + token + "</span>";
        }
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
            return "<span class=\"code-token-variable\">" + token + "</span>";
        }
        if (/^[-+*/%=<>!]+$/.test(token)) {
            return "<span class=\"code-token-operator\">" + token + "</span>";
        }
        if (/^[()[\]{},.:]$/.test(token)) {
            return "<span class=\"code-token-punctuation\">" + token + "</span>";
        }
        return token;
    }

    function toggleListValue(list, value) {
        const index = list.indexOf(value);
        if (index >= 0) {
            list.splice(index, 1);
            return;
        }
        list.push(value);
    }

    function shuffleArray(items) {
        const copy = (items || []).slice();

        for (let index = copy.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            const current = copy[index];
            copy[index] = copy[swapIndex];
            copy[swapIndex] = current;
        }

        return copy;
    }

    function normalizeLevelId(rawLevelId) {
        const parsed = Number(rawLevelId);
        const total = api.getTotalLevelCountSync();

        if (!Number.isFinite(parsed)) {
            return 1;
        }

        return Math.max(1, Math.min(Math.trunc(parsed), total));
    }

    function formatLineNumber(lineNumber, totalLines) {
        const width = String(totalLines || 1).length;
        return String(lineNumber).padStart(width, "0");
    }

    function escapeHtml(value) {
        return window.CapyCore.escapeHtml(value);
    }

    function escapeAttribute(value) {
        return window.CapyCore.escapeAttribute(value);
    }

    function createAudioSystem() {
        let context = null;
        let musicOscillator = null;
        let musicGain = null;
        let musicInterval = 0;
        let musicStep = 0;
        const melody = [392, 440, 523.25, 587.33, 523.25, 440, 349.23, 392];
        const harmony = [196, 220, 261.63, 293.66];

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

        function playTone(frequency, duration, type, gainValue) {
            const ctx = ensureContext();
            if (!ctx) {
                return;
            }

            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.type = type || "sine";
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(gainValue || 0.045, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
        }

        function playMusicNote(frequency, startDelay, duration, gainValue, type) {
            const ctx = ensureContext();
            if (!ctx || !musicGain) {
                return;
            }

            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            const startAt = ctx.currentTime + startDelay;
            oscillator.type = type || "sine";
            oscillator.frequency.setValueAtTime(frequency, startAt);
            gain.gain.setValueAtTime(0.001, startAt);
            gain.gain.linearRampToValueAtTime(gainValue, startAt + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
            oscillator.connect(gain);
            gain.connect(musicGain);
            oscillator.start(startAt);
            oscillator.stop(startAt + duration + 0.05);
        }

        function scheduleMusicPhrase() {
            const melodyNote = melody[musicStep % melody.length];
            const harmonyNote = harmony[Math.floor(musicStep / 2) % harmony.length];

            playMusicNote(harmonyNote, 0, 1.55, 0.075, "triangle");
            playMusicNote(melodyNote, 0.02, 0.34, 0.105, "sine");
            playMusicNote(melody[(musicStep + 2) % melody.length], 0.42, 0.32, 0.085, "sine");
            playMusicNote(melody[(musicStep + 4) % melody.length], 0.82, 0.38, 0.07, "triangle");
            musicStep += 1;
        }

        function startMusic() {
            const ctx = ensureContext();
            if (!ctx || musicOscillator) {
                return;
            }

            musicOscillator = ctx.createOscillator();
            musicGain = ctx.createGain();
            const droneGain = ctx.createGain();
            musicOscillator.type = "sine";
            musicOscillator.frequency.value = 130.81;
            droneGain.gain.value = 0.028;
            musicGain.gain.value = 1.15;
            musicOscillator.connect(droneGain);
            droneGain.connect(musicGain);
            musicGain.connect(ctx.destination);
            musicOscillator.start();
            scheduleMusicPhrase();
            musicInterval = window.setInterval(scheduleMusicPhrase, 1600);
        }

        return {
            startMusic: startMusic,
            playCorrect: function () {
                playTone(660, 0.13, "sine", 0.14);
                window.setTimeout(function () { playTone(880, 0.13, "sine", 0.12); }, 90);
            },
            playIncorrect: function () {
                playTone(170, 0.2, "sawtooth", 0.105);
            },
            playComplete: function () {
                playTone(523, 0.16, "sine", 0.13);
                window.setTimeout(function () { playTone(659, 0.16, "sine", 0.13); }, 110);
                window.setTimeout(function () { playTone(784, 0.24, "sine", 0.13); }, 220);
            }
        };
    }
}());
