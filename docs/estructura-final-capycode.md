# CapyCode - Documentacion estructural final

Fecha de ultima actualizacion: 2026-05-04

Este documento funciona como bitacora tecnica y fuente de verdad para ajustar los diagramas finales de CapyCode a la implementacion real y a las decisiones de estructura acordadas durante el cierre del proyecto.

## 1. Proposito del documento

El objetivo es separar con claridad tres capas que se estaban mezclando:

- Estructura de dominio que si debe aparecer en diagramas de clases o entidad-relacion.
- Responsabilidades de backend/base de datos que no deben dibujarse como clases de juego si solo son persistencia, seguridad o calculo.
- Pendientes de frontend que no cambian el modelo del dominio, pero si deben registrarse para la version final.

Este documento tambien registra decisiones tomadas, inconsistencias detectadas en el codigo actual y preguntas abiertas que deben resolverse antes de cerrar diagramas.

## 2. Estado actual observado en el codigo

La aplicacion actual es una web estatica compuesta por archivos HTML, CSS, JSON y JavaScript del lado cliente.

Archivos estructurales principales:

- `js/app-data.js`: contiene datos globales de academia, historia, rutas, niveles, tienda, personajes y logros.
- `js/questions-data.js`: respaldo embebido de preguntas en JavaScript.
- `questions.json`: JSON con preguntas por tema y nivel.
- `levels_algoritmos_complementado.json`: JSON alternativo/complementado de preguntas de algoritmos.
- `levels.json`: JSON con estructura tematica amplia.
- `js/common.js`: contiene sesion local, perfil local, HUD, progreso, compra/equipamiento y completado de niveles.
- `js/game.js`: contiene flujo de ejercicios, validacion de respuestas, recompensa de XP y completado de nivel.
- `js/map.js`: renderiza rutas y niveles en el mapa.
- `js/shop.js`: renderiza tienda, compra y equipamiento.
- `js/profile.js`: renderiza perfil y coleccion.
- `js/auth.js`: simula login/registro con `localStorage`.

No existe backend implementado todavia. La version de codigo del 2026-05-04 ya separa el acceso a datos en `js/api-client.js`, con modo mock local por defecto y contrato preparado para backend PHP/API futuro.

## 2.1. Estado implementado en frontend mock

La app queda preparada con una capa unica `window.CapyApi`.

Metodos disponibles:

- `registerUser(username, password)`
- `loginUser(username, password)`
- `logoutUser()`
- `getCurrentUser()`
- `updateUsername(username)`
- `updatePassword(currentPassword, newPassword)`
- `getRoutes()`
- `getLevelsByRoute(routeId)`
- `getExercisesByLevel(levelId)`
- `completeLevel(levelId, answers)`
- `getOutfits()`
- `unlockOutfit(outfitId)`
- `equipOutfit(outfitId)`

Modo actual:

- `API_BASE_URL` vacio usa mock local.
- La sesion mock se guarda en `sessionStorage`, por lo que se pierde al cerrar navegador.
- No se guardan tokens frontend.
- El usuario mock conserva `id`, `username`, `currentLevelId`, `streak`, `xp`, `lastCompletionAt`, `currentOutfitId` y `unlockedOutfitIds`.
- El runner canonico de niveles es `nivel.html?levelId=<id>`.
- Las paginas antiguas `p_*.html` redirigen al runner canonico para compatibilidad.

Preparacion para backend:

- Cuando exista backend, se cambiara `window.CAPYCODE_CONFIG.API_BASE_URL` antes de cargar `js/api-client.js`.
- `window.CAPYCODE_CONFIG.DATA_SOURCE` permite alternar rapido entre `"local"` y `"backend"`; si queda en `"auto"`, usar una `API_BASE_URL` no vacia activa backend.
- Ejemplo provisional: `http://10.50.67.76/<subcarpeta>/api`.
- Las peticiones reales usan `fetch()` con `credentials: "include"`.
- La sesion real esperada sera cookie HttpOnly hasta cerrar navegador.
- La disponibilidad desde Cloudflare dependera de CORS, protocolo y acceso a la IP privada del Tec o VPN.

## 3. Decision estructural confirmada

La estructura final deseada no es una sola ruta de algoritmos.

La estructura final debe ser:

- Varias rutas tematicas.
- Cada ruta tematica corresponde a un tema.
- Cada ruta tiene estrictamente 7 niveles.
- Cada nivel tiene 5 ejercicios.
- Cada ruta termina con 35 ejercicios en total.
- Las rutas son secuenciales.
- Los niveles dentro de cada ruta tambien son secuenciales.

Distribucion estricta de dificultad por ruta:

| Nivel dentro de ruta | Dificultad |
| --- | --- |
| 1 | Facil |
| 2 | Facil |
| 3 | Medio |
| 4 | Medio |
| 5 | Dificil |
| 6 | Dificil |
| 7 | Integrador |

Esta regla debe modelarse como invariante del sistema. No debe quedar como convencion visual solamente.

## 3.1. Decisiones cerradas

- `current_level_id` sera el puntero entero al nivel global secuencial desbloqueado.
- `current_level_id` no debe tratarse como llave foranea estricta si se usa `totalLevels + 1` como centinela de juego completado.
- Si existen 8 rutas y cada una tiene 7 niveles, el rango esperado sera 1 a 56.
- Al completar el ultimo nivel global, `current_level_id` avanzara a `totalLevels + 1` como centinela de juego completado.
- El segundo nivel de la segunda ruta sera el nivel global 9.
- La ruta actual y el nivel dentro de ruta se derivan matematicamente desde `current_level_id`.
- El progreso principal (`current_level_id`, `streak`, `xp`, `last_completion_at`) vivira directamente en `users` para mantener el modelo simple.
- La autenticacion usara contrasena hasheada y sesion HttpOnly del lado backend.
- `Outfit` es una entidad/tabla principal porque se persiste en base de datos.
- La tienda como pantalla/interfaz es frontend; no es una entidad del dominio.
- `users` guardara el id del vestuario equipado mediante `current_outfit_id`.
- `current_outfit_id` tendra por defecto el id del outfit inicial elegido por el equipo.
- Los vestuarios desbloqueados se modelaran con tabla intermedia `user_outfits`, no como lista de ids dentro de `User`.
- La pagina de historia sera solo frontend; no tendra entidad, tabla ni backend propios.
- `Session` no aparecera en el diagrama principal de clases/dominio.
- `Session` si aparecera en el diagrama entidad-relacion como tabla tecnica minima si se implementa sesion HttpOnly de servidor.
- La nomenclatura final del modelo sera en ingles.
- Las clases usaran `PascalCase` singular.
- Las tablas usaran `snake_case` plural.
- Las claves foraneas usaran sufijo `_id`, por ejemplo `user_id`, no prefijo `id_user`.
- La ruta tematica se modelara solo como `Route`; no se creara `Topic`.
- `routes` no tendra campo `topic`; `routes.name` representa directamente el tema de la ruta.
- `routes` tendra `background_image` para el fondo visual de la ruta.
- Los ejercicios se importaran a `exercises` mediante script local o SQL generado, no mediante endpoint publico.
- La validacion de ejercicios sera hibrida y simple: frontend para feedback inmediato, backend para confirmar completado de nivel.
- No existira progreso parcial dentro de un nivel.
- Si el usuario sale antes de completar los 5 ejercicios del nivel, pierde el avance de esa partida.
- No se modelaran tablas de intentos, respuestas individuales ni checkpoints por ejercicio.
- La XP ganada al completar un nivel dependera de la dificultad del nivel.
- La XP real debe calcularse y sumarse en backend, no confiarse a un valor enviado por frontend.
- `users.xp` representa XP disponible/gastable, no XP historica total.
- No se agregara `total_xp` ni metrica historica equivalente.
- Repetir niveles ya completados solo servira como practica.
- Repetir un nivel completado no otorga XP, no modifica racha y no cambia progreso.
- El usuario puede jugar su nivel actual para avanzar y obtener recompensa.
- El usuario puede repetir niveles anteriores ya completados solo como practica.
- El usuario no puede entrar a niveles futuros bloqueados.
- Al completar el nivel 7 integrador de una ruta, el avance al siguiente nivel global debe ocurrir de inmediato.
- El desbloqueo de la siguiente ruta se deriva automaticamente de `current_level_id`.
- Cualquier popup intermedio de cierre de ruta sera frontend puro.
- El tiempo de cuenta regresiva por ejercicio dependera de la dificultad, pero sera una regla de frontend.
- Si se agota el tiempo de cualquier ejercicio, se restablece automaticamente el intento completo del nivel.
- Los intentos fallidos de nivel seran ilimitados temporalmente, segun acuerdo previo con el cliente.
- Al reiniciar un nivel por tiempo agotado, se vuelve a aleatorizar el orden de ejercicios y opciones en frontend.

## 4. Rutas tematicas previstas

Segun la estructura actual de `levels.json`, existen estas rutas/temas esperados:

- Algoritmos.
- Tipos de datos.
- Expresiones.
- Funciones.
- Condicionales.
- Ciclos.
- Estructuras de datos.
- Archivos de texto plano.

Nota importante: `js/app-data.js` muestra rutas narrativas similares, pero actualmente solo declara 7 niveles reales para `ruta-grimorio-algoritmo`. La implementacion final debe ampliar o generar los niveles para todas las rutas tematicas.

## 5. Estado del JSON de preguntas

Decision del equipo:

- No se editara el JSON de preguntas por ahora.
- La encargada enviara una version final con las preguntas necesarias.
- El equipo solo ordenara las preguntas cuando llegue la version final.
- El JSON debe terminar representando 35 ejercicios por ruta.
- La base de datos debe ser la fuente operativa final para rutas, niveles y ejercicios.
- El JSON final debe tratarse como fuente de importacion/semilla para poblar `exercises`.

Estructura esperada para cada ruta:

- 7 niveles por tema.
- 5 ejercicios por nivel.
- 35 ejercicios por ruta.

En el codigo actual, `questions.json` ya usa una forma directa para algoritmos:

- `temas.algoritmos.nivel_1`
- `temas.algoritmos.nivel_2`
- ...
- `temas.algoritmos.nivel_7`

Cada nivel contiene 5 ejercicios y mezcla tipos como:

- `opcion_multiple`
- `ordenar_lineas`
- `drag_and_drop`
- `seleccionar_lineas`
- `respuesta_numerica`

`levels.json`, en cambio, actualmente agrupa por dificultad (`facil`, `medio`, `dificil`) y todavia no refleja explicitamente el nivel integrador. Esto se considera pendiente de alineacion con la estructura final.

Decision recomendada sobre contenido:

- `routes`, `levels` y `exercises` deben existir en base de datos.
- El JSON de preguntas no debe ser el modelo final del sistema.
- El JSON sirve para importar ejercicios a la base de datos.
- Si el JSON recibido contiene solo ejercicios, el equipo debe asignar cada ejercicio a `route_id`, `level_id` y `order_index`.
- Las rutas y niveles son estructura del sistema; no dependen de que el JSON los traiga.
- PHP debe consultar `exercises` desde base de datos y responder JSON al frontend.

Motivo:

- Los diagramas ya modelan `Exercise` con atributos y relaciones.
- La app necesita saber a que `Level` pertenece cada `Exercise`.
- El progreso del usuario depende de completar niveles, por lo tanto los ejercicios deben relacionarse con niveles reales.
- Mantener ejercicios solo en JSON haria que la base de datos tenga usuarios/progreso, pero no el catalogo academico completo.
- Importar desde JSON permite recibir el trabajo de las encargadas sin forzar que ellas conozcan toda la estructura interna de rutas y niveles.

Flujo recomendado:

1. Recibir JSON final de preguntas.
2. Revisar cada ejercicio.
3. Asignar `route_id`, `level_id`, `type` y `order_index`.
4. Separar datos visibles en `content_data`.
5. Separar datos de validacion en `answer_data`.
6. Insertar datos en `exercises`.
7. Hacer que frontend consuma `/api/levels/{id}/exercises` en lugar de leer el JSON directamente.

Decision sobre importacion:

- Se usara un script local o SQL generado con ayuda tecnica.
- No se recomienda exponer un endpoint publico para importar ejercicios.
- Si se crea una herramienta PHP de importacion, debe ser temporal, local o protegida, no parte de la app normal.
- Antes de importar, el equipo debe organizar los ejercicios por ruta, nivel y orden.
- El script de importacion no debe alterar el contenido original de preguntas, codigo, opciones o respuestas.

## 6. Modelo canonico de dominio y datos

La nomenclatura canonica queda en ingles. Las clases se escriben en `PascalCase`; las tablas y columnas SQL en `snake_case`; las propiedades JavaScript en `camelCase`.

### User

Tabla: `users`

Representa a una persona registrada en CapyCode.

Columnas SQL:

- `id`
- `username`
- `password_hash`
- `current_level_id`
- `streak`
- `xp`
- `last_completion_at`
- `current_outfit_id`

Propiedades JS equivalentes:

- `id`
- `username`
- `currentLevelId`
- `streak`
- `xp`
- `lastCompletionAt`
- `currentOutfitId`

Notas:

- La contrasena nunca debe guardarse en texto plano.
- `password_hash` se genera en backend con `bcrypt`.
- `streak` es un entero persistido, pero `Streak` no debe ser clase.
- `xp` representa el saldo disponible/gastable del usuario.
- No se guarda XP historica total; por lo tanto no existe `total_xp`.
- `last_completion_at` guarda fecha/hora de la ultima terminacion de nivel.
- `current_level_id` apunta al nivel global secuencial desbloqueado.
- Mientras `current_level_id <= totalLevels`, coincide con un `levels.id` real.
- Cuando `current_level_id = totalLevels + 1`, representa juego completado y no coincide con un nivel real.
- `current_outfit_id` referencia el outfit equipado.
- Al crear un usuario, `current_level_id` inicia en 1.
- Al crear un usuario, `current_outfit_id` apunta al outfit inicial y ese mismo outfit se inserta en `user_outfits`.
- Un nivel con `id < current_level_id` se considera completado y solo puede repetirse como practica.
- Un nivel con `id = current_level_id` es el nivel actual y puede otorgar recompensa al completarse.
- Un nivel con `id > current_level_id` esta bloqueado.
- Si `current_level_id = totalLevels + 1`, el juego completo esta terminado.
- En estado de juego terminado, todos los niveles tienen `id < current_level_id` y quedan disponibles solo como practica.

Derivacion con 7 niveles por ruta:

- `routeIndex = Math.ceil(currentLevelId / 7)`
- `routeLevel = ((currentLevelId - 1) % 7) + 1`

Ejemplo:

- `currentLevelId = 1` equivale a ruta 1, nivel 1.
- `currentLevelId = 7` equivale a ruta 1, nivel 7.
- `currentLevelId = 8` equivale a ruta 2, nivel 1.
- `currentLevelId = 9` equivale a ruta 2, nivel 2.
- Con 8 rutas de 7 niveles, `currentLevelId = 57` equivale a juego completado.

### Route

Tabla: `routes`

Representa una ruta tematica. No se crea entidad `Topic` ni campo `topic` porque cada `Route.name` ya representa exactamente el tema de la ruta.

Columnas SQL:

- `id`
- `name`
- `order_index`
- `background_image`

Propiedades JS equivalentes:

- `id`
- `name`
- `orderIndex`
- `backgroundImage`

Relaciones y reglas:

- Una `Route` contiene exactamente 7 `Level`.
- Una `Route` tiene 35 `Exercise` a traves de sus niveles.
- Las rutas se desbloquean secuencialmente por avance de `current_level_id`.
- Al completar el nivel integrador de una ruta, `current_level_id` avanza al primer nivel de la siguiente ruta.
- Al completar el ultimo nivel integrador del juego, `current_level_id` avanza a `totalLevels + 1`.
- `background_image` apunta al fondo visual de la ruta.
- Las posiciones de los nodos de nivel no necesitan guardarse por ruta si todos los fondos respetan las mismas posiciones.

### Level

Tabla: `levels`

Representa una unidad jugable dentro de una ruta.

Columnas SQL:

- `id`
- `route_id`
- `route_order`
- `name`
- `difficulty`
- `content`

Propiedades JS equivalentes:

- `id`
- `routeId`
- `routeOrder`
- `name`
- `difficulty`
- `content`

Reglas:

- `id` se usa como identificador global secuencial de nivel dentro del catalogo fijo del proyecto.
- `route_order` va de 1 a 7 dentro de cada ruta.
- Cada `Level` pertenece a exactamente una `Route`.
- Cada `Level` tiene exactamente 5 `Exercise`.
- No se modela `description` para niveles; el frontend final debe mostrar solo nombre, dificultad y contenido.
- `content` es texto breve fijo del nivel y se guarda en base de datos.
- `content` no debe derivarse automaticamente desde `Route.name` ni desde la dificultad.
- `content` no reemplaza ni reintroduce una descripcion larga de nivel.

Valores validos de `difficulty`:

- `easy`
- `medium`
- `hard`
- `integrative`

Reglas derivadas de `difficulty`:

- La dificultad determina la XP otorgada al completar el nivel.
- La dificultad determina el tiempo de cuenta regresiva de cada ejercicio en frontend.
- No se agregara `xp_reward` a `levels` mientras la recompensa dependa solo de dificultad.
- Si en el futuro cada nivel necesitara una recompensa propia aunque tenga la misma dificultad, entonces si convendria agregar `xp_reward`.

Tiempos de cuenta regresiva definidos:

| Dificultad | Tiempo maximo por ejercicio |
| --- | --- |
| `easy` | 20 segundos |
| `medium` | 30 segundos |
| `hard` | 40 segundos |
| `integrative` | 50 segundos |

Justificacion:

- En `questions.json`, cada nivel actual contiene 5 ejercicios y mezcla los cinco tipos principales.
- Los niveles faciles tienen prompts mas cortos y hasta 5 lineas visibles.
- Los niveles medios y dificiles aumentan longitud de prompt y cantidad de lineas visibles.
- El nivel integrador actual contiene prompts mas largos, por lo que 50 segundos es razonable como limite superior.
- No se recomienda bajar estos tiempos mientras existan ejercicios de ordenar lineas, seleccionar lineas o completar plantillas.

### Exercise

Tabla: `exercises`

Representa un reto individual dentro de un nivel.

Decision importante:

- En el diagrama de clases, `Exercise` debe modelarse como clase abstracta.
- Cada tipo de ejercicio debe representarse como subclase concreta de `Exercise`.
- En la base de datos, se usara un diseno hibrido con una sola tabla `exercises`.
- `type` indica el subtipo conceptual de ejercicio.
- `content_data` y `answer_data` guardan la parte variable de cada subtipo.
- No se creara una tabla por tipo de ejercicio para esta entrega.
- Esta decision es final salvo que el profesor exija normalizacion estricta por subtipo.
- Esta decision afecta principalmente al diagrama entidad-relacion, no al diagrama de clases.
- En el diagrama de clases se mantienen las 5 subclases porque representan comportamiento y atributos especificos.
- En el diagrama entidad-relacion no se crean 5 tablas hijas; se representa una sola tabla `exercises`.

Columnas SQL:

- `id`
- `level_id`
- `type`
- `prompt`
- `content_data`
- `answer_data`
- `order_index`

Propiedades JS equivalentes:

- `id`
- `levelId`
- `type`
- `prompt`
- `contentData`
- `answerData`
- `orderIndex`

Reglas:

- Un `Level` tiene exactamente 5 `Exercise`.
- Un `Exercise` pertenece a exactamente un `Level`.
- `content_data` guarda los datos visibles/armables del ejercicio que cambian segun el tipo.
- `answer_data` guarda los datos de validacion que cambian segun el tipo.
- `order_index` define el orden del ejercicio dentro del nivel.
- `exercises` sera poblada a partir del JSON final recibido.
- Una vez importados, los ejercicios se consumen desde base de datos mediante PHP/API.
- No se guarda el archivo JSON completo como blob unico.
- Se importan sus campos a columnas y payloads estructurados.

Nota sobre JSON en base de datos:

- Si la base de datos soporta tipo `JSON`, usar `JSON` para `content_data` y `answer_data`.
- Si no lo soporta o quieren mantenerlo simple en MySQL/PHP escolar, usar `TEXT` con JSON valido.
- Esto no significa que el JSON externo sea la fuente final; la fuente operativa sigue siendo la tabla `exercises`.
- Evitar JSON por completo obligaria a crear varias tablas hijas por tipo de ejercicio, lo cual es mas complejo para esta entrega.
- El diseno hibrido no elimina los atributos especificos de cada subtipo; solo los encapsula dentro de payloads estructurados.
- En clases, los atributos especificos siguen apareciendo en cada subclase.
- En SQL, esos atributos especificos viven dentro de `content_data` o `answer_data`, segun correspondan.

Clase abstracta recomendada:

`Exercise`

Atributos comunes:

- `id`
- `levelId`
- `type`
- `prompt`
- `content`
- `orderIndex`

Metodos comunes:

- `validateAnswer(answer)`
- `getFeedback(answer)`

Subclases recomendadas:

| Subclase | Tipo canonico | Atributos especificos principales |
| --- | --- | --- |
| `MultipleChoiceExercise` | `multiple_choice` | `options`, `correctOptionIds` |
| `NumericAnswerExercise` | `numeric_answer` | `expectedValue` |
| `LineSelectionExercise` | `line_selection` | `lines`, `correctLineIds` |
| `LineOrderingExercise` | `line_ordering` | `lines`, `correctOrder` |
| `FillBlanksExercise` | `fill_blanks` | `template`, `blanks`, `correctValues` |

Metodos especificos:

- Cada subclase implementa su propia version de `validateAnswer(answer)`.
- Cada subclase puede preparar su estructura visual desde `answer_data`.

Nota sobre persistencia:

- La herencia ayuda al diagrama de clases porque expresa comportamiento.
- La tabla unica ayuda al diagrama ER porque evita complejidad innecesaria.
- `exercises.type` indica que subclase conceptual se debe usar.
- `exercises.content_data` contiene los datos visibles/armables de esa subclase.
- `exercises.answer_data` contiene los datos de respuesta/validacion de esa subclase.
- PHP puede leer `type`, decodificar ambos payloads y aplicar la validacion correspondiente.
- Equivalencia conceptual: una fila de `exercises` con `type = multiple_choice` representa una instancia de `MultipleChoiceExercise`.
- Equivalencia conceptual: una fila de `exercises` con `type = numeric_answer` representa una instancia de `NumericAnswerExercise`.
- Por eso no hay contradiccion entre tener subclases en UML y una sola tabla en SQL.

Ejemplos de filas en `exercises`:

| id | level_id | type | prompt | content_data | answer_data | order_index |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | `multiple_choice` | "Que imprime este codigo?" | `{"code":["print(2+2)"],"options":[{"id":"A","text":"3"},{"id":"B","text":"4"}]}` | `{"correctIds":["B"]}` | 1 |
| 2 | 1 | `numeric_answer` | "Cuantas iteraciones realiza el ciclo?" | `{"code":["for i in range(5):","  print(i)"]}` | `{"value":5}` | 2 |
| 3 | 1 | `line_ordering` | "Ordena las lineas para crear el algoritmo." | `{"lines":[{"id":"A","text":"Mostrar resultado"},{"id":"B","text":"Leer dato"}]}` | `{"correctOrder":["B","A"]}` | 3 |

Comparacion con diseno normalizado:

- Diseno hibrido elegido: una tabla `exercises`, menos joins, importacion mas simple desde JSON y suficiente claridad para el proyecto.
- Diseno normalizado estricto: `exercises` mas una tabla hija por cada subtipo; seria mas riguroso teoricamente, pero aumentaria complejidad en SQL, PHP, importacion y diagramas.
- Diseno de muchas columnas nulas: descartado porque ensucia la tabla y mezcla atributos que solo aplican a algunos tipos.

Decision sobre validacion:

- La validacion sera hibrida, pero sin agregar complejidad innecesaria.
- El frontend usara `answerData` para validar cada ejercicio al momento de responder y mostrar feedback inmediato.
- El frontend no permitira avanzar al siguiente ejercicio si la respuesta actual es incorrecta.
- Una respuesta incorrecta no reinicia el nivel; solo bloquea el avance hasta responder correctamente.
- El backend sera la autoridad para completar un nivel.
- Al terminar correctamente los 5 ejercicios, el frontend enviara las respuestas del intento a `POST /api/levels/{id}/complete`.
- El backend consultara `answer_data` en `exercises`, validara las respuestas recibidas y solo entonces actualizara `current_level_id`, `xp`, `streak` y `last_completion_at`.
- No se creara un endpoint por cada ejercicio respondido.
- No se guardara historial detallado de cada respuesta salvo que el profesor lo pida despues.
- No se guardara progreso parcial del nivel.
- Si el usuario abandona la pantalla antes de completar los 5 ejercicios, el intento se descarta.
- Si se agota el tiempo de cualquier ejercicio, se considera fallido el intento completo del nivel.
- Al agotarse el tiempo, el frontend debe restablecer automaticamente el nivel desde el primer ejercicio.
- Los intentos de nivel seran ilimitados de forma temporal.
- Una respuesta incorrecta antes de que se agote el tiempo no reinicia el nivel.
- Una respuesta incorrecta solo muestra feedback y mantiene al usuario en el ejercicio actual.
- Cada reinicio por tiempo agotado debe volver a aleatorizar ejercicios y opciones.
- La aleatorizacion de reinicio no modifica `order_index`, ids ni datos persistidos.
- Esta regla queda como acuerdo de producto con cliente y puede revisarse despues sin cambiar la base de datos.

Motivo:

- El usuario recibe feedback instantaneo sin esperar al servidor por cada ejercicio.
- El avance real del usuario no depende solo de una bandera enviada por el navegador.
- La implementacion se mantiene corta: una carga de ejercicios y una llamada final para completar nivel.
- Al no existir progreso parcial, la base de datos se mantiene simple y no requiere tablas como `level_attempts` o `exercise_answers`.
- Al ser intentos ilimitados y no persistidos, no se requiere contador de fallos en `users`, `levels` ni `exercises`.

Estructura recomendada por tipo:

#### MultipleChoiceExercise

Origen actual:

- `tipo`
- `prompt`
- `code`
- `opciones`
- `correct_ids`

Persistencia recomendada:

```json
content_data = {
  "code": ["..."],
  "options": [{ "id": "A", "text": "..." }]
}

answer_data = {
  "correctIds": ["A"]
}
```

#### NumericAnswerExercise

Origen actual:

- `tipo`
- `prompt`
- `code`
- `valor`

Persistencia recomendada:

```json
content_data = {
  "code": ["..."]
}

answer_data = {
  "value": 6
}
```

#### LineSelectionExercise

Origen actual:

- `tipo`
- `prompt`
- `lineas`
- `correct_ids`

Persistencia recomendada:

```json
content_data = {
  "lines": [{ "id": "A", "text": "..." }]
}

answer_data = {
  "correctIds": ["A"]
}
```

#### LineOrderingExercise

Origen actual:

- `tipo`
- `prompt`
- `lineas`
- `orden_correcto`

Persistencia recomendada:

```json
content_data = {
  "lines": [{ "id": "A", "text": "..." }]
}

answer_data = {
  "correctOrder": ["A", "B"]
}
```

#### FillBlanksExercise

Origen actual:

- `tipo`
- `prompt`
- `plantilla`
- `banco_palabras`
- `rellenos`

Persistencia recomendada:

```json
content_data = {
  "template": ["... {h1} ..."],
  "wordBank": ["range", "enumerate", "list"]
}

answer_data = {
  "blanks": { "h1": "range" }
}
```

Regla de importacion:

- No modificar textos, codigo, opciones, lineas, plantillas ni respuestas.
- Solo traducir nombres de claves al modelo canonico cuando se importan.
- Guardar tambien el JSON original como archivo de respaldo en el repositorio o carpeta administrativa, pero no usarlo como fuente operativa de la app.

Tipos canonicos de ejercicio:

| Tipo actual | Tipo canonico |
| --- | --- |
| `opcion_multiple` | `multiple_choice` |
| `respuesta_numerica` | `numeric_answer` |
| `seleccionar_lineas` | `line_selection` |
| `ordenar_lineas` | `line_ordering` |
| `drag_and_drop` | `fill_blanks` |

### Outfit

Tabla: `outfits`

Representa un vestuario/personaje equipable.

Columnas SQL:

- `id`
- `name`
- `description`
- `tagline`
- `cost`
- `image`

Propiedades JS equivalentes:

- `id`
- `name`
- `description`
- `tagline`
- `cost`
- `image`

Relaciones y reglas:

- Un `User` tiene un `current_outfit_id`.
- Un `Outfit` puede ser el outfit actual de muchos usuarios.
- Un `User` puede tener muchos outfits desbloqueados.
- Un `Outfit` puede estar desbloqueado por muchos usuarios.
- El outfit inicial debe existir en `outfits` como cualquier otro outfit, normalmente con `cost = 0`.
- La tienda es pantalla de frontend, no entidad de dominio.

Costos actuales observados en `js/app-data.js`:

| Outfit | Cost |
| --- | --- |
| `CapyBlack` | 0 |
| `CapyAqua` | 300 |
| `CapyKing` | 750 |
| `CapyExplorer` | 1200 |
| `CapyRuna` | 1800 |
| `CapyCandy` | 2000 |
| `CapySun` | 2200 |
| `CapyEarth` | 2600 |
| `CapyConstelation` | 2900 |

Nota: en la nomenclatura final se usa `cost`; los nombres temporales `price`, `costo` o `costoXP` deben desaparecer al migrar a la estructura final.

Reglas de compra/equipamiento:

- `users.xp` funciona como saldo disponible.
- Desbloquear un outfit resta `outfits.cost` de `users.xp`.
- No se permite desbloquear si `users.xp < outfits.cost`.
- La compra se ejecuta directamente al presionar el boton correspondiente.
- No se requiere confirmacion previa antes de descontar XP.
- Comprar un outfit solo lo desbloquea; no lo equipa automaticamente.
- Equipar un outfit no cuesta XP.
- Solo se puede equipar un outfit ya desbloqueado.
- El outfit actual debe existir en `user_outfits` para ese usuario.
- `current_outfit_id` solo cambia cuando el usuario ejecuta la accion de equipar.
- No se conserva una metrica historica de XP total ganada.
- Si despues se agrega animacion, popup o celebracion de compra, sera frontend puro.

Tabla intermedia:

`user_outfits`

Columnas SQL:

- `user_id`
- `outfit_id`
- `unlocked_at`

Restricciones recomendadas:

- Llave primaria compuesta: `user_id` + `outfit_id`.
- `user_id` referencia a `users.id`.
- `outfit_id` referencia a `outfits.id`.
- Evitar registros duplicados del mismo outfit para el mismo usuario.

### Session

Tabla: `sessions`

Entidad tecnica para autenticacion. No pertenece al dominio jugable, pero si aparece en el diagrama entidad-relacion.

Columnas SQL:

- `id`
- `user_id`
- `token_hash`
- `created_at`
- `expires_at`

Campo opcional:

- `revoked_at`

Reglas:

- Un `User` puede tener muchas `Session`.
- Una `Session` pertenece a un solo `User`.
- El token real se guarda en cookie `HttpOnly`.
- La base de datos guarda solo `token_hash`.
- En primera version se recomienda no usar `revoked_at`; al cerrar sesion, backend borra la fila y limpia la cookie.

### Descartes explicitos

No crear estas clases/tablas en el modelo principal:

- `Topic`: se absorbe en `Route.name`.
- `routes.topic`: no se usa porque duplicaria `routes.name`.
- `StoryStation`: la pagina de historia es frontend puro.
- `UserProgress`: el progreso vive directamente en `users`.
- `Streak`: es atributo/regla, no entidad.
- `XP`: es atributo/recompensa, no entidad.
- `Shop`: es pantalla de frontend, no entidad.

## 7. Elementos que NO deben convertirse en clases de dominio

### Streak

No debe ser una clase.

Debe ser:

- Un atributo entero de `User`.
- Una regla de negocio calculada en backend al completar nivel.
- Una visualizacion derivada en frontend.

### XP

No debe ser clase.

Debe ser:

- Un atributo entero de `User`.
- Una moneda/recompensa usada por tienda y avance.

### Session

No debe tratarse como parte del juego.

Decision:

- No incluir `Session` en el diagrama principal de clases/dominio.
- Si el diagrama entidad-relacion incluye autenticacion, agregar tabla tecnica `sessions`.
- No usar `session` como atributo textual de `User`.

Campos minimos recomendados para `sessions`:

- `id`
- `user_id`
- `token_hash`
- `created_at`
- `expires_at`

Campo opcional si se quiere conservar historial de sesiones cerradas:

- `revoked_at`

Relacion:

- Un `User` puede tener muchas `Session`.
- Una `Session` pertenece a un solo `User`.

Motivo:

- Mantiene limpio el dominio del juego.
- Define donde vive la autenticacion en base de datos.
- Evita meter tokens o sesiones como atributos directos de usuario.

### HUD, iconos, sonidos y musica

No son clases de dominio.

Son componentes o recursos de frontend.

## 8. Regla de racha propuesta

La racha se calcula por dia calendario, no por ventana movil de 24 horas.

Regla acordada:

- Solo cuenta cuando el usuario termina un nivel.
- No cuenta cuando inicia un nivel.
- No cuenta por completar ejercicios individuales.
- Si el usuario completa al menos 1 nivel durante un dia calendario, conserva o aumenta racha.
- Si pasa un dia calendario completo sin completar ningun nivel, la racha visible debe volver a 0.

Ejemplo:

- Completa un nivel el lunes: racha 1.
- Completa un nivel el martes: racha 2.
- No completa ningun nivel el miercoles.
- El jueves, antes de completar otro nivel, la racha visible debe ser 0.
- Si completa un nivel el jueves, la nueva racha debe ser 1.

Recomendacion tecnica:

- Guardar `last_completion_at` en backend.
- Calcular `streak` con una funcion de backend al completar nivel.
- Tambien calcular `visibleStreak` al consultar perfil, para evitar mostrar una racha fantasma.

Advertencia sobre el truco de frontend:

Guardar en frontend el dia del ultimo nivel completado y compararlo contra la fecha actual puede servir como solucion visual temporal. Sin embargo, no debe ser fuente de verdad porque el usuario puede manipular `localStorage`, cambiar el reloj local o usar otro dispositivo.

Mejor version del mismo enfoque:

- Backend guarda `streak` y `last_completion_at`.
- Backend devuelve al frontend `visibleStreak`.
- Frontend puede recalcular visualmente si ya cambio el dia, pero solo como presentacion.
- La autoridad final sigue siendo backend.

Zona horaria:

- La regla de dia calendario debe definirse con una zona horaria de negocio.
- Recomendado: `America/Mexico_City`, si el proyecto se evaluara para usuarios del contexto local.

## 9. Funcion backend: nivel completado

Cuando el usuario termina el ultimo ejercicio de un nivel, el frontend debe llamar al backend.

Operacion conceptual:

`completeLevel(userId, levelId, answers, completedAt)`

Responsabilidades:

- Validar que el nivel enviado no sea futuro bloqueado.
- Validar si el nivel completado corresponde a `current_level_id` del usuario o a un nivel anterior de practica.
- Evitar saltos de nivel no permitidos.
- Permitir repetir niveles completados solo como practica.
- Evitar duplicar recompensas si el usuario repite un nivel ya completado.
- Validar las respuestas recibidas contra `answer_data` de los 5 ejercicios del nivel.
- Rechazar la completacion si no estan correctas las 5 respuestas del nivel.
- Incrementar `current_level_id` si corresponde.
- Calcular XP de completado segun `difficulty` del nivel.
- Sumar XP de completado si corresponde.
- Calcular `streak`.
- Guardar `last_completion_at`.
- Devolver el nuevo estado de progreso al frontend.
- Si el nivel es futuro bloqueado, rechazar la solicitud.
- Si el nivel ya estaba completado, devolver estado sin sumar XP, sin cambiar racha y sin modificar `current_level_id`.
- Si se completa el ultimo nivel global, actualizar `current_level_id` a `totalLevels + 1`.

Pseudoflujo:

1. Buscar `User`.
2. Rechazar si `levelId > current_level_id`.
3. Determinar si `levelId < current_level_id` es practica o si `levelId = current_level_id` es avance.
4. Cargar los 5 ejercicios del nivel desde `exercises`.
5. Validar `answers` contra `answer_data`.
6. Confirmar que las 5 respuestas son correctas.
7. Si es practica, responder como practica completada sin recompensa.
8. Si es avance nuevo, actualizar `current_level_id`; si era el ultimo nivel global, usar `totalLevels + 1`.
9. Calcular `streak` usando `last_completion_at` y `completedAt`.
10. Calcular XP usando la dificultad del nivel.
11. Actualizar XP.
12. Guardar cambios.
13. Responder estado actualizado.

Regla de XP:

- El frontend no debe enviar cuanta XP sumar.
- El backend debe leer la dificultad del nivel y calcular la recompensa.
- El frontend puede mostrar una previsualizacion de XP usando la misma tabla de valores, pero solo como presentacion.
- Mientras la XP dependa solo de dificultad, no se necesita columna `xp_reward`.
- La XP solo se otorga la primera vez que el usuario completa el nivel que corresponde a su avance actual.
- Repetir niveles completados no otorga XP.

Tabla de valores definida:

| Dificultad | XP otorgada |
| --- | --- |
| `easy` | 100 |
| `medium` | 200 |
| `hard` | 300 |
| `integrative` | 550 |

Justificacion economica:

- Los vestuarios actuales cuestan 0, 300, 750, 1200, 1800, 2000, 2200, 2600 y 2900 XP.
- El costo total de todos los vestuarios pagados actuales es 13750 XP.
- Cada ruta completa otorga 1750 XP: 2 niveles `easy`, 2 `medium`, 2 `hard` y 1 `integrative`.
- Con 8 rutas completas, el usuario puede ganar 14000 XP.
- Esto permite comprar todos los vestuarios actuales con un margen pequeno de 250 XP.
- Si despues cambian costos de tienda, esta tabla debe recalibrarse.

## 10. Autenticacion y sesion

Estado actual:

- `js/auth.js` simula login y registro con `localStorage`.
- No hay validacion real contra servidor.
- No hay hashing real de contrasena.
- No hay sesiones reales.

Recomendacion para backend sencillo, comun y suficientemente seguro:

- Usar `bcrypt` para hash de contrasenas.
- Usar un costo razonable, por ejemplo 10 o 12.
- Nunca guardar contrasenas en texto plano.
- Nunca enviar ni devolver `passwordHash` al frontend.

Flujo correcto de registro/login:

- El usuario escribe su contrasena en el frontend.
- El frontend envia la contrasena al backend dentro de una peticion HTTPS.
- El backend recibe la contrasena, genera el hash con `bcrypt` y guarda solo `passwordHash`.
- En login, backend compara la contrasena recibida contra `passwordHash`.
- El frontend nunca debe guardar la contrasena.
- El frontend tampoco debe calcular el hash principal.

Motivo para hashear en backend:

- Si se hashea en frontend como sustituto del hash backend, ese hash se vuelve practicamente la contrasena.
- Si no hay HTTPS, un atacante podria robar lo que viaje por red, sea contrasena o hash reutilizable.
- Backend debe controlar sal, costo del algoritmo y formato del hash.
- El hash frontend no reemplaza TLS/HTTPS.

Conclusion:

- En desarrollo local puede usarse HTTP temporalmente.
- En despliegue real, especialmente con Cloudflare o una red externa, frontend y backend deberian usar HTTPS.
- La contrasena viaja "en claro" dentro del cuerpo de la peticion, pero cifrada por HTTPS durante el transporte.

Opciones:

- En Node.js: `bcrypt` o `bcryptjs`.
- En Python: `passlib[bcrypt]`.
- En PHP: `password_hash()` con `PASSWORD_BCRYPT`.

Recomendacion para sesion:

- No guardar token de sesion en `localStorage` si se puede evitar.
- Preferir cookie `HttpOnly`, `Secure` y `SameSite=Lax`.
- Usar sesion de servidor con tabla `sessions` para mantenerlo simple y definido.
- Evitar JWT en esta entrega si no necesitan autenticacion stateless.
- Generar el token de sesion en backend.
- Hashear el token en backend antes de guardarlo en base de datos.
- Guardar en cookie el token real y en base de datos solo `token_hash`.

Motivo:

- `localStorage` puede ser leido por JavaScript si ocurre una vulnerabilidad XSS.
- Una cookie `HttpOnly` no puede ser leida directamente desde JavaScript del navegador.
- `Secure` obliga a enviar la cookie solo por HTTPS.
- `SameSite=Lax` reduce riesgo de CSRF en navegacion normal sin volver complejo el proyecto.

Modelo tecnico recomendado para base de datos:

`User 1 ---- 0..* Session`

Campos recomendados de `Session`:

- `id`
- `user_id`
- `token_hash`
- `created_at`
- `expires_at`

Para mantenerlo corto, se recomienda no usar `revoked_at` en la primera version. Al cerrar sesion, backend borra la fila de `sessions` y limpia la cookie. Si despues quieren auditoria historica, pueden agregar `revoked_at` y conservar la fila.

Nota sobre hash de tokens:

- Para contrasenas se recomienda `bcrypt`.
- Para tokens de sesion aleatorios de alta entropia, basta guardar un hash rapido como SHA-256 del token.
- No se debe guardar el token crudo en base de datos.

Advertencia si frontend y backend estan en dominios distintos:

- Si el frontend esta en Cloudflare Pages y el backend esta en una IP de la iMac, son origenes distintos.
- Para que una cookie HttpOnly viaje en peticiones `fetch` cross-origin se necesita configurar CORS con credenciales.
- El frontend debe llamar con `credentials: "include"`.
- El backend debe responder con `Access-Control-Allow-Credentials: true`.
- El backend no debe usar `Access-Control-Allow-Origin: *`; debe permitir el origen exacto del frontend.
- Si la cookie es cross-site, normalmente requiere `SameSite=None; Secure`, lo cual exige HTTPS.
- Si se sirve frontend y backend desde el mismo dominio/origen, la configuracion es mas simple y `SameSite=Lax` suele bastar.

## 10.1. Backend en iMac del profesor

El backend no cambia las clases del dominio. Cambia la arquitectura de despliegue.

Modelo mental correcto:

- El frontend son archivos estaticos: HTML, CSS, JS, imagenes y JSON.
- El backend es un servidor/API corriendo en la iMac del profesor.
- La base de datos vive en esa iMac o en un servicio accesible desde esa iMac.
- El navegador del usuario abre el frontend y, cuando necesita datos reales, hace peticiones HTTP al backend.

Ejemplo conceptual:

- Frontend: `https://capycode.pages.dev`
- Backend/API: `http://IP_DEL_PROFESOR:PUERTO/api`
- Base de datos: interna al backend, no accesible directamente desde el navegador.

La conexion no ocurre porque Cloudflare "hable" con la iMac. Ocurre porque el navegador del usuario carga el frontend y luego llama a la IP del backend.

Restricciones importantes:

- Si la IP del backend es privada, por ejemplo `192.168.x.x`, `10.x.x.x` o `172.16.x.x` a `172.31.x.x`, solo sera accesible desde la misma red local o desde VPN.
- Si la iMac esta dentro de la red del Tec y no tiene exposicion publica, probablemente deberan estar conectados a la red de la universidad o a una VPN institucional.
- Si se quiere acceder desde fuera del Tec, se necesita una IP publica, redireccion de puertos, firewall abierto o un tunel seguro.
- Si el frontend esta en HTTPS y el backend esta en HTTP, el navegador puede bloquear peticiones por contenido mixto. Lo ideal es que el backend tambien tenga HTTPS.
- El backend debe permitir CORS para el origen del frontend, por ejemplo el dominio de Cloudflare Pages o el archivo local si estan probando.
- Si usaran cookies HttpOnly entre Cloudflare y la IP de la iMac, deben revisar tambien `SameSite`, `Secure` y `credentials`.
- Para mantenerlo simple y seguro, lo ideal es servir frontend y backend bajo HTTPS y, si se puede, bajo el mismo dominio o subdominios bien configurados.

Para diagramas:

- En diagrama de componentes/despliegue, dibujar `Frontend estatico`, `Navegador`, `Backend/API en iMac del profesor` y `Base de datos`.
- En diagrama de clases, no dibujar la iMac ni Cloudflare como clases.
- En diagrama ER, no dibujar IP, red, Cloudflare ni archivos estaticos.

Recomendacion practica:

- Definir una constante de configuracion frontend llamada `API_BASE_URL`.
- En desarrollo puede apuntar a una IP local.
- En entrega final debe apuntar a la IP/dominio real del backend.
- Confirmar con el profesor si la IP es publica, privada, o si requiere estar en la red del Tec.

## 10.2. Rol de PHP en el proyecto

PHP probablemente sera la tecnologia del backend/API.

Modelo mental:

- HTML, CSS y JavaScript siguen siendo el frontend estatico.
- JavaScript usa `fetch()` para llamar endpoints PHP.
- PHP recibe la peticion HTTP.
- PHP valida sesion y permisos.
- PHP consulta o actualiza la base de datos con SQL.
- PHP responde JSON al frontend.

PHP no reemplaza el frontend. Tampoco cambia el diagrama de clases del dominio. Implementa operaciones del backend como login, registro, completar nivel, comprar/equipar outfit y consultar progreso.

Responsabilidades adecuadas para PHP:

- Recibir login y registro.
- Hashear contrasenas con `password_hash()`.
- Verificar contrasenas con `password_verify()`.
- Crear tokens de sesion con `random_bytes()`.
- Guardar `token_hash` con `hash('sha256', $token)`.
- Enviar cookie HttpOnly con `setcookie()`.
- Leer cookie de sesion en cada request.
- Consultar base de datos usando PDO.
- Consultar `routes`, `levels`, `exercises`, `outfits` y progreso del usuario.
- Ejecutar `completeLevel()`, `calculateStreak()` y operaciones de outfits.
- Devolver respuestas JSON.

Responsabilidades que no deberian quedar en PHP:

- Renderizar toda la interfaz, si mantienen el frontend estatico actual.
- Guardar contrasenas en texto plano.
- Exponer SQL directamente al navegador.
- Permitir que el navegador escriba directamente en la base de datos.

Ejemplo de flujo:

1. El usuario completa un nivel en una pagina HTML.
2. `game.js` llama `POST /api/levels/{id}/complete`.
3. PHP lee la cookie de sesion.
4. PHP busca la sesion en `sessions`.
5. PHP identifica al `User`.
6. PHP valida que el nivel sea el actual.
7. PHP actualiza `current_level_id`, `xp`, `streak` y `last_completion_at`.
8. PHP responde JSON con el progreso actualizado.

Conclusion:

- PHP sera el puente entre frontend estatico y base de datos.
- En diagramas de componentes aparece como `Backend/API PHP`.
- En diagramas de clases no se dibuja "PHP" como clase.
- En ER no aparece PHP; aparecen sus tablas (`users`, `routes`, `levels`, etc.).

## 11. Pendientes de frontend registrados

### Perfil

- Permitir cambiar nombre de usuario.
- Permitir cambiar contrasena.
- Quitar texto/titulo tipo "Novato del Grimorio".
- Reemplazar ese titulo por el nombre de la ruta actual.
- Ajustar perfil para que datos reales vengan del backend en lugar de `localStorage`.

### Niveles y mapa

- Quitar descripcion de niveles.
- Mantener para cada nivel solo:
  - nombre
  - dificultad
  - contenido breve
- El contenido breve de nivel vendra de `levels.content`.
- Agregar/asegurar dificultad `Integrador`.
- Adaptar mapa a varias rutas tematicas, no solo a algoritmos.
- Cada ruta debe renderizar exactamente 7 niveles.
- Las rutas y niveles deben desbloquearse secuencialmente.
- Permitir entrar al nivel actual.
- Permitir repetir niveles anteriores ya completados como practica.
- Bloquear niveles futuros.
- Si `current_level_id = totalLevels + 1`, mostrar estado de juego completado y permitir todos los niveles solo como practica.
- Implementar popup intermedio de cierre de ruta al completar un nivel integrador.
- El popup de cierre de ruta sera solo frontend y no debe retrasar el avance real de `current_level_id`.
- Implementar popup especial de juego completado al terminar el ultimo nivel global.
- El popup final de juego completado sera frontend puro y queda como pendiente de menor prioridad frente a la estructura principal.

### HUD y textos

- Cambiar "XP Points" por "XP".
- Mejorar icono de racha.
- Mejorar icono de XP.
- Mejorar iconografia general.

### Ejercicios e interaccion

- Mostrar los ejercicios de cada nivel en orden aleatorio durante la partida.
- Aleatorizar tambien los incisos/opciones de respuesta cuando el tipo de ejercicio los tenga.
- La aleatorizacion debe ser solo de frontend y no debe modificar ids, `order_index`, backend, base de datos ni diagramas.
- Bloquear el avance al siguiente ejercicio mientras la respuesta actual sea incorrecta.
- Respuesta incorrecta no reinicia el nivel; solo mantiene al usuario en el ejercicio actual.
- Descartar el avance de la partida si el usuario sale antes de completar los 5 ejercicios.
- Agregar cuenta regresiva por ejercicio.
- El tiempo disponible debe depender de la dificultad del nivel.
- La cuenta regresiva sera una regla de frontend y no agregara tablas, entidades ni backend adicional.
- Tiempos definidos: `easy` 20s, `medium` 30s, `hard` 40s, `integrative` 50s por ejercicio.
- Al agotarse el tiempo de cualquier ejercicio, restablecer automaticamente el intento completo del nivel.
- El reinicio debe volver al primer ejercicio del nivel.
- Al reiniciar por tiempo agotado, volver a aleatorizar el orden de ejercicios y opciones.
- Permitir intentos ilimitados de nivel de forma temporal, segun acuerdo con cliente.
- Los popups de respuesta correcta o incorrecta deben superponerse sobre la pantalla.
- Los popups no deben empujar contenido, mover elementos ni generar scroll adicional.
- Al repetir un nivel ya completado, mostrarlo como practica.
- La practica no debe prometer XP, racha ni desbloqueo de nuevo nivel.
- Al completar el nivel integrador, mostrar popup intermedio de cierre de ruta antes de llevar al usuario visualmente a la siguiente ruta.
- Al completar el ultimo nivel global, mostrar un popup especial de final del juego.
- El popup especial de final del juego no debe tener prioridad sobre backend, estructura de rutas/niveles, importacion de ejercicios ni autenticacion.

### Audio

- Agregar musica de fondo en pantalla de ejercicios/niveles.
- Como son paginas estaticas, se acepta que la musica se corte al cambiar de pagina.
- Usar un audio fijo durante la pantalla de ejercicios.
- Agregar sonido para popup de nivel completado.
- Agregar sonido para ejercicio contestado correctamente.
- Agregar sonido para ejercicio contestado incorrectamente.

### Tienda/personajes

- La tienda es pantalla de frontend, no entidad.
- `Outfit` si es entidad/tabla principal.
- Modelar `users.current_outfit_id`.
- Modelar relacion de desbloqueados con `user_outfits`.
- Comprar vestuario no requiere modal de confirmacion.
- Comprar vestuario solo lo desbloquea; equiparlo debe ser una accion separada.
- Cualquier animacion, popup o celebracion de compra sera frontend puro y no cambiara backend ni diagramas.

### Historia

- La pagina de historia debe considerarse frontend puro.
- No crear tabla ni clase `StoryStation`.
- Puede leer datos existentes de rutas, niveles, mentores o contenido estatico.
- Requiere rediseño posterior porque la version actual no representa bien la intencion del producto.

### Nomenclatura

Decision:

- La nomenclatura final sera en ingles.
- Los nombres deben ser cortos, consistentes y sin texto decorativo.
- Evitar sinonimos duplicados.
- Alinear nombres entre diagramas, base de datos, JSON, frontend y backend antes de la entrega final.

Convenciones recomendadas:

| Elemento | Convencion | Ejemplo |
| --- | --- | --- |
| Clase | `PascalCase`, singular | `User`, `Route`, `Level`, `Exercise`, `Outfit`, `Session` |
| Tabla | `snake_case`, plural | `users`, `routes`, `levels`, `exercises`, `outfits`, `sessions` |
| Tabla intermedia | entidades relacionadas en singular, unidas por `_` | `user_outfits` |
| Columna | `snake_case` | `current_level_id`, `current_outfit_id` |
| Propiedad JS | `camelCase` | `currentLevelId`, `currentOutfitId` |
| Llave primaria | siempre `id` | `users.id`, `levels.id` |
| Llave foranea | sufijo `_id` | `user_id`, `route_id`, `level_id`, `outfit_id` |
| Fecha/hora | sufijo `_at` | `created_at`, `expires_at`, `unlocked_at`, `last_completion_at` |
| Booleano | prefijo `is_`, `has_`, `can_` | `is_active`, `has_completed` |
| Funcion JS/PHP | `camelCase` | `completeLevel`, `calculateStreak`, `equipOutfit` |
| Endpoint REST | sustantivo plural, minusculas | `/api/levels/{id}/complete` |

Decision sobre `id`:

- La llave primaria de cada tabla debe llamarse `id`.
- Las llaves foraneas deben usar sufijo `_id`.
- No se recomienda usar prefijo `id_` en nombres como `id_user`.

Motivo:

- `user_id`, `route_id` y `current_outfit_id` son convenciones ampliamente usadas en SQL, ORMs y APIs.
- El nombre se lee como "id del usuario", "id de la ruta", "id del vestuario actual".
- Agrupa semanticamente el campo por la entidad a la que referencia.
- Evita nombres menos naturales como `id_user`, que son menos comunes en ecosistemas modernos.

Mapeo preliminar de nombres:

| Concepto actual | Nombre canonico recomendado |
| --- | --- |
| Usuario | `User` / `users` |
| RutaTematica | `Route` / `routes` |
| Nivel | `Level` / `levels` |
| Ejercicio | `Exercise` / `exercises` |
| Vestuario | `Outfit` / `outfits` |
| Sesion | `Session` / `sessions` |
| usuarios_vestuarios | `user_outfits` |
| nivelActual | `currentLevelId` / `current_level_id` |
| racha | `streak` |
| xp | `xp` |
| ultimaCompletacion | `lastCompletionAt` / `last_completion_at` |
| vestuarioActualId | `currentOutfitId` / `current_outfit_id` |
| passwordHash | `passwordHash` / `password_hash` |

Clases canonicas:

- `User`
- `Route`
- `Level`
- `Exercise`
- `MultipleChoiceExercise`
- `NumericAnswerExercise`
- `LineSelectionExercise`
- `LineOrderingExercise`
- `FillBlanksExercise`
- `Outfit`
- `Session`

Tablas canonicas:

- `users`
- `routes`
- `levels`
- `exercises`
- `outfits`
- `user_outfits`
- `sessions`

Funciones backend canonicas:

- `registerUser(username, password)`
- `loginUser(username, password)`
- `logoutUser(sessionToken)`
- `getCurrentUser(userId)`
- `updateUsername(userId, username)`
- `updatePassword(userId, currentPassword, newPassword)`
- `validateExerciseAnswer(exercise, answer)`
- `validateLevelAnswers(levelId, answers)`
- `completeLevel(userId, levelId, answers, completedAt)`
- `getXpReward(difficulty)`
- `calculateStreak(currentStreak, lastCompletionAt, completedAt)`
- `getVisibleStreak(streak, lastCompletionAt, now)`
- `unlockOutfit(userId, outfitId)`
- `equipOutfit(userId, outfitId)`
- `getRoutes()`
- `getLevelsByRoute(routeId)`
- `getExercisesByLevel(levelId)`

Endpoints REST sugeridos:

| Metodo | Endpoint | Proposito |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Crear usuario |
| `POST` | `/api/auth/login` | Iniciar sesion |
| `POST` | `/api/auth/logout` | Cerrar sesion |
| `GET` | `/api/me` | Obtener perfil/progreso actual |
| `PATCH` | `/api/me/username` | Cambiar nombre de usuario |
| `PATCH` | `/api/me/password` | Cambiar contrasena |
| `GET` | `/api/routes` | Listar rutas |
| `GET` | `/api/routes/{id}/levels` | Listar niveles de una ruta |
| `GET` | `/api/levels/{id}/exercises` | Listar ejercicios de un nivel, incluyendo datos necesarios para validacion local |
| `POST` | `/api/levels/{id}/complete` | Validar respuestas del nivel y completar nivel |
| `GET` | `/api/outfits` | Listar outfits |
| `POST` | `/api/outfits/{id}/unlock` | Desbloquear outfit |
| `POST` | `/api/outfits/{id}/equip` | Equipar outfit |

Endpoint opcional solo para administracion/importacion local:

| Metodo | Endpoint | Proposito |
| --- | --- | --- |
| `POST` | `/api/admin/import-exercises` | Importar ejercicios desde JSON final, solo si esta protegido o se usa localmente |

Archivos PHP sugeridos si no usan framework:

- `api/auth/register.php`
- `api/auth/login.php`
- `api/auth/logout.php`
- `api/me/index.php`
- `api/me/username.php`
- `api/me/password.php`
- `api/routes/index.php`
- `api/routes/levels.php`
- `api/levels/exercises.php`
- `api/levels/complete.php`
- `api/outfits/index.php`
- `api/outfits/unlock.php`
- `api/outfits/equip.php`
- `api/admin/import-exercises.php`, opcional y solo local/protegido si importan JSON desde una herramienta web

Nota: si el profesor les da una estructura PHP especifica, se respeta esa estructura y se conservan estos nombres como referencia conceptual.

## 12. Cambios estructurales pendientes en codigo

No ejecutar todavia hasta cerrar modelo y recibir JSON final.

Pendientes probables:

- Cambiar `app-data.js` para representar 8 rutas con 7 niveles cada una.
- Alinear `routeId` y `href` para cada nivel.
- Permitir que el mapa renderice niveles de la ruta activa con sus 7 nodos.
- Alinear `currentLevelId` como referencia al nivel global secuencial.
- Reemplazar `localStorage` como fuente de verdad por backend.
- Mantener `localStorage` solo como cache/estado visual temporal si hace falta.
- Modificar `game.js` para llamar a backend al completar nivel.
- Modificar `game.js` para cargar ejercicios desde `/api/levels/{id}/exercises`.
- Crear proceso local o SQL generado para importar el JSON final hacia `exercises`.
- Modificar `profile.js` para permitir edicion de nombre/contrasena.
- Modificar textos y HUD.
- Agregar audio en pantallas de ejercicios.
- Implementar cuenta regresiva por ejercicio segun dificultad.
- Implementar tabla de XP por dificultad en backend.
- Implementar popup frontend de cierre de ruta al completar nivel integrador.
- Implementar popup frontend especial de juego completado, con prioridad secundaria.
- Agregar configuracion `API_BASE_URL` para conectar el frontend con el backend de la iMac.
- Definir nomenclatura final de clases, tablas, atributos y claves JSON.

## 13. Recomendacion para diagramas

### Diagrama de clases / dominio

Incluir:

- `User`
- `Route`
- `Level`
- `Exercise`
- `Outfit`

Evitar como clases de dominio:

- `Streak`
- `XP`
- `HUD`
- `Icon`
- `Music`
- `Popup`
- `LocalStorage`
- `JSON`
- `StoryStation`
- `UserProgress`, salvo exigencia explicita del profesor

### Diagrama entidad-relacion

Incluir:

- `users`
- `sessions`
- `routes`
- `levels`
- `exercises`
- campos de progreso en `users`
- `outfits`
- `user_outfits`

Nota:

- En diagrama de clases, `Exercise` puede tener subclases.
- En ER, se mantiene solo `exercises` con `type` y `answer_data`.

### Diagrama de componentes

Aqui si pueden aparecer:

- Frontend estatico
- Navegador del usuario
- Backend/API PHP
- Base de datos
- Archivos JSON de contenido
- Servicio de autenticacion o modulo auth
- Modulo de progreso
- Modulo de ejercicios
- API externa por IP/dominio del servidor del profesor

## 14. Riesgos detectados

### Riesgo 1: `current_level_id` ambiguo

Estado: resuelto.

Con varias rutas secuenciales, el avance del usuario podia significar dos cosas:

- Un entero global, por ejemplo 1 a 56 si hay 8 rutas por 7 niveles.
- Un par logico: ruta actual + nivel dentro de ruta.

Decision final: se usara `current_level_id` como puntero entero al nivel global secuencial.

Implicacion:

- El backend guarda `users.current_level_id`.
- El frontend deriva ruta y nivel interno cuando necesita mostrarlo.
- El desbloqueo sigue una unica linea de progreso.
- En ER, `current_level_id` no se dibuja como FK estricta hacia `levels.id` si se mantiene el centinela `totalLevels + 1`.

### Riesgo 2: rutas narrativas y rutas jugables mezcladas

Estado: resuelto.

`storyStations` y `map.routes` actualmente mezclan narrativa con estructura jugable.

Decision final:

- No crear `StoryStation` como entidad.
- La historia sera frontend puro.
- Si la pagina de historia necesita datos, debe leerlos de `Route`, `Level` o contenido estatico.
- No habra tabla ni backend especifico para historia.

### Riesgo 3: session como atributo de user

Estado: resuelto.

Poner `session` como atributo simple de `User` es facil, pero debil conceptualmente.

Es mejor:

- `User` tiene `Session`.
- `Session` pertenece a `User`.
- La sesion es infraestructura, no parte del progreso del juego.

Decision final: usar sesion HttpOnly gestionada por backend. `Session` aparece en ER como tabla tecnica minima, pero no aparece en el diagrama principal de clases/dominio.

### Riesgo 4: racha fantasma

Si la racha solo se recalcula al completar nivel, puede mostrarse una racha vieja despues de varios dias sin jugar.

Mitigacion recomendada:

- Calcular `visibleStreak` al consultar perfil.
- Guardar `last_completion_at`.
- Hacer que frontend muestre 0 si la fecha ya expiro, pero sin considerar eso fuente de verdad.

### Riesgo 5: backend accesible solo desde red universitaria

Si la iMac del profesor esta expuesta solo en la red del Tec, el frontend no podra consumir la API desde cualquier lugar.

Mitigacion:

- Confirmar si la IP es publica o privada.
- Confirmar puerto del backend.
- Confirmar si se requiere VPN o estar conectado a Wi-Fi/red del Tec.
- Configurar CORS para el origen del frontend.
- Evitar que el frontend en HTTPS llame a un backend HTTP en produccion.

## 15. Preguntas abiertas

Estas preguntas deben resolverse una por una.

1. Definir si `levels.name` sera unico globalmente o solo unico dentro de cada ruta.

## 16. Decision actual de trabajo

Por ahora:

- No editar JSON de preguntas.
- Documentar decisiones y pendientes.
- Continuar cuestionando el modelo una pregunta a la vez.
- Priorizar decisiones que afectan diagramas y backend antes de tocar frontend.
