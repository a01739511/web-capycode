window.CAPYCODE_APP_DATA = {
    academy: {
        title: "La Academia CapyCode",
        subtitle: "Un sendero encantado donde cada tema es una estación del bosque mágico.",
        intro: "Capythilda recibe a cada aprendiz con un grimorio, una varita-código y un recorrido capaz de convertir conceptos de programación en retos claros, visuales y jugables.",
        longStory: [
            "La Academia CapyCode se despliega como un sendero encantado entre árboles brillantes, construcciones flotantes y criaturas mágicas que representan desafíos de código.",
            "Todo comienza en la Torre de Capythilda, donde la directora entrega el primer grimorio, presenta la varita-código y explica que cada estación del bosque guarda una pieza del conocimiento arcano de la programación.",
            "Desde ahí, cada aprendiz recorre bibliotecas vivientes, laboratorios de cristales, altares de runas, torres con puertas duales, círculos infinitos, forjas encantadas y archivos subterráneos hasta llegar a las Pruebas de Magia Mayor."
        ],
        entrance: {
            title: "Entrada: La Torre de Capythilda",
            description: "Capythilda da la bienvenida, entrega el grimorio inicial, presenta el mundo de CapyCode y acompaña la elección del avatar con el que empieza la aventura.",
            image: "assets/Torre.webp"
        }
    },
    storyStations: [
        {
            id: "entrada",
            order: "Tutorial",
            title: "La Torre de Capythilda",
            place: "Entrada principal de la academia",
            mentor: "Capythilda, la directora",
            content: "Bienvenida, uso de la varita-código, primer grimorio e introducción al mundo.",
            description: "Es la primera parada del viaje. Aquí el aprendiz entiende que el código es una forma de magia ordenada y descubre que cada decisión en el sendero abre nuevas puertas del bosque.",
            image: "assets/Torre.webp"
        },
        {
            id: "algoritmo",
            order: "Nivel 1",
            title: "Grimorio del Algoritmo Antiguo",
            place: "Biblioteca flotante",
            mentor: "Algorithmo el Críptico",
            content: "Algoritmos, lógica básica, secuencia, selección y repetición.",
            description: "Los libros se abren solos y revelan patrones para pensar antes de lanzar un hechizo. Aquí nace la lógica del viaje.",
            image: "assets/Libros.webp"
        },
        {
            id: "tipos",
            order: "Nivel 2",
            title: "Pócimas de Tipo Puro",
            place: "Laboratorio burbujeante en una caverna de cristales",
            mentor: "Datara la Destiladora",
            content: "int, float, bool, str y conversion de tipos.",
            description: "Cada frasco representa una esencia distinta. Mezclar mal los tipos rompe la fórmula; dominarlos permite crear pócimas exactas.",
            image: "assets/characters/CapyCandy.webp"
        },
        {
            id: "expresiones",
            order: "Nivel 3",
            title: "El Altar de las Expresiones",
            place: "Santuario mágico con runas flotantes",
            mentor: "Expron el Preciso",
            content: "Operaciones aritméticas, relacionales y lógicas.",
            description: "Las runas responden a cada combinación correcta y muestran cómo una expresión puede alterar el destino de un hechizo.",
            image: "assets/characters/CapyConstelation.webp"
        },
        {
            id: "condicionales",
            order: "Nivel 4",
            title: "Hechizos Condicionales",
            place: "Torre de puertas vivas",
            mentor: "Elsemina la Dual",
            content: "if, if-else, if-elif-else y estructuras de decisión.",
            description: "Cada puerta se abre con una respuesta distinta. Aprender a elegir el camino correcto define el avance del aprendiz.",
            image: "assets/characters/CapySun.webp"
        },
        {
            id: "ciclos",
            order: "Nivel 5",
            title: "Círculo de Repetición Infinita",
            place: "Círculo de piedras mágicas que giran eternamente",
            mentor: "Whilegon el Repetidor",
            content: "while, for, break y continue.",
            description: "Los cantos del bosque se repiten como un bucle sin fin hasta que el aprendiz comprende cuándo continuar, cuándo romper y cómo iterar con control.",
            image: "assets/Infinito.webp"
        },
        {
            id: "funciones",
            order: "Nivel 6",
            title: "Taller de Funciones Encantadas",
            place: "Forja mágica de runas sobre metal caliente",
            mentor: "Funcilda la Forjadora",
            content: "Definición de funciones, parámetros, retorno y reutilización.",
            description: "En esta forja los hechizos se personalizan, toman entradas y devuelven resultados para resolver retos más grandes sin repetir trabajo.",
            image: "assets/characters/CapyKing.webp"
        },
        {
            id: "listas",
            order: "Nivel 7",
            title: "Biblioteca de Criaturas de Datos",
            place: "Biblioteca viviente",
            mentor: "Liston el Domador",
            content: "Listas, listas de listas, acceso y manipulación.",
            description: "Las listas se mueven como serpientes de palabras. Domarlas significa aprender a guardar, recorrer y transformar colecciones vivas.",
            image: "assets/characters/CapyRuna.webp"
        },
        {
            id: "archivos",
            order: "Nivel 8",
            title: "El Archivo Perdido",
            place: "Archivo oculto bajo tierra",
            mentor: "Archivara la Olvidada",
            content: "Lectura y escritura de archivos de texto plano.",
            description: "Pergaminos voladores custodian registros ancestrales. Aquí el aprendiz descubre cómo guardar memoria fuera del hechizo activo.",
            image: "assets/world/mapa-academia.webp"
        },
        {
            id: "final",
            order: "Final",
            title: "Pruebas de Magia Mayor",
            place: "Claro encantado de desafíos integradores",
            mentor: "Capythilda, jueza del bosque",
            content: "Proyecto final, retos integradores y diploma capibárico.",
            description: "Las pruebas finales combinan todo lo aprendido. Solo quien domina el sendero completo recibe el reconocimiento de la academia.",
            image: "assets/characters/Capythilda.webp"
        }
    ],
    worldLore: [
        {
            title: "El Grimorio Inicial",
            description: "Cada aprendiz recibe un libro vivo que reacciona a sus avances y guarda los hechizos aprendidos durante el sendero."
        },
        {
            title: "La Varita-Código",
            description: "No lanza magia por sí sola: traduce intención, lógica y estructura en conjuros que solo funcionan cuando el código está bien construido."
        },
        {
            title: "El Bosque de Estaciones",
            description: "La academia no se aprende en salones cerrados, sino recorriendo lugares que representan conceptos y decisiones reales del pensamiento computacional."
        },
        {
            title: "El Diploma Capibárico",
            description: "La prueba final no es solo una meta académica; es la confirmación de que el aprendiz ya puede conjurar soluciones por su cuenta."
        }
    ],
    palette: [
        { name: "Moon Mist", hex: "#EEEDF4" },
        { name: "Rose Dust", hex: "#ECD2E5" },
        { name: "Lilac Rune", hex: "#9F95D3" },
        { name: "Arcane Violet", hex: "#66419F" },
        { name: "Aqua Spell", hex: "#358DAA" },
        { name: "Night Lake", hex: "#266476" }
    ],
    miniGames: [
        "Ordenar líneas",
        "Pregunta de opción múltiple",
        "Completar plantilla",
        "Seleccionar líneas",
        "Respuesta numérica"
    ],
    potions: [
        { name: "Poción HP", color: "Azul", effect: "Recupera energía para seguir practicando." },
        { name: "Poción MP", color: "Morada", effect: "Activa ayudas y pistas en misiones difíciles." },
        { name: "Multiplicador XP", color: "Turquesa", effect: "Duplica los puntos de una ronda exitosa." },
        { name: "Protector de racha", color: "Verde", effect: "Evita que una falla rompa la cadena." },
        { name: "Recuperador de racha", color: "Amarillo", effect: "Permite reiniciar una racha de forma rápida." }
    ],
    map: {
        currentRouteId: "ruta-grimorio-algoritmo",
        title: "Mapa de la academia",
        background: "assets/fondo1.webp",
        image: "assets/world/mapa-academia.webp",
        caption: "El recorrido conecta biblioteca, altar, torre, círculo y talleres del bosque.",
        levelAnchors: [
            { x: "16.2%", y: "52%" },
            { x: "34.3%", y: "42.2%" },
            { x: "33.2%", y: "74.9%" },
            { x: "49.8%", y: "59.9%" },
            { x: "66.5%", y: "37.2%" },
            { x: "88.4%", y: "49.8%" },
            { x: "77.2%", y: "73.7%" }
        ],
        levelAnchorsByLayout: {
            sidebar: [
                { x: "17%", y: "48.5%" },
                { x: "33.8%", y: "32.2%" },
                { x: "33.3%", y: "75.9%" },
                { x: "49.8%", y: "60.9%" },
                { x: "66.5%", y: "32%" },
                { x: "88.2%", y: "46%" },
                { x: "75.2%", y: "75.7%" }
            ],
            full: [
                { x: "16.8%", y: "44.2%" },
                { x: "33.7%", y: "25%" },
                { x: "33.2%", y: "78.6%" },
                { x: "49.8%", y: "60.2%" },
                { x: "66.5%", y: "22%" },
                { x: "88.6%", y: "41.2%" },
                { x: "75.6%", y: "77%" }
            ]
        },
        routes: [
            {
                id: "ruta-grimorio-algoritmo",
                order: "Ruta 1",
                title: "Algoritmo Antiguo",
                background: "assets/fondo1.webp",
                unlockLevel: 1
            },
            {
                id: "ruta-pocimas-tipo",
                order: "Ruta 2",
                title: "Alquimista de Tipos",
                background: "assets/fondo1.webp",
                unlockLevel: 2
            },
            {
                id: "ruta-altar-expresiones",
                order: "Ruta 3",
                title: "Altar de las Expresiones",
                background: "assets/fondo1.webp",
                unlockLevel: 3
            },
            {
                id: "ruta-hechizos-condicionales",
                order: "Ruta 4",
                title: "Hechizos Condicionales",
                background: "assets/fondo1.webp",
                unlockLevel: 4
            },
            {
                id: "ruta-repeticion-infinita",
                order: "Ruta 5",
                title: "Círculo de Repetición Infinita",
                background: "assets/fondo1.webp",
                unlockLevel: 5
            },
            {
                id: "ruta-funciones-encantadas",
                order: "Ruta 6",
                title: "Taller de Funciones Encantadas",
                background: "assets/fondo1.webp",
                unlockLevel: 6
            },
            {
                id: "ruta-criaturas-datos",
                order: "Ruta 7",
                title: "Biblioteca de Estructuras de Datos",
                background: "assets/fondo1.webp",
                unlockLevel: 7
            },
            {
                id: "ruta-archivo-perdido",
                order: "Ruta 8",
                title: "El Archivo Perdido",
                background: "assets/fondo1.webp",
                unlockLevel: 8
            }
        ]
    },
    levels: [
        {
            id: 1,
            routeId: "ruta-grimorio-algoritmo",
            title: "Nivel 1",
            topic: "Grimorio del Algoritmo Antiguo",
            place: "Biblioteca flotante",
            mentor: "Algorithmo el Críptico",
            difficulty: "Fácil",
            content: "Secuencia básica, lectura de pasos y reconocimiento de orden lógico simple.",
            description: "Los libros se abren solos y te enseñan a seguir instrucciones en el orden correcto, paso a paso, antes de lanzar tu primer hechizo.",
            image: "assets/Libros.webp",
            href: "p_opcionMultiple.html?tema=algoritmos&level=1",
            x: "17.8%",
            y: "55%"
        },
        {
            id: 2,
            routeId: "ruta-grimorio-algoritmo",
            title: "Nivel 2",
            topic: "Senderos de la Secuencia",
            place: "Pasajes del scriptorium",
            mentor: "Algorithmo el Críptico",
            difficulty: "Fácil",
            content: "Secuencia de instrucciones, consecuencias de cambiar el orden y primeros patrones iterativos sencillos.",
            description: "Cada acción tiene su momento. Aprende a reconocer cómo un algoritmo cambia cuando alteras el orden de sus pasos.",
            image: "assets/Libros.webp",
            href: "p_opcionMultiple.html?tema=algoritmos&level=2",
            x: "33.8%",
            y: "42.2%"
        },
        {
            id: 3,
            routeId: "ruta-grimorio-algoritmo",
            title: "Nivel 3",
            topic: "Espejos de la Selección",
            place: "Galería de espejos encantados",
            mentor: "Algorithmo el Críptico",
            difficulty: "Medio",
            content: "Selección básica, condiciones simples y análisis de flujo lógico.",
            description: "No todos los caminos son iguales. Aquí descubrirás cómo tomar decisiones simples para elegir la acción correcta en cada caso.",
            image: "assets/Torre.webp",
            href: "p_opcionMultiple.html?tema=algoritmos&level=3",
            x: "32.5%",
            y: "74.6%"
        },
        {
            id: 4,
            routeId: "ruta-grimorio-algoritmo",
            title: "Nivel 4",
            topic: "Runa de la Repetición",
            place: "Círculo de runas repetidas",
            mentor: "Algorithmo el Críptico",
            difficulty: "Medio",
            content: "Repetición, acumuladores, conteo y patrones de recorrido sencillos.",
            description: "Algunos hechizos necesitan repetirse. Domina patrones básicos para ejecutar instrucciones varias veces sin perder el control.",
            image: "assets/Torre.webp",
            href: "p_opcionMultiple.html?tema=algoritmos&level=4",
            x: "49.5%",
            y: "60.7%"
        },
        {
            id: 5,
            routeId: "ruta-grimorio-algoritmo",
            title: "Nivel 5",
            topic: "Círculo del Patrón Lógico",
            place: "Anillo de piedra del bosque arcano",
            mentor: "Algorithmo el Críptico",
            difficulty: "Difícil",
            content: "Combinación de secuencia, selección y repetición; predicción de resultados y razonamiento algorítmico compuesto.",
            description: "Combina orden, decisión y repetición para identificar cómo fluye una solución y predecir su resultado con mayor precisión.",
            image: "assets/Infinito.webp",
            href: "p_opcionMultiple.html?tema=algoritmos&level=5",
            x: "67.9%",
            y: "40%"
        },
        {
            id: 6,
            routeId: "ruta-grimorio-algoritmo",
            title: "Nivel 6",
            topic: "Cámara del Algoritmo Mayor",
            place: "Sala mayor del grimorio",
            mentor: "Algorithmo el Críptico",
            difficulty: "Difícil",
            content: "Algoritmos más largos, revisión de lógica, corrección de estructuras y validación de soluciones más elaboradas.",
            description: "Los desafíos se vuelven más complejos. Analiza procesos completos, detecta errores de lógica y organiza soluciones más robustas.",
            image: "assets/Infinito.webp",
            href: "p_opcionMultiple.html?tema=algoritmos&level=6",
            x: "89.1%",
            y: "52.7%"
        },
        {
            id: 7,
            routeId: "ruta-grimorio-algoritmo",
            title: "Nivel 7",
            topic: "Prueba del Grimorio Viviente",
            place: "Aula central de la academia",
            mentor: "Algorithmo el Críptico",
            difficulty: "Integrador",
            content: "Nivel final de consolidación que mezcla secuencia, selección y repetición como cierre de ruta.",
            description: "Enfrenta un reto integrador donde deberás usar secuencia, selección y repetición para completar un algoritmo digno de la Academia.",
            image: "assets/Libros.webp",
            href: "p_opcionMultiple.html?tema=algoritmos&level=7",
            x: "77.7%",
            y: "73.4%"
        }
    ],
    mentors: [
        {
            name: "Capythilda",
            role: "Directora de la academia",
            focus: "Da la bienvenida, entrega el grimorio inicial y conecta toda la narrativa.",
            image: "assets/characters/Capythilda.webp"
        },
        {
            name: "Algorithmo",
            role: "Mentor del algoritmo antiguo",
            focus: "Enseña lógica, orden y pensamiento secuencial.",
            image: "assets/world/mentor-algoritmos.webp"
        },
        {
            name: "Datara",
            role: "Destiladora de tipos",
            focus: "Trabaja tipos de datos y conversiones con pociones brillantes.",
            image: "assets/characters/CapyCandy.webp"
        },
        {
            name: "Expron",
            role: "Guardián de expresiones",
            focus: "Cuida operaciones aritméticas, lógicas y relacionales.",
            image: "assets/characters/CapyConstelation.webp"
        },
        {
            name: "Elsemina",
            role: "Maestra de decisiones",
            focus: "Presenta puertas, condiciones y caminos alternos.",
            image: "assets/characters/CapySun.webp"
        },
        {
            name: "Whilegon",
            role: "Maestro de ciclos",
            focus: "Guía for, while, break y continue en la fuente del bosque.",
            image: "assets/characters/CapyExplorer.webp"
        },
        {
            name: "Funcilda",
            role: "Forjadora de funciones",
            focus: "Explica parámetros, retorno y reutilización de hechizos.",
            image: "assets/characters/CapyKing.webp"
        },
        {
            name: "Archivara",
            role: "Custodia del archivo viviente",
            focus: "Introduce listas, colecciones y lectura de archivos.",
            image: "assets/characters/CapyRuna.webp"
        }
    ],
    shopItems: [
        {
            id: "CapyBlack",
            name: "CapyBlack",
            nombre: "CapyBlack",
            description: "La capibara de sombras elegantes que acompaña los primeros pasos por CapyCode.",
            descripcion: "La capibara de sombras elegantes que acompaña los primeros pasos por CapyCode.",
            frase: "sombra-elegante",
            slogan: "Sombra elegante",
            perk: "Sombra elegante",
            price: 0,
            costo: 0,
            image: "assets/characters/CapyBlack.webp",
            badge: "En uso"
        },
        {
            id: "CapyAqua",
            name: "CapyAqua",
            nombre: "CapyAqua",
            description: "Un vestuario sereno de tonos acuáticos para avanzar con calma por los retos.",
            descripcion: "Un vestuario sereno de tonos acuáticos para avanzar con calma por los retos.",
            frase: "marea-tranquila",
            slogan: "Marea tranquila",
            perk: "Marea tranquila",
            price: 300,
            costo: 300,
            image: "assets/characters/CapyAqua.webp"
        },
        {
            id: "CapyKing",
            name: "CapyKing",
            nombre: "CapyKing",
            description: "Capa real, corona brillante y una presencia solemne para la aventura.",
            descripcion: "Capa real, corona brillante y una presencia solemne para la aventura.",
            frase: "corona-serena",
            slogan: "Corona serena",
            perk: "Corona serena",
            price: 750,
            costo: 750,
            image: "assets/characters/CapyKing.webp"
        },
        {
            id: "CapyExplorer",
            name: "CapyExplorer",
            nombre: "CapyExplorer",
            description: "Sombrero, lentes y equipo de exploración para recorrer el mapa con curiosidad.",
            descripcion: "Sombrero, lentes y equipo de exploración para recorrer el mapa con curiosidad.",
            frase: "ruta-curiosa",
            slogan: "Ruta curiosa",
            perk: "Ruta curiosa",
            price: 1200,
            costo: 1200,
            image: "assets/characters/CapyExplorer.webp"
        },
        {
            id: "CapyCandy",
            name: "CapyCandy",
            nombre: "CapyCandy",
            description: "Colores dulces y destellos suaves para una colección más alegre.",
            descripcion: "Colores dulces y destellos suaves para una colección más alegre.",
            frase: "chispa-dulce",
            slogan: "Chispa dulce",
            perk: "Chispa dulce",
            price: 2000,
            costo: 2000,
            image: "assets/characters/CapyCandy.webp"
        },
        {
            id: "CapyRuna",
            name: "CapyRuna",
            nombre: "CapyRuna",
            description: "Marcas de runa y detalles antiguos para quienes disfrutan el lado misterioso del bosque.",
            descripcion: "Marcas de runa y detalles antiguos para quienes disfrutan el lado misterioso del bosque.",
            frase: "runa-paciente",
            slogan: "Runa paciente",
            perk: "Runa paciente",
            price: 1800,
            costo: 1800,
            image: "assets/characters/CapyRuna.webp"
        },
        {
            id: "CapySun",
            name: "CapySun",
            nombre: "CapySun",
            description: "Un vestuario luminoso con detalles solares para darle brillo al recorrido.",
            descripcion: "Un vestuario luminoso con detalles solares para darle brillo al recorrido.",
            frase: "amanecer-claro",
            slogan: "Amanecer claro",
            perk: "Amanecer claro",
            price: 2200,
            costo: 2200,
            image: "assets/characters/CapySun.webp"
        },
        {
            id: "CapyEarth",
            name: "CapyEarth",
            nombre: "CapyEarth",
            description: "Tonos de tierra y hojas para una presencia tranquila dentro del mapa.",
            descripcion: "Tonos de tierra y hojas para una presencia tranquila dentro del mapa.",
            frase: "raiz-constante",
            slogan: "Raíz constante",
            perk: "Raíz constante",
            price: 2600,
            costo: 2600,
            image: "assets/characters/CapyEarth.webp"
        },
        {
            id: "CapyConstelation",
            name: "CapyConstelation",
            nombre: "CapyConstelation",
            description: "Un atuendo estelar con detalles de cielo nocturno para destacar en la colección.",
            descripcion: "Un atuendo estelar con detalles de cielo nocturno para destacar en la colección.",
            frase: "cielo-estelar",
            slogan: "Cielo estelar",
            perk: "Cielo estelar",
            price: 2900,
            costo: 2900,
            image: "assets/characters/CapyConstelation.webp"
        }
    ],
    achievements: [
        { title: "Conocimiento Mágico", description: "Ganaste tus primeros 50 puntos de magia." },
        { title: "Racha Encendida", description: "Mantienes encendida la energía del bosque brillante." },
        { title: "Coleccionista Arcano", description: "Desbloqueaste nuevos vestuarios en la tienda." },
        { title: "Explorador del Mapa", description: "Recorriste las estaciones principales de la academia." }
    ]
};
