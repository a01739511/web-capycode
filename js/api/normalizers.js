(function () {
    function validateUsername(username, minLength, maxLength) {
        const cleanUsername = String(username || "").trim();

        if (!cleanUsername) {
            throw new Error("Escribe un nombre de usuario.");
        }

        if (cleanUsername.length < minLength || cleanUsername.length > maxLength) {
            throw new Error("El usuario debe tener entre " + minLength + " y " + maxLength + " caracteres.");
        }

        return cleanUsername;
    }

    function validatePassword(password, minLength, maxLength) {
        const cleanPassword = String(password || "");

        if (!cleanPassword) {
            throw new Error("Escribe una contraseña.");
        }

        if (cleanPassword.length < minLength || cleanPassword.length > maxLength) {
            throw new Error("La contraseña debe tener entre " + minLength + " y " + maxLength + " caracteres.");
        }

        return cleanPassword;
    }

    window.CapyUserNormalizers = {
        validateUsername: validateUsername,
        validatePassword: validatePassword
    };
}());
