(function () {
    const SESSION_KEY = "capycodeSession";
    const XP_REWARD = 50;

    const app = document.querySelector(".app-container[data-game-mode]");
    if (!app) {
        return;
    }

    const session = readJson(SESSION_KEY);
    if (!session || !session.username) {
        window.location.href = "iniciar_sesion.html";
        return;
    }

    const state = {
        questions: [],
        currentIndex: 0,
        selectedOption: null,
        selectedLines: [],
        blankAnswers: {},
        orderItems: [],
        numericAnswer: "",
        awaitingNext: false,
        dragIndex: null,
        progress: loadProgress()
    };

    const elements = {
        playerName: document.getElementById("player-name"),
        streak: document.getElementById("streak-value"),
        xp: document.getElementById("xp-value"),
        missionLabel: document.getElementById("mission-label"),
        missionTitle: document.getElementById("mission-title"),
        progressRatio: document.getElementById("progress-ratio"),
        progressFill: document.getElementById("progress-fill"),
        questionTypeLabel: document.getElementById("question-type-label"),
        questionTitle: document.getElementById("question-title"),
        questionContent: document.getElementById("question-content"),
        feedback: document.getElementById("feedback-message"),
        primaryAction: document.getElementById("primary-action-button"),
        restartButton: document.getElementById("restart-button"),
        logoutButton: document.getElementById("logout-button")
    };

    elements.playerName.textContent = session.username;
    elements.logoutButton.addEventListener("click", logout);
    elements.restartButton.addEventListener("click", restartMission);
    elements.primaryAction.addEventListener("click", handlePrimaryAction);

    boot();

    async function boot() {
        const dataset = await loadQuestionDataset();
        const flattenedQuestions = flattenQuestions(dataset);
        const filterType = app.dataset.filterType;

        state.questions = filterType
            ? flattenedQuestions.filter(function (question) {
                return question.tipo === filterType;
            })
            : flattenedQuestions;

        if (!state.questions.length) {
            renderEmptyState("No se encontraron preguntas para esta vista.");
            return;
        }

        state.currentIndex = Math.min(state.progress.currentIndex || 0, state.questions.length - 1);
        syncHeader();
        resetInteractionState();
        renderCurrentQuestion();
        renderProgress();
    }

    async function loadQuestionDataset() {
        try {
            const response = await fetch("questions.json", { cache: "no-store" });
            if (!response.ok) {
                throw new Error("No se pudo leer questions.json");
            }
            return await response.json();
        } catch (error) {
            if (window.CAPYCODE_QUESTIONS) {
                return window.CAPYCODE_QUESTIONS;
            }
            throw error;
        }
    }

    function flattenQuestions(dataset) {
        const results = [];
        const temas = dataset.temas || {};

        Object.keys(temas).forEach(function (tema) {
            const niveles = temas[tema];
            Object.keys(niveles).forEach(function (nivel) {
                (niveles[nivel] || []).forEach(function (question, index) {
                    results.push(Object.assign({}, question, {
                        tema: tema,
                        nivel: nivel,
                        uid: [tema, nivel, index, question.tipo].join("-")
                    }));
                });
            });
        });

        return results;
    }

    function syncHeader() {
        const firstQuestion = state.questions[0];
        const level = firstQuestion.nivel.toUpperCase();
        const topic = firstQuestion.tema.toUpperCase();

        elements.missionLabel.textContent = topic + " | NIVEL " + level;
        if (app.dataset.gameMode === "practice") {
            elements.missionTitle.textContent = "Practica: " + formatQuestionType(firstQuestion.tipo);
        }
    }

    function renderCurrentQuestion() {
        const question = state.questions[state.currentIndex];
        if (!question) {
            renderCompletedState();
            return;
        }

        elements.questionTypeLabel.textContent = formatQuestionType(question.tipo);
        elements.questionTitle.textContent = question.prompt;
        elements.feedback.textContent = "";
        elements.feedback.className = "feedback-message";
        elements.questionContent.innerHTML = "";
        elements.primaryAction.textContent = "Comprobar";
        elements.primaryAction.disabled = false;

        switch (question.tipo) {
        case "opcion_multiple":
            renderMultipleChoice(question);
            break;
        case "ordenar_lineas":
            renderOrderLines(question);
            break;
        case "drag_and_drop":
            renderFillInTheBlank(question);
            break;
        case "seleccionar_lineas":
            renderSelectLines(question);
            break;
        case "respuesta_numerica":
            renderNumericQuestion(question);
            break;
        default:
            renderEmptyState("Este tipo de pregunta todavia no esta implementado.");
            break;
        }
    }

    function renderMultipleChoice(question) {
        const optionsGrid = document.createElement("div");
        optionsGrid.className = "options-grid";

        question.opciones.forEach(function (option) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "option-btn";
            button.innerHTML = "<span class=\"marker\">" + escapeHtml(option.id) + "</span><span class=\"text\">" + escapeHtml(option.text) + "</span>";
            button.addEventListener("click", function () {
                state.selectedOption = option.id;
                updateSelectedOption(optionsGrid, option.id);
            });
            optionsGrid.appendChild(button);
        });

        elements.questionContent.appendChild(optionsGrid);
    }

    function renderOrderLines(question) {
        state.orderItems = question.lineas.map(function (line) {
            return { id: line.id, text: line.text };
        });

        const helper = document.createElement("p");
        helper.className = "helper-text";
        helper.textContent = "Arrastra cada tarjeta desde el icono lateral hasta dejar el orden correcto.";
        elements.questionContent.appendChild(helper);

        const list = document.createElement("div");
        list.className = "sortable-list";
        list.id = "sortable-list";
        elements.questionContent.appendChild(list);
        paintOrderItems();
    }

    function paintOrderItems() {
        const list = document.getElementById("sortable-list");
        list.innerHTML = "";

        state.orderItems.forEach(function (item, index) {
            const article = document.createElement("article");
            article.className = "sortable-item code-card";
            article.draggable = true;
            article.dataset.index = String(index);

            article.addEventListener("dragstart", handleDragStart);
            article.addEventListener("dragover", handleDragOver);
            article.addEventListener("drop", handleDrop);

            article.innerHTML = [
                "<div class=\"drag-handle\" aria-hidden=\"true\">",
                "<img src=\"assets/menu-icon.svg\" alt=\"\">",
                "</div>",
                "<div class=\"code-snippet\"><pre><code>",
                escapeHtml(item.text),
                "</code></pre></div>"
            ].join("");

            list.appendChild(article);
        });
    }

    function renderFillInTheBlank(question) {
        const helper = document.createElement("p");
        helper.className = "helper-text";
        helper.textContent = "Selecciona la palabra correcta para cada espacio.";
        elements.questionContent.appendChild(helper);

        const placeholders = extractPlaceholders(question.plantilla);
        placeholders.forEach(function (placeholder) {
            if (!state.blankAnswers[placeholder]) {
                state.blankAnswers[placeholder] = "";
            }
        });

        const template = document.createElement("div");
        template.className = "template-card";

        question.plantilla.forEach(function (line) {
            const lineElement = document.createElement("div");
            lineElement.className = "template-line";

            const tokens = line.split(/(\{[^}]+\})/g).filter(Boolean);
            tokens.forEach(function (token) {
                if (token.startsWith("{") && token.endsWith("}")) {
                    const key = token.slice(1, -1);
                    const select = document.createElement("select");
                    select.className = "blank-select";
                    select.dataset.placeholder = key;

                    const emptyOption = document.createElement("option");
                    emptyOption.value = "";
                    emptyOption.textContent = "Elegir";
                    select.appendChild(emptyOption);

                    question.banco_palabras.forEach(function (word) {
                        const option = document.createElement("option");
                        option.value = word;
                        option.textContent = word;
                        if (state.blankAnswers[key] === word) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });

                    select.addEventListener("change", function () {
                        state.blankAnswers[key] = select.value;
                    });

                    lineElement.appendChild(select);
                } else {
                    const span = document.createElement("span");
                    span.className = "template-text";
                    span.textContent = token;
                    lineElement.appendChild(span);
                }
            });

            template.appendChild(lineElement);
        });

        const bank = document.createElement("div");
        bank.className = "word-bank";
        question.banco_palabras.forEach(function (word) {
            const pill = document.createElement("span");
            pill.className = "word-pill";
            pill.textContent = word;
            bank.appendChild(pill);
        });

        elements.questionContent.appendChild(template);
        elements.questionContent.appendChild(bank);
    }

    function renderSelectLines(question) {
        const helper = document.createElement("p");
        helper.className = "helper-text";
        helper.textContent = "Haz clic en una o varias lineas para marcarlas.";
        elements.questionContent.appendChild(helper);

        const lineList = document.createElement("div");
        lineList.className = "line-selection-list";

        question.lineas.forEach(function (line) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "line-select-btn";
            button.dataset.lineId = line.id;
            button.innerHTML = "<span class=\"line-id\">" + escapeHtml(line.id) + "</span><code>" + escapeHtml(line.text) + "</code>";
            button.addEventListener("click", function () {
                toggleSelectedLine(line.id);
                updateSelectedLines(lineList);
            });
            lineList.appendChild(button);
        });

        elements.questionContent.appendChild(lineList);
    }

    function renderNumericQuestion(question) {
        if (question.code && question.code.length) {
            const codeCard = document.createElement("div");
            codeCard.className = "code-card";
            codeCard.innerHTML = "<div class=\"code-snippet\"><pre><code>" + escapeHtml(question.code.join("\n")) + "</code></pre></div>";
            elements.questionContent.appendChild(codeCard);
        }

        const inputGroup = document.createElement("div");
        inputGroup.className = "input-group inline-input-group";
        inputGroup.innerHTML = [
            "<label for=\"numeric-answer\">Respuesta numerica</label>",
            "<input type=\"number\" id=\"numeric-answer\" class=\"numeric-input\" placeholder=\"Escribe tu respuesta\">"
        ].join("");

        const input = inputGroup.querySelector("input");
        input.value = state.numericAnswer;
        input.addEventListener("input", function () {
            state.numericAnswer = input.value;
        });

        elements.questionContent.appendChild(inputGroup);
    }

    function handlePrimaryAction() {
        if (!state.questions.length) {
            return;
        }

        if (state.awaitingNext) {
            if (state.currentIndex >= state.questions.length) {
                restartMission();
                return;
            }
            goToNextQuestion();
            return;
        }

        const question = state.questions[state.currentIndex];
        const result = validateQuestion(question);

        if (!result.valid) {
            showFeedback(result.message, "error");
            return;
        }

        applyResult(result.correct, result.explanation);
    }

    function validateQuestion(question) {
        switch (question.tipo) {
        case "opcion_multiple":
            if (!state.selectedOption) {
                return { valid: false, message: "Selecciona una opcion antes de comprobar." };
            }
            return {
                valid: true,
                correct: question.correct_ids.includes(state.selectedOption),
                explanation: "La respuesta correcta es " + question.correct_ids.join(", ") + "."
            };
        case "ordenar_lineas":
            return {
                valid: true,
                correct: state.orderItems.map(function (item) { return item.id; }).join("|") === question.orden_correcto.join("|"),
                explanation: "El orden correcto es " + question.orden_correcto.join(" -> ") + "."
            };
        case "drag_and_drop":
            if (Object.values(state.blankAnswers).some(function (value) { return !value; })) {
                return { valid: false, message: "Completa todos los espacios antes de comprobar." };
            }
            return {
                valid: true,
                correct: Object.keys(question.rellenos).every(function (key) {
                    return question.rellenos[key] === state.blankAnswers[key];
                }),
                explanation: "La plantilla correcta usa: " + Object.values(question.rellenos).join(", ") + "."
            };
        case "seleccionar_lineas":
            if (!state.selectedLines.length) {
                return { valid: false, message: "Selecciona al menos una linea." };
            }
            return {
                valid: true,
                correct: sameItems(state.selectedLines, question.correct_ids),
                explanation: "La seleccion correcta es " + question.correct_ids.join(", ") + "."
            };
        case "respuesta_numerica":
            if (state.numericAnswer === "") {
                return { valid: false, message: "Escribe un numero antes de comprobar." };
            }
            return {
                valid: true,
                correct: Number(state.numericAnswer) === Number(question.valor),
                explanation: "El resultado correcto es " + question.valor + "."
            };
        default:
            return { valid: false, message: "Tipo de pregunta no soportado." };
        }
    }

    function applyResult(correct, explanation) {
        state.awaitingNext = true;
        elements.primaryAction.textContent = state.currentIndex === state.questions.length - 1 ? "Ver resumen" : "Siguiente";

        if (correct) {
            state.progress.correctAnswers += 1;
            state.progress.streak += 1;
            state.progress.xp += XP_REWARD;
            showFeedback("Correcto. " + explanation, "success");
        } else {
            state.progress.streak = 0;
            showFeedback("Aun no. " + explanation, "error");
        }

        renderProgress();
        saveProgress();
    }

    function goToNextQuestion() {
        state.currentIndex += 1;
        state.progress.currentIndex = state.currentIndex;
        state.awaitingNext = false;
        resetInteractionState();
        saveProgress();
        renderProgress();

        if (state.currentIndex >= state.questions.length) {
            renderCompletedState();
            return;
        }

        renderCurrentQuestion();
    }

    function renderCompletedState() {
        elements.questionTypeLabel.textContent = "Mision completada";
        elements.questionTitle.textContent = "Excelente trabajo, " + session.username + ".";
        elements.questionContent.innerHTML = [
            "<div class=\"summary-card\">",
            "<p>Respuestas correctas: <strong>" + state.progress.correctAnswers + " de " + state.questions.length + "</strong></p>",
            "<p>XP acumulada en esta vista: <strong>" + state.progress.xp + "</strong></p>",
            "<p>Tu racha actual es: <strong>" + state.progress.streak + "</strong></p>",
            "<p>Puedes reiniciar la mision para practicar otra vez.</p>",
            "</div>"
        ].join("");
        elements.feedback.textContent = "";
        elements.primaryAction.textContent = "Volver a empezar";
        state.awaitingNext = true;
    }

    function renderEmptyState(message) {
        elements.questionTypeLabel.textContent = "Sin contenido";
        elements.questionTitle.textContent = message;
        elements.questionContent.innerHTML = "";
        elements.primaryAction.disabled = true;
    }

    function renderProgress() {
        const answered = Math.min(
            state.currentIndex + (state.awaitingNext ? 1 : 0),
            state.questions.length
        );
        const total = state.questions.length;
        const progressPercent = total ? (answered / total) * 100 : 0;

        elements.progressRatio.textContent = answered + "/" + total;
        elements.progressFill.style.width = progressPercent + "%";
        elements.streak.textContent = String(state.progress.streak);
        elements.xp.textContent = String(state.progress.xp);
    }

    function showFeedback(text, type) {
        elements.feedback.textContent = text;
        elements.feedback.className = "feedback-message";
        elements.feedback.classList.add(type === "success" ? "is-success" : "is-error");
    }

    function restartMission() {
        state.currentIndex = 0;
        state.progress = {
            currentIndex: 0,
            correctAnswers: 0,
            streak: 0,
            xp: 0
        };
        state.awaitingNext = false;
        resetInteractionState();
        saveProgress();
        renderProgress();
        renderCurrentQuestion();
    }

    function resetInteractionState() {
        state.selectedOption = null;
        state.selectedLines = [];
        state.blankAnswers = {};
        state.numericAnswer = "";
        state.orderItems = [];
        state.dragIndex = null;
    }

    function loadProgress() {
        const key = getProgressKey();
        const saved = readJson(key);
        if (saved) {
            return Object.assign({
                currentIndex: 0,
                correctAnswers: 0,
                streak: 0,
                xp: 0
            }, saved);
        }

        return {
            currentIndex: 0,
            correctAnswers: 0,
            streak: 0,
            xp: 0
        };
    }

    function saveProgress() {
        localStorage.setItem(getProgressKey(), JSON.stringify(state.progress));
    }

    function getProgressKey() {
        const filter = app.dataset.filterType || "all";
        const mode = app.dataset.gameMode || "mission";
        return "capycodeProgress::" + session.username + "::" + mode + "::" + filter;
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "iniciar_sesion.html";
    }

    function updateSelectedOption(container, optionId) {
        container.querySelectorAll(".option-btn").forEach(function (button) {
            const marker = button.querySelector(".marker");
            const selected = marker && marker.textContent === optionId;
            button.classList.toggle("is-selected", selected);
        });
    }

    function toggleSelectedLine(lineId) {
        const index = state.selectedLines.indexOf(lineId);
        if (index >= 0) {
            state.selectedLines.splice(index, 1);
            return;
        }
        state.selectedLines.push(lineId);
    }

    function updateSelectedLines(container) {
        container.querySelectorAll(".line-select-btn").forEach(function (button) {
            button.classList.toggle("is-selected", state.selectedLines.includes(button.dataset.lineId));
        });
    }

    function handleDragStart(event) {
        state.dragIndex = Number(event.currentTarget.dataset.index);
        event.currentTarget.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(state.dragIndex));
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        event.currentTarget.classList.add("is-drop-target");
    }

    function handleDrop(event) {
        event.preventDefault();
        clearDragStyles();
        const fromIndex = Number(event.dataTransfer.getData("text/plain"));
        const toIndex = Number(event.currentTarget.dataset.index);

        if (Number.isNaN(fromIndex) || Number.isNaN(toIndex) || fromIndex === toIndex) {
            state.dragIndex = null;
            return;
        }

        const movedItem = state.orderItems.splice(fromIndex, 1)[0];
        state.orderItems.splice(toIndex, 0, movedItem);
        state.dragIndex = null;
        paintOrderItems();
    }

    document.addEventListener("dragend", function () {
        state.dragIndex = null;
        clearDragStyles();
    });

    function clearDragStyles() {
        document.querySelectorAll(".sortable-item").forEach(function (item) {
            item.classList.remove("is-dragging");
            item.classList.remove("is-drop-target");
        });
    }

    function extractPlaceholders(templateLines) {
        const found = [];
        templateLines.forEach(function (line) {
            const matches = line.match(/\{([^}]+)\}/g) || [];
            matches.forEach(function (match) {
                const placeholder = match.slice(1, -1);
                if (!found.includes(placeholder)) {
                    found.push(placeholder);
                }
            });
        });
        return found;
    }

    function formatQuestionType(type) {
        const labels = {
            opcion_multiple: "Opcion multiple",
            ordenar_lineas: "Ordenar lineas",
            drag_and_drop: "Completar plantilla",
            seleccionar_lineas: "Seleccionar lineas",
            respuesta_numerica: "Respuesta numerica"
        };
        return labels[type] || "Pregunta";
    }

    function readJson(key) {
        try {
            const rawValue = localStorage.getItem(key);
            return rawValue ? JSON.parse(rawValue) : null;
        } catch (error) {
            return null;
        }
    }

    function sameItems(left, right) {
        if (left.length !== right.length) {
            return false;
        }

        const sortedLeft = left.slice().sort();
        const sortedRight = right.slice().sort();
        return sortedLeft.every(function (item, index) {
            return item === sortedRight[index];
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
}());
