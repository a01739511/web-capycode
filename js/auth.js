(function () {
    const SESSION_KEY = "capycodeSession";
    const form = document.getElementById("auth-form");
    const message = document.getElementById("form-message");

    if (!form || !message) {
        return;
    }

    if (readSession()) {
        window.location.href = "mapa.html";
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const username = String(formData.get("username") || "").trim();
        const password = String(formData.get("password") || "").trim();

        if (!username || !password) {
            showMessage("Completa usuario y contrasena para entrar.", "error");
            return;
        }

        if (password.length < 3) {
            showMessage("Usa al menos 3 caracteres para seguir probando.", "error");
            return;
        }

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                username: username,
                loggedInAt: new Date().toISOString()
            })
        );

        showMessage("Listo. Te llevamos al mapa de la academia...", "success");
        window.setTimeout(function () {
            window.location.href = "mapa.html";
        }, 450);
    });

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
