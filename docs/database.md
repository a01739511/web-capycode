# Base De Datos Y API

## Configuracion

`api/config.php` define SQLite local por defecto. En la iMac o servidor se debe crear `api/config.local.php` para sobreescribir la configuracion sin tocar el repo.

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
