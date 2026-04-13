(function () {
    const storyRoot = document.getElementById("about-story");
    const mentorsRoot = document.getElementById("about-mentors");
    const extrasRoot = document.getElementById("about-extras");
    const data = window.CAPYCODE_APP_DATA;

    if (!storyRoot || !mentorsRoot || !extrasRoot || !data) {
        return;
    }

    storyRoot.innerHTML = [
        "<p class=\"panel-kicker\">Historia</p>",
        "<h1>", data.academy.title, "</h1>",
        "<p class=\"page-subtitle\">", data.academy.subtitle, "</p>",
        "<p class=\"story-copy\">", data.academy.intro, "</p>",
        data.academy.longStory.map(function (paragraph) {
            return "<p>" + paragraph + "</p>";
        }).join(""),
        "<img class=\"world-map-image\" src=\"", data.map.image, "\" alt=\"Mapa de la academia\">"
    ].join("");

    mentorsRoot.innerHTML = data.mentors.map(function (mentor) {
        return [
            "<article class=\"mentor-card\">",
            "<img src=\"", mentor.image, "\" alt=\"", mentor.name, "\">",
            "<div>",
            "<h3>", mentor.name, "</h3>",
            "<p class=\"mentor-role\">", mentor.role, "</p>",
            "<p>", mentor.focus, "</p>",
            "</div>",
            "</article>"
        ].join("");
    }).join("");

    extrasRoot.innerHTML = [
        "<section class=\"info-grid-section\">",
        "<h2>Ruta narrativa</h2>",
        "<div class=\"route-grid\">",
        data.levels.map(function (level) {
            return [
                "<article class=\"route-card\">",
                "<span class=\"route-index\">Nivel ", level.id, "</span>",
                "<h3>", level.topic, "</h3>",
                "<p><strong>Lugar:</strong> ", level.place, "</p>",
                "<p><strong>Mentor:</strong> ", level.mentor, "</p>",
                "</article>"
            ].join("");
        }).join(""),
        "</div>",
        "</section>",
        "<section class=\"info-grid-section\">",
        "<h2>Mini juegos</h2>",
        "<div class=\"tag-grid\">",
        data.miniGames.map(function (item) {
            return "<span class=\"info-tag\">" + item + "</span>";
        }).join(""),
        "</div>",
        "</section>",
        "<section class=\"info-grid-section\">",
        "<h2>Pociones y articulos</h2>",
        "<div class=\"potion-list\">",
        data.potions.map(function (potion) {
            return "<article class=\"potion-card\"><h3>" + potion.name + "</h3><p>" + potion.color + "</p><p>" + potion.effect + "</p></article>";
        }).join(""),
        "</div>",
        "</section>",
        "<section class=\"info-grid-section\">",
        "<h2>Paleta visual</h2>",
        "<div class=\"palette-strip\">",
        data.palette.map(function (color) {
            return "<div class=\"palette-chip\"><span class=\"palette-swatch\" style=\"background:" + color.hex + "\"></span><strong>" + color.name + "</strong><span>" + color.hex + "</span></div>";
        }).join(""),
        "</div>",
        "</section>"
    ].join("");
}());
