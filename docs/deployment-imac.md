# Despliegue En iMac

## Antes De Copiar

1. Confirmar que la rama final tiene `git status` limpio.
2. Ejecutar verificaciones:

```bash
php -l api/index.php
node --check js/api-client.js
```

3. Probar localmente:

```bash
php -S 127.0.0.1:8000 router.php
```

## Copia Al Servidor

Copiar todo el proyecto excepto archivos ignorados por Git. No se requiere instalar dependencias.

El servidor debe tener:

- PHP con PDO.
- `pdo_sqlite` para SQLite local o `pdo_mysql` para MySQL.
- Permisos de escritura sobre `data/` si se usa SQLite.

## Configuracion Local

Crear `api/config.local.php` en la iMac si se usa MySQL:

```php
<?php

return [
    'db_driver' => 'mysql',
    'db_host' => '127.0.0.1',
    'db_port' => 3306,
    'db_name' => 'TC2005B_601_3',
    'db_user' => 'TC2005B_601_3',
    'db_password' => 'TU_PASSWORD',
    'db_charset' => 'utf8mb4',
    'table_prefix' => 'capycode_',
];
```

`api/config.local.php` esta ignorado por Git para no subir credenciales.

## Verificacion En Produccion

- Abrir `iniciar_sesion.html`.
- Registrar usuario de prueba.
- Completar el nivel 1.
- Revisar que suba XP, racha y desbloquee el siguiente nivel.
- Entrar a tienda y equipar/comprar un vestuario disponible.
