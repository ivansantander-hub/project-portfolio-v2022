---
slug: dms
lang: es
order: 5
title: Control documental con permisos heredados y auditoría
project: Gestión documental (DMS)
headline: El gestor documental de una plataforma de ensayos clínicos, donde cada archivo tiene que saber quién puede verlo y cada acción deja rastro. Trabajé el modelo de permisos, la carga a S3, la caché y, al final, centralizar la autorización de lectura.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · modelo de permisos, carga de archivos, caché y autorización en servidor
period: 2024 – 2026
confidential: true
featured: false
summary:
  - k: El problema
    v: "Carpetas anidadas, documentos compartidos con usuarios internos y externos, y un registro de auditoría obligatorio para cada acción."
  - k: La decisión
    v: "Permisos efectivos guardados por fila y con su origen (explícito, heredado hacia abajo, hacia arriba), y auditoría publicada en una cola."
  - k: En qué terminó
    v: "34 despliegues a producción entre marzo de 2025 y agosto de 2026. La consolidación de la autorización de lectura está en revisión."
metrics:
  - value: "34"
    label: "despliegues a producción del DMS (mar 2025 – ago 2026)"
  - value: "577"
    label: "cambios listados en las notas de producción"
  - value: "608"
    label: "commits míos en la API GraphQL, la API REST y el frontend del DMS"
stack:
  - GraphQL Federation
  - Node.js
  - TypeScript
  - Next.js
  - PostgreSQL
  - Prisma
  - Redis
  - RabbitMQ
  - AWS S3
tags:
  - arquitectura
  - seguridad
  - auditoría
---

## El problema

La plataforma necesita su propio gestor documental: carpetas por compañía y personales, versiones, papelera, documentos compartidos con usuarios internos y externos, descargas en zip y movimiento de carpetas. En un dominio regulado, cada acción sobre un documento debe quedar registrada con quién, cuándo y desde dónde.

Lo construimos entre varias personas desde diciembre de 2024: una API GraphQL federada, una API REST para la carga de archivos, un frontend en Next.js y cuatro workers que consumen de RabbitMQ (descargas, auditoría, movimiento de carpetas y certificados de firma). Los workers los escribieron sobre todo mis compañeros; yo trabajé más en la API GraphQL, la carga de archivos y el frontend.

Lo difícil era el acceso: un documento compartido dentro de varias carpetas debe ser visible para quien lo recibe sin mostrarle el resto, y quien accede a una carpeta debe acceder también a lo que se agregue después.

## Decisiones

**Permisos efectivos guardados por fila y con su origen.** Cada permiso es una fila por usuario y elemento, marcada como explícita, heredada hacia abajo o heredada hacia arriba. Hacia abajo copia los niveles de acceso a lo que cuelga de una carpeta; hacia arriba da solo lectura a las carpetas padre, lo justo para navegar hasta lo compartido. Si hay conflicto, gana el explícito. Costo: compartir, mover o versionar obliga a recalcular filas, y varios de mis commits de septiembre de 2025 fueron corregir esos casos.

**Carga multiparte a S3 con una ruta por el backend.** Migré la API de carga a AWS SDK v3 y agregué una ruta que sube cada parte desde el servidor, porque el bucket tiene Object Lock y así el SDK agrega la verificación de integridad que ese modo exige. Costo: por esa ruta los archivos pasan por nuestro servicio en vez de ir directo del navegador a S3.

**Auditoría publicada en una cola.** Cada operación arma un registro con acción, entidad, resultado, IP, navegador, sistema operativo y dispositivo, y lo publica en RabbitMQ; un worker lo guarda. El equipo movió la escritura de logs a la cola para no alargar la respuesta. Costo: la auditoría depende de la cola y del worker, y hay que vigilar ambos.

**Caché en Redis para los DataLoaders.** Agregué una caché en Redis con invalidación explícita al borrar documentos y carpetas, y una mutación para que otros servicios invaliden. Costo: cada escritura nueva tiene que acordarse de invalidar o se sirven datos viejos.

**Autorización de lectura centralizada en el servidor.** En septiembre de 2026 escribí una capa que calcula en un solo lugar el alcance de lectura de cada petición (propietario o permiso efectivo, compañía activa, no borrado, alcance del token de acceso externo), para no repetir esa lógica en cada consulta. Tiene tres modos: apagado, sombra (registra lo que ocultaría) y forzado; las denegaciones van a la auditoría. Costo: más consultas por petición y una etapa de observación antes de forzar.

## Resultado

- El DMS salió a producción en marzo de 2025 (0.3.0), llegó a 1.0.0 en diciembre de 2025 y a 1.9.0 en agosto de 2026: 34 despliegues y 577 cambios listados.
- La autorización en servidor y un versionado atómico (una transacción que bloquea el documento, impide versionar con un flujo de firma en curso y conserva el propietario) están en ramas en revisión, no en producción.

## Qué haría distinto

Diseñaría la capa de autorización como una pieza central desde el principio. Consolidarla después fue un cambio grande, con modo sombra incluido, en vez de crecer junto con cada consulta.
