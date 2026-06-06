(function () {
    const publicConfig = window.CAPYCODE_CONFIG = Object.assign({
        API_BASE_URL: "",
        DATA_SOURCE: "auto"
    }, window.CAPYCODE_CONFIG || {});

    const backendBaseUrl = String(publicConfig.API_BASE_URL || "").replace(/\/+$/, "");
    const dataSource = String(publicConfig.DATA_SOURCE || "auto").toLowerCase();

    function isBackendMode() {
        if (dataSource === "local") {
            return false;
        }

        if (dataSource === "backend") {
            return backendBaseUrl.length > 0;
        }

        return backendBaseUrl.length > 0;
    }

    window.CapyApiConfig = {
        config: publicConfig,
        backendBaseUrl: backendBaseUrl,
        dataSource: dataSource,
        isBackendMode: isBackendMode,
        storageKeys: {
            users: "capycodeUsersV3",
            session: "capycodeSessionV3",
            backendUser: "capycodeBackendUserV1",
            backendToken: "capycodeBackendTokenV1",
            legacySession: "capycodeSession",
            legacyProfilePrefix: "capycodeProfile::",
            nextUserId: "capycodeNextUserIdV3"
        },
        defaults: {
            outfitId: "Capibara",
            legacyStarterOutfitId: "CapyBlack"
        },
        validation: {
            usernameMinLength: 3,
            usernameMaxLength: 20,
            passwordMinLength: 8,
            passwordMaxLength: 64
        },
        progression: {
            totalLevelsPerRoute: 7,
            exercisesPerLevel: 5,
            timezone: "America/Mexico_City"
        }
    };
}());
