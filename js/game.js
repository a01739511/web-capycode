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

    if (!app || !api || !window.CapyCore || !window.CapyGameState || !window.CapyGameAnswers ||
        !window.CapyGameRenderer || !window.CapyGameDragSort || !window.CapyGameCompletion ||
        !window.CapyGameAudio) {
        return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const levelId = normalizeLevelId(searchParams.get("levelId") || searchParams.get("level"));
    const level = api.getLevelByIdSync(levelId);
    const timerSeconds = level ? api.getDifficultySeconds(level.difficulty) : 30;
    const UNLOCK_ALL_LEVELS_FOR_PREVIEW = Boolean(
        window.CAPYCODE_CONFIG && window.CAPYCODE_CONFIG.UNLOCK_ALL_LEVELS_FOR_PREVIEW
    );
    const LEVEL_MUSIC_TRACKS = Array.isArray(window.CAPYCODE_LEVEL_MUSIC)
        ? window.CAPYCODE_LEVEL_MUSIC.filter(function (track) {
            return track && track.src;
        })
        : [];

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

    const state = window.CapyGameState.createInitialState(timerSeconds);

    const audio = window.CapyGameAudio.createAudioSystem(LEVEL_MUSIC_TRACKS);
    let answerPopupTimer = 0;

    if (!level) {
        renderEmptyState("Nivel no encontrado.");
        return;
    }

    elements.primaryAction.addEventListener("click", onPrimaryAction);
    audio.startMusic();
    window.setTimeout(audio.startMusic, 350);
    document.addEventListener("pointerdown", audio.startMusic, { once: true });
    document.addEventListener("touchstart", audio.startMusic, { once: true, passive: true });
    document.addEventListener("keydown", function (event) {
        audio.startMusic();

        if (event.key === "Enter" && event.ctrlKey) {
            onPrimaryAction();
        }
    });
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            audio.startMusic();
        }
    });
    window.addEventListener("beforeunload", audio.stopMusic);

    start();

    async function start() {
        const profile = window.CapyCore.getProfile();

        if (!UNLOCK_ALL_LEVELS_FOR_PREVIEW &&
            level.id > profile.currentLevelId &&
            profile.currentLevelId !== api.getTotalLevelCountSync() + 1) {
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
        state.exercises = window.CapyGameState.prepareAttemptExercises(state.sourceExercises, 5);
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
            isPractice ? " (Práctica)" : ""
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
        state.orderBankItems = [];
        state.numericValue = "";
        state.remainingSeconds = timerSeconds;

        if (exercise.type === "LineOrderingExercise") {
            state.orderBankItems = (exercise.contentData.lines || []).map(function (line) {
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
        grid.className = "answer-stack answer-choice-grid";
        if (options.length === 4) {
            grid.classList.add("answer-choice-grid--quad");
        }
        if (hasLongOptions(options)) {
            grid.classList.add("has-long-options");
        }

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
        window.requestAnimationFrame(function () {
            tuneAnswerGridDensity(grid);
        });
    }

    function hasLongOptions(options) {
        return options.some(function (option) {
            return String(option.text || "").length > 78;
        });
    }

    function tuneAnswerGridDensity(grid) {
        if (!grid || !elements.questionContent) {
            return;
        }

        const hasOverflow = elements.questionContent.scrollHeight > elements.questionContent.clientHeight + 8;
        grid.classList.toggle("is-space-tight", hasOverflow);
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
        input.placeholder = "Respuesta numérica";
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

        function renderOrderLines(exercise) {
        const layout = document.createElement("section");
        layout.className = "sortable-layout";
        layout.innerHTML = [
            "<article class=\"sortable-panel\">",
            "<div class=\"sortable-panel-head\">",
            "<p class=\"panel-kicker\">Bloques disponibles</p>",
            "<p>Arrastra cada línea desde aquí.</p>",
            "</div>",
            "<div class=\"sortable-list\" id=\"sortable-bank\" data-order-zone=\"bank\" aria-label=\"Bloques disponibles\"></div>",
            "</article>",
            "<article class=\"sortable-panel is-builder\">",
            "<div class=\"sortable-panel-head\">",
            "<p class=\"panel-kicker\">Área de construcción</p>",
            "<p>Forma el código correcto aquí.</p>",
            "</div>",
            "<div class=\"sortable-list is-builder\" id=\"sortable-build\" data-order-zone=\"build\" aria-label=\"Área de construcción\"></div>",
            "</article>"
        ].join("");
        elements.questionContent.appendChild(layout);
        paintSortable(exercise);
    }

    function paintSortable(exercise) {
        const bank = document.getElementById("sortable-bank");
        const build = document.getElementById("sortable-build");
        if (!bank || !build) {
            return;
        }

        bank.innerHTML = "";
        build.innerHTML = "";

        paintSortableZone(bank, state.orderBankItems, "bank");
        paintSortableZone(build, state.orderItems, "build");

        renderSortableBuildPlaceholder(build);

        bindOrderZone(bank);
        bindOrderZone(build);
        syncOrderItemsFromDom(exercise);
    }

    function paintSortableZone(zoneElement, items, zoneName) {
        items.forEach(function (item, index) {
            const article = document.createElement("article");
            article.className = "sortable-row";
            article.dataset.index = String(index);
            article.dataset.lineId = item.id;
            article.dataset.orderZone = zoneName;
            article.innerHTML = [
                "<button class=\"drag-pill\" type=\"button\" draggable=\"true\" aria-label=\"Arrastrar línea ", index + 1, "\"><img src=\"assets/menu-icon.svg\" alt=\"\"></button>",
                "<div class=\"sortable-row-code\">",
                buildCodeLineMarkup(item.text, index + 1, items.length),
                "</div>"
            ].join("");
            bindDragHandle(article);
            zoneElement.appendChild(article);
        });
    }

    function bindDragHandle(article) {
        const handle = article.querySelector(".drag-pill");
        if (!handle) {
            return;
        }

        handle.addEventListener("dragstart", function (event) {
            state.draggedLineId = article.dataset.lineId;
            article.classList.add("is-dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", state.draggedLineId);
            event.dataTransfer.setDragImage(article, 24, 24);
        });

        handle.addEventListener("dragend", function () {
            article.classList.remove("is-dragging");
            syncOrderItemsFromDom(getCurrentExercise());
            state.draggedLineId = "";
        });

        article.addEventListener("dragover", function (event) {
            const draggedRow = getDraggedRow();
            if (!draggedRow || draggedRow === article) {
                return;
            }

            event.preventDefault();
            const list = article.parentElement;
            const rect = article.getBoundingClientRect();
            const shouldPlaceAfter = event.clientY > rect.top + rect.height / 2;

            if (shouldPlaceAfter) {
                list.insertBefore(draggedRow, article.nextSibling);
            } else {
                list.insertBefore(draggedRow, article);
            }
        });

        article.addEventListener("drop", function (event) {
            event.preventDefault();
            syncOrderItemsFromDom(getCurrentExercise());
        });

        handle.addEventListener("pointerdown", function (event) {
            beginPointerDrag(event, article);
        });
    }

    function bindOrderZone(zoneElement) {
        zoneElement.addEventListener("dragover", function (event) {
            const draggedRow = getDraggedRow();
            if (!draggedRow) {
                return;
            }

            event.preventDefault();
            if (!event.target.closest(".sortable-row")) {
                removeSortableBuildPlaceholder(zoneElement);
                zoneElement.appendChild(draggedRow);
            }
        });

        zoneElement.addEventListener("drop", function (event) {
            const draggedRow = getDraggedRow();
            if (!draggedRow) {
                return;
            }

            event.preventDefault();
            if (!event.target.closest(".sortable-row")) {
                removeSortableBuildPlaceholder(zoneElement);
                zoneElement.appendChild(draggedRow);
            }
            syncOrderItemsFromDom(getCurrentExercise());
        });
    }

    function beginPointerDrag(event, article) {
        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        event.preventDefault();
        state.pointerDragLineId = article.dataset.lineId;
        article.classList.add("is-dragging");
        document.addEventListener("pointermove", handlePointerDragMove);
        document.addEventListener("pointerup", endPointerDrag);
        document.addEventListener("pointercancel", endPointerDrag);
    }

    function handlePointerDragMove(event) {
        const draggedRow = getPointerDraggedRow();
        if (!draggedRow) {
            return;
        }

        event.preventDefault();
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const targetRow = target ? target.closest(".sortable-row") : null;
        const targetZone = target ? target.closest("[data-order-zone]") : null;

        if (targetRow && targetRow !== draggedRow) {
            const list = targetRow.parentElement;
            const rect = targetRow.getBoundingClientRect();
            const shouldPlaceAfter = event.clientY > rect.top + rect.height / 2;

            if (shouldPlaceAfter) {
                window.CapyGameDragSort.moveRowAfter(draggedRow, targetRow);
            } else {
                window.CapyGameDragSort.moveRowBefore(draggedRow, targetRow);
            }

            syncOrderItemsFromDom(getCurrentExercise());
            return;
        }

        if (targetZone) {
            removeSortableBuildPlaceholder(targetZone);
            targetZone.appendChild(draggedRow);
            syncOrderItemsFromDom(getCurrentExercise());
        }
    }

    function endPointerDrag() {
        const draggedRow = getPointerDraggedRow();
        if (draggedRow) {
            draggedRow.classList.remove("is-dragging");
        }

        syncOrderItemsFromDom(getCurrentExercise());
        state.pointerDragLineId = "";
        document.removeEventListener("pointermove", handlePointerDragMove);
        document.removeEventListener("pointerup", endPointerDrag);
        document.removeEventListener("pointercancel", endPointerDrag);
    }

    function getPointerDraggedRow() {
        if (!state.pointerDragLineId) {
            return null;
        }

        return window.CapyGameDragSort.getDraggedRow("[data-line-id]", function (row) {
            return row.dataset.lineId === state.pointerDragLineId;
        }) || null;
    }

    function getDraggedRow() {
        if (!state.draggedLineId) {
            return null;
        }

        return window.CapyGameDragSort.getDraggedRow("[data-line-id]", function (row) {
            return row.dataset.lineId === state.draggedLineId;
        }) || null;
    }

    function syncOrderItemsFromDom(exercise) {
        const bank = document.getElementById("sortable-bank");
        const build = document.getElementById("sortable-build");
        if (!bank || !build || !exercise) {
            return;
        }

        const sourceLines = (exercise.contentData.lines || []).map(function (line) {
            return { id: line.id, text: line.text };
        });
        const itemsById = new Map(sourceLines.map(function (item) {
            return [String(item.id), item];
        }));
        state.orderBankItems = Array.from(bank.querySelectorAll("[data-line-id]")).map(function (row) {
            return itemsById.get(String(row.dataset.lineId));
        }).filter(Boolean);
        state.orderItems = Array.from(build.querySelectorAll("[data-line-id]")).map(function (row) {
            return itemsById.get(String(row.dataset.lineId));
        }).filter(Boolean);
        renderSortableBuildPlaceholder(build);
    }

    function renderSortableBuildPlaceholder(build) {
        if (!build) {
            return;
        }

        removeSortableBuildPlaceholder(build);
        if (state.orderItems.length) {
            return;
        }

        build.insertAdjacentHTML("beforeend", [
            "<div class=\"sortable-empty-state\">",
            "<strong>Construye tu respuesta aquí</strong>",
            "<span>Suelta las líneas en esta zona para ordenarlas.</span>",
            "</div>"
        ].join(""));
    }

    function removeSortableBuildPlaceholder(zoneElement) {
        if (!zoneElement || zoneElement.id !== "sortable-build") {
            return;
        }

        zoneElement.querySelectorAll(".sortable-empty-state").forEach(function (emptyState) {
            emptyState.remove();
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
            return state.orderItems.length === (exercise.contentData.lines || []).length
                ? { lineIds: state.orderItems.map(function (item) { return item.id; }) }
                : null;
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
        elements.questionTitle.textContent = "Este nivel aún no está disponible";
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
            outcome: outcome,
            copy: copy
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
        if (celebrationOutfits.length) {
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
        audio.playGameOver();
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

        if (!UNLOCK_ALL_LEVELS_FOR_PREVIEW &&
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

    function getNewlyDiscoveredOutfits(outcome) {
        if (!outcome || !Array.isArray(outcome.newlyDiscoveredOutfits)) {
            return [];
        }

        return outcome.newlyDiscoveredOutfits.filter(function (item) {
            return item && item.id && item.image;
        });
    }

    function getCelebrationOutfits(outcome) {
        return getNewlyDiscoveredOutfits(outcome);
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

    function buildStoryBeatMarkup(storyBeat) {
        if (!storyBeat || !storyBeat.message) {
            return "";
        }

        return [
            "<article class=\"completion-story-card\">",
            "<div class=\"completion-story-art\">",
            storyBeat.characterImage
                ? "<img src=\"" + escapeAttribute(storyBeat.characterImage) + "\" alt=\"" + escapeAttribute(storyBeat.characterName || "Guía de la ruta") + "\">"
                : "<img src=\"assets/characters/Capythilda.webp\" alt=\"Capythilda\">",
            "</div>",
            "<div class=\"completion-story-copy\">",
            "<span>", escapeHtml(storyBeat.message), "</span>",
            "</div>",
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
        return String(line).split(/(\{[^}]+\})/g).map(function (part) {
            const match = part.match(/^\{([^}]+)\}$/);
            if (!match) {
                return highlightPython(part);
            }

            const key = match[1];
            const value = state.blankAnswers[key] || "";
            const isActive = state.activeBlankKey === key;

            return [
                "<button class=\"code-blank",
                value ? " is-filled" : " is-empty",
                isActive ? " is-active" : "",
                "\" type=\"button\" data-blank-key=\"", escapeAttribute(key), "\">",
                value ? escapeHtml(value) : escapeHtml(getBlankPlaceholderLabel(key)),
                "</button>"
            ].join("");
        }).join("");
    }

    function getBlankPlaceholderLabel(key) {
        return "";
    }

    function buildRetryActionMarkup(label) {
        return window.CapyGameCompletion.buildRetryActionMarkup(label, {
            escapeAttribute: escapeAttribute,
            escapeHtml: escapeHtml
        });
    }

    function buildCompletionLeadMarkup(context) {
        const practice = Boolean(context && context.practice);
        const outcome = context && context.outcome;
        const copy = String((context && context.copy) || "");
        const needsRetryIcon = !practice && !(outcome && outcome.routeCompleted) && !(outcome && outcome.gameCompleted);

        if (needsRetryIcon) {
            return [
                "<div class=\"completion-inline-retry\">",
                buildRetryActionMarkup("Repetir nivel"),
                "</div>"
            ].join("");
        }

        return "";
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
        const source = String(line === undefined || line === null ? "" : line);
        const tokens = source.match(/(".*?"|'.*?'|#[^\n]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|==|!=|<=|>=|[-+*/%=<>()[\]{},.:]|[^\sA-Za-z0-9_]+)/g);

        if (!tokens) {
            return escapeHtml(source);
        }

        let output = "";
        let cursor = 0;

        tokens.forEach(function (token) {
            const index = source.indexOf(token, cursor);
            if (index > cursor) {
                output += escapeHtml(source.slice(cursor, index));
            }

            output += wrapToken(token);
            cursor = index + token.length;
        });

        output += escapeHtml(source.slice(cursor));
        return output;
    }

    function wrapToken(token) {
        const safeToken = escapeHtml(token);
        if (/^#/.test(token)) {
            return "<span class=\"code-token-comment\">" + safeToken + "</span>";
        }
        if (/^("|')/.test(token)) {
            return "<span class=\"code-token-string\">" + safeToken + "</span>";
        }
        if (/^\d/.test(token)) {
            return "<span class=\"code-token-number\">" + safeToken + "</span>";
        }
        if (PYTHON_KEYWORDS.has(token)) {
            return "<span class=\"code-token-keyword\">" + safeToken + "</span>";
        }
        if (PYTHON_BUILTINS.has(token)) {
            return "<span class=\"code-token-builtin\">" + safeToken + "</span>";
        }
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
            return "<span class=\"code-token-variable\">" + safeToken + "</span>";
        }
        if (/^[-+*/%=<>!]+$/.test(token)) {
            return "<span class=\"code-token-operator\">" + safeToken + "</span>";
        }
        if (/^[()[\]{},.:]$/.test(token)) {
            return "<span class=\"code-token-punctuation\">" + safeToken + "</span>";
        }
        return safeToken;
    }

    function toggleListValue(list, value) {
        window.CapyGameAnswers.toggleListValue(list, value);
    }

    function shuffleArray(items) {
        return window.CapyGameState.shuffleArray(items);
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
        return window.CapyGameRenderer.escapeHtml(value);
    }

    function escapeAttribute(value) {
        return window.CapyGameRenderer.escapeAttribute(value);
    }

}());
