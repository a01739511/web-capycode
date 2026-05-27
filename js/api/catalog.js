(function () {
    const TOTAL_LEVELS_PER_ROUTE = 7;
    const EXERCISES_PER_LEVEL = 5;
    const OUTFIT_TRANSPARENT_IMAGES = {
        Capibara: "assets/characters/no_bg/Capibara.webp",
        CapyBlack: "assets/characters/no_bg/Capy_Black.webp",
        CapyAqua: "assets/characters/no_bg/Capy_Aqua..webp",
        CapyKing: "assets/characters/no_bg/Capy_King.webp",
        CapyExplorer: "assets/characters/no_bg/Capy_Explorer.webp",
        CapyCandy: "assets/characters/no_bg/Capy_Candy.webp",
        CapyRuna: "assets/characters/no_bg/Capy_Runa.webp",
        CapySun: "assets/characters/no_bg/Capy_Sun.webp",
        CapyEarth: "assets/characters/no_bg/Capy_Earth.webp",
        CapyConstelation: "assets/characters/no_bg/Capy_Constelation.webp"
    };

    const DIFFICULTY_BY_ROUTE_ORDER = {
        1: "easy",
        2: "easy",
        3: "medium",
        4: "medium",
        5: "hard",
        6: "hard",
        7: "integrative"
    };

    const DIFFICULTY_LABELS = {
        easy: "Fácil",
        medium: "Medio",
        hard: "Difícil",
        integrative: "Integrador"
    };

    const DIFFICULTY_BUCKETS = {
        easy: "facil",
        medium: "medio",
        hard: "dificil",
        integrative: "integrador"
    };

    const TIMER_SECONDS = {
        easy: 20,
        medium: 30,
        hard: 40,
        integrative: 50
    };

    const XP_REWARD = {
        easy: 100,
        medium: 200,
        hard: 300,
        integrative: 550
    };

    const OUTFIT_COSTS = {
        Capibara: 0,
        CapyBlack: 0,
        CapyAqua: 300,
        CapyKing: 750,
        CapyExplorer: 1200,
        CapyRuna: 1800,
        CapyCandy: 2000,
        CapySun: 2200,
        CapyEarth: 2600,
        CapyConstelation: 2900
    };

    const OUTFIT_ORDER = [
        "Capibara",
        "CapyBlack",
        "CapyAqua",
        "CapyKing",
        "CapyExplorer",
        "CapyRuna",
        "CapyCandy",
        "CapySun",
        "CapyEarth",
        "CapyConstelation"
    ];

    const OUTFIT_ROUTE_REQUIREMENTS = {
        CapyBlack: 1,
        CapyAqua: 3,
        CapyKing: 6,
        CapyRuna: 2,
        CapyCandy: 8,
        CapySun: 7,
        CapyEarth: 5,
        CapyConstelation: 4
    };

    const STARTER_DISCOVERED_OUTFIT_IDS = [
        "Capibara",
        "CapyExplorer"
    ];

    const STORY_MESSAGES = {
        algoritmos: [
            "CapyBlack te muestra un sendero de piedras antiguas: cada paso importa, y el bosque solo responde cuando el orden del viaje es claro.",
            "La neblina se aparta cuando sigues una secuencia sin dudar; por primera vez, el bosque parece obedecer tu ritmo.",
            "Una puerta de tinta viva se abre apenas lo justo: CapyBlack sonríe al ver que ya distingues cuándo avanzar y cuándo esperar.",
            "Los libros flotantes cambian de lugar, pero tú ya reconoces los patrones. El caos empieza a parecer una coreografía secreta.",
            "Las luciérnagas del archivo antiguo giran en rondas precisas. Cada repetición las vuelve menos salvajes y más tuyas.",
            "CapyBlack guarda silencio mientras observas el mapa entero. Ya no resuelves pasos sueltos: empiezas a leer la intención del camino.",
            "Al final del grimorio, una ruta dormida se ilumina. El bosque acepta que ya puedes sostener un hechizo completo sin perderte."
        ]
    };

    const ROUTE_DEFINITIONS = [
        buildRoute(1, "algoritmos", "Algoritmo Antiguo", "assets/world/routes/route-01-algoritmo-antiguo.webp", "assets/world/orbs/route-01-algoritmo-antiguo-orb.webp", "Secuencia, selección, repetición y razonamiento algorítmico.", "CapyBlack", "assets/characters/no_bg/Capy_Black.webp"),
        buildRoute(2, "tipos_de_datos", "Alquimista de Tipos", "assets/world/routes/route-02-alquimista-de-tipos.webp", "assets/world/orbs/route-02-alquimista-de-tipos-orb.webp", "Tipos primitivos, conversiones y lectura de valores.", "CapyRuna", "assets/characters/no_bg/Capy_Runa.webp"),
        buildRoute(3, "expresiones", "Altar de las Expresiones", "assets/world/routes/route-03-expresiones.webp", "assets/world/orbs/route-03-expresiones-orb.webp", "Operadores aritméticos, relacionales y lógicos.", "CapyAqua", "assets/characters/no_bg/Capy_Aqua..webp"),
        buildRoute(4, "condicionales", "Hechizos Condicionales", "assets/world/routes/route-04-condicionales.webp", "assets/world/orbs/route-04-condicionales-orb.webp", "Decisiones con if, else y combinaciones de condiciones.", "CapyConstelation", "assets/characters/no_bg/Capy_Constelation.webp"),
        buildRoute(5, "ciclos", "Círculo de Repetición Infinita", "assets/world/routes/route-05-ciclos.webp", "assets/world/orbs/route-05-ciclos-orb.webp", "Repetición controlada con for, while, break y continue.", "CapyEarth", "assets/characters/no_bg/Capy_Earth.webp"),
        buildRoute(6, "funciones", "Taller de Funciones Encantadas", "assets/world/routes/route-06-funciones.webp", "assets/world/orbs/route-06-funciones-orb.webp", "Funciones, parámetros, retorno y reutilización.", "CapyKing", "assets/characters/no_bg/Capy_King.webp"),
        buildRoute(7, "estructuras_de_datos", "Biblioteca de Estructuras de Datos", "assets/world/routes/route-07-estructuras-de-datos.webp", "assets/world/orbs/route-07-estructuras-de-datos-orb.webp", "Listas, colecciones y operaciones sobre datos agrupados.", "CapySun", "assets/characters/no_bg/Capy_Sun.webp"),
        buildRoute(8, "archivos_de_texto_plano", "El Archivo Perdido", "assets/world/routes/route-08-archivos-de-texto-plano.webp", "assets/world/orbs/route-08-archivos-de-texto-plano-orb.webp", "Lectura, escritura y procesamiento de archivos simples.", "CapyCandy", "assets/characters/no_bg/Capy_Candy.webp")
    ];

    const DEFAULT_OUTFITS = [
        outfit("Capibara", "Capibara", "La compañera base de la aventura CapyCode.", "Esencia capibara", "assets/characters/Capibara.webp"),
        outfit("CapyBlack", "CapyBlack", "Vestuario base de la aventura CapyCode.", "Sombra elegante", "assets/characters/CapyBlack.webp", 1),
        outfit("CapyAqua", "CapyAqua", "Tonos acuáticos para avanzar con calma.", "Marea tranquila", "assets/characters/CapyAqua.webp", 3),
        outfit("CapyKing", "CapyKing", "Corona y capa para una presencia solemne.", "Corona serena", "assets/characters/CapyKing.webp", 6),
        outfit("CapyExplorer", "CapyExplorer", "Equipo de exploración para recorrer rutas.", "Ruta curiosa", "assets/characters/CapyExplorer.webp"),
        outfit("CapyRuna", "CapyRuna", "Marcas antiguas para retos misteriosos.", "Runa paciente", "assets/characters/CapyRuna.webp", 2),
        outfit("CapyCandy", "CapyCandy", "Colores dulces para una colección alegre.", "Chispa dulce", "assets/characters/CapyCandy.webp", 8),
        outfit("CapySun", "CapySun", "Detalles solares para iluminar el recorrido.", "Amanecer claro", "assets/characters/CapySun.webp", 7),
        outfit("CapyEarth", "CapyEarth", "Tonos de tierra para una presencia constante.", "Raíz constante", "assets/characters/CapyEarth.webp", 5),
        outfit("CapyConstelation", "CapyConstelation", "Detalles estelares para destacar en la colección.", "Cielo estelar", "assets/characters/CapyConstelation.webp", 4)
    ];

    function buildRoute(id, key, name, backgroundImage, orbImage, content, characterName, characterImage) {
        return {
            id: id,
            key: key,
            name: name,
            backgroundImage: backgroundImage,
            orbImage: orbImage,
            content: content,
            storyCharacterName: characterName,
            storyCharacterImage: characterImage
        };
    }

    function outfit(id, name, description, tagline, image, unlockRouteId) {
        return {
            id: id,
            name: name,
            description: description,
            tagline: tagline,
            image: image,
            unlockRouteId: unlockRouteId || null
        };
    }

    window.CapyApiCatalog = {
        TOTAL_LEVELS_PER_ROUTE: TOTAL_LEVELS_PER_ROUTE,
        EXERCISES_PER_LEVEL: EXERCISES_PER_LEVEL,
        OUTFIT_TRANSPARENT_IMAGES: OUTFIT_TRANSPARENT_IMAGES,
        DIFFICULTY_BY_ROUTE_ORDER: DIFFICULTY_BY_ROUTE_ORDER,
        DIFFICULTY_LABELS: DIFFICULTY_LABELS,
        DIFFICULTY_BUCKETS: DIFFICULTY_BUCKETS,
        TIMER_SECONDS: TIMER_SECONDS,
        XP_REWARD: XP_REWARD,
        STORY_MESSAGES: STORY_MESSAGES,
        ROUTE_DEFINITIONS: ROUTE_DEFINITIONS,
        OUTFIT_COSTS: OUTFIT_COSTS,
        OUTFIT_ORDER: OUTFIT_ORDER,
        OUTFIT_ROUTE_REQUIREMENTS: OUTFIT_ROUTE_REQUIREMENTS,
        STARTER_DISCOVERED_OUTFIT_IDS: STARTER_DISCOVERED_OUTFIT_IDS,
        DEFAULT_OUTFITS: DEFAULT_OUTFITS
    };
}());
