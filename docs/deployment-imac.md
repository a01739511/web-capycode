# Despliegue En iMac

## Antes De Copiar

1. Confirmar que la rama final tiene `git status` limpio.
2. Ejecutar verificaciones:

```bash
Get-ChildItem api -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

3. Probar localmente:

```bash
php -S 127.0.0.1:8000 router.php
```

## Copia Al Servidor

Copiar todo el proyecto excepto archivos ignorados por Git. No se requiere instalar dependencias.
El banco de preguntas ya viaja en `content/question-bank.json`, asi que no hace falta copiar datasets alternos ni herramientas de generacion.

### Limpieza Recomendada Antes De Reemplazar

Para evitar cache local, archivos legacy o mezclas con versiones viejas:

1. Respaldar `api/config.local.php` si existe.
2. Eliminar del directorio publicado anterior todo lo versionado en Git.
3. Copiar la version nueva completa.
4. Restaurar `api/config.local.php` si aplica.
5. Confirmar que ya no existan archivos eliminados en esta refactorizacion, por ejemplo:
   - `questions.json`
   - `levels.json`
   - `levels_algoritmos_complementado.json`
   - `js/questions-data.js`
   - `js/app-data.js`
   - `js/level-music.js`
   - `js/common.js`
   - `wrangler.toml`
   - `tools/generate_questions_dataset.py`

Si la iMac usa una copia Git del proyecto, la forma mas limpia es:

```bash
git fetch origin
git checkout <rama-final>
git pull --ff-only origin <rama-final>
git clean -fd
```

`git clean -fd` elimina archivos no versionados; no debe ejecutarse si hay archivos locales que no se hayan respaldado.

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
- Repetir clic rapidamente en el ultimo inciso correcto y confirmar que solo aparece un popup final.
- Revisar que suba XP, racha y desbloquee el siguiente nivel.
- Entrar a tienda y equipar/comprar un vestuario disponible.
