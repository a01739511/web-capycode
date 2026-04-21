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
        const route = getPrimaryRoute();
        const firstStation = stations[0] || null;
        const heroStats = [
            { label: "Ruta", value: route.order || "Ruta 1" },
            { label: "Paradas", value: String(stations.length) },
            { label: "Tono", value: "Arcano" }
        ];

        if (!activeStationId && stations.length) {
            activeStationId = stations[0].id;
        }

        storyRoot.innerHTML = [
            "<section class=\"story-cinema-hero\">",
            "<div class=\"story-cinema-copy\">",
            "<p class=\"panel-kicker\">Historia</p>",
            "<h1>", data.academy.title, "</h1>",
            "<p class=\"story-cinema-lede\">Fantasia ligera, retos claros y una ruta visual con ritmo propio.</p>",
            "<div class=\"story-cinema-stats\">",
            heroStats.map(function (item) {
                return [
                    "<article class=\"story-cinema-stat\">",
                    "<span>", item.label, "</span>",
                    "<strong>", item.value, "</strong>",
                    "</article>"
                ].join("");
            }).join(""),
            "</div>",
            "</div>",
            "<div class=\"story-cinema-poster\">",
            entrance ? "<img src=\"" + entrance.image + "\" alt=\"" + entrance.title + "\">" : "",
            "<div class=\"story-cinema-overlay\">",
            "<span>Capythilda abre la aventura</span>",
            "<strong>", firstStation ? firstStation.title : "La ruta comienza aqui", "</strong>",
            "</div>",
            "</div>",
            "</section>"
        ].join("");

        mapRoot.innerHTML = [
            "<section class=\"story-route-stage\">",
            "<div class=\"story-route-poster\">",
            "<img src=\"", data.map.image, "\" alt=\"Ruta narrativa de CapyCode\">",
            "<div class=\"story-route-titlewrap\">",
            "<span class=\"story-route-index\">", route.order || "Ruta 1", "</span>",
            "<h2>", route.title || "Bosque Arcano", "</h2>",
            "</div>",
            "</div>",
            "<aside class=\"story-palette-rail\">",
            "<p class=\"panel-kicker\">Paleta</p>",
            "<div class=\"story-color-orbs\">",
            (data.palette || []).slice(0, 4).map(function (color) {
                return [
                    "<div class=\"story-color-orb\">",
                    "<span style=\"background:", color.hex, ";\"></span>",
                    "<strong>", color.name, "</strong>",
                    "</div>"
                ].join("");
            }).join(""),
            "</div>",
            "<p class=\"story-palette-note\">Luz, runa y bosque.</p>",
            "</aside>",
            "</section>"
        ].join("");

        renderExtras();
    }

    function renderExtras() {
        const stations = data.storyStations || [];
        const activeStation = stations.find(function (station) {
            return station.id === activeStationId;
        }) || stations[0];

        extrasRoot.innerHTML = [
            "<section class=\"story-explorer-shell story-explorer-shell--cinema\">",
            "<div class=\"story-explorer-head\">",
            "<div>",
            "<p class=\"panel-kicker\">Estaciones</p>",
            "<h2>Recorrido visual</h2>",
            "</div>",
            "<p class=\"story-explorer-note\">Toca una parada para verla al instante.</p>",
            "</div>",
            "<div class=\"story-station-tabs\">",
            stations.map(function (station) {
                return [
                    "<button class=\"story-station-chip", station.id === activeStation.id ? " is-active" : "", "\" type=\"button\" data-station-id=\"", station.id, "\">",
                    "<span>", station.order, "</span>",
                    "<strong>", compactTitle(station.title, 26), "</strong>",
                    "</button>"
                ].join("");
            }).join(""),
            "</div>",
            buildStationSpotlight(activeStation),
            "</section>"
        ].join("");
    }

    function buildStationSpotlight(station) {
        if (!station) {
            return "";
        }

        return [
            "<article class=\"story-spotlight-card story-spotlight-card--cinema\">",
            "<div class=\"story-spotlight-visual\">",
            "<img src=\"", station.image, "\" alt=\"", station.title, "\">",
            "</div>",
            "<div class=\"story-spotlight-copy\">",
            "<p class=\"panel-kicker\">", station.order, "</p>",
            "<h3>", station.title, "</h3>",
            "<p class=\"story-spotlight-summary\">", compactText(station.description, 14), "</p>",
            "<div class=\"story-spotlight-tags\">",
            extractTags(station.content).map(function (tag) {
                return "<span class=\"story-spotlight-tag\">" + tag + "</span>";
            }).join(""),
            "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function getPrimaryRoute() {
        const routes = data.map && Array.isArray(data.map.routes) ? data.map.routes : [];
        return routes[0] || { order: "Ruta 1", title: "Bosque Arcano" };
    }

    function extractTags(content) {
        return String(content || "")
            .split(",")
            .map(function (item) {
                return item.trim();
            })
            .filter(Boolean)
            .slice(0, 3);
    }

    function compactText(text, wordLimit) {
        const words = String(text || "").split(/\s+/).filter(Boolean);
        if (words.length <= wordLimit) {
            return words.join(" ");
        }

        return words.slice(0, wordLimit).join(" ") + ".";
    }

    function compactTitle(text, maxLength) {
        const value = String(text || "");
        if (value.length <= maxLength) {
            return value;
        }

        return value.slice(0, maxLength - 3).trim() + "...";
    }

    function bindStationExplorer() {
        extrasRoot.addEventListener("click", function (event) {
            const trigger = event.target.closest("[data-station-id]");
            if (!trigger) {
                return;
            }

            event.preventDefault();

            const tabs = extrasRoot.querySelector(".story-station-tabs");
            const tabsScrollLeft = tabs ? tabs.scrollLeft : 0;

            activeStationId = trigger.dataset.stationId;
            renderExtras();

            const nextTabs = extrasRoot.querySelector(".story-station-tabs");
            if (nextTabs) {
                nextTabs.scrollLeft = tabsScrollLeft;
            }
        });
    }
}());
