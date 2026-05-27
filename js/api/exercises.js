(function () {
    function validateExerciseAnswer(exercise, answer) {
        if (!exercise || answer === undefined || answer === null) {
            return false;
        }

        if (exercise.type === "MultipleChoiceExercise") {
            return compareSets(answer.optionIds || [], exercise.answerData.correctOptionIds || []);
        }

        if (exercise.type === "NumericAnswerExercise") {
            return Number(answer.value) === Number(exercise.answerData.correctValue);
        }

        if (exercise.type === "LineSelectionExercise") {
            return compareSets(answer.lineIds || [], exercise.answerData.correctLineIds || []);
        }

        if (exercise.type === "LineOrderingExercise") {
            return compareArrays(answer.lineIds || [], exercise.answerData.correctLineOrder || []);
        }

        if (exercise.type === "FillBlanksExercise") {
            return compareObjects(answer.blanks || {}, exercise.answerData.correctBlanks || {});
        }

        return false;
    }

    function compareArrays(left, right) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
            return false;
        }

        return left.every(function (item, index) {
            return String(item) === String(right[index]);
        });
    }

    function compareSets(left, right) {
        const cleanLeft = (Array.isArray(left) ? left : []).map(String).sort();
        const cleanRight = (Array.isArray(right) ? right : []).map(String).sort();
        return compareArrays(cleanLeft, cleanRight);
    }

    function compareObjects(left, right) {
        const leftKeys = Object.keys(left || {}).sort();
        const rightKeys = Object.keys(right || {}).sort();

        if (!compareArrays(leftKeys, rightKeys)) {
            return false;
        }

        return leftKeys.every(function (key) {
            return String(left[key]) === String(right[key]);
        });
    }

    window.CapyExerciseRules = {
        validateExerciseAnswer: validateExerciseAnswer,
        compareArrays: compareArrays,
        compareSets: compareSets,
        compareObjects: compareObjects
    };
}());
