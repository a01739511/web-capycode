(function () {
    function readLocalJson(key, fallback) {
        return readJson(localStorage, key, fallback);
    }

    function writeLocalJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function readSessionJson(key, fallback) {
        return readJson(sessionStorage, key, fallback);
    }

    function writeSessionJson(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    function readJson(storage, key, fallback) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            storage.removeItem(key);
            return fallback;
        }
    }

    function readNumber(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function uniqueList(items) {
        return (Array.isArray(items) ? items : []).filter(function (item, index, list) {
            return item && list.indexOf(item) === index;
        });
    }

    function arrayCopy(value) {
        return Array.isArray(value) ? value.slice() : [];
    }

    function normalizeUsernameKey(username) {
        return String(username || "").trim().toLowerCase();
    }

    window.CapyApiStorage = {
        readLocalJson: readLocalJson,
        writeLocalJson: writeLocalJson,
        readSessionJson: readSessionJson,
        writeSessionJson: writeSessionJson,
        readNumber: readNumber,
        uniqueList: uniqueList,
        arrayCopy: arrayCopy,
        normalizeUsernameKey: normalizeUsernameKey
    };
}());
