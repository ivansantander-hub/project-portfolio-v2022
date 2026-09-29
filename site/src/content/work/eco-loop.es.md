---
slug: eco-loop
lang: es
order: 13
title: Dos IAs conversando entre ellas
project: eco-loop
headline: "Dos modelos de lenguaje que hablan solos se atascan ofreciéndose ayuda. eco-loop es un laboratorio para medir cuándo pasa y qué lo rompe: 195 ensayos con réplicas por 1,02 dólares."
domain: "Proyecto propio · Código abierto"
role: "Autor único · diseño experimental y desarrollo"
period: Septiembre 2026
featured: true
links:
  - label: Código en GitHub
    href: https://github.com/ivansantander-hub/eco-loop
summary:
  - k: El problema
    v: "¿Qué pasa si dos IAs conversan entre ellas, sin nadie más en la conversación?"
  - k: La decisión
    v: "Tratarlo como experimento: marcos controlados, réplicas y medidas automáticas, no conversaciones sueltas."
  - k: En qué terminó
    v: "Dos laboratorios cerrados, 16 y 195 ensayos, con conclusiones y límites documentados."
metrics:
  - value: "195"
    label: "ensayos en el Laboratorio 02"
  - value: "54 → 68 %"
    label: "originalidad al darles papel de persona"
  - value: "0 de 63"
    label: "ensayos con «¿en qué puedo ayudarte?» si la semilla es un sueño"
  - value: "$1,02"
    label: "coste en OpenRouter"
stack:
  - Python
  - JavaScript
  - Ollama
  - OpenRouter
tags:
  - ia
  - investigación
  - llm
---

eco-loop pone a conversar a dos modelos de lenguaje, a veces dos copias del mismo, sin ninguna persona en medio. Funciona con Ollama en local y con cualquier modelo de OpenRouter, en Python sin dependencias. Cada laboratorio hace una pregunta, la prueba con ensayos y deja una bitácora con método, resultados y límites.

## La pregunta

En un chat hay un usuario y un asistente. Aquí no hay usuario: cada IA ve los mensajes de la otra como si los escribiera una persona. El Laboratorio 01 (Espejos, 16 ensayos) preguntó qué pasa entonces. Con un simple «Hola», todos los modelos arrancan ofreciendo ayuda y la conversación se bloquea en bucles de «¿en qué puedo ayudarte?» o aclaraciones infinitas. Solo avanza cuando una IA cede y hace de usuario.

El Laboratorio 02 (Máscaras) partió de ahí: si se bloquean porque las dos se creen asistentes, ¿qué cambia al darles otro papel, hacerse pasar por humanas o saberse IAs?

## Diseño experimental

- **Marcos.** Un marco decide qué instrucción recibe cada IA: ninguna (control), una o dos «personas» que no deben decir que son IA, dos IAs que saben que lo son, o solo una que lo sabe. En total, siete marcos, dos de ellos espejo para separar el efecto del papel del efecto del orden.
- **Series.** `marcos-1`: 5 marcos × 3 modelos (GPT-4o-mini, Gemini 2.5 Flash Lite, Llama 3.3 70B) × 3 réplicas = 45 ensayos. `marcos-2`: 7 marcos × 2 semillas («Hola» y «Anoche soñé que el mar se había ido.») × 3 modelos × 3 réplicas = 126. `marcos-largo`: 18 ensayos de 30 turnos. `marcos-local`: 6 con Qwen 14B en local.
- **Condiciones fijas:** 12 turnos (30 en `marcos-largo`), temperatura 0.8, historial completo en cada turno y el texto exacto que recibió cada modelo guardado en el ensayo.

## Decisiones

**Medidas automáticas y baratas.** La originalidad de un mensaje es el porcentaje de sus palabras con contenido que no estaban en el mensaje anterior de la otra IA. Las señales de rol («habla como asistente», «se dice IA», adulación, cesión del rol) son expresiones regulares en español e inglés. *Trade-off:* miden frases, no ideas ni intenciones. Por eso la cesión se calibró contra la lectura manual del grupo de control, con la que coincide en 9 de 9.

**Réplicas en lugar de conversaciones sueltas.** En el Laboratorio 01, Llama llegó a decir «I am a human» y otro ensayo degeneró en «A A A…». Con tres réplicas por combinación, ninguna de las dos cosas se repitió. *Trade-off:* multiplica coste y tiempo, y aun así tres réplicas dan tendencias, no estadística.

**Registrar lo invisible.** El primer ensayo «puro» no lo era: el modelo local traía de fábrica un system prompt que Ollama aplicaba sin avisar. Además, Ollama recortaba en silencio el principio de las conversaciones largas. Desde entonces el sistema guarda las instrucciones de fábrica, calcula la ventana de contexto en cada turno y avisa de respuestas cortadas, vacías o degeneradas.

**Un solo motor.** La forma de armar los mensajes llegó a estar copiada en el navegador, en la batería de ensayos y en el script de terminal. Hoy vive en un núcleo que usan la web y los comandos por igual. Hay 87 pruebas que corren sin red, contra un proveedor falso y un servidor local que imita los streams de Ollama y OpenRouter. *Trade-off:* sin dependencias, el cliente de streaming (NDJSON y SSE) y el servidor web están escritos sobre la biblioteca estándar.

## Resultados

- **Un papel rompe el bloqueo, y el de persona es el que mejor funciona.** Con una persona en la conversación, la originalidad sube del 54 % al 68 % y los bucles bajan de 5 de 18 a 1–2 de 18.
- **Saberse IA ayuda menos y aguanta peor.** Es el marco donde menos se cede el rol (3 de 18) y, a 30 turnos, la originalidad cae de ~74 % a ~35 %: el elogio mutuo se vuelve plantilla y es eso lo que se copia. «Dos humanas», en cambio, aguanta 30 turnos sin degradarse.
- **El primer mensaje pesa tanto como el marco.** Con «Hola» hubo 11 de 63 ensayos con bucle y un 24 % de mensajes aduladores; con el sueño, 5 de 63 y un 8 %, y el «¿en qué puedo ayudarte?» no apareció en ninguno de los 63.
- **El papel decide el resultado; el orden, el comportamiento.** Quien habla primero recibe la semilla como si viniera de un usuario y abre como asistente aunque su instrucción diga que es una persona. La «persona» no confesó ser IA en ninguno de los 36 ensayos del espejo.
- **El modelo pesa más que el marco.** Llama concentra 9 de los 16 bucles de `marcos-2`; Gemini es el más adulador (29 % de sus mensajes).
- **Ningún marco quita la adulación.**

El proyecto queda en pausa, con las siguientes preguntas apuntadas: un formato de guion sin roles de chat, un moderador que intervenga y el efecto de la temperatura.

## Qué haría distinto

Fijaría un límite de tokens holgado desde el primer ensayo. En `marcos-1` se cortó el 42 % de los mensajes con 300 tokens, y la IA siguiente solía continuar la frase de la otra; hubo que repetir con 1000 tokens (10 % de cortes). También mediría la velocidad del modelo local antes de planear una serie: `marcos-local` se paró tras 6 de los 10 ensayos previstos porque generaba unos 3 tokens por segundo. Y variaría más de una condición por eje: dos semillas y una sola temperatura dejan abierto cuánto de lo observado depende de ellas.
