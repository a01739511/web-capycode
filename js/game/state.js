(function () {
    function createInitialState(timerSeconds) {
        return {
            sourceExercises: [],
            exercises: [],
            currentIndex: 0,
            answers: [],
            selectedOptionIds: [],
            selectedLineIds: [],
            blankAnswers: {},
            activeBlankKey: "",
            orderItems: [],
            orderBankItems: [],
            numericValue: "",
            remainingSeconds: timerSeconds,
            timerId: 0,
            transitionTimeoutId: 0,
            locked: false,
            isCompleting: false,
            completionQueued: false,
            completionStarted: false,
            draggedLineId: "",
            pointerDragLineId: ""
        };
    }

    function prepareAttemptExercises(sourceExercises, count) {
        return shuffleArray(sourceExercises).slice(0, count).map(prepareExerciseForAttempt);
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

    window.CapyGameState = {
        createInitialState: createInitialState,
        prepareAttemptExercises: prepareAttemptExercises,
        shuffleArray: shuffleArray
    };
}());
