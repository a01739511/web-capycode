# Propuesta: Insignias por ruta completada

## Idea general

Se propone agregar insignias como recompensa visual cuando un usuario completa una ruta completa del juego. Es decir, al terminar el ultimo nivel de una ruta, el sistema desbloquearia una insignia asociada a esa ruta.

La insignia no reemplaza el sistema actual de XP, rachas o vestuarios; solo lo complementa como una recompensa de progreso academico.

## Impacto conceptual

Antes de implementarlo en codigo, habria que actualizar los diagramas del proyecto:

- Base de datos: agregar datos de insignia en `routes` y una tabla `user_route_badges` para registrar que usuario ya obtuvo la insignia de cada ruta.
- Estados de progreso: incluir el paso de "otorgar insignia" al completar el ultimo nivel de una ruta.
- Clases de dominio: agregar la relacion entre `User`, `Route` y la insignia obtenida.
- Componentes/servicios: extender la logica de progreso para validar y registrar insignias.

## Impacto en el codigo

Como todavia no existe backend ni base de datos real, el impacto seria manejable. Actualmente el progreso vive simulado en frontend, por lo que primero se podria implementar localmente y despues mapearlo al backend.

Cambios esperados:

- `js/app-data.js`: agregar nombre, descripcion e imagen de insignia por ruta.
- `js/api-client.js`: guardar que insignias tiene desbloqueadas el usuario.
- Logica de completar nivel: si el nivel completado es el ultimo de la ruta, desbloquear la insignia si aun no existe.
- UI: mostrar la insignia en el popup de ruta completada y, opcionalmente, en el perfil.

## Nivel de invasividad

La propuesta seria de impacto bajo a medio.

Seria baja si solo se registra y se muestra la insignia al completar una ruta. Seria media si tambien se agrega una galeria de insignias en el perfil o indicadores visuales en el mapa.

## Recomendacion

Primero validarlo conceptualmente en diagramas y base de datos. Si el equipo lo aprueba, despues se implementaria en frontend como simulacion local y finalmente se conectaria con backend cuando la base de datos este lista.
