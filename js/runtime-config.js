(function () {
    const existing = window.CAPYCODE_CONFIG || {};
    const protocol = String(window.location.protocol || "").toLowerCase();
    const isHttp = protocol === "http:" || protocol === "https:";
    const inferredBase = existing.API_BASE_URL !== undefined
        ? existing.API_BASE_URL
        : (isHttp ? "api" : "");

    window.CAPYCODE_CONFIG = Object.assign({
        API_BASE_URL: inferredBase,
        DATA_SOURCE: existing.DATA_SOURCE !== undefined ? existing.DATA_SOURCE : "auto",
        UNLOCK_ALL_ROUTES_FOR_PREVIEW: existing.UNLOCK_ALL_ROUTES_FOR_PREVIEW !== undefined
            ? existing.UNLOCK_ALL_ROUTES_FOR_PREVIEW
            : true
    }, existing);
}());
