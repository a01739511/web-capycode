(function () {
    function updateStreakOnCompletion(user, date, timezone) {
        const nowIso = date.toISOString();
        const todayKey = getDateKey(nowIso, timezone);
        const lastKey = user.lastCompletionAt ? getDateKey(user.lastCompletionAt, timezone) : "";
        const shouldCelebrate = lastKey !== todayKey;

        if (!lastKey) {
            user.streak = 1;
        } else if (lastKey === todayKey) {
            user.streak = Math.max(1, readNumber(user.streak, 1));
        } else if (daysBetweenDateKeys(lastKey, todayKey) === 1) {
            user.streak = Math.max(0, readNumber(user.streak, 0)) + 1;
        } else {
            user.streak = 1;
        }

        user.lastCompletionAt = nowIso;
        return {
            show: shouldCelebrate,
            streak: readNumber(user.streak, 0),
            title: "Racha activa x" + readNumber(user.streak, 0),
            description: shouldCelebrate
                ? "Tu primera actividad correcta de hoy quedo registrada."
                : ""
        };
    }

    function getVisibleStreak(user, timezone) {
        if (!user || !user.lastCompletionAt) {
            return 0;
        }

        const lastKey = getDateKey(user.lastCompletionAt, timezone);
        const todayKey = getDateKey(new Date().toISOString(), timezone);
        const dayGap = daysBetweenDateKeys(lastKey, todayKey);

        return dayGap <= 1 ? readNumber(user.streak, 0) : 0;
    }

    function getDateKey(isoValue, timezone) {
        const date = isoValue ? new Date(isoValue) : new Date();
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(date).reduce(function (accumulator, part) {
            accumulator[part.type] = part.value;
            return accumulator;
        }, {});

        return [parts.year, parts.month, parts.day].join("-");
    }

    function daysBetweenDateKeys(leftKey, rightKey) {
        const left = leftKey.split("-").map(Number);
        const right = rightKey.split("-").map(Number);
        const leftTime = Date.UTC(left[0], left[1] - 1, left[2]);
        const rightTime = Date.UTC(right[0], right[1] - 1, right[2]);

        return Math.round((rightTime - leftTime) / 86400000);
    }

    function readNumber(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    window.CapyProgressRules = {
        updateStreakOnCompletion: updateStreakOnCompletion,
        getVisibleStreak: getVisibleStreak,
        getDateKey: getDateKey,
        daysBetweenDateKeys: daysBetweenDateKeys
    };
}());
