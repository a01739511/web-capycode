window.CAPYCODE_QUESTIONS = {
    "temas":  {
                  "algoritmos":  {
                                     "nivel_1":  [
                                                     {
                                                         "tipo":  "opcion_multiple",
                                                         "prompt":  "¿Qué imprime este código?",
                                                         "code":  [
                                                                      "def multiplica(x, y=2):",
                                                                      "    return x * y",
                                                                      "print(multiplica(3))"
                                                                  ],
                                                         "opciones":  [
                                                                          {
                                                                              "id":  "A",
                                                                              "text":  "6"
                                                                          },
                                                                          {
                                                                              "id":  "B",
                                                                              "text":  "3"
                                                                          },
                                                                          {
                                                                              "id":  "C",
                                                                              "text":  "Error: falta un argumento"
                                                                          },
                                                                          {
                                                                              "id":  "D",
                                                                              "text":  "None"
                                                                          }
                                                                      ],
                                                         "correct_ids":  [
                                                                             "A"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "ordenar_lineas",
                                                         "prompt":  "Ordena las líneas para imprimir \u0027Hola Python\u0027 tres veces.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "for _ in range(3):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    print(\u0027Hola Python\u0027)"
                                                                        }
                                                                    ],
                                                         "orden_correcto":  [
                                                                                "A",
                                                                                "B"
                                                                            ]
                                                     },
                                                     {
                                                         "tipo":  "drag_and_drop",
                                                         "prompt":  "Completa la plantilla para sumar los números de 0 a n (incluido) de forma iterativa.",
                                                         "plantilla":  [
                                                                           "def suma_hasta(n):",
                                                                           "    total = 0",
                                                                           "    for i in {h1}(n + 1):",
                                                                           "        total += i",
                                                                           "    return total"
                                                                       ],
                                                         "banco_palabras":  [
                                                                                "range",
                                                                                "enumerate",
                                                                                "list"
                                                                            ],
                                                         "rellenos":  {
                                                                          "h1":  "range"
                                                                      }
                                                     },
                                                     {
                                                         "tipo":  "seleccionar_lineas",
                                                         "prompt":  "Selecciona la línea donde se define la función llamada \u0027suma\u0027.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "def suma(a, b):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    return a + b"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "resultado = suma(2, 3)"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "print(resultado)"
                                                                        }
                                                                    ],
                                                         "correct_ids":  [
                                                                             "A"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "respuesta_numerica",
                                                         "prompt":  "¿Qué número imprime el siguiente programa?",
                                                         "code":  [
                                                                      "contador = 0",
                                                                      "for _ in range(3):",
                                                                      "    contador += 2",
                                                                      "print(contador)"
                                                                  ],
                                                         "valor":  6
                                                     }
                                                 ],
                                     "nivel_2":  [
                                                     {
                                                         "tipo":  "opcion_multiple",
                                                         "prompt":  "En Python, ¿qué hace este algoritmo si n vale 4?",
                                                         "code":  [
                                                                      "suma = 0",
                                                                      "for i in range(1, n + 1):",
                                                                      "    suma += i",
                                                                      "print(suma)"
                                                                  ],
                                                         "opciones":  [
                                                                          {
                                                                              "id":  "A",
                                                                              "text":  "Imprime 4"
                                                                          },
                                                                          {
                                                                              "id":  "B",
                                                                              "text":  "Imprime 6"
                                                                          },
                                                                          {
                                                                              "id":  "C",
                                                                              "text":  "Imprime 10"
                                                                          },
                                                                          {
                                                                              "id":  "D",
                                                                              "text":  "Imprime 11"
                                                                          }
                                                                      ],
                                                         "correct_ids":  [
                                                                             "C"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "ordenar_lineas",
                                                         "prompt":  "Ordena las líneas para contar del 1 al 3 e imprimir cada número.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "for i in range(1, 4):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    print(i)"
                                                                        }
                                                                    ],
                                                         "orden_correcto":  [
                                                                                "A",
                                                                                "B"
                                                                            ]
                                                     },
                                                     {
                                                         "tipo":  "drag_and_drop",
                                                         "prompt":  "Completa la plantilla para contar cuántos elementos hay en una lista usando un contador.",
                                                         "plantilla":  [
                                                                           "def contar_elementos(xs):",
                                                                           "    total = 0",
                                                                           "    for _ in xs:",
                                                                           "        total {h1} 1",
                                                                           "    return total"
                                                                       ],
                                                         "banco_palabras":  [
                                                                                "+=",
                                                                                "-=",
                                                                                "*="
                                                                            ],
                                                         "rellenos":  {
                                                                          "h1":  "+="
                                                                      }
                                                     },
                                                     {
                                                         "tipo":  "seleccionar_lineas",
                                                         "prompt":  "Selecciona la línea donde el algoritmo actualiza el contador dentro del bucle.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "total = 0"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "for x in [4, 5, 6]:"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "    total += 1"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "print(total)"
                                                                        }
                                                                    ],
                                                         "correct_ids":  [
                                                                             "C"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "respuesta_numerica",
                                                         "prompt":  "¿Qué número imprime el siguiente programa?",
                                                         "code":  [
                                                                      "suma = 0",
                                                                      "for i in range(1, 5):",
                                                                      "    suma += i",
                                                                      "print(suma)"
                                                                  ],
                                                         "valor":  10
                                                     }
                                                 ],
                                     "nivel_3":  [
                                                     {
                                                         "tipo":  "ordenar_lineas",
                                                         "prompt":  "Ordena las líneas para contar cuántos números pares hay en una lista.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "def contar_pares(xs):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    total = 0"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "    for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "        if x % 2 == 0:"
                                                                        },
                                                                        {
                                                                            "id":  "E",
                                                                            "text":  "            total += 1"
                                                                        },
                                                                        {
                                                                            "id":  "F",
                                                                            "text":  "    return total"
                                                                        }
                                                                    ],
                                                         "orden_correcto":  [
                                                                                "A",
                                                                                "B",
                                                                                "C",
                                                                                "D",
                                                                                "E",
                                                                                "F"
                                                                            ]
                                                     },
                                                     {
                                                         "tipo":  "opcion_multiple",
                                                         "prompt":  "En un algoritmo que recorre una lista una sola vez sumando sus elementos, ¿qué papel cumple la variable \u0027total\u0027?",
                                                         "opciones":  [
                                                                          {
                                                                              "id":  "A",
                                                                              "text":  "Acumula el resultado parcial de la suma."
                                                                          },
                                                                          {
                                                                              "id":  "B",
                                                                              "text":  "Indica la posición actual del bucle."
                                                                          },
                                                                          {
                                                                              "id":  "C",
                                                                              "text":  "Detiene el programa cuando llega a cero."
                                                                          },
                                                                          {
                                                                              "id":  "D",
                                                                              "text":  "Convierte la lista en un conjunto."
                                                                          }
                                                                      ],
                                                         "correct_ids":  [
                                                                             "A"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "drag_and_drop",
                                                         "prompt":  "Completa la plantilla para contar cuántos números pares hay en una lista.",
                                                         "plantilla":  [
                                                                           "def contar_pares(xs):",
                                                                           "    total = 0",
                                                                           "    for x in xs:",
                                                                           "        if x {h1} 2 == 0:",
                                                                           "            total {h2} 1",
                                                                           "    return total"
                                                                       ],
                                                         "banco_palabras":  [
                                                                                "%",
                                                                                "+=",
                                                                                "*="
                                                                            ],
                                                         "rellenos":  {
                                                                          "h1":  "%",
                                                                          "h2":  "+="
                                                                      }
                                                     },
                                                     {
                                                         "tipo":  "seleccionar_lineas",
                                                         "prompt":  "Selecciona la línea donde se inicializa el acumulador antes del bucle.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "def suma_lista(xs):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    total = 0"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "    for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "        total += x"
                                                                        },
                                                                        {
                                                                            "id":  "E",
                                                                            "text":  "    return total"
                                                                        }
                                                                    ],
                                                         "correct_ids":  [
                                                                             "B"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "respuesta_numerica",
                                                         "prompt":  "¿Qué número imprime el siguiente programa?",
                                                         "code":  [
                                                                      "suma = 0",
                                                                      "for i in range(1, 7):",
                                                                      "    if i % 2 == 0:",
                                                                      "        suma += i",
                                                                      "print(suma)"
                                                                  ],
                                                         "valor":  12
                                                     }
                                                 ],
                                     "nivel_4":  [
                                                     {
                                                         "tipo":  "ordenar_lineas",
                                                         "prompt":  "Ordena las líneas para buscar si un número objetivo está dentro de una lista y devolver True si aparece.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "def contiene(xs, objetivo):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "        if x == objetivo:"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "            return True"
                                                                        },
                                                                        {
                                                                            "id":  "E",
                                                                            "text":  "    return False"
                                                                        }
                                                                    ],
                                                         "orden_correcto":  [
                                                                                "A",
                                                                                "B",
                                                                                "C",
                                                                                "D",
                                                                                "E"
                                                                            ]
                                                     },
                                                     {
                                                         "tipo":  "opcion_multiple",
                                                         "prompt":  "Si un algoritmo usa una variable llamada \u0027encontrado\u0027 que inicia en False y cambia a True cuando halla el dato buscado, ¿qué representa esa variable?",
                                                         "opciones":  [
                                                                          {
                                                                              "id":  "A",
                                                                              "text":  "Un acumulador numérico."
                                                                          },
                                                                          {
                                                                              "id":  "B",
                                                                              "text":  "Una bandera o indicador lógico."
                                                                          },
                                                                          {
                                                                              "id":  "C",
                                                                              "text":  "El índice final del algoritmo."
                                                                          },
                                                                          {
                                                                              "id":  "D",
                                                                              "text":  "La lista original ordenada."
                                                                          }
                                                                      ],
                                                         "correct_ids":  [
                                                                             "B"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "drag_and_drop",
                                                         "prompt":  "Completa la plantilla para sumar solo los números positivos de una lista.",
                                                         "plantilla":  [
                                                                           "def suma_positivos(xs):",
                                                                           "    total = 0",
                                                                           "    for x in xs:",
                                                                           "        if x {h1} 0:",
                                                                           "            total {h2} x",
                                                                           "    return total"
                                                                       ],
                                                         "banco_palabras":  [
                                                                                "\u003e",
                                                                                "+=",
                                                                                "=="
                                                                            ],
                                                         "rellenos":  {
                                                                          "h1":  "\u003e",
                                                                          "h2":  "+="
                                                                      }
                                                     },
                                                     {
                                                         "tipo":  "seleccionar_lineas",
                                                         "prompt":  "Selecciona la línea donde el algoritmo detecta que encontró el elemento buscado.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    if x == objetivo:"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "        return True"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "return False"
                                                                        }
                                                                    ],
                                                         "correct_ids":  [
                                                                             "B"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "respuesta_numerica",
                                                         "prompt":  "¿Qué número imprime el siguiente programa?",
                                                         "code":  [
                                                                      "total = 0",
                                                                      "for x in [3, -1, 4, -2, 5]:",
                                                                      "    if x \u003e 0:",
                                                                      "        total += x",
                                                                      "print(total)"
                                                                  ],
                                                         "valor":  12
                                                     }
                                                 ],
                                     "nivel_5":  [
                                                     {
                                                         "tipo":  "ordenar_lineas",
                                                         "prompt":  "Ordena las líneas para devolver el máximo de una lista sin usar max().",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "def maximo(xs):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    if not xs:"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "        raise ValueError(\u0027lista vacía\u0027)"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "    m = xs[0]"
                                                                        },
                                                                        {
                                                                            "id":  "E",
                                                                            "text":  "    for x in xs[1:]:"
                                                                        },
                                                                        {
                                                                            "id":  "F",
                                                                            "text":  "        if x \u003e m:"
                                                                        },
                                                                        {
                                                                            "id":  "G",
                                                                            "text":  "            m = x"
                                                                        },
                                                                        {
                                                                            "id":  "H",
                                                                            "text":  "    return m"
                                                                        }
                                                                    ],
                                                         "orden_correcto":  [
                                                                                "A",
                                                                                "B",
                                                                                "C",
                                                                                "D",
                                                                                "E",
                                                                                "F",
                                                                                "G",
                                                                                "H"
                                                                            ]
                                                     },
                                                     {
                                                         "tipo":  "opcion_multiple",
                                                         "prompt":  "En un algoritmo que busca el mayor valor de una lista, ¿por qué se suele inicializar la variable \u0027m\u0027 con el primer elemento y no con 0?",
                                                         "opciones":  [
                                                                          {
                                                                              "id":  "A",
                                                                              "text":  "Porque 0 no existe en Python."
                                                                          },
                                                                          {
                                                                              "id":  "B",
                                                                              "text":  "Porque así funciona también con listas de números negativos."
                                                                          },
                                                                          {
                                                                              "id":  "C",
                                                                              "text":  "Porque hace el algoritmo más lento."
                                                                          },
                                                                          {
                                                                              "id":  "D",
                                                                              "text":  "Porque evita usar comparaciones."
                                                                          }
                                                                      ],
                                                         "correct_ids":  [
                                                                             "B"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "drag_and_drop",
                                                         "prompt":  "Completa la plantilla para calcular el promedio de una lista; si está vacía, devuelve 0 (evita división por cero).",
                                                         "plantilla":  [
                                                                           "def promedio(xs):",
                                                                           "    if {h1}(xs) {h2} 0:",
                                                                           "        return 0",
                                                                           "    return {h3}(xs) / len(xs)"
                                                                       ],
                                                         "banco_palabras":  [
                                                                                "len",
                                                                                "==",
                                                                                "sum"
                                                                            ],
                                                         "rellenos":  {
                                                                          "h1":  "len",
                                                                          "h2":  "==",
                                                                          "h3":  "sum"
                                                                      }
                                                     },
                                                     {
                                                         "tipo":  "seleccionar_lineas",
                                                         "prompt":  "Selecciona la línea donde el algoritmo actualiza el valor máximo encontrado.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "m = xs[0]"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "for x in xs[1:]:"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "    if x \u003e m:"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "        m = x"
                                                                        },
                                                                        {
                                                                            "id":  "E",
                                                                            "text":  "return m"
                                                                        }
                                                                    ],
                                                         "correct_ids":  [
                                                                             "D"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "respuesta_numerica",
                                                         "prompt":  "¿Qué número imprime el siguiente programa?",
                                                         "code":  [
                                                                      "count = 0",
                                                                      "for i in range(1, 21):",
                                                                      "    if i % 3 == 0 and i % 5 != 0:",
                                                                      "        count += 1",
                                                                      "print(count)"
                                                                  ],
                                                         "valor":  5
                                                     }
                                                 ],
                                     "nivel_6":  [
                                                     {
                                                         "tipo":  "ordenar_lineas",
                                                         "prompt":  "Ordena las líneas para contar cuántas veces aparece el valor más pequeño de una lista después de calcularlo.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "def contar_minimos(xs):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    m = min(xs)"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "    total = 0"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "    for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "E",
                                                                            "text":  "        if x == m:"
                                                                        },
                                                                        {
                                                                            "id":  "F",
                                                                            "text":  "            total += 1"
                                                                        },
                                                                        {
                                                                            "id":  "G",
                                                                            "text":  "    return total"
                                                                        }
                                                                    ],
                                                         "orden_correcto":  [
                                                                                "A",
                                                                                "B",
                                                                                "C",
                                                                                "D",
                                                                                "E",
                                                                                "F",
                                                                                "G"
                                                                            ]
                                                     },
                                                     {
                                                         "tipo":  "opcion_multiple",
                                                         "prompt":  "¿Qué estrategia algorítmica se está usando cuando un programa recorre una lista una sola vez para encontrar el máximo y al mismo tiempo contar cuántas veces aparece?",
                                                         "opciones":  [
                                                                          {
                                                                              "id":  "A",
                                                                              "text":  "Backtracking"
                                                                          },
                                                                          {
                                                                              "id":  "B",
                                                                              "text":  "Recorrido lineal con acumuladores"
                                                                          },
                                                                          {
                                                                              "id":  "C",
                                                                              "text":  "Búsqueda binaria"
                                                                          },
                                                                          {
                                                                              "id":  "D",
                                                                              "text":  "Programación dinámica"
                                                                          }
                                                                      ],
                                                         "correct_ids":  [
                                                                             "B"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "drag_and_drop",
                                                         "prompt":  "Completa la plantilla para encontrar el primer número par en una lista; si no existe, devuelve None.",
                                                         "plantilla":  [
                                                                           "def primer_par(xs):",
                                                                           "    for x in xs:",
                                                                           "        if x {h1} 2 {h2} 0:",
                                                                           "            return x",
                                                                           "    return {h3}"
                                                                       ],
                                                         "banco_palabras":  [
                                                                                "%",
                                                                                "==",
                                                                                "None"
                                                                            ],
                                                         "rellenos":  {
                                                                          "h1":  "%",
                                                                          "h2":  "==",
                                                                          "h3":  "None"
                                                                      }
                                                     },
                                                     {
                                                         "tipo":  "seleccionar_lineas",
                                                         "prompt":  "Selecciona la línea que permite terminar el algoritmo en cuanto se encuentra la primera coincidencia.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    if x == objetivo:"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "        return x"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "return None"
                                                                        }
                                                                    ],
                                                         "correct_ids":  [
                                                                             "C"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "respuesta_numerica",
                                                         "prompt":  "¿Qué número imprime el siguiente programa?",
                                                         "code":  [
                                                                      "m = 0",
                                                                      "for x in [2, 7, 1, 9, 4]:",
                                                                      "    if x \u003e m:",
                                                                      "        m = x",
                                                                      "print(m)"
                                                                  ],
                                                         "valor":  9
                                                     }
                                                 ],
                                     "nivel_7":  [
                                                     {
                                                         "tipo":  "ordenar_lineas",
                                                         "prompt":  "Ordena las líneas para resolver un ejercicio integrador: sumar todos los números positivos pares de una lista.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "def suma_pares_positivos(xs):"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    total = 0"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "    for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "        if x \u003e 0 and x % 2 == 0:"
                                                                        },
                                                                        {
                                                                            "id":  "E",
                                                                            "text":  "            total += x"
                                                                        },
                                                                        {
                                                                            "id":  "F",
                                                                            "text":  "    return total"
                                                                        }
                                                                    ],
                                                         "orden_correcto":  [
                                                                                "A",
                                                                                "B",
                                                                                "C",
                                                                                "D",
                                                                                "E",
                                                                                "F"
                                                                            ]
                                                     },
                                                     {
                                                         "tipo":  "opcion_multiple",
                                                         "prompt":  "Un algoritmo recorre una lista para contar cuántos elementos cumplen una condición. Si inicia con total = 0 y suma 1 cuando la condición se cumple, ¿qué patrón algorítmico está usando?",
                                                         "opciones":  [
                                                                          {
                                                                              "id":  "A",
                                                                              "text":  "Un contador"
                                                                          },
                                                                          {
                                                                              "id":  "B",
                                                                              "text":  "Una recursión"
                                                                          },
                                                                          {
                                                                              "id":  "C",
                                                                              "text":  "Un diccionario"
                                                                          },
                                                                          {
                                                                              "id":  "D",
                                                                              "text":  "Un ordenamiento"
                                                                          }
                                                                      ],
                                                         "correct_ids":  [
                                                                             "A"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "drag_and_drop",
                                                         "prompt":  "Completa la plantilla para determinar si todos los números de una lista son positivos.",
                                                         "plantilla":  [
                                                                           "def todos_positivos(xs):",
                                                                           "    for x in xs:",
                                                                           "        if x {h1} 0:",
                                                                           "            return False",
                                                                           "    return {h2}"
                                                                       ],
                                                         "banco_palabras":  [
                                                                                "\u003c=",
                                                                                "True",
                                                                                "None"
                                                                            ],
                                                         "rellenos":  {
                                                                          "h1":  "\u003c=",
                                                                          "h2":  "True"
                                                                      }
                                                     },
                                                     {
                                                         "tipo":  "seleccionar_lineas",
                                                         "prompt":  "Selecciona la línea donde el algoritmo descarta inmediatamente el caso inválido.",
                                                         "lineas":  [
                                                                        {
                                                                            "id":  "A",
                                                                            "text":  "for x in xs:"
                                                                        },
                                                                        {
                                                                            "id":  "B",
                                                                            "text":  "    if x \u003c= 0:"
                                                                        },
                                                                        {
                                                                            "id":  "C",
                                                                            "text":  "        return False"
                                                                        },
                                                                        {
                                                                            "id":  "D",
                                                                            "text":  "return True"
                                                                        }
                                                                    ],
                                                         "correct_ids":  [
                                                                             "C"
                                                                         ]
                                                     },
                                                     {
                                                         "tipo":  "respuesta_numerica",
                                                         "prompt":  "¿Qué número imprime el siguiente programa integrador?",
                                                         "code":  [
                                                                      "total = 0",
                                                                      "for x in [1, 2, 3, 4, 5, 6]:",
                                                                      "    if x % 2 == 0:",
                                                                      "        total += x",
                                                                      "    else:",
                                                                      "        total += 1",
                                                                      "print(total)"
                                                                  ],
                                                         "valor":  15
                                                     }
                                                 ]
                                 }
              }
};
