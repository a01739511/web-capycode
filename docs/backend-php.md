# Backend PHP de CapyCode

Este proyecto ya incluye una API PHP mínima en `api/` con base de datos SQLite autoinicializable.

## Qué hace

- Crea y usa `data/capycode.sqlite`.
- Si la base no existe, crea tablas y siembra rutas, niveles, ejercicios y vestuarios.
- Usa sesión PHP con cookie HttpOnly.
- Responde JSON para el contrato actual del frontend.

## Endpoints principales

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

## Ejecución local

Si la máquina tiene PHP instalado:

```bash
php -S 127.0.0.1:8000 router.php
```

Luego abrir:

- `http://127.0.0.1:8000/iniciar_sesion.html`

## Despliegue simple en Apache/PHP

1. Copiar el repo a la carpeta pública del servidor.
2. Asegurar que PHP tenga habilitado `pdo_sqlite`.
3. Asegurar permisos de escritura sobre `data/`.
4. Abrir `iniciar_sesion.html` desde el navegador del servidor.

El frontend usa `js/runtime-config.js`, que cuando detecta `http(s)` apunta automáticamente a `./api`.
