(function () {
    function createRequester(options) {
        const settings = options || {};
        const baseUrl = String(settings.baseUrl || "").replace(/\/+$/, "");
        const getToken = typeof settings.getToken === "function" ? settings.getToken : function () { return ""; };
        const clearAuth = typeof settings.clearAuth === "function" ? settings.clearAuth : function () {};

        return async function request(path, requestOptions) {
            const optionsForFetch = requestOptions || {};
            const hasBody = optionsForFetch.body !== undefined;
            const token = getToken();
            const authHeaders = token
                ? {
                    Authorization: "Bearer " + token,
                    "X-Capy-Token": token
                }
                : {};
            const init = Object.assign({}, optionsForFetch, {
                headers: Object.assign({
                    Accept: "application/json"
                }, hasBody ? { "Content-Type": "application/json" } : {}, authHeaders, optionsForFetch.headers || {})
            });

            if (hasBody && typeof optionsForFetch.body !== "string") {
                init.body = JSON.stringify(optionsForFetch.body);
            }

            const response = await fetch(baseUrl + "/" + String(path || "").replace(/^\/+/, ""), init);
            let payload = null;

            try {
                payload = await response.json();
            } catch (error) {
                payload = null;
            }

            if (!response.ok) {
                if (response.status === 401) {
                    clearAuth();
                }
                const message = payload && payload.error ? payload.error : "La API no pudo completar la solicitud.";
                throw new Error(message);
            }

            return payload;
        };
    }

    window.CapyApiHttp = {
        createRequester: createRequester
    };
}());
