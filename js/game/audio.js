(function () {
    window.CapyGameAudio = {
        createAudioSystem: createAudioSystem
    };

    function createAudioSystem(levelMusicTracks) {
        const tracks = Array.isArray(levelMusicTracks) ? levelMusicTracks : [];
        let context = null;
        let backgroundPlayer = null;
        let musicStarted = false;
        let shuffledTracks = [];
        let activeTrackSrc = "";
        let lastGameOverPattern = -1;
        const volumeMultiplier = 5;
        const backgroundVolume = 0.42;

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
            gain.gain.setValueAtTime((gainValue || 0.045) * volumeMultiplier, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
        }

        function playSequence(notes, options) {
            const ctx = ensureContext();
            if (!ctx || !Array.isArray(notes)) {
                return;
            }

            const baseDelay = (options && options.stepDelay) || 120;
            notes.forEach(function (note, index) {
                const tone = Array.isArray(note) ? note : [note];
                window.setTimeout(function () {
                    playTone(
                        tone[0],
                        tone[1] || 0.16,
                        tone[2] || "sine",
                        (tone[3] || 0.1) * 5
                    );
                }, baseDelay * index);
            });
        }

        function createBackgroundPlayer() {
            if (backgroundPlayer || !tracks.length) {
                return backgroundPlayer;
            }

            backgroundPlayer = new Audio();
            backgroundPlayer.autoplay = true;
            backgroundPlayer.preload = "metadata";
            backgroundPlayer.playsInline = true;
            backgroundPlayer.volume = backgroundVolume;
            backgroundPlayer.addEventListener("ended", playNextRandomTrack);
            backgroundPlayer.addEventListener("error", playNextRandomTrack);
            return backgroundPlayer;
        }

        function buildShuffledTracks() {
            const pool = tracks.slice();

            for (let index = pool.length - 1; index > 0; index -= 1) {
                const randomIndex = Math.floor(Math.random() * (index + 1));
                const temp = pool[index];
                pool[index] = pool[randomIndex];
                pool[randomIndex] = temp;
            }

            if (pool.length > 1 && pool[0].src === activeTrackSrc) {
                pool.push(pool.shift());
            }

            return pool;
        }

        function playNextRandomTrack() {
            if (!musicStarted || !tracks.length) {
                return;
            }

            if (!shuffledTracks.length) {
                shuffledTracks = buildShuffledTracks();
            }

            const nextTrack = shuffledTracks.shift();
            const player = createBackgroundPlayer();
            if (!nextTrack || !player) {
                return;
            }

            activeTrackSrc = nextTrack.src;
            if (player.src !== new URL(nextTrack.src, window.location.href).href) {
                player.src = nextTrack.src;
            }

            const playPromise = player.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    // Ignore autoplay rejections; the next interaction retries playback.
                });
            }
        }

        function pickNextGameOverPattern() {
            const patterns = [
                [[220, 0.18, "triangle", 0.22], [165, 0.26, "sawtooth", 0.2], [131, 0.44, "sine", 0.18]],
                [[196, 0.2, "square", 0.22], [147, 0.24, "triangle", 0.2], [123, 0.42, "sawtooth", 0.18]],
                [[233, 0.16, "triangle", 0.22], [185, 0.26, "triangle", 0.2], [139, 0.46, "sine", 0.18]]
            ];
            let nextIndex = Math.floor(Math.random() * patterns.length);
            if (patterns.length > 1 && nextIndex === lastGameOverPattern) {
                nextIndex = (nextIndex + 1) % patterns.length;
            }
            lastGameOverPattern = nextIndex;
            return patterns[nextIndex];
        }

        function startMusic() {
            ensureContext();
            if (musicStarted) {
                if (backgroundPlayer && backgroundPlayer.paused) {
                    playNextRandomTrack();
                }
                return;
            }

            musicStarted = true;
            playNextRandomTrack();
        }

        function stopMusic() {
            musicStarted = false;
            shuffledTracks = [];
            activeTrackSrc = "";

            if (backgroundPlayer) {
                backgroundPlayer.pause();
                backgroundPlayer.currentTime = 0;
            }
        }

        return {
            startMusic: startMusic,
            stopMusic: stopMusic,
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
            },
            playUnlock: function () {
                playSequence([
                    [523, 0.12, "triangle", 0.1],
                    [659, 0.14, "triangle", 0.11],
                    [784, 0.16, "triangle", 0.12],
                    [1047, 0.28, "sine", 0.13]
                ], { stepDelay: 105 });
            },
            playGameOver: function () {
                playSequence(pickNextGameOverPattern(), { stepDelay: 120 });
            }
        };
    }
}());
