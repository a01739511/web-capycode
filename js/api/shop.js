(function () {
    function getStarterDiscoveredOutfitIds(starterIds) {
        return (Array.isArray(starterIds) ? starterIds : []).slice();
    }

    function migrateLegacyStarterState(unlockedOutfitIds, currentOutfitId, unlockedBadgeRouteIds, options) {
        const settings = options || {};
        const defaultOutfitId = settings.defaultOutfitId || "Capibara";
        const legacyStarterOutfitId = settings.legacyStarterOutfitId || "CapyBlack";
        const uniqueList = settings.uniqueList || defaultUniqueList;
        const arrayCopy = settings.arrayCopy || defaultArrayCopy;
        let migratedUnlockedOutfitIds = uniqueList(arrayCopy(unlockedOutfitIds));
        let migratedCurrentOutfitId = currentOutfitId;
        const hasRouteOneBadge = arrayCopy(unlockedBadgeRouteIds).includes(1);

        // CapyBlack dejo de ser vestuario inicial: solo permanece si la ruta 1 ya fue completada.
        if (!hasRouteOneBadge) {
            migratedUnlockedOutfitIds = migratedUnlockedOutfitIds.filter(function (outfitId) {
                return outfitId !== legacyStarterOutfitId;
            });

            if (!migratedUnlockedOutfitIds.includes(defaultOutfitId)) {
                migratedUnlockedOutfitIds.unshift(defaultOutfitId);
            }

            if (migratedCurrentOutfitId === legacyStarterOutfitId ||
                !migratedUnlockedOutfitIds.includes(migratedCurrentOutfitId)) {
                migratedCurrentOutfitId = defaultOutfitId;
            }
        }

        if (!migratedUnlockedOutfitIds.includes(defaultOutfitId)) {
            migratedUnlockedOutfitIds.unshift(defaultOutfitId);
        }

        return {
            unlockedOutfitIds: uniqueList(migratedUnlockedOutfitIds),
            currentOutfitId: migratedCurrentOutfitId || defaultOutfitId
        };
    }

    function getDiscoveredOutfitIdsFromState(explicitIds, unlockedOutfitIds, unlockedBadgeRouteIds, options) {
        const settings = options || {};
        const uniqueList = settings.uniqueList || defaultUniqueList;
        const arrayCopy = settings.arrayCopy || defaultArrayCopy;
        const starterIds = getStarterDiscoveredOutfitIds(settings.starterIds);
        const getRouteRewardOutfit = settings.getRouteRewardOutfit || function () { return null; };
        const discovered = uniqueList(
            arrayCopy(explicitIds)
                .concat(arrayCopy(unlockedOutfitIds))
                .concat(starterIds)
        );

        arrayCopy(unlockedBadgeRouteIds).forEach(function (routeId) {
            const routeOutfit = getRouteRewardOutfit(routeId);
            if (routeOutfit && !discovered.includes(routeOutfit.id)) {
                discovered.push(routeOutfit.id);
            }
        });

        return uniqueList(discovered);
    }

    function defaultUniqueList(items) {
        return (Array.isArray(items) ? items : []).filter(function (item, index, list) {
            return item && list.indexOf(item) === index;
        });
    }

    function defaultArrayCopy(value) {
        return Array.isArray(value) ? value.slice() : [];
    }

    window.CapyShopRules = {
        getStarterDiscoveredOutfitIds: getStarterDiscoveredOutfitIds,
        migrateLegacyStarterState: migrateLegacyStarterState,
        getDiscoveredOutfitIdsFromState: getDiscoveredOutfitIdsFromState
    };
}());
