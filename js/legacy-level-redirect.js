(function () {
    if (window.CAPYCODE_MOBILE_DOWNLOAD_ONLY) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const levelId = params.get("levelId") || params.get("level") || "1";
    window.location.replace("nivel.html?levelId=" + encodeURIComponent(levelId));
}());
