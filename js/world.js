(function () {
    const world = window.CAPYCODE_WORLD;
    if (!world) {
        return;
    }

    const storyRoot = document.getElementById("academy-story");
    const mapRoot = document.getElementById("academy-map");
    const rosterRoot = document.getElementById("mentor-roster");

    if (!storyRoot || !mapRoot || !rosterRoot) {
        return;
    }

    renderStory();
    renderMap();
    renderRoster();

    function renderStory() {
        storyRoot.innerHTML = [
            "<p class=\"section-eyebrow\">Historia</p>",
            "<h3 class=\"section-title\">", escapeHtml(world.academy.title), "</h3>",
            "<p class=\"story-subtitle\">", escapeHtml(world.academy.subtitle), "</p>",
            "<div class=\"story-hero\">",
            "<img src=\"assets/characters/Capythilda.png\" alt=\"Capythilda, directora de la academia\">",
            "<div>",
            "<p>", escapeHtml(world.academy.intro), "</p>",
            "<p>", escapeHtml(world.academy.currentMission), "</p>",
            "</div>",
            "</div>",
            "<div class=\"palette-strip\">",
            world.palette.map(function (color) {
                return [
                    "<div class=\"palette-chip\">",
                    "<span class=\"palette-swatch\" style=\"background:", escapeHtml(color.hex), "\"></span>",
                    "<strong>", escapeHtml(color.name), "</strong>",
                    "<span>", escapeHtml(color.hex), "</span>",
                    "</div>"
                ].join("");
            }).join(""),
            "</div>"
        ].join("");
    }

    function renderMap() {
        mapRoot.innerHTML = [
            "<p class=\"section-eyebrow\">Mapa narrativo</p>",
            "<h3 class=\"section-title\">Ruta de aprendizaje</h3>",
            "<img class=\"world-map-image\" src=\"", escapeHtml(world.map.image), "\" alt=\"", escapeHtml(world.map.alt), "\">",
            "<p class=\"story-subtitle\">", escapeHtml(world.map.caption), "</p>"
        ].join("");
    }

    function renderRoster() {
        rosterRoot.innerHTML = [
            "<p class=\"section-eyebrow\">Personajes</p>",
            "<h3 class=\"section-title\">Mentores de la academia</h3>",
            "<div class=\"mentor-grid\">",
            world.mentors.map(function (mentor) {
                return [
                    "<article class=\"mentor-card\">",
                    "<img src=\"", escapeHtml(mentor.image), "\" alt=\"", escapeHtml(mentor.name), "\">",
                    "<div>",
                    "<h4>", escapeHtml(mentor.name), "</h4>",
                    "<p class=\"mentor-role\">", escapeHtml(mentor.role), "</p>",
                    "<p>", escapeHtml(mentor.focus), "</p>",
                    "</div>",
                    "</article>"
                ].join("");
            }).join(""),
            "</div>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
}());
