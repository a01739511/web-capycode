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
- `content/`: datos publicos consumidos por la app, como el banco unico de preguntas y configuraciones visuales.
- `js/core/`: shell comun de la app y helpers compartidos entre pantallas.
- `js/`: inicializadores de pantalla y modulos clasicos sin build step.
- `api/`: API PHP compatible con SQLite local y MySQL por configuracion local.
- `api/lib/database.php`: punto de entrada estable de base de datos; reparte la logica interna en `api/lib/database/`.
- `api/lib/game_data.php`: punto de entrada estable del contenido jugable; reparte reglas en `api/lib/game-data/`.
- `api/lib/repositories.php`: punto de entrada estable de consultas y reglas de dominio; reparte funciones en `api/lib/repositories/`.
- `assets/`: imagenes, iconos y audio.
- `content/question-bank.json`: banco unico y canonico de ejercicios.

## Contratos que no deben romperse

- El frontend usa `window.CapyApi`, `window.CapyCore` y `window.CapyHotkeys`.
- La pagina canonica de juego es `nivel.html?levelId=<id>`.
- Los endpoints de `api/index.php` mantienen el mismo JSON y las mismas rutas.
- La base de datos conserva nombres de tablas y columnas.

Consulta `docs/architecture.md`, `docs/database.md`, `docs/deployment-imac.md`, `docs/diagramas-mermaid.md`, `docs/manual-de-usuario.md` y `docs/definicion-pruebas-estaticas-y-manuales.md` para la explicacion completa.
