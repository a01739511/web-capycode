(function () {
    const storyRoot = document.getElementById("about-story");
    const mapRoot = document.getElementById("about-map");
    const extrasRoot = document.getElementById("about-extras");
    const data = window.CAPYCODE_APP_DATA;
    let activeStationId = "";

    if (!storyRoot || !mapRoot || !extrasRoot || !data) {
        return;
    }

    renderPage();
    bindStationExplorer();

    function renderPage() {
        const stations = data.storyStations || [];
        const entrance = data.academy && data.academy.entrance ? data.academy.entrance : null;

        if (!activeStationId && stations.length) {
            activeStationId = stations[0].id;
        }

        storyRoot.innerHTML = [
            "<p class=\"panel-kicker\">Historia</p>",
            "<h1>", data.academy.title, "</h1>",
            "<p class=\"page-subtitle\">", data.academy.subtitle, "</p>",
            "<p class=\"story-copy\">", data.academy.intro, "</p>",
            data.academy.longStory.map(function (paragraph) {
                return "<p>" + paragraph + "</p>";
            }).join(""),
            entrance ? [
                "<div class=\"about-highlight\">",
                "<p class=\"panel-kicker\">Primera parada</p>",
                "<h2>", entrance.title, "</h2>",
                "<p>", entrance.description, "</p>",
                "</div>"
            ].join("") : ""
        ].join("");

        mapRoot.innerHTML = [
            "<p class=\"panel-kicker\">Mapa narrativo</p>",
            "<h2>El sendero de la academia</h2>",
            "<p class=\"page-subtitle\">Cada estación del bosque representa una parte del aprendizaje. El mapa vive aparte para que puedas apreciarlo completo.</p>",
            "<img class=\"world-map-image world-map-image-large\" src=\"", data.map.image, "\" alt=\"Mapa de la Academia CapyCode\">",
            "<p class=\"about-map-caption\">", data.map.caption, "</p>"
        ].join("");

        renderExtras();
    }

    function renderExtras() {
        const stations = data.storyStations || [];
        const activeStation = stations.find(function (station) {
            return station.id === activeStationId;
        }) || stations[0];

        extrasRoot.innerHTML = [
            "<section class=\"info-grid-section about-explorer\">",
            "<div class=\"panel-header\">",
            "<div>",
            "<p class=\"panel-kicker\">Sendero encantado</p>",
            "<h2>Explora cada estación</h2>",
            "</div>",
            "</div>",
            "<div class=\"story-station-shell\">",
            "<div class=\"story-station-list\">",
            stations.map(function (station) {
                return [
                    "<button class=\"story-station-tab", station.id === activeStation.id ? " is-active" : "", "\" type=\"button\" data-station-id=\"", station.id, "\">",
                    "<span class=\"story-station-order\">", station.order, "</span>",
                    "<strong>", station.title, "</strong>",
                    "<span>", station.place, "</span>",
                    "</button>"
                ].join("");
            }).join(""),
            "</div>",
            buildStationDetail(activeStation),
            "</div>",
            "</section>",
            "<section class=\"info-grid-section\">",
            "<p class=\"panel-kicker\">Lore del bosque</p>",
            "<h2>Elementos clave de CapyCode</h2>",
            "<div class=\"lore-grid\">",
            (data.worldLore || []).map(function (item) {
                return [
                    "<article class=\"lore-card\">",
                    "<h3>", item.title, "</h3>",
                    "<p>", item.description, "</p>",
                    "</article>"
                ].join("");
            }).join(""),
            "</div>",
            "</section>",
            "<section class=\"info-grid-section about-closing\">",
            "<p class=\"panel-kicker\">Destino final</p>",
            "<h2>Pruebas de Magia Mayor</h2>",
            "<p>Capythilda vuelve a aparecer como jueza del claro encantado. En esta última parte, el aprendiz combina condicionales, ciclos, funciones, listas y archivos para resolver retos integradores y obtener el diploma capibárico.</p>",
            "<div class=\"about-closing-actions\">",
            "<a class=\"scene-button primary\" href=\"mapa.html\">Volver al mapa</a>",
            "<a class=\"scene-button ghost\" href=\"tienda.html\">Ver vestuarios</a>",
            "</div>",
            "</section>"
        ].join("");
    }

    function buildStationDetail(station) {
        if (!station) {
            return "";
        }

        return [
            "<article class=\"story-station-detail\">",
            "<div class=\"story-station-visual\">",
            "<img src=\"", station.image, "\" alt=\"", station.title, "\">",
            "</div>",
            "<div class=\"story-station-copy\">",
            "<p class=\"panel-kicker\">", station.order, "</p>",
            "<h3>", station.title, "</h3>",
            "<div class=\"story-station-meta\">",
            "<span><strong>Lugar:</strong> ", station.place, "</span>",
            "<span><strong>Guia:</strong> ", station.mentor, "</span>",
            "</div>",
            "<p class=\"story-station-topic\">", station.content, "</p>",
            "<p>", station.description, "</p>",
            "</div>",
            "</article>"
        ].join("");
    }

    function bindStationExplorer() {
        extrasRoot.addEventListener("click", function (event) {
            const trigger = event.target.closest("[data-station-id]");
            if (!trigger) {
                return;
            }

            activeStationId = trigger.dataset.stationId;
            renderExtras();
        });
    }
}());
