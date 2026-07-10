# Especificaciones Técnicas: Auditoría y Optimización de Código
**Sistemas de Agentes Autónomos — Antigravity**

Este documento define el estándar operativo absoluto para que los agentes de Antigravity ejecuten auditorías de código e implementen mejoras. Cada instrucción debe ser seguida sin desviaciones para garantizar la integridad, la seguridad y el alto desempeño del software.

---

## 1. Criterios Fundamentales de Evaluación

Antes de modificar cualquier línea de código, el agente debe validar el software bajo tres ejes de control:

* **Intención (El Qué):** Comprobar que el bloque de código cumple con el objetivo inmediato y el requerimiento técnico explícito. Si la intención es ambigua, el agente detiene el proceso y reporta la inconsistencia.
* **Dirección (El Cómo):** Evaluar si la trayectoria técnica, la arquitectura y la estrategia de desarrollo son óptimas y eficientes.
* **Propósito (El Porqué):** Asegurar que el resultado final genere un impacto positivo real y medible en el negocio (velocidad, conversión o estabilidad).

---

## 2. Decálogo de Inspección (Foco Técnico)

El agente debe aplicar rigurosamente los siguientes principios de control de calidad:

1.  **Integridad:** Emitir diagnósticos reales basados en rectitud técnica. No se permiten suposiciones; el fallo o la ineficiencia se demuestran con datos.
2.  **Seguridad y Ética:** Validar que la arquitectura proteja la integridad de la información de extremo a extremo (sanitización de entradas, prevención de inyecciones y manejo seguro de variables de entorno).
3.  **Sobriedad:** Forzar un diseño funcional. La limpieza del código es consecuencia directa de su utilidad. Se elimina la sobreingeniería y el uso innecesario de dependencias externas.
4.  **Excelencia:** Exigir precisión y alto desempeño en la ejecución de scripts, tiempos de respuesta y renderizado.

---

## 3. Matriz de Diagnóstico y Acciones

| Componente | Foco de Inspección | Acción Inmediata ante Fallo |
| :--- | :--- | :--- |
| **Desempeño** | Consumo de recursos, bloqueos de renderizado, bucles ineficientes. | Optimizar algoritmos, remover redundancias y minificar lógica. |
| **Seguridad** | Fugas de datos, exposición de credenciales, vulnerabilidades OWASP. | Refactorizar e implementar capas de aislamiento y cifrado de inmediato. |
| **Mantenibilidad** | Código monolítico, nombres ambiguos, falta de modularidad. | Dividir en funciones puras, cohesivas y de responsabilidad única. |

---

## 4. Instrucciones de Ejecución para el Agente (Paso a Paso)

El agente debe ejecutar las tareas de auditoría y refactorización siguiendo estrictamente este flujo:

### Paso 1: Análisis Estático y Diagnóstico
* Analizar el repositorio asignado.
* Identificar cuellos de botella y deuda técnica real sin alterar el comportamiento del sistema.

### Paso 2: Refactorización Funcional
* Escribir el código de reemplazo en formato **afirmativo y absoluto**. El código debe definir exactamente lo que **es** y **hace**.
* Eliminar comentarios innecesarios, explicaciones redundantes y lógica abstracta.

### Paso 3: Registro de Transparencia (Log de Cambios)
Para cada mejora implementada, el agente debe documentar de forma automatizada:
1.  **Estado Crítico Detectado:** Diagnóstico técnico del problema.
2.  **Solución Aplicada:** Código optimizado.
3.  **Métrica de Impacto:** Reducción de peso, mejora en tiempo de ejecución o eliminación de riesgo de seguridad.

---

## 5. Lista de Control para Aceptación (Checklist de Entrega)

El agente solo considerará la tarea como **completada** si se verifica el cumplimiento del siguiente checklist:

- [ ] La intención original del código se mantiene intacta, pero su ejecución es más eficiente.
- [ ] La arquitectura es segura y protege la integridad de la información.
- [ ] Se eliminó toda lógica redundante; el diseño es estrictamente funcional y sobrio.
- [ ] El cambio se traduce en una mejora medible orientada al rendimiento del negocio.