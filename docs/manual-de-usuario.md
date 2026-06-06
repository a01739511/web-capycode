# 1. Que Es CapyCode

CapyCode es un juego de aprendizaje por rutas. Tu objetivo es avanzar nivel por nivel resolviendo ejercicios de programacion en Python para ganar XP, mantener tu racha y desbloquear contenido nuevo.

## 1.1. Que Necesitas Para Jugar

| Requisito | Que implica |
| --- | --- |
| Cuenta | Debes registrarte o iniciar sesion |
| Tiempo de juego | Cada ejercicio tiene tiempo limite |
| Atencion | Las respuestas se validan con precision |
| Progreso activo | Solo puedes avanzar en el siguiente nivel disponible |

## 1.2. Pantallas Que Vas A Usar

| Pantalla | Para que sirve |
| --- | --- |
| Inicio de sesion / registro | Entrar al juego con tu cuenta |
| Mapa | Ver rutas, niveles y progreso |
| Nivel | Resolver ejercicios |
| Tienda | Comprar o equipar vestuarios |
| Perfil | Revisar tu progreso, XP, racha y coleccion |
| Tutorial | Recordar como interactuar con el juego |

# 2. Como Empezar

## 2.1. Primer Ingreso

1. Crea una cuenta o inicia sesion.
2. Entra al mapa.
3. Abre el nivel desbloqueado.
4. Resuelve los 5 ejercicios del intento.

## 2.2. Como Se Ve El Progreso General

| Elemento | Significado |
| --- | --- |
| Ruta | Conjunto tematico de niveles |
| Nivel desbloqueado | Ya puedes jugarlo |
| Nivel bloqueado | Aun no cumples el requisito para abrirlo |
| Nivel completado | Ya lo pasaste al menos una vez |
| XP | Puntos acumulados |
| Racha | Dias consecutivos con actividad correcta |

# 3. Como Funciona El Juego

## 3.1. Rutas Y Niveles

El juego esta dividido en rutas. Cada ruta tiene 7 niveles y cada nivel pertenece a un tema concreto.

| Dato | Regla |
| --- | --- |
| Niveles por ruta | 7 |
| Ejercicios por intento | 5 |
| Acceso | Solo puedes avanzar al siguiente nivel disponible |
| Repeticion | Los niveles ya completados pueden jugarse otra vez |

## 3.2. Que Pasa Dentro De Un Nivel

Cada intento de nivel toma 5 ejercicios del nivel actual. El juego puede variar el orden de aparicion, pero sigue evaluando el mismo contenido del nivel.

### 3.2.1. Tipos De Ejercicio

| Tipo | Que haces |
| --- | --- |
| Opcion multiple | Elegir una o varias respuestas |
| Respuesta numerica | Escribir un numero |
| Seleccionar lineas | Marcar la linea correcta |
| Ordenar lineas | Formar el orden canonico correcto |
| Completar plantilla | Llenar huecos con palabras del banco |

### 3.2.2. Informacion Que Muestra Cada Ejercicio

Antes de responder, el juego te muestra apoyo para interpretar bien el reto.

| Bloque visible | Para que te sirve |
| --- | --- |
| Contexto | Te ubica en el tema del ejercicio |
| Consigna | Te dice exactamente que debes hacer |
| Reglas de lectura | Evita interpretaciones ambiguas |
| Criterio de validacion | Te aclara como se acepta la respuesta |
| Error comun | Te avisa una confusion frecuente |

### 3.2.3. Tiempo Por Ejercicio

Cada ejercicio tiene un temporizador segun la dificultad del nivel.

| Dificultad del nivel | Tiempo por ejercicio |
| --- | --- |
| Facil | 20 segundos |
| Medio | 30 segundos |
| Dificil | 40 segundos |
| Integrador | 50 segundos |

## 3.3. Que Pasa Si Respondes Bien O Mal

| Situacion | Resultado |
| --- | --- |
| Respuesta correcta | Avanzas al siguiente ejercicio |
| Respuesta incorrecta | Permaneces en el mismo ejercicio |
| Respuesta incompleta | El juego te pide completarla |
| Ultimo ejercicio correcto | Se guarda el intento y aparece el popup final |

### 3.3.1. Si Una Respuesta Es Incorrecta

1. No avanzas.
2. Debes corregir el mismo ejercicio.
3. El tiempo sigue corriendo mientras no hayas terminado.

### 3.3.2. Si Se Acaba El Tiempo

Si el temporizador llega a cero:

1. El intento termina.
2. Aparece `Game Over`.
3. Puedes reiniciar el nivel o volver al mapa.
4. Ese intento no te da avance, XP ni recompensa.

## 3.4. Reintentos

| Caso | Que ocurre |
| --- | --- |
| Reiniciar despues de `Game Over` | Empiezas de nuevo el intento |
| Repetir un nivel completado | Se juega como practica cuando ya no corresponde avance real |
| Volver mas tarde | Tu progreso guardado se conserva |

# 4. Reglas De Progreso

## 4.1. Desbloqueo De Niveles

Solo puedes abrir:

1. El nivel actual que te toca.
2. Niveles anteriores ya completados.
3. Todos los niveles cuando el juego completo ya fue terminado, pero en ese caso cuentan como practica.

## 4.2. XP

Cuando completas un nivel nuevo, ganas XP segun su dificultad.

| Dificultad | XP ganado |
| --- | --- |
| Facil | 100 XP |
| Medio | 200 XP |
| Dificil | 300 XP |
| Integrador | 550 XP |

## 4.3. Cuando Un Nivel Si Cuenta Como Avance

| Situacion | Cuenta como avance |
| --- | --- |
| Completar el nivel que sigue en tu progreso | Si |
| Repetir un nivel anterior | No |
| Jugar despues de terminar todo el juego | No, cuenta como practica |

## 4.4. Practica

La practica sirve para volver a jugar sin alterar tu progreso principal.

| En practica | Que pasa |
| --- | --- |
| XP | No aumenta |
| Racha | No cambia |
| Nivel actual | No avanza |
| Popup final | Muestra `Practica completada` |

## 4.5. Racha

La racha se actualiza con la primera actividad correcta del dia que realmente cuenta como avance.

| Caso | Resultado |
| --- | --- |
| Primera actividad correcta de hoy | La racha se registra o aumenta |
| Vuelves a jugar el mismo dia | La racha se conserva, pero no sube otra vez |
| Jugaste tambien ayer | La racha aumenta en 1 |
| Dejaste pasar uno o mas dias | La racha vuelve a 1 |

### 4.5.1. Ejemplos De Racha

| Escenario | Resultado esperado |
| --- | --- |
| Ayer jugaste y hoy completas un nivel nuevo | La racha sube |
| Hoy ya completaste una actividad correcta y repites otra | La racha no vuelve a subir ese mismo dia |
| Pasaste varios dias sin jugar | La siguiente actividad correcta reinicia la racha en 1 |

## 4.6. Fin De Ruta Y Fin Del Juego

| Momento | Que puede ocurrir |
| --- | --- |
| Fin de una ruta | Se desbloquea la siguiente ruta |
| Fin de una ruta | Puede habilitar recompensas en la tienda |
| Fin del juego completo | Todos los niveles restantes se pueden repetir como practica |

# 5. Tienda Y Vestuarios

## 5.1. Como Se Desbloquean

No todos los vestuarios estan disponibles desde el inicio.

| Estado | Significado |
| --- | --- |
| Base | Ya lo tienes desde el principio |
| Disponible | Ya puedes comprarlo |
| Equipado | Es tu apariencia actual |
| Bloqueado por ruta | Primero debes completar cierta ruta |
| XP insuficiente | Ya esta habilitado, pero aun no te alcanza |

## 5.2. Como Comprar

1. Entra a la tienda.
2. Revisa si el vestuario ya esta habilitado por ruta.
3. Revisa si tienes suficiente XP.
4. Confirma la compra.

## 5.3. Como Equipar

| Caso | Resultado |
| --- | --- |
| Ya lo compraste | Puedes equiparlo |
| No lo has comprado | No puedes equiparlo |
| Esta bloqueado por ruta | Primero debes completar la ruta requerida |

## 5.4. Lo Que Debes Tener En Cuenta

| Regla | Explicacion |
| --- | --- |
| Comprar gasta XP | Tu saldo baja al confirmar |
| Comprar no siempre equipa automaticamente | Puedes necesitar equiparlo despues |
| El vestuario activo se refleja en el perfil y la barra lateral | El cambio es visible en varias pantallas |

# 6. Perfil Y Tutorial

## 6.1. Perfil

En tu perfil puedes revisar:

| Dato | Para que te sirve |
| --- | --- |
| Usuario | Confirmar tu cuenta activa |
| XP | Ver cuantos puntos tienes |
| Racha | Ver tu continuidad diaria |
| Nivel actual | Saber donde vas |
| Insignias | Ver rutas completadas |
| Vestuarios | Ver lo que descubriste, compraste o equipaste |

## 6.2. Tutorial

El tutorial es una guia rapida para recordar:

1. Como leer el mapa.
2. Como avanzar por niveles.
3. Como interpretar los ejercicios.
4. Como ubicar tienda y perfil.

# 7. Recomendaciones Para Jugar Mejor

## 7.1. Antes De Responder

| Consejo | Por que ayuda |
| --- | --- |
| Lee el contexto | Reduce errores por interpretacion |
| Mira la consigna completa | Evita contestar otra cosa |
| Revisa el criterio de validacion | Te dice exactamente como se acepta |
| Controla el tiempo | Cada ejercicio tiene limite |

## 7.2. En Ejercicios De Ordenar Lineas

1. Usa todas las lineas.
2. No inventes codigo nuevo.
3. Respeta la secuencia canonica pedida por el juego.
4. Apoyate en la guia de pasos si aparece.

## 7.3. En Ejercicios De Practica

La practica sirve para estudiar o repetir, pero no para subir progreso real.

# 8. Preguntas Frecuentes Del Alumno

## 8.1. Que Pasa Si Cierro La Pagina

Tu progreso guardado permanece en la cuenta. Si el intento no se habia completado, tendras que volver a empezar ese nivel.

## 8.2. Que Pasa Si Repito Un Nivel Ya Pasado

Puede contar como practica. Eso significa que puedes jugarlo otra vez, pero sin aumentar XP, racha ni avance principal.

## 8.3. Que Pasa Si Me Equivoco Muchas Veces

Puedes seguir corrigiendo mientras todavia quede tiempo en el ejercicio actual.

## 8.4. Que Pasa Si No Tengo Suficiente XP En La Tienda

No podras comprar ese vestuario hasta reunir los puntos necesarios.
