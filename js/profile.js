(function () {
    const heroRoot = document.getElementById("profile-hero");
    const progressRoot = document.getElementById("profile-progress");
    const collectionRoot = document.getElementById("profile-collection");
    const achievementsRoot = document.getElementById("profile-achievements");
    const data = window.CAPYCODE_APP_DATA;

    if (!heroRoot || !progressRoot || !collectionRoot || !achievementsRoot || !data || !window.CapyCore) {
        return;
    }

    const profile = window.CapyCore.getProfile();
    const equipped = data.shopItems.find(function (item) {
        return item.id === profile.equippedCharacter;
    }) || data.shopItems[0];

    heroRoot.innerHTML = [
        "<article class=\"profile-hero-card glass-surface\">",
        "<div class=\"profile-hero-copy\">",
        "<p class=\"panel-kicker\">Perfil del aventurero</p>",
        "<h1 data-player-name></h1>",
        "<p class=\"profile-title\" data-player-title></p>",
        "<div class=\"profile-metrics\">",
        "<div><span>Nivel</span><strong>", profile.level, "</strong></div>",
        "<div><span>Racha</span><strong data-player-streak></strong></div>",
        "<div><span>XP</span><strong data-player-xp></strong></div>",
        "</div>",
        "<p class=\"profile-note\">Tu companero actual es ", equipped.name, ". Sigue completando misiones para desbloquear nuevas vestiduras, abrir estaciones selladas y llevar tu rango mas alla del portal del nivel 6.</p>",
        "<div class=\"profile-hero-actions\">",
        "<a class=\"scene-button primary\" href=\"mapa.html\">Continuar aventura</a>",
        "<a class=\"scene-button ghost\" href=\"tienda.html\">Ver tienda</a>",
        "</div>",
        "</div>",
        "<div class=\"profile-hero-art\">",
        "<img src=\"", equipped.image, "\" alt=\"", equipped.name, "\">",
        "</div>",
        "</article>"
    ].join("");

    progressRoot.innerHTML = [
        buildJourneyCard("Mision principal", profile.missionProgress.mission),
        buildJourneyCard("Ordenar lineas", profile.missionProgress.order),
        buildJourneyCard("Completar plantilla", profile.missionProgress.template),
        buildStatCard("Completadas", String(profile.completedActivities.length), "Estaciones terminadas"),
        buildStatCard("Coleccion", String(profile.unlockedCharacters.length), "Companeros disponibles"),
        buildStatCard("Mapa", String(profile.level - 1), "Niveles desbloqueados")
    ].join("");

    collectionRoot.innerHTML = data.shopItems.map(function (item) {
        const unlocked = window.CapyCore.isUnlocked(item.id, profile);
        const equippedNow = profile.equippedCharacter === item.id;
        return [
            "<article class=\"collection-card", equippedNow ? " is-equipped" : "", unlocked ? "" : " is-locked", "\">",
            "<img src=\"", item.image, "\" alt=\"", item.name, "\">",
            "<div>",
            "<h3>", item.name, "</h3>",
            "<p>", unlocked ? item.perk : "Se desbloquea en la tienda magica.", "</p>",
            "</div>",
            "</article>"
        ].join("");
    }).join("");

    achievementsRoot.innerHTML = buildAchievements(profile).map(function (achievement) {
        return [
            "<article class=\"achievement-card", achievement.unlocked ? " is-unlocked" : "", "\">",
            "<span class=\"achievement-state\">", achievement.unlocked ? "Listo" : "Pendiente", "</span>",
            "<h3>", achievement.title, "</h3>",
            "<p>", achievement.description, "</p>",
            "</article>"
        ].join("");
    }).join("");

    window.CapyCore.updateHud();

    function buildJourneyCard(title, progress) {
        const percentage = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;
        return [
            "<article class=\"journey-card\">",
            "<p>", title, "</p>",
            "<strong>", progress.current, "/", progress.total, "</strong>",
            "<div class=\"mini-progress-track\"><span style=\"width:", percentage, "%\"></span></div>",
            "</article>"
        ].join("");
    }

    function buildStatCard(label, value, caption) {
        return [
            "<article class=\"journey-card is-highlight\">",
            "<p>", label, "</p>",
            "<strong>", value, "</strong>",
            "<span class=\"journey-caption\">", caption, "</span>",
            "</article>"
        ].join("");
    }

    function buildAchievements(currentProfile) {
        return [
            {
                title: "Conocimiento Magico",
                description: "Completa una estacion principal y reclama tu primer bono de finalizacion.",
                unlocked: currentProfile.completedActivities.length >= 1
            },
            {
                title: "Racha Encendida",
                description: "Mantiene una racha de 15 aciertos o mas durante el viaje.",
                unlocked: currentProfile.streak >= 15
            },
            {
                title: "Coleccionista Arcano",
                description: "Desbloquea cuatro o mas companeros en la tienda magica.",
                unlocked: currentProfile.unlockedCharacters.length >= 4
            },
            {
                title: "Portal Abierto",
                description: "Completa el ciclo del nivel 5 y abre acceso a la siguiente estacion.",
                unlocked: currentProfile.level >= 6
            }
        ];
    }
}());
