# 1. Acceso Y Navegación

CapyCode es una experiencia web de aprendizaje por rutas. El flujo esperado es: autenticación, mapa, nivel, retroalimentación, desbloqueo de progreso, tienda y perfil.

| Pantalla | Archivo | Objetivo principal | Acción esperada |
| --- | --- | --- | --- |
| Inicio | `index.html` | Entrada general al proyecto | Redirigir al flujo principal |
| Iniciar sesión | `iniciar_sesion.html` | Recuperar una sesión existente | Entrar al mapa |
| Registro | `registro.html` | Crear un usuario nuevo | Crear sesión y abrir mapa |
| Mapa | `mapa.html` | Elegir ruta y nivel | Entrar al siguiente nivel disponible |
| Nivel | `nivel.html` | Resolver 5 ejercicios | Guardar progreso |
| Tienda | `tienda.html` | Comprar o equipar vestuarios | Actualizar apariencia |
| Perfil | `perfil.html` | Consultar progreso y colecciones | Revisar estado actual |
| Tutorial | `tutorial.html` | Entender la interacción base | Volver al mapa |

## 1.1. Registro

1. Abrir `registro.html`.
2. Capturar nombre de usuario y contraseña.
3. Confirmar el formulario.
4. Verificar que el sistema redirige automáticamente al mapa.

| Campo | Regla funcional | Resultado esperado |
| --- | --- | --- |
| Usuario | Debe cumplir longitud mínima y máxima configurada | Se acepta o se muestra error |
| Contraseña | Debe cumplir longitud mínima y máxima configurada | Se acepta o se muestra error |

## 1.2. Inicio De Sesión

1. Abrir `iniciar_sesion.html`.
2. Capturar credenciales vigentes.
3. Presionar el botón de acceso.
4. Verificar que el HUD del mapa muestre el nombre del usuario correcto.

### 1.2.1. Señales visuales correctas

| Elemento | Qué debe verse |
| --- | --- |
| Logo | Identidad visual de CapyCode |
| Formulario | Usuario y contraseña visibles |
| Error de acceso | Mensaje claro si la autenticación falla |
| Redirección exitosa | Mapa disponible con sesión activa |

# 2. Mapa Y Progreso

El mapa organiza el juego en rutas. Cada ruta tiene niveles secuenciales y un estado visual que depende del progreso del usuario.

## 2.1. Lectura Del Mapa

| Elemento del mapa | Significado |
| --- | --- |
| Ruta activa | Ruta donde el usuario puede avanzar |
| Nivel desbloqueado | Se puede abrir |
| Nivel bloqueado | Requiere completar niveles previos |
| Nivel completado | Ya otorga práctica, no nuevo avance |
| Mascota / narrativa | Refuerza identidad de la ruta |

## 2.2. Reglas De Progreso

1. Cada nivel resuelto correctamente otorga XP.
2. Solo el nivel siguiente desbloqueado avanza el progreso real.
3. Si el juego completo ya fue terminado, los niveles restantes se juegan como práctica.
4. Completar la última pantalla de una ruta puede desbloquear recompensas asociadas.

### 2.2.1. HUD esperado

| Indicador | Fuente | Qué representa |
| --- | --- | --- |
| Nombre | Perfil actual | Usuario autenticado |
| Código | ID normalizado | Identificador visible |
| Ruta actual | Progreso | Zona activa del mapa |
| Nivel | Progreso | Nivel siguiente o estado completado |
| XP | Perfil | Puntos acumulados |
| Racha | Perfil visible | Actividad diaria registrada |

# 3. Resolución De Niveles

Cada nivel presenta exactamente 5 ejercicios por intento. El sistema mezcla el orden de esos ejercicios, pero conserva la validación y el contenido del nivel.

## 3.1. Tipos De Ejercicio

| Tipo | Interacción | Criterio de validación |
| --- | --- | --- |
| Opción múltiple | Seleccionar una o varias tarjetas | Coincidir exactamente con las opciones correctas |
| Respuesta numérica | Escribir un número | Coincidir con el valor final esperado |
| Seleccionar líneas | Marcar una línea de código | Elegir la línea que ejecuta la acción pedida |
| Ordenar líneas | Arrastrar líneas a una secuencia | Coincidir con el orden canónico evaluado |
| Completar plantilla | Insertar palabras en huecos | Coincidir exactamente con cada hueco esperado |

## 3.2. Contexto De Ejercicio

Cada ejercicio incluye contexto visible antes del reto:

| Bloque | Propósito |
| --- | --- |
| Contexto | Explica el tema y el alcance del fragmento |
| Consigna | Aclara qué debe responder el usuario |
| Reglas de lectura | Evita interpretaciones ambiguas |
| Criterio de validación | Define cómo se acepta la respuesta |
| Error común | Advierte una confusión típica |

### 3.2.1. Ordenar Líneas

En ejercicios de ordenamiento:

1. Deben usarse todas las líneas exactamente una vez.
2. No se puede inventar código adicional.
3. El juego evalúa una única secuencia canónica.
4. Se muestra una guía de pasos para aclarar qué tipo de flujo espera el nivel.

## 3.3. Temporizador Y Finalización

| Estado | Comportamiento esperado |
| --- | --- |
| Tiempo activo | El contador desciende por ejercicio |
| Respuesta correcta | Aparece confirmación flotante y se avanza |
| Respuesta incorrecta | Aparece error flotante y se permanece en el ejercicio |
| Tiempo agotado | Se abre el overlay de `Game Over` |
| Último ejercicio correcto | Se envía un único guardado y se abre un único popup de completado |

### 3.3.1. Popup De Completado

| Caso | Mensaje base |
| --- | --- |
| Nivel nuevo | `Nivel completado` |
| Práctica | `Práctica completada` |
| Ruta terminada | `Ruta completada` |
| Juego terminado | `Juego completado` |

# 4. Tienda Y Vestuarios

La tienda trabaja con el catálogo y el perfil actual. No existe un inventario separado del backend o del modo local.

## 4.1. Estados De Un Vestuario

| Estado | Descripción |
| --- | --- |
| Disponible para compra | Se puede comprar con XP suficiente |
| Equipado | Ya es la apariencia activa |
| Comprado | Ya pertenece al usuario |
| Bloqueado por ruta | Requiere completar una ruta específica |

## 4.2. Flujo De Compra

1. Abrir `tienda.html`.
2. Revisar costo, estado y detalle del vestuario.
3. Comprar si el usuario tiene XP suficiente.
4. Equipar si ya pertenece al usuario.

### 4.2.1. Señales esperadas

| Acción | Retroalimentación |
| --- | --- |
| Comprar | Sonido alto de tienda + actualización del HUD |
| Equipar | Sonido alto de tienda + cambio visual en sidebar/perfil |
| Intento bloqueado | Mensaje o estado visual consistente |

# 5. Perfil Y Tutorial

## 5.1. Perfil

El perfil resume el estado completo del usuario.

| Sección | Contenido esperado |
| --- | --- |
| Encabezado | Usuario, XP, racha, vestuario activo |
| Insignias | Rutas completadas |
| Colección | Vestuarios descubiertos, comprados y equipados |
| Progreso | Nivel actual y avance global |

## 5.2. Tutorial

El tutorial refuerza la lectura del mapa y la interacción general.

| Objetivo | Resultado esperado |
| --- | --- |
| Entender navegación | El usuario ubica mapa, tienda y perfil |
| Entender progreso | El usuario distingue bloqueado, desbloqueado y práctica |
| Entender niveles | El usuario identifica ejercicios y guardado de progreso |

# 6. Operación Local Y En iMac

## 6.1. Uso Local

| Modo | URL típica | Fuente de datos |
| --- | --- | --- |
| Preview estático | `http://127.0.0.1:5500` | `localStorage` + `content/question-bank.json` |
| Servidor PHP local | `http://127.0.0.1:8790` | API PHP + SQLite/MySQL |

## 6.2. Uso En iMac

1. Copiar la versión final limpia del repositorio.
2. Verificar que no permanezcan archivos legacy, temporales ni cachés ajenos al build final.
3. Confirmar `api/config.local.php` si la iMac usa MySQL.
4. Repetir registro, mapa, nivel, tienda y perfil como prueba de humo.

### 6.2.1. Evidencia mínima

| Validación | Evidencia mínima |
| --- | --- |
| Login y registro | Captura o video corto |
| Nivel 1 completo | Popup único de completado |
| XP y racha | HUD actualizado |
| Compra/equipado | Cambio visible en tienda y perfil |

# 7. Recuperación De Problemas

## 7.1. Casos Frecuentes

| Síntoma | Causa probable | Acción sugerida |
| --- | --- | --- |
| Fondo o asset no carga | Caché vieja o ruta incorrecta | Recargar fuerte y validar versión |
| API no responde en `:5500` | Se abrió la app en modo estático | Probar con servidor PHP |
| Nivel bloqueado inesperadamente | Sesión/perfil no actualizado | Reingresar o revisar progreso actual |
| Popup duplicado | Intentos múltiples de envío | Verificar que la versión nueva ya esté desplegada |

## 7.2. Qué No Debe Hacer El Usuario

1. No mezclar la versión estática con una API que no esté corriendo.
2. No modificar archivos `content/` o `api/` directamente en producción sin volver a verificar el flujo completo.
3. No interpretar como error que un nivel ya terminado se marque como práctica después de completar el juego.
