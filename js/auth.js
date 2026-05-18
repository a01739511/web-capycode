(function () {
    if (window.CAPYCODE_MOBILE_DOWNLOAD_ONLY) {
        return;
    }

    const form = document.getElementById("auth-form");
    const message = document.getElementById("form-message");
    const api = window.CapyApi;

    if (!form || !message || !api) {
        return;
    }

    if (api.getCurrentUserSync()) {
        window.location.href = "mapa.html";
        return;
    }

    if (api.isBackendMode()) {
        api.getCurrentUser().then(function (response) {
            if (response && response.user) {
                window.location.href = "mapa.html";
            }
        }).catch(function () {
            // If there is no active backend session, keep the auth form visible.
        });
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const username = String(formData.get("username") || "").trim();
        const password = String(formData.get("password") || "").trim();
        const isRegister = document.body.dataset.authMode === "register";
        const minimumPasswordLength = isRegister ? 8 : 3;

        if (!username || !password) {
            showMessage("Completa usuario y contraseña para entrar.", "error");
            return;
        }

        if (password.length < minimumPasswordLength) {
            showMessage("Usa al menos " + minimumPasswordLength + " caracteres.", "error");
            return;
        }

        setFormBusy(true);

        try {
            if (isRegister) {
                await api.registerUser(username, password);
            } else {
                await api.loginUser(username, password);
            }

            showMessage("Listo. Entrando a CapyCode...", "success");
            window.setTimeout(function () {
                window.location.href = "mapa.html";
            }, 450);
        } catch (error) {
            showMessage(error.message || "No se pudo iniciar sesión.", "error");
        } finally {
            setFormBusy(false);
        }
    });

    function setFormBusy(isBusy) {
        form.querySelectorAll("button, input").forEach(function (control) {
            control.disabled = isBusy;
        });
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message";
        message.classList.add(type === "success" ? "is-success" : "is-error");
    }
}());
