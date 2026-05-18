(function () {
    const existing = window.CAPYCODE_CONFIG || {};
    const protocol = String(window.location.protocol || "").toLowerCase();
    const hostname = String(window.location.hostname || "").toLowerCase();
    const isHttp = protocol === "http:" || protocol === "https:";
    const isLocalNetworkHost = hostname === "localhost"
        || hostname === "127.0.0.1"
        || hostname === "::1"
        || hostname === "[::1]"
        || hostname.indexOf("10.") === 0
        || hostname.indexOf("192.168.") === 0
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
    const inferredBase = existing.API_BASE_URL !== undefined
        ? existing.API_BASE_URL
        : (isHttp && isLocalNetworkHost ? "api" : "");

    window.CAPYCODE_CONFIG = Object.assign({
        API_BASE_URL: inferredBase,
        DATA_SOURCE: existing.DATA_SOURCE !== undefined
            ? existing.DATA_SOURCE
            : (inferredBase ? "auto" : "local"),
        UNLOCK_ALL_ROUTES_FOR_PREVIEW: existing.UNLOCK_ALL_ROUTES_FOR_PREVIEW !== undefined
            ? existing.UNLOCK_ALL_ROUTES_FOR_PREVIEW
            : true,
        UNLOCK_ALL_LEVELS_FOR_PREVIEW: existing.UNLOCK_ALL_LEVELS_FOR_PREVIEW !== undefined
            ? existing.UNLOCK_ALL_LEVELS_FOR_PREVIEW
            : true
    }, existing);
}());
