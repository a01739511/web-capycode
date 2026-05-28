# Definición De Pruebas Estáticas Y Manuales (Heurística)

## 1. Qué Significa En Este Proyecto

En CapyCode, este documento define dos grupos complementarios:

| Tipo | Qué evalúa | Cuándo se aplica |
| --- | --- | --- |
| Pruebas estáticas | Calidad del código sin ejecutar la app | Antes de subir cambios |
| Pruebas manuales heurísticas | Comportamiento y experiencia observando la interfaz | Después de que la app ya corre |

La parte “heurística” significa que no solo se comprueba si algo funciona, sino si se comporta de una manera consistente, clara y razonable para la persona usuaria.

## 2. Objetivo

1. Detectar errores de sintaxis, referencias rotas, archivos viejos y contratos inconsistentes.
2. Detectar fallas visuales, ambigüedad en preguntas, problemas de navegación y regresiones de flujo.
3. Mantener alineados frontend, backend, contenido, base de datos y despliegue.

## 3. Pruebas Estáticas

## 3.1. Revisión De Estructura

| Verificación | Método | Criterio de aceptación |
| --- | --- | --- |
| Árbol limpio | `git status` | Solo existen cambios previstos para la entrega |
| Archivos legacy eliminados | búsqueda con `rg` | No quedan referencias a JSON viejos, scripts viejos o assets muertos |
| Banco único | inspección de `content/` | Solo existe `content/question-bank.json` como fuente activa de preguntas |
| Nombres coherentes | revisión manual | Carpetas y archivos coinciden con su responsabilidad actual |

## 3.2. Validación De Sintaxis

| Capa | Comando | Resultado esperado |
| --- | --- | --- |
| JavaScript | `Get-ChildItem js,content -Recurse -Include *.js \| ForEach-Object { node --check $_.FullName }` | Sin errores |
| PHP | `Get-ChildItem api -Recurse -Filter *.php \| ForEach-Object { php -l $_.FullName }` | Sin errores |
| Diff | `git diff --check` | Sin errores de espacios, cortes o parches rotos |

## 3.3. Revisión De Contratos

| Contrato | Qué revisar | Riesgo que evita |
| --- | --- | --- |
| `window.CapyApi` | métodos públicos y forma de uso | rotura entre pantallas |
| `content/question-bank.json` | esquema único y campos de contexto | ambigüedad en ejercicios |
| Endpoints PHP | rutas, payloads y respuestas | incompatibilidad frontend/backend |
| Base de datos | tablas, columnas y seed | pérdida de persistencia |

## 3.4. Heurísticas Estáticas De Código

| Heurística | Pregunta de revisión |
| --- | --- |
| Cohesión | ¿Cada archivo hace una sola cosa principal? |
| Legibilidad | ¿Los nombres explican intención y no solo implementación? |
| Comentarios | ¿Aclaran reglas no obvias sin narrar lo evidente? |
| Duplicación | ¿La misma regla aparece más de una vez con riesgo de divergencia? |
| Rutas y assets | ¿Toda referencia tiene archivo real y toda imagen usada tiene referencia viva? |
| Migración legacy | ¿La compatibilidad antigua está aislada y no contaminó toda la app? |

## 4. Pruebas Manuales Heurísticas

## 4.1. Flujo Base Del Usuario

| Caso | Pasos | Qué debe observarse |
| --- | --- | --- |
| Registro | Abrir registro, crear usuario, llegar al mapa | Transición limpia y HUD correcto |
| Login | Entrar con usuario existente | Sesión activa y nombre correcto |
| Logout | Cerrar sesión desde shell compartido | Redirección consistente a login |

## 4.2. Mapa

| Heurística | Qué validar |
| --- | --- |
| Claridad | El usuario distingue ruta actual, progreso y bloqueo |
| Consistencia | El nivel disponible coincide con el perfil real |
| Robustez visual | Fondos, badges, nodos y personajes cargan sin 404 |

## 4.3. Nivel

| Caso | Qué revisar |
| --- | --- |
| Contexto del ejercicio | Cada ejercicio muestra alcance, reglas y criterio de validación |
| Opción múltiple | Las opciones responden y solo quedan seleccionadas según la regla |
| Respuesta numérica | El input acepta y conserva el número escrito |
| Selección de líneas | La línea marcada es clara y única |
| Ordenar líneas | La secuencia canónica es comprensible y el arrastre funciona |
| Completar plantilla | Los huecos y el banco de palabras se actualizan correctamente |
| Temporizador | Baja por ejercicio y cambia a estado de peligro |
| Guardado final | El popup de completado aparece una sola vez |

### 4.3.1. Heurística Del Bug Corregido

| Riesgo | Prueba manual |
| --- | --- |
| Doble guardado del último inciso | Spam de clic o `Ctrl + Enter` sobre el último ejercicio correcto |
| Resultado esperado | Solo un envío efectivo, un solo popup final y sin overlay de práctica inmediatamente después |

## 4.4. Tienda

| Heurística | Qué validar |
| --- | --- |
| Jerarquía visual | Se entiende qué está bloqueado, comprado o equipado |
| Audio | Los efectos de comprar y equipar se oyen claramente por encima de la música |
| Regla de compra | No se permite comprar sin XP suficiente |
| Regla de equipar | Solo se equipa lo que el usuario ya posee |

## 4.5. Perfil Y Tutorial

| Vista | Heurística |
| --- | --- |
| Perfil | El progreso mostrado coincide con mapa, tienda y backend |
| Tutorial | La explicación acompaña el flujo actual y no un flujo viejo |

## 4.6. Backend Y Persistencia

| Caso | Qué validar |
| --- | --- |
| `GET /api/health` | Responde correctamente |
| Registro / login / logout | Mantienen sesión coherente |
| `GET /me` | Devuelve usuario consistente |
| `GET /routes` y niveles | Coinciden con el mapa |
| `GET /levels/{id}/exercises` | Devuelve ejercicios con contexto y validación |
| `POST /levels/{id}/complete` | Guarda una sola vez por intento |
| Tienda | Comprar y equipar persiste cambios |

## 5. Criterios De Aceptación

| Área | Criterio mínimo para aprobar |
| --- | --- |
| Código | Sintaxis limpia, estructura coherente, sin archivos muertos |
| Contenido | Banco único, sin ambigüedades graves, con contexto visible |
| UX | Flujo continuo, sin bloqueos extraños ni mensajes contradictorios |
| Persistencia | Perfil, progreso, XP, racha y tienda permanecen correctos |
| Despliegue | La versión subida coincide con la validada en local |

## 6. Evidencia Recomendada

1. Capturas del mapa, un nivel, popup final, tienda y perfil.
2. Salida de `node --check`, `php -l` y `git diff --check`.
3. Registro breve de pruebas manuales realizadas.
4. Confirmación de la versión desplegada en GitHub e iMac.
