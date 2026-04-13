window.CAPYCODE_APP_DATA = {
    academy: {
        title: "La Academia CapyCode",
        subtitle: "Un sendero encantado donde cada tema es una estacion del bosque magico.",
        intro: "Capythilda recibe a cada aprendiz con un grimorio, una varita-codigo y un companero capaz de convertir conceptos de programacion en retos claros, visuales y jugables.",
        longStory: [
            "La entrada ocurre en la Torre de Capythilda, donde el jugador conoce la historia del reino, elige identidad y entiende como funciona la magia del codigo.",
            "Despues, el mapa avanza por estaciones inspiradas en los temas del curso: algoritmos, tipos de datos, expresiones, condicionales, ciclos y funciones.",
            "Cada lugar mezcla narrativa y practica con mini juegos de opcion multiple, ordenar lineas, completar plantillas, seleccionar lineas y retos de respuesta numerica."
        ]
    },
    palette: [
        { name: "Moon Mist", hex: "#EEEDF4" },
        { name: "Rose Dust", hex: "#ECD2E5" },
        { name: "Lilac Rune", hex: "#9F95D3" },
        { name: "Arcane Violet", hex: "#66419F" },
        { name: "Aqua Spell", hex: "#358DAA" },
        { name: "Night Lake", hex: "#266476" }
    ],
    miniGames: [
        "Ordenar lineas",
        "Pregunta de opcion multiple",
        "Completar plantilla",
        "Seleccionar lineas",
        "Respuesta numerica"
    ],
    potions: [
        { name: "Pocion HP", color: "Azul", effect: "Recupera energia para seguir practicando." },
        { name: "Pocion MP", color: "Morada", effect: "Activa ayudas y pistas en misiones dificiles." },
        { name: "Multiplicador XP", color: "Turquesa", effect: "Duplica los puntos de una ronda exitosa." },
        { name: "Protector de racha", color: "Verde", effect: "Evita que una falla rompa la cadena." },
        { name: "Recuperador de racha", color: "Amarillo", effect: "Permite reiniciar una racha de forma rapida." }
    ],
    map: {
        background: "assets/fondo.png",
        image: "assets/world/mapa-academia.jpeg",
        caption: "El recorrido conecta biblioteca, altar, torre, circulo y talleres del bosque."
    },
    levels: [
        {
            id: 1,
            title: "Nivel 1",
            topic: "Grimorio del Algoritmo Antiguo",
            place: "Biblioteca flotante",
            mentor: "Algorithmo el Criptico",
            content: "Secuencia, seleccion y repeticion basica.",
            description: "Los libros se abren solos y muestran como pensar paso a paso antes de escribir codigo.",
            image: "assets/Libros.jpeg",
            href: "p_opcionMultiple.html",
            x: "72%",
            y: "82%"
        },
        {
            id: 2,
            title: "Nivel 2",
            topic: "Pocimas de Tipo Puro",
            place: "Laboratorio de cristales",
            mentor: "Datara la Destiladora",
            content: "int, float, bool, str y conversion de tipos.",
            description: "Cada frasco representa un tipo de dato y el jugador aprende a combinarlos sin romper la mezcla.",
            image: "assets/characters/CapyCandy.png",
            href: "p_completarPlantilla.html",
            x: "56%",
            y: "66%"
        },
        {
            id: 3,
            title: "Nivel 3",
            topic: "Altar de las Expresiones",
            place: "Santuario de runas",
            mentor: "Expron el Preciso",
            content: "Operaciones aritmeticas, logicas y relacionales.",
            description: "Las runas flotantes reaccionan a cada expresion correcta y revelan como se evalua una condicion.",
            image: "assets/characters/CapyConstelation.png",
            href: "p_opcionMultiple.html",
            x: "38%",
            y: "51%"
        },
        {
            id: 4,
            title: "Nivel 4",
            topic: "Hechizos Condicionales",
            place: "Torre de puertas vivas",
            mentor: "Elsemina la Dual",
            content: "if, if-else e if-elif-else.",
            description: "Cada puerta responde a una decision distinta y ayuda a entender que camino toma el programa.",
            image: "assets/Torre.jpeg",
            href: "p_opcionMultiple.html",
            x: "52%",
            y: "36%"
        },
        {
            id: 5,
            title: "Nivel 5",
            topic: "Circulo de Repeticion Infinita",
            place: "Fuente del bosque brillante",
            mentor: "Whilegon el Persistente",
            content: "for, while, break y continue.",
            description: "El agua del portal repite patrones hasta que el aprendiz domina ciclos y progreso de mision.",
            image: "assets/Infinito.jpeg",
            href: "p_ordenarLineas.html",
            x: "69%",
            y: "23%"
        },
        {
            id: 6,
            title: "Nivel 6",
            topic: "Funciones Encantadas",
            place: "Taller de hechizos reutilizables",
            mentor: "Funcilda la Forjadora",
            content: "Parametros, retorno y modularidad.",
            description: "Aqui los hechizos se guardan, se nombran y se reutilizan para resolver problemas mayores.",
            image: "assets/characters/CapyKing.png",
            href: "#",
            x: "48%",
            y: "12%"
        },
        {
            id: 7,
            title: "Nivel 7",
            topic: "Biblioteca de Criaturas y Archivos",
            place: "Archivo viviente",
            mentor: "Archivara de las Listas",
            content: "Listas, colecciones y archivos.",
            description: "Las criaturas guardan datos en estantes encantados y muestran como leer, guardar y recorrer estructuras.",
            image: "assets/characters/CapyRuna.png",
            href: "#",
            x: "31%",
            y: "6%"
        }
    ],
    mentors: [
        {
            name: "Capythilda",
            role: "Directora de la academia",
            focus: "Da la bienvenida, entrega el grimorio inicial y conecta toda la narrativa.",
            image: "assets/characters/Capythilda.png"
        },
        {
            name: "Algorithmo",
            role: "Mentor del algoritmo antiguo",
            focus: "Enseña logica, orden y pensamiento secuencial.",
            image: "assets/world/mentor-algoritmos.jpeg"
        },
        {
            name: "Datara",
            role: "Destiladora de tipos",
            focus: "Trabaja tipos de datos y conversiones con pociones brillantes.",
            image: "assets/characters/CapyCandy.png"
        },
        {
            name: "Expron",
            role: "Guardian de expresiones",
            focus: "Cuida operaciones aritmeticas, logicas y relacionales.",
            image: "assets/characters/CapyConstelation.png"
        },
        {
            name: "Elsemina",
            role: "Maestra de decisiones",
            focus: "Presenta puertas, condiciones y caminos alternos.",
            image: "assets/characters/CapySun.png"
        },
        {
            name: "Whilegon",
            role: "Maestro de ciclos",
            focus: "Guia for, while, break y continue en la fuente del bosque.",
            image: "assets/characters/CapyExplorer.png"
        },
        {
            name: "Funcilda",
            role: "Forjadora de funciones",
            focus: "Explica parametros, retorno y reutilizacion de hechizos.",
            image: "assets/characters/CapyKing.png"
        },
        {
            name: "Archivara",
            role: "Custodia del archivo viviente",
            focus: "Introduce listas, colecciones y lectura de archivos.",
            image: "assets/characters/CapyRuna.png"
        }
    ],
    shopItems: [
        {
            id: "CapyBlack",
            name: "CapyBlack",
            perk: "+15 poder magico",
            price: 0,
            image: "assets/characters/CapyBlack.png",
            badge: "En uso"
        },
        {
            id: "CapyAqua",
            name: "CapyAqua",
            perk: "Aura de agua ancestral",
            price: 300,
            image: "assets/characters/CapyAqua.png"
        },
        {
            id: "CapyKing",
            name: "CapyKing",
            perk: "Corona arcana",
            price: 750,
            image: "assets/characters/CapyKing.png"
        },
        {
            id: "CapyExplorer",
            name: "CapyExplorer",
            perk: "Ingenio mecanico",
            price: 1200,
            image: "assets/characters/CapyExplorer.png"
        },
        {
            id: "CapyCandy",
            name: "CapyCandy",
            perk: "Energia dulce",
            price: 2000,
            image: "assets/characters/CapyCandy.png"
        },
        {
            id: "CapyRuna",
            name: "CapyRuna",
            perk: "Sabiduria antigua",
            price: 1800,
            image: "assets/characters/CapyRuna.png"
        },
        {
            id: "CapySun",
            name: "CapySun",
            perk: "Luz de decision",
            price: 2200,
            image: "assets/characters/CapySun.png"
        },
        {
            id: "CapyEarth",
            name: "CapyEarth",
            perk: "Defensa del bosque",
            price: 2600,
            image: "assets/characters/CapyEarth.png"
        },
        {
            id: "CapyConstelation",
            name: "CapyConstelation",
            perk: "Vision estelar",
            price: 2900,
            image: "assets/characters/CapyConstelation.png"
        }
    ],
    achievements: [
        { title: "Conocimiento Magico", description: "Ganaste tus primeros 50 puntos de magia." },
        { title: "Racha Encendida", description: "Mantienes encendida la energia del bosque brillante." },
        { title: "Coleccionista Arcano", description: "Desbloqueaste nuevos companeros en la tienda." },
        { title: "Explorador del Mapa", description: "Recorriste las estaciones principales de la academia." }
    ]
};
