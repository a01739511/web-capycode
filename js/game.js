(function () {
    const XP_REWARD = 50;
    const COMPLETION_BONUS = 50;
    const app = document.querySelector("[data-question-types]");
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
        questions: [],
        currentIndex: 0,
        selectedOption: null,
        selectedLines: [],
        blankAnswers: {},
        activeBlankKey: "",
        orderItems: [],
        numericAnswer: "",
        awaitingNext: false
    };

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

    const completionConfigs = {
        mission: {
            activityKey: "nivel-5-mision",
            bonusXp: COMPLETION_BONUS
        },
        order: {
            activityKey: "nivel-5-orden",
            bonusXp: COMPLETION_BONUS
        },
        template: {
            activityKey: "nivel-5-plantilla",
            bonusXp: COMPLETION_BONUS,
            nextLevel: 6,
            unlockCharacter: "CapyExplorer"
        }
    };

    elements.primaryAction.addEventListener("click", onPrimaryAction);

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
        state.activeBlankKey = "";
        state.orderItems = [];
        state.numericAnswer = "";
        state.awaitingNext = false;

        elements.questionTitle.textContent = question.prompt;
        elements.questionContent.innerHTML = "";
        elements.questionContent.classList.remove("has-internal-scroll");
        clearCompletionOverlay();
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
                buildCodeLineMarkup(item.text, index + 1, state.orderItems.length)
            ].join("");
            article.addEventListener("dragstart", handleDragStart);
            article.addEventListener("dragover", handleDragOver);
            article.addEventListener("drop", handleDrop);
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
                correct: state.orderItems.map(function (item) {
                    return item.id;
                }).join("|") === question.orden_correcto.join("|"),
                message: "El orden correcto es " + question.orden_correcto.join(" -> ") + "."
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

        if (question.tipo === "drag_and_drop") {
            Object.keys(question.rellenos).forEach(function (key) {
                const button = elements.questionContent.querySelector("[data-blank-key=\"" + key + "\"]");
                if (!button) {
                    return;
                }

                if (question.rellenos[key] === state.blankAnswers[key]) {
                    button.classList.add("is-filled");
                } else if (!correct) {
                    button.classList.add("is-active");
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
            if (progress && progress.current < progress.total) {
                progress.current += 1;
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
        const outcome = window.CapyCore.completeActivity(app.dataset.progressKey, completionConfigs[app.dataset.progressKey]);
        const profile = outcome.profile;
        const equipped = (window.CAPYCODE_APP_DATA.shopItems || []).find(function (item) {
            return item.id === profile.equippedCharacter;
        });
        const nextPage = app.dataset.nextPage || "mapa.html";
        const headline = outcome.firstCompletion ? "Nivel completado" : "Mision dominada";
        const rewardCopy = outcome.firstCompletion
            ? "Has ganado +" + COMPLETION_BONUS + " XP extra por completar esta estacion."
            : "Esta estacion ya estaba completada. Puedes repetirla para seguir practicando.";
        const celebrationImage = getCelebrationCharacterImage(equipped);

        app.classList.add("is-complete");
        document.body.classList.add("quiz-complete");

        document.body.insertAdjacentHTML("beforeend", [
            "<div class=\"completion-overlay\" data-completion-overlay>",
            "<div class=\"completion-spotlight\" aria-hidden=\"true\"></div>",
            "<div class=\"completion-confetti\" aria-hidden=\"true\">",
            buildConfettiMarkup(),
            "</div>",
            "<section class=\"completion-screen glass-surface\">",
            "<div class=\"completion-screen-copy\">",
            "<p class=\"panel-kicker\">", outcome.firstCompletion ? "Misi\u00f3n superada" : "Pr\u00e1ctica completada", "</p>",
            "<h2>", headline, "</h2>",
            "<p class=\"completion-lead\">", rewardCopy, "</p>",
            celebrationImage ? "<div class=\"completion-screen-art\"><img src=\"" + celebrationImage + "\" alt=\"" + escapeHtml(equipped ? equipped.name : "Personaje") + "\"></div>" : "",
            "<div class=\"completion-actions\">",
            "<a class=\"magic-cta\" href=\"", nextPage, "\">", buildNextCtaLabel(nextPage), "</a>",
            "<a class=\"scene-button ghost\" href=\"mapa.html\">Salir al mapa</a>",
            "</div>",
            "</div>",
            "</section>",
            "</div>"
        ].join(""));
    }

    function buildNextCtaLabel(nextPage) {
        if (nextPage === "mapa.html") {
            return "Volver al mapa";
        }
        return "Ir al siguiente reto";
    }

    function renderProgress() {
        const profile = window.CapyCore.getProfile();
        const progress = profile.missionProgress[app.dataset.progressKey];
        if (!progress) {
            return;
        }

        const percentage = (progress.current / progress.total) * 100;
        elements.missionLabel.textContent = app.dataset.heroTag || "Ruta del nivel";
        elements.progressRatio.textContent = progress.current + "/" + progress.total;
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
        state.currentIndex = 0;
        renderQuestion();
        renderProgress();
        elements.feedback.textContent = "";
        elements.primaryAction.style.display = "";
        elements.primaryAction.disabled = false;
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
        return new Array(18).fill(null).map(function (_, index) {
            return "<span class=\"confetti-piece confetti-piece-" + ((index % 6) + 1) + "\" style=\"--piece-index:" + index + ";\"></span>";
        }).join("");
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
