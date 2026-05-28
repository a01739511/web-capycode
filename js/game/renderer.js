(function () {
    // El renderizador convierte un ejercicio normalizado en controles visuales
    // consistentes, sin decidir nada sobre progreso o evaluacion.
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

    function escapeHtml(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }

    function formatLineNumber(lineNumber, totalLines) {
        const width = String(totalLines || 1).length;
        return String(lineNumber).padStart(width, "0");
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

    function createQuestionRenderer(options) {
        const settings = options || {};
        const elements = settings.elements || {};
        const state = settings.state || {};
        const answers = settings.answers || window.CapyGameAnswers;
        const dragSortRuntime = settings.dragSortRuntime || null;

        function renderExercise(exercise) {
            renderExerciseContext(exercise);

            if (exercise.type === "MultipleChoiceExercise") {
                renderMultipleChoice(exercise);
                return;
            }

            if (exercise.type === "NumericAnswerExercise") {
                renderNumeric(exercise);
                return;
            }

            if (exercise.type === "LineSelectionExercise") {
                renderSelectLines(exercise);
                return;
            }

            if (exercise.type === "LineOrderingExercise" && dragSortRuntime) {
                dragSortRuntime.renderExercise(elements.questionContent, exercise);
                return;
            }

            renderFillBlanks(exercise);
        }

        function renderExerciseContext(exercise) {
            const context = exercise &&
                exercise.contentData &&
                exercise.contentData.context &&
                typeof exercise.contentData.context === "object"
                ? exercise.contentData.context
                : null;

            if (!context) {
                return;
            }

            const scene = String(context.scene || "").trim();
            const task = String(context.task || "").trim();
            const rules = Array.isArray(context.rules) ? context.rules.filter(Boolean) : [];
            const acceptance = String(context.acceptance || "").trim();
            const commonPitfall = String(context.commonPitfall || "").trim();
            const canonicalFlow = Array.isArray(context.canonicalFlow) ? context.canonicalFlow.filter(Boolean) : [];

            if (!scene && !task && !rules.length && !acceptance && !commonPitfall && !canonicalFlow.length) {
                return;
            }

            const section = document.createElement("section");
            section.className = "exercise-context-card";
            section.innerHTML = [
                scene ? "<p class=\"exercise-context-scene\">" + escapeHtml(scene) + "</p>" : "",
                task ? "<p class=\"exercise-context-task\"><strong>Consigna:</strong> " + escapeHtml(task) + "</p>" : "",
                rules.length ? buildContextListMarkup("Reglas de lectura", rules, "ul") : "",
                canonicalFlow.length ? buildContextListMarkup("Secuencia canónica evaluada", canonicalFlow, "ol") : "",
                acceptance ? "<p class=\"exercise-context-note\"><strong>Criterio de validación:</strong> " + escapeHtml(acceptance) + "</p>" : "",
                commonPitfall ? "<p class=\"exercise-context-note is-warning\"><strong>Evita este error común:</strong> " + escapeHtml(commonPitfall) + "</p>" : ""
            ].join("");
            elements.questionContent.appendChild(section);
        }

        function buildContextListMarkup(label, items, tagName) {
            const safeTagName = tagName === "ol" ? "ol" : "ul";
            return [
                "<div class=\"exercise-context-list-block\">",
                "<p class=\"exercise-context-label\">", escapeHtml(label), "</p>",
                "<", safeTagName, " class=\"exercise-context-list\">",
                items.map(function (item) {
                    return "<li>" + escapeHtml(item) + "</li>";
                }).join(""),
                "</", safeTagName, ">",
                "</div>"
            ].join("");
        }

        function renderMultipleChoice(exercise) {
            const optionsList = exercise.contentData.options || [];
            const correctCount = (exercise.answerData.correctOptionIds || []).length;
            const wrapper = document.createElement("div");
            wrapper.className = (exercise.contentData.code || []).length ? "numeric-layout" : "answer-stack";
            const grid = document.createElement("div");
            grid.className = "answer-stack answer-choice-grid";

            if (optionsList.length === 4) {
                grid.classList.add("answer-choice-grid--quad");
            }

            if (hasLongOptions(optionsList)) {
                grid.classList.add("has-long-options");
            }

            if ((exercise.contentData.code || []).length) {
                wrapper.appendChild(createCodeStage(exercise.contentData.code));
            }

            optionsList.forEach(function (option) {
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
                        answers.toggleListValue(state.selectedOptionIds, option.id);
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

        function renderFillBlanks(exercise) {
            elements.questionContent.classList.add("has-internal-scroll");

            if (!state.activeBlankKey) {
                state.activeBlankKey = answers.getFirstBlankKey(exercise);
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
                    answers.fillActiveBlank(state, exercise, button.dataset.word);
                    renderFillBlanks(exercise);
                });
            });

            bankPanel.querySelector(".template-clear-button").addEventListener("click", function () {
                if (state.activeBlankKey) {
                    delete state.blankAnswers[state.activeBlankKey];
                }
                renderFillBlanks(exercise);
            });
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

        return {
            renderExercise: renderExercise
        };
    }

    function hasLongOptions(options) {
        return options.some(function (option) {
            return String(option.text || "").length > 78;
        });
    }

    function tuneAnswerGridDensity(grid) {
        const questionContent = document.getElementById("question-content");

        if (!grid || !questionContent) {
            return;
        }

        const hasOverflow = questionContent.scrollHeight > questionContent.clientHeight + 8;
        grid.classList.toggle("is-space-tight", hasOverflow);
    }

    function getBlankPlaceholderLabel(key) {
        return "";
    }

    window.CapyGameRenderer = {
        escapeHtml: escapeHtml,
        escapeAttribute: escapeAttribute,
        formatLineNumber: formatLineNumber,
        createCodeStage: createCodeStage,
        buildCodeLineMarkup: buildCodeLineMarkup,
        createQuestionRenderer: createQuestionRenderer
    };
}());
