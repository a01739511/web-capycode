# Base De Datos Y API

## Configuracion

`api/config.php` define SQLite local por defecto. En la iMac o servidor se debe crear `api/config.local.php` para sobreescribir la configuracion sin tocar el repo.

Internamente, la inicializacion y semillas viven en `api/lib/database/`, pero `api/lib/database.php` se conserva como punto de entrada estable para no romper includes existentes.
El contenido jugable que alimenta esas semillas vive en `content/question-bank.json` y se resuelve desde `api/lib/game-data/`.

Campos importantes:

- `db_driver`: `sqlite` o `mysql`.
- `db_path`: ruta de SQLite local.
- `db_host`, `db_name`, `db_user`, `db_password`: conexion MySQL.
- `table_prefix`: prefijo de tablas, por defecto `capycode_`.

## Tablas

La API autoinicializa las tablas necesarias con el prefijo configurado. Por defecto, las tablas fisicas se crean como `capycode_users`, `capycode_routes`, etc.; estos son los nombres logicos:

- `users`
- `routes`
- `levels`
- `exercises`
- `outfits`
- `user_outfits`
- `user_route_badges`
- `user_tokens`
- `app_meta`

No se cambiaron nombres de tablas, columnas ni relaciones durante el refactor.

## Organizacion Interna

- `runtime.php`: configuracion activa, driver y nombres fisicos de tabla.
- `connection.php`: conexion PDO para SQLite o MySQL.
- `schema.php`: creacion de tablas y columnas compatibles con versiones previas.
- `routes.php`: seed y sincronizacion del catalogo de rutas.
- `catalog.php`: seed, resincronizacion y fingerprint de niveles y ejercicios.
- `meta.php`: lecturas y escrituras de `app_meta`.
- `outfits.php`: seed, sincronizacion y migracion del vestuario por defecto.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `PATCH /api/me/username`
- `PATCH /api/me/password`
- `GET /api/routes`
- `GET /api/routes/{id}/levels`
- `GET /api/levels/{id}/exercises`
- `POST /api/levels/{id}/complete`
- `GET /api/outfits`
- `POST /api/outfits/{id}/unlock`
- `POST /api/outfits/{id}/equip`

## Reglas Persistidas

- `current_level_id` es el siguiente nivel desbloqueado.
- Completar niveles anteriores es practica y no da XP ni racha.
- Completar el nivel actual suma XP segun dificultad.
- La racha se calcula con zona horaria `America/Mexico_City`.
- La compra y equipamiento de vestuarios se valida en backend.
