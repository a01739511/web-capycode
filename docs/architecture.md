# Arquitectura De CapyCode

## Frontend

La aplicacion sigue siendo HTML estatico con CSS plano y JavaScript clasico. No hay bundler, framework ni transpilacion.

- Cada HTML carga `style.css`, que funciona como entrada publica.
- `style.css` importa archivos en `styles/` para separar tokens, layout, pantallas y responsive.
- Los inicializadores de pantalla siguen siendo `js/auth.js`, `js/map.js`, `js/game.js`, `js/shop.js` y `js/profile.js`.
- `js/api/config.js`, `http.js` y `storage.js` concentran configuracion, peticiones HTTP y acceso a almacenamiento local.
- `js/api/catalog.js`, `normalizers.js`, `shop.js`, `exercises.js` y `progress.js` separan catalogos, validaciones y reglas puras de juego.
- `js/game/state.js`, `answers.js`, `renderer.js`, `drag-sort.js`, `completion.js` y `audio.js` separan piezas internas del runner sin usar modulos ES.

## Flujo De Juego

1. `mapa.html` consulta el usuario actual con `window.CapyCore.getProfile()`.
2. El mapa habilita solo niveles completados o el nivel actual.
3. `nivel.html?levelId=<id>` carga cinco ejercicios del nivel actual.
4. El feedback inmediato se valida en frontend con `CapyExerciseRules`.
5. Al terminar los cinco ejercicios, `window.CapyApi.completeLevel()` confirma progreso contra backend o modo local.
6. La API calcula XP, racha, desbloqueos y siguiente nivel.

## Convenciones

- JavaScript usa `camelCase`.
- PHP usa prefijo `capy_` y `snake_case`.
- Tablas SQL usan `snake_case` plural.
- Comentarios nuevos explican reglas de negocio, no instrucciones obvias.

## Compatibilidad Conservada

- URLs principales conservadas: `mapa.html`, `nivel.html`, `tienda.html`, `perfil.html`, `tutorial.html`, `iniciar_sesion.html`, `registro.html`.
- Las paginas legacy `p_*.html` fueron eliminadas porque ya no forman parte del flujo actual.
- El contrato global `window.CapyApi` no cambia.
