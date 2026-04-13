(function () {
    const SESSION_KEY = "capycodeSession";
    const mode = document.body.dataset.authMode;
    const form = document.getElementById("auth-form");
    const message = document.getElementById("form-message");

    if (!form || !mode) {
        return;
    }

    if (readSession()) {
        window.location.href = "p_opcionMultiple.html";
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const username = String(formData.get("username") || "").trim();
        const password = String(formData.get("password") || "");

        if (!username || !password) {
            showMessage("Completa todos los campos obligatorios.", "error");
            return;
        }

        if (password.length < 3) {
            showMessage("Usa al menos 3 caracteres para seguir probando.", "error");
            return;
        }

        allowAccess(username);
    });

    function allowAccess(username) {
        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                username: username,
                loggedInAt: new Date().toISOString()
            })
        );

        showMessage("Acceso correcto. Entrando a la mision...", "success");
        window.setTimeout(function () {
            window.location.href = "p_opcionMultiple.html";
        }, 500);
    }

    function readSession() {
        try {
            const rawSession = localStorage.getItem(SESSION_KEY);
            return rawSession ? JSON.parse(rawSession) : null;
        } catch (error) {
            return null;
        }
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message";
        message.classList.add(type === "success" ? "is-success" : "is-error");
    }
}());
