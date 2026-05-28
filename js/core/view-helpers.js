(function () {
    function escapeHtml(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function normalizeDisplayText(value) {
        const text = String(value || "");

        if (text.indexOf("Ãƒ") === -1 && text.indexOf("Ã‚") === -1) {
            return text;
        }

        try {
            return decodeURIComponent(escape(text));
        } catch (error) {
            return text;
        }
    }

    function getTransparentOutfitImage(item) {
        return item && (item.transparentImage || item.image) ? (item.transparentImage || item.image) : "";
    }

    function isUnlockedOutfit(profile, itemId) {
        const unlocked = profile && (profile.unlockedOutfitIds || profile.unlockedCharacters) || [];
        return unlocked.includes(itemId);
    }

    function isDiscoveredOutfit(profile, itemId) {
        const discovered = profile && (profile.discoveredOutfitIds || profile.availableOutfitIds) || [];
        return discovered.includes(itemId) || isUnlockedOutfit(profile, itemId);
    }

    function getActiveOutfit(api, profile) {
        if (!api || !profile) {
            return null;
        }

        return api.getOutfitByIdSync(profile.currentOutfitId || profile.equippedCharacter) ||
            api.getOutfitsSync()[0] ||
            null;
    }

    function getCurrentRouteLabel(api, profile) {
        if (!api || !profile) {
            return "Ruta actual";
        }

        const totalLevels = api.getTotalLevelCountSync();
        const isGameCompleted = profile.currentLevelId === totalLevels + 1;
        const route = api.getCurrentRouteForUserSync(profile);

        return isGameCompleted ? "Juego completado" : (route ? route.name : "Ruta actual");
    }

    function getUnlockedRouteBadgeIds(api, profile, levelsPerRoute) {
        if (!api || !profile) {
            return [];
        }

        if (Array.isArray(profile.unlockedBadgeRouteIds) && profile.unlockedBadgeRouteIds.length) {
            return profile.unlockedBadgeRouteIds.map(Number);
        }

        const playableLevelsPerRoute = Number(levelsPerRoute || 7);
        const highestCompletedLevel = Math.max(
            0,
            Math.min(api.getTotalLevelCountSync(), Number(profile.currentLevelId || 1) - 1)
        );

        return api.getRoutesSync().filter(function (route) {
            return highestCompletedLevel >= route.orderIndex * playableLevelsPerRoute;
        }).map(function (route) {
            return Number(route.id);
        });
    }

    window.CapyViewHelpers = {
        escapeHtml: escapeHtml,
        escapeAttribute: escapeAttribute,
        normalizeDisplayText: normalizeDisplayText,
        getTransparentOutfitImage: getTransparentOutfitImage,
        isUnlockedOutfit: isUnlockedOutfit,
        isDiscoveredOutfit: isDiscoveredOutfit,
        getActiveOutfit: getActiveOutfit,
        getCurrentRouteLabel: getCurrentRouteLabel,
        getUnlockedRouteBadgeIds: getUnlockedRouteBadgeIds
    };
}());
