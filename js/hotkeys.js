(function () {
    const shortcuts = new Map();
    let initialized = false;

    function init() {
        if (initialized) {
            return;
        }

        initialized = true;
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("keydown", trackKeyboardUse, true);
        document.addEventListener("pointerdown", function () {
            document.body.classList.remove("is-using-keyboard");
        }, true);
    }

    function register(config) {
        if (Array.isArray(config)) {
            return config.map(register);
        }

        const shortcut = normalizeShortcut(config);

        if (!shortcut.id) {
            return function noop() {};
        }

        shortcuts.set(shortcut.id, shortcut);
        notifyChange();

        return function unregister() {
            shortcuts.delete(shortcut.id);
            notifyChange();
        };
    }

    function normalizeShortcut(config) {
        const shortcut = Object.assign({
            id: "",
            key: "",
            code: "",
            label: "",
            description: "",
            group: "General",
            order: 100,
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false,
            allowInInput: false,
            displayOnly: false,
            action: null,
            enabled: null
        }, config || {});

        shortcut.key = normalizeKey(shortcut.key);
        shortcut.code = String(shortcut.code || "");
        return shortcut;
    }

    function handleKeydown(event) {
        if (event.defaultPrevented || event.isComposing) {
            return;
        }

        const candidates = Array.from(shortcuts.values()).filter(function (shortcut) {
            return !shortcut.displayOnly && matchesShortcut(shortcut, event);
        });

        if (!candidates.length) {
            return;
        }

        const shortcut = candidates[candidates.length - 1];

        if (!shortcut.allowInInput && isEditableElement(document.activeElement)) {
            return;
        }

        if (typeof shortcut.enabled === "function" && !shortcut.enabled()) {
            return;
        }

        if (typeof shortcut.action !== "function") {
            return;
        }

        event.preventDefault();
        shortcut.action(event);
    }

    function trackKeyboardUse(event) {
        if (event.key === "Tab") {
            document.body.classList.add("is-using-keyboard");
        }
    }

    function matchesShortcut(shortcut, event) {
        const keyMatches = shortcut.code
            ? event.code === shortcut.code
            : normalizeKey(event.key) === shortcut.key;

        return keyMatches &&
            Boolean(event.altKey) === Boolean(shortcut.altKey) &&
            Boolean(event.ctrlKey) === Boolean(shortcut.ctrlKey) &&
            Boolean(event.shiftKey) === Boolean(shortcut.shiftKey) &&
            Boolean(event.metaKey) === Boolean(shortcut.metaKey);
    }

    function isEditableElement(element) {
        if (!element) {
            return false;
        }

        const tagName = element.tagName ? element.tagName.toLowerCase() : "";
        return tagName === "input" ||
            tagName === "textarea" ||
            tagName === "select" ||
            element.isContentEditable;
    }

    function normalizeKey(key) {
        const value = String(key || "");
        if (value.length === 1) {
            return value.toLowerCase();
        }
        return value;
    }

    function navigateTo(href) {
        window.location.href = resolveHref(href);
    }

    function clickSelector(selector) {
        const element = document.querySelector(selector);
        if (element && typeof element.click === "function") {
            element.click();
        }
    }

    function resolveHref(href) {
        const value = String(href || "");
        const localHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
        const currentPage = window.location.pathname.split("/").pop() || "";
        const usesHtmlFiles = window.location.protocol === "file:" || localHost || currentPage.includes(".");

        if (!usesHtmlFiles && value.endsWith(".html")) {
            return value.slice(0, -5);
        }

        return value;
    }

    function getShortcuts() {
        return Array.from(shortcuts.values()).sort(function (left, right) {
            if (left.group !== right.group) {
                return left.group.localeCompare(right.group);
            }
            return left.order - right.order;
        });
    }

    function renderLists() {
        document.querySelectorAll("[data-hotkey-list]").forEach(function (root) {
            renderList(root);
        });
    }

    function renderList(root) {
        const groups = getShortcuts().reduce(function (accumulator, shortcut) {
            const groupName = shortcut.group || "General";
            if (!accumulator[groupName]) {
                accumulator[groupName] = [];
            }
            accumulator[groupName].push(shortcut);
            return accumulator;
        }, {});

        root.innerHTML = Object.keys(groups).map(function (groupName) {
            return [
                "<section class=\"hotkey-group\">",
                "<h3>", escapeHtml(groupName), "</h3>",
                "<div class=\"hotkey-rows\">",
                groups[groupName].map(function (shortcut) {
                    return [
                        "<article class=\"hotkey-row\">",
                        "<kbd>", escapeHtml(formatShortcut(shortcut)), "</kbd>",
                        "<div>",
                        "<strong>", escapeHtml(shortcut.label), "</strong>",
                        "<span>", escapeHtml(shortcut.description), "</span>",
                        "</div>",
                        "</article>"
                    ].join("");
                }).join(""),
                "</div>",
                "</section>"
            ].join("");
        }).join("");
    }

    function formatShortcut(shortcut) {
        const keys = [];

        if (shortcut.ctrlKey) {
            keys.push("Ctrl");
        }
        if (shortcut.altKey) {
            keys.push("Alt");
        }
        if (shortcut.shiftKey) {
            keys.push("Shift");
        }
        if (shortcut.metaKey) {
            keys.push("Meta");
        }

        keys.push(formatKey(shortcut.key || shortcut.code));
        return keys.join(" + ");
    }

    function formatKey(key) {
        if (key === " ") {
            return "Espacio";
        }
        if (key === "ArrowUp") {
            return "Flecha arriba";
        }
        if (key === "ArrowDown") {
            return "Flecha abajo";
        }
        if (key === "Enter") {
            return "Enter";
        }
        if (key === "Tab") {
            return "Tab";
        }
        if (/^Key[A-Z]$/.test(key)) {
            return key.slice(3);
        }
        return String(key).length === 1 ? String(key).toUpperCase() : String(key);
    }

    function notifyChange() {
        document.dispatchEvent(new CustomEvent("capyhotkeyschange"));
        renderLists();
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    init();

    window.CapyHotkeys = {
        register: register,
        getShortcuts: getShortcuts,
        renderLists: renderLists,
        navigateTo: navigateTo,
        clickSelector: clickSelector
    };
}());
