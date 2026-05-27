# CapyCode

CapyCode es una aplicacion web estatica para practicar Python con rutas, niveles, tienda de vestuarios y progreso persistente.

## Como correrlo localmente

```bash
php -S 127.0.0.1:8000 router.php
```

Abre `http://127.0.0.1:8000/iniciar_sesion.html`.

## Estructura principal

- `index.html`, `iniciar_sesion.html`, `registro.html`, `mapa.html`, `nivel.html`, `tienda.html`, `perfil.html`, `tutorial.html`: paginas publicas conservadas.
- `style.css`: entrada publica de estilos; importa modulos planos en `styles/`.
- `js/`: inicializadores de pantalla y modulos clasicos sin build step.
- `api/`: API PHP compatible con SQLite local y MySQL por configuracion local.
- `assets/`: imagenes, iconos y audio.
- `questions.json`, `levels.json`, `levels_algoritmos_complementado.json`: fuentes de ejercicios para semilla/respaldo.

## Contratos que no deben romperse

- El frontend usa `window.CapyApi`, `window.CapyCore` y `window.CapyHotkeys`.
- La pagina canonica de juego es `nivel.html?levelId=<id>`.
- Los endpoints de `api/index.php` mantienen el mismo JSON y las mismas rutas.
- La base de datos conserva nombres de tablas y columnas.

Consulta `docs/architecture.md`, `docs/database.md` y `docs/deployment-imac.md` para la explicacion completa.
