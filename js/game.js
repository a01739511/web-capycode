(function () {
    const XP_REWARD = 50;
    const app = document.querySelector("[data-question-types]");

    if (!app || !window.CapyCore) {
        return;
    }

    const session = window.CapyCore.getSession();
    if (!session) {
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
        awaitingNext: false
    };

    const elements = {
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

    elements.primaryAction.addEventListener("click", onPrimaryAction);
    if (elements.secondaryAction) {
        elements.secondaryAction.addEventListener("click", restartPage);
    }

    start();

    async function start() {
        const dataset = await loadQuestions();
        state.questions = flattenQuestions(dataset).filter(function (question) {
            return questionTypes.includes(question.tipo);
        });

        if (!state.questions.length) {
            renderEmptyState("No hay preguntas configuradas para esta pantalla.");
            return;
        }

        renderQuestion();
        renderProgress();
        window.CapyCore.updateHud();
    }

    async function loadQuestions() {
        try {
            const response = await fetch("questions.json", { cache: "no-store" });
            if (!response.ok) {
                throw new Error("No se pudo cargar questions.json");
            }
            return await response.json();
        } catch (error) {
            return window.CAPYCODE_QUESTIONS;
        }
    }

    function flattenQuestions(dataset) {
        const results = [];
        const temas = dataset.temas || {};

        Object.keys(temas).forEach(function (tema) {
            Object.keys(temas[tema]).forEach(function (nivel) {
                (temas[tema][nivel] || []).forEach(function (question, index) {
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

    function renderQuestion() {
        const question = state.questions[state.currentIndex];
        state.selectedOption = null;
        state.selectedLines = [];
        state.blankAnswers = {};
        state.orderItems = [];
        state.numericAnswer = "";
        state.awaitingNext = false;

        elements.questionTitle.textContent = question.prompt;
        elements.questionContent.innerHTML = "";
        elements.feedback.textContent = "";
        elements.feedback.className = "feedback-banner";
        elements.primaryAction.textContent = "Comprobar";

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
        const grid = document.createElement("div");
        grid.className = "answer-stack";

        question.opciones.forEach(function (option) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-card";
            button.dataset.optionId = option.id;
            button.innerHTML = "<span class=\"answer-marker\">" + option.id + "</span><span>" + escapeHtml(option.text) + "</span>";
            button.addEventListener("click", function () {
                state.selectedOption = option.id;
                grid.querySelectorAll(".answer-card").forEach(function (item) {
                    item.classList.toggle("is-selected", item.dataset.optionId === option.id);
                });
            });
            grid.appendChild(button);
        });

        elements.questionContent.appendChild(grid);
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
        list.innerHTML = "";

        state.orderItems.forEach(function (item, index) {
            const article = document.createElement("article");
            article.className = "sortable-row";
            article.draggable = true;
            article.dataset.index = String(index);
            article.innerHTML = [
                "<div class=\"drag-pill\"><img src=\"assets/menu-icon.svg\" alt=\"\"></div>",
                "<code>", escapeHtml(item.text), "</code>"
            ].join("");
            article.addEventListener("dragstart", handleDragStart);
            article.addEventListener("dragover", handleDragOver);
            article.addEventListener("drop", handleDrop);
            list.appendChild(article);
        });
    }

    function renderTemplate(question) {
        const card = document.createElement("div");
        card.className = "code-stage";

        question.plantilla.forEach(function (line) {
            const row = document.createElement("div");
            row.className = "template-row";

            line.split(/(\{[^}]+\})/g).filter(Boolean).forEach(function (token) {
                if (token.startsWith("{") && token.endsWith("}")) {
                    const key = token.slice(1, -1);
                    const select = document.createElement("select");
                    select.className = "inline-select";
                    select.innerHTML = "<option value=\"\">[]</option>" + question.banco_palabras.map(function (word) {
                        return "<option value=\"" + word + "\">" + word + "</option>";
                    }).join("");
                    select.addEventListener("change", function () {
                        state.blankAnswers[key] = select.value;
                    });
                    row.appendChild(select);
                } else {
                    const span = document.createElement("span");
                    span.textContent = token;
                    row.appendChild(span);
                }
            });

            card.appendChild(row);
        });

        elements.questionContent.appendChild(card);
    }

    function renderSelectLines(question) {
        const stack = document.createElement("div");
        stack.className = "answer-stack";

        question.lineas.forEach(function (line) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-card";
            button.dataset.lineId = line.id;
            button.innerHTML = "<span class=\"answer-marker\">" + line.id + "</span><code>" + escapeHtml(line.text) + "</code>";
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
        wrapper.className = "code-stage";
        wrapper.innerHTML = "<pre><code>" + escapeHtml(question.code.join("\n")) + "</code></pre>";
        elements.questionContent.appendChild(wrapper);

        const input = document.createElement("input");
        input.type = "number";
        input.className = "magic-input";
        input.placeholder = "Escribe tu respuesta";
        input.addEventListener("input", function () {
            state.numericAnswer = input.value;
        });
        elements.questionContent.appendChild(input);
    }

    function onPrimaryAction() {
        if (state.awaitingNext) {
            nextQuestion();
            return;
        }

        const question = state.questions[state.currentIndex];
        const result = validate(question);

        if (!result.valid) {
            showFeedback(result.message, "error");
            return;
        }

        applyAnswerState(question, result.correct);
        updateProfile(result.correct);
        showFeedback(result.correct ? "Correcto. " + result.message : "Aun no. " + result.message, result.correct ? "success" : "error");

        state.awaitingNext = true;
        elements.primaryAction.textContent = state.currentIndex === state.questions.length - 1 ? "Siguiente nivel" : "Siguiente";
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
                message: "La respuesta correcta es " + question.correct_ids.join(", ") + "."
            };
        case "ordenar_lineas":
            return {
                valid: true,
                correct: state.orderItems.map(function (item) { return item.id; }).join("|") === question.orden_correcto.join("|"),
                message: "El orden correcto es " + question.orden_correcto.join(" → ") + "."
            };
        case "drag_and_drop":
            if (Object.keys(question.rellenos).some(function (key) { return !state.blankAnswers[key]; })) {
                return { valid: false, message: "Completa todos los espacios antes de comprobar." };
            }
            return {
                valid: true,
                correct: Object.keys(question.rellenos).every(function (key) {
                    return question.rellenos[key] === state.blankAnswers[key];
                }),
                message: "La plantilla correcta usa " + Object.values(question.rellenos).join(", ") + "."
            };
        case "seleccionar_lineas":
            if (!state.selectedLines.length) {
                return { valid: false, message: "Selecciona al menos una linea." };
            }
            return {
                valid: true,
                correct: sameItems(state.selectedLines, question.correct_ids),
                message: "La linea correcta es " + question.correct_ids.join(", ") + "."
            };
        case "respuesta_numerica":
            if (state.numericAnswer === "") {
                return { valid: false, message: "Escribe un numero antes de comprobar." };
            }
            return {
                valid: true,
                correct: Number(state.numericAnswer) === Number(question.valor),
                message: "El resultado correcto es " + question.valor + "."
            };
        default:
            return { valid: false, message: "Tipo de pregunta no soportado." };
        }
    }

    function applyAnswerState(question, correct) {
        if (question.tipo === "opcion_multiple") {
            elements.questionContent.querySelectorAll(".answer-card").forEach(function (card) {
                if (question.correct_ids.includes(card.dataset.optionId)) {
                    card.classList.add("is-correct");
                } else if (card.dataset.optionId === state.selectedOption && !correct) {
                    card.classList.add("is-incorrect");
                }
            });
        }

        if (question.tipo === "seleccionar_lineas") {
            elements.questionContent.querySelectorAll(".answer-card").forEach(function (card) {
                if (question.correct_ids.includes(card.dataset.lineId)) {
                    card.classList.add("is-correct");
                } else if (state.selectedLines.includes(card.dataset.lineId) && !correct) {
                    card.classList.add("is-incorrect");
                }
            });
        }
    }

    function updateProfile(correct) {
        const profile = window.CapyCore.getProfile();
        const progressKey = app.dataset.progressKey;
        const progress = profile.missionProgress[progressKey];

        if (correct) {
            profile.xp += XP_REWARD;
            profile.streak += 1;
            if (progress.current < progress.total) {
                profile.missionProgress[progressKey].current += 1;
            }
        } else {
            profile.streak = Math.max(0, profile.streak - 1);
        }

        window.CapyCore.saveProfile(profile);
        window.CapyCore.updateHud();
    }

    function nextQuestion() {
        if (state.currentIndex >= state.questions.length - 1) {
            renderCompletion();
            return;
        }

        state.currentIndex += 1;
        renderQuestion();
        renderProgress();
    }

    function renderCompletion() {
        const profile = window.CapyCore.getProfile();
        const equipped = (window.CAPYCODE_APP_DATA.shopItems || []).find(function (item) {
            return item.id === profile.equippedCharacter;
        });

        elements.questionTitle.textContent = "Conocimiento Magico desbloqueado";
        elements.questionContent.innerHTML = [
            "<div class=\"completion-card\">",
            "<p class=\"panel-kicker\">Recompensa</p>",
            "<h3>Has ganado +", XP_REWARD, " Puntos de Magia</h3>",
            equipped ? "<img src=\"" + equipped.image + "\" alt=\"" + equipped.name + "\">" : "",
            "<a class=\"magic-cta\" href=\"" + (app.dataset.nextPage || "mapa.html") + "\">Siguiente nivel</a>",
            "</div>"
        ].join("");
        elements.feedback.textContent = "";
        elements.primaryAction.style.display = "none";
        if (elements.secondaryAction) {
            elements.secondaryAction.textContent = "Volver al mapa";
            elements.secondaryAction.onclick = function () {
                window.location.href = "mapa.html";
            };
        }
    }

    function renderProgress() {
        const profile = window.CapyCore.getProfile();
        const progress = profile.missionProgress[app.dataset.progressKey];
        elements.missionLabel.textContent = app.dataset.progressLabel || "NIVEL 5: CICLOS";
        elements.progressRatio.textContent = progress.current + "/" + progress.total;
        elements.progressFill.style.width = ((progress.current / progress.total) * 100) + "%";
    }

    function restartPage() {
        state.currentIndex = 0;
        renderQuestion();
        renderProgress();
        elements.primaryAction.style.display = "";
    }

    function renderEmptyState(message) {
        elements.questionTitle.textContent = message;
        elements.questionContent.innerHTML = "";
        elements.primaryAction.disabled = true;
    }

    function showFeedback(message, type) {
        elements.feedback.textContent = message;
        elements.feedback.className = "feedback-banner";
        elements.feedback.classList.add(type === "success" ? "is-success" : "is-error");
    }

    function toggleSelectedLine(lineId) {
        const index = state.selectedLines.indexOf(lineId);
        if (index >= 0) {
            state.selectedLines.splice(index, 1);
            return;
        }
        state.selectedLines.push(lineId);
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
}());
