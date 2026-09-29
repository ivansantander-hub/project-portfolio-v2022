---
slug: scrum-poker
lang: es
order: 17
title: Planning poker en tiempo real
project: Scrum Poker
headline: "Una app de planning poker para estimar en equipo: salas con código, votos ocultos hasta que el anfitrión los revela y reconexión si se cae la conexión."
domain: Proyecto propio
role: Desarrollador único
period: Marzo 2026
featured: false
links:
  - label: Código en GitHub
    href: https://github.com/ivansantander-hub/scrum-poker
summary:
  - k: El problema
    v: "Estimar historias en equipo, en tiempo real, sin registro."
  - k: La decisión
    v: "El servidor guarda el estado de la sala y lo reenvía completo a todos en cada cambio."
  - k: En qué terminó
    v: "Un prototipo funcional hecho en una noche; no encontré un despliegue."
metrics:
  - value: "7"
    label: "commits"
  - value: "8"
    label: "eventos cliente → servidor"
  - value: "~2.8k"
    label: "líneas de TypeScript"
stack:
  - NestJS
  - Socket.IO
  - SQLite
  - React
  - Zustand
  - Framer Motion
  - Vite
tags:
  - producto propio
  - tiempo real
---

Scrum Poker es un monorepo con un backend en NestJS y un frontend en React. Un anfitrión crea una sala con un código de 6 caracteres, elige el mazo (Fibonacci o por horas), los demás entran con nombre y avatar, votan en secreto y el anfitrión revela los votos o reinicia la ronda. La interfaz está en inglés y español.

## El problema

Quería una herramienta simple para estimar historias en equipo: entrar con un código, votar y ver los resultados a la vez, sin cuentas ni registro.

## Decisiones

**El servidor es la fuente de verdad.** Toda la lógica pasa por un gateway de Socket.IO en NestJS. Después de cada acción (entrar, votar, revelar, reiniciar) el servidor reconstruye la sala desde la base de datos y reenvía el estado completo a todos. Costo: se manda la sala entera en cada voto; con salas pequeñas no importa.

**SQLite con SQL escrito a mano.** Dos tablas (salas y jugadores) creadas al arrancar, con repositorios que envuelven los callbacks de `sqlite3` en promesas. Costo: no hay migraciones; la columna de avatar se agregó con un `ALTER TABLE` cuyo error se ignora, y el archivo de la base quedó versionado en git.

**Reconexión desde el navegador.** El store de Zustand persiste la sala y el jugador en `localStorage`; al reconectarse, el cliente emite `rejoinRoom` con su id. Costo: si el jugador ya no existe, el servidor crea uno nuevo con el avatar por defecto en lugar de restaurar el anterior.

## Resultado

Lo hice en una noche: 7 commits el 27 de marzo de 2026, entre las 8:42 p. m. y las 11:51 p. m. Funciona en local. No encontré una URL de despliegue, y el CORS del backend solo admite puertos de `localhost`.

## Qué haría distinto

Validaría permisos en todos los eventos: revelar y empezar comprueban que quien lo pide sea el anfitrión, pero reiniciar la ronda no, y votar no verifica que el jugador pertenezca a la sala. Los ids se generan con `Math.random`, y los únicos tests son los que trae la plantilla de NestJS. Eso es lo primero que arreglaría antes de desplegarlo.
