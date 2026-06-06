(function () {
    // Este modulo traduce cada gesto del jugador al formato de respuesta que
    // espera la validacion, sin tocar render ni reglas de progreso.
    function toggleListValue(list, value) {
        const index = list.indexOf(value);

        if (index >= 0) {
            list.splice(index, 1);
        } else {
            list.push(value);
        }
    }

    function resetAnswerState(state, exercise, timerSeconds) {
        // Cada ejercicio arranca desde cero para que no sobrevivan selecciones
        // del paso anterior al cambiar de reto.
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
                return {
                    id: line.id,
                    text: line.text
                };
            });
        }
    }

    function getCurrentAnswer(state, exercise) {
        if (!exercise) {
            return null;
        }

        if (exercise.type === "MultipleChoiceExercise") {
            return state.selectedOptionIds.length
                ? { optionIds: state.selectedOptionIds.slice() }
                : null;
        }

        if (exercise.type === "NumericAnswerExercise") {
            return state.numericValue !== ""
                ? { value: state.numericValue }
                : null;
        }

        if (exercise.type === "LineSelectionExercise") {
            return state.selectedLineIds.length
                ? { lineIds: state.selectedLineIds.slice() }
                : null;
        }

        if (exercise.type === "LineOrderingExercise") {
            return state.orderItems.length === (exercise.contentData.lines || []).length
                ? {
                    lineIds: state.orderItems.map(function (item) {
                        return item.id;
                    })
                }
                : null;
        }

        if (exercise.type === "FillBlanksExercise") {
            const requiredKeys = Object.keys(exercise.answerData.correctBlanks || {});
            const hasAll = requiredKeys.every(function (key) {
                return state.blankAnswers[key] !== undefined && state.blankAnswers[key] !== "";
            });

            return hasAll
                ? { blanks: Object.assign({}, state.blankAnswers) }
                : null;
        }

        return null;
    }

    function getFirstBlankKey(exercise) {
        const template = (exercise.contentData.template || []).join("\n");
        const match = template.match(/\{([^}]+)\}/);
        return match ? match[1] : "";
    }

    function fillActiveBlank(state, exercise, word) {
        if (!state.activeBlankKey) {
            state.activeBlankKey = getFirstBlankKey(exercise);
        }

        if (!state.activeBlankKey) {
            return;
        }

        state.blankAnswers[state.activeBlankKey] = word;
    }

    window.CapyGameAnswers = {
        toggleListValue: toggleListValue,
        resetAnswerState: resetAnswerState,
        getCurrentAnswer: getCurrentAnswer,
        getFirstBlankKey: getFirstBlankKey,
        fillActiveBlank: fillActiveBlank
    };
}());
