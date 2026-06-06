(function () {
    // El runner solo coordina modulos. La logica de estado, render, drag y
    // audio vive separada para que el flujo del nivel sea facil de explicar.
    const app = document.querySelector("[data-level-runner=\"true\"]");
    const api = window.CapyApi;

    if (!app || !api || !window.CapyCore || !window.CapyGameState || !window.CapyGameAnswers ||
        !window.CapyGameRenderer || !window.CapyGameDragSort || !window.CapyGameCompletion ||
        !window.CapyGameAudio) {
        return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const levelId = normalizeLevelId(searchParams.get("levelId") || searchParams.get("level"));
    const level = api.getLevelByIdSync(levelId);
    const timerSeconds = level ? api.getDifficultySeconds(level.difficulty) : 30;
    const unlockAllLevelsForPreview = Boolean(
        window.CAPYCODE_CONFIG && window.CAPYCODE_CONFIG.UNLOCK_ALL_LEVELS_FOR_PREVIEW
    );
    const levelMusicTracks = Array.isArray(window.CAPYCODE_LEVEL_MUSIC)
        ? window.CAPYCODE_LEVEL_MUSIC.filter(function (track) {
            return track && track.src;
        })
        : [];

    const elements = {
        shell: app,
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
    const audio = window.CapyGameAudio.createAudioSystem(levelMusicTracks);
    const dragSort = window.CapyGameDragSort.createRuntime({
        state: state,
        getCurrentExercise: getCurrentExercise
    });
    const renderer = window.CapyGameRenderer.createQuestionRenderer({
        elements: elements,
        state: state,
        answers: window.CapyGameAnswers,
        dragSortRuntime: dragSort
    });
    const overlays = window.CapyGameCompletion.createRuntime({
        api: api,
        audio: audio,
        level: level,
        startAttempt: startAttempt,
        unlockAllLevelsForPreview: unlockAllLevelsForPreview,
        escapeHtml: window.CapyGameRenderer.escapeHtml,
        escapeAttribute: window.CapyGameRenderer.escapeAttribute
    });

    if (!level) {
        renderEmptyState("Nivel no encontrado.");
        return;
    }

    elements.primaryAction.addEventListener("click", onPrimaryAction);
    startAudioLoop();
    start();

    async function start() {
        const profile = window.CapyCore.getProfile();

        if (!unlockAllLevelsForPreview &&
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

    // Cada intento reconstruye el set de ejercicios y limpia cualquier residuo visual.
    function startAttempt(reason) {
        stopTimer();
        clearPendingTransition();
        overlays.clearAnswerPopup();
        overlays.clearCompletionOverlay();
        state.exercises = window.CapyGameState.prepareAttemptExercises(state.sourceExercises, 5);
        state.currentIndex = 0;
        state.answers = [];
        state.locked = false;
        state.isCompleting = false;
        state.completionQueued = false;
        state.completionStarted = false;

        renderQuestion();
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
            state.completionQueued = true;
            completeAttempt();
            return;
        }

        window.CapyGameAnswers.resetAnswerState(state, exercise, timerSeconds);
        state.locked = false;
        overlays.clearAnswerPopup();
        elements.questionTitle.textContent = exercise.prompt;
        elements.questionContent.innerHTML = "";
        elements.questionContent.classList.remove("has-internal-scroll");
        elements.feedback.textContent = "";
        elements.feedback.className = "feedback-banner";
        elements.primaryAction.textContent = "Comprobar";
        elements.primaryAction.disabled = false;
        elements.secondaryAction.style.display = "none";
        elements.shell.dataset.activeQuestionType = exercise.type;

        renderer.renderExercise(exercise);
        renderProgress();
        startTimer();
    }

    function onPrimaryAction() {
        if (state.locked || state.isCompleting) {
            return;
        }

        const exercise = getCurrentExercise();
        const answer = window.CapyGameAnswers.getCurrentAnswer(state, exercise);

        if (!answer) {
            overlays.showFloatingResult("error", "Respuesta incompleta", "Completa el ejercicio para comprobar.");
            audio.playIncorrect();
            return;
        }

        if (!api.validateExerciseAnswer(exercise, answer)) {
            overlays.showFloatingResult("error", "Respuesta incorrecta", "Corrige este ejercicio para poder avanzar.");
            audio.playIncorrect();
            return;
        }

        stopTimer();
        state.locked = true;
        elements.primaryAction.disabled = true;
        state.answers.push({
            exerciseId: exercise.id,
            answer: answer
        });
        overlays.showFloatingResult("success", "Respuesta correcta", "Avanzando al siguiente ejercicio.");
        audio.playCorrect();

        if (state.currentIndex >= state.exercises.length - 1) {
            state.completionQueued = true;
            state.isCompleting = true;
            queueTransition(completeAttempt, 720);
            return;
        }

        state.currentIndex += 1;
        queueTransition(renderQuestion, 720);
    }

    async function completeAttempt() {
        clearPendingTransition();
        if (state.completionStarted) {
            return;
        }

        state.completionQueued = true;
        state.completionStarted = true;
        state.isCompleting = true;
        stopTimer();
        elements.primaryAction.disabled = true;

        try {
            const outcome = await api.completeLevel(level.id, state.answers);
            audio.playComplete();
            window.CapyCore.updateHud();
            window.CapyCore.renderSidebarSkins();
            overlays.showCompletionOverlay(outcome);
        } catch (error) {
            state.completionStarted = false;
            state.completionQueued = false;
            state.isCompleting = false;
            state.locked = false;
            elements.primaryAction.disabled = false;
            overlays.showFloatingResult("error", "No se pudo guardar", error.message || "Intenta de nuevo.");
        }
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
                overlays.showGameOverOverlay();
            }
        }, 1000);
    }

    function stopTimer() {
        if (state.timerId) {
            window.clearInterval(state.timerId);
            state.timerId = 0;
        }
    }

    function queueTransition(callback, delayMs) {
        clearPendingTransition();
        state.transitionTimeoutId = window.setTimeout(function () {
            state.transitionTimeoutId = 0;
            callback();
        }, delayMs);
    }

    function clearPendingTransition() {
        if (state.transitionTimeoutId) {
            window.clearTimeout(state.transitionTimeoutId);
            state.transitionTimeoutId = 0;
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
        clearPendingTransition();
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
        clearPendingTransition();

        if (elements.missionLabel) {
            elements.missionLabel.textContent = "CapyCode";
        }

        elements.questionTitle.textContent = message;
        elements.questionContent.innerHTML = [
            "<div class=\"completion-card\">",
            "<p>", window.CapyGameRenderer.escapeHtml(message), "</p>",
            "<a class=\"scene-button primary\" href=\"mapa.html\">Volver al mapa</a>",
            "</div>"
        ].join("");
        elements.primaryAction.style.display = "none";
        elements.secondaryAction.style.display = "none";
    }

    function startAudioLoop() {
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
    }

    function normalizeLevelId(rawLevelId) {
        const parsed = Number(rawLevelId);
        const total = api.getTotalLevelCountSync();

        if (!Number.isFinite(parsed)) {
            return 1;
        }

        return Math.max(1, Math.min(Math.trunc(parsed), total));
    }
}());
