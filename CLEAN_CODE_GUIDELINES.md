# Estándares de Clean Code - Proyecto Estuprenda

Este documento define los lineamientos de codificación para el proyecto, basados en los principios de "Clean Code" de Robert C. Martin. Antigravity utilizará estas reglas como referencia para todas las tareas de desarrollo y refactorización.

---

## 1. Nombres Significativos
- **Usa nombres que revelen la intención:** Evita variables como `d` o `data`. Usa `diasParaCierre` o `listaDeProductos`.
- **Evita la desinformación:** No uses nombres que puedan confundir (ej. `listaDePrecios` si no es una lista real).
- **Usa nombres pronunciables y buscables:** `p123` es difícil de buscar; `idProductoUnico` es mejor.
- **Nombres de Clases:** Deben ser sustantivos (`User`, `Account`). Evita verbos.
- **Nombres de Métodos:** Deben ser verbos o frases verbales (`saveUser`, `deleteProduct`).

## 2. Funciones
- **Pequeñas:** Deben ser lo más pequeñas posible. Idealmente menos de 20 líneas.
- **Hacer una sola cosa (SRP):** Una función debe tener una única responsabilidad.
- **Nivel de Abstracción:** Mantén un único nivel de abstracción por función.
- **Argumentos de Funciones:** Menos es mejor. 0-2 es ideal, 3 es aceptable si es necesario. Evita funciones con 4 o más parámetros (usa objetos en su lugar).
- **Sin Efectos Secundarios:** Una función no debe hacer nada oculto (ej. cambiar una variable global mientras valida una contraseña).

## 3. Comentarios
- **El código debe explicar la intención:** Si necesitas un comentario para explicar qué hace el código, es probable que el código deba ser refactorizado.
- **Comentarios Buenos:** Avisos legales, comentarios TODO, explicaciones de intenciones complejas que no pueden simplificarse.
- **Comentarios Malos:** Código comentado, comentarios redundantes, diarios de cambios.

## 4. Formateo
- **Formateo Vertical:** Los archivos deben leerse como un artículo de periódico (lo más importante arriba, detalles abajo).
- **Densidad Vertical:** Agrupa líneas de código relacionadas y separa grupos con líneas en blanco.
- **Distancia Vertical:** Las variables deben declararse cerca de su uso.

## 5. Objetos y Estructuras de Datos
- **Ley de Demeter:** Un módulo no debe conocer los detalles internos de los objetos que manipula.
- **Estructuras vs Objetos:** Las estructuras de datos exponen sus datos; los objetos ocultan sus datos tras abstracciones.

## 6. Manejo de Errores
- **Usa Excepciones en lugar de códigos de error:** Prefiere `try-catch` sobre devolver valores como `-1` o `null`.
- **Define el flujo normal:** No uses el manejo de excepciones para controlar el flujo lógico normal.
- **No devuelvas NULL:** Evita devolver null para prevenir errores de puntero nulo. Lanza una excepción o devuelve un objeto vacío.

## 7. Principio DRY (Don't Repeat Yourself)
- No dupliques lógica. Si el mismo código aparece en dos lugares, extráelo a una función o clase común.

## 8. Regla del Boy Scout
- "Deja el código un poco más limpio de como lo encontraste". Cada vez que editemos un archivo, aplicaremos pequeñas mejoras de limpieza.

---
*Este documento es dinámico y puede ser ajustado según las necesidades específicas del equipo Estuprenda.*
