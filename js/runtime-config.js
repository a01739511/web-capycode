(function () {
    const existing = window.CAPYCODE_CONFIG || {};
    const protocol = String(window.location.protocol || "").toLowerCase();
    const hostname = String(window.location.hostname || "").toLowerCase();
    const port = String(window.location.port || "");
    const isHttp = protocol === "http:" || protocol === "https:";
    const canonicalAppBase = String(
        existing.CANONICAL_APP_BASE_URL || "http://10.50.67.76/TC2005B_601_3/capycode/"
    );
    const canonicalApiBase = String(
        existing.CANONICAL_API_BASE_URL || (canonicalAppBase.replace(/\/+$/, "") + "/api/index.php")
    );
    const canonicalUrl = new URL(canonicalAppBase, window.location.href);
    const sameCanonicalHost = isHttp &&
        hostname === canonicalUrl.hostname.toLowerCase() &&
        port === String(canonicalUrl.port || "");
    const sameCanonicalPath = sameCanonicalHost &&
        String(window.location.pathname || "").indexOf(canonicalUrl.pathname) === 0;
    const isCanonicalApp = sameCanonicalHost && sameCanonicalPath;

    if (protocol === "https:" && !isCanonicalApp) {
        const currentFile = String(window.location.pathname || "").split("/").pop() || "index.html";
        window.location.replace(
            canonicalAppBase.replace(/\/+$/, "") + "/" + currentFile + window.location.search + window.location.hash
        );
        return;
    }

    const inferredBase = existing.API_BASE_URL !== undefined
        ? existing.API_BASE_URL
        : (isCanonicalApp ? "api/index.php" : canonicalApiBase);

    window.CAPYCODE_CONFIG = Object.assign({
        API_BASE_URL: inferredBase,
        DATA_SOURCE: existing.DATA_SOURCE !== undefined
            ? existing.DATA_SOURCE
            : "backend",
        CANONICAL_APP_BASE_URL: canonicalAppBase,
        CANONICAL_API_BASE_URL: canonicalApiBase,
        UNLOCK_ALL_ROUTES_FOR_PREVIEW: existing.UNLOCK_ALL_ROUTES_FOR_PREVIEW !== undefined
            ? existing.UNLOCK_ALL_ROUTES_FOR_PREVIEW
            : false,
        UNLOCK_ALL_LEVELS_FOR_PREVIEW: existing.UNLOCK_ALL_LEVELS_FOR_PREVIEW !== undefined
            ? existing.UNLOCK_ALL_LEVELS_FOR_PREVIEW
            : false,
        SHOW_ROUTE_OUTFIT_PREVIEW_ON_EVERY_LEVEL: existing.SHOW_ROUTE_OUTFIT_PREVIEW_ON_EVERY_LEVEL !== undefined
            ? existing.SHOW_ROUTE_OUTFIT_PREVIEW_ON_EVERY_LEVEL
            : false
    }, existing);
}());
