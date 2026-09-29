---
slug: dev-platform
lang: es
order: 10
title: Una CLI para levantar un polyrepo de 32 repositorios en local
project: Plataforma de desarrollo local
headline: Levantar la plataforma en local implicaba clonar, configurar y arrancar a mano decenas de repositorios independientes. Armé una CLI que clona, configura, diagnostica y arranca el entorno con un asistente, y documenté cada entrega con su verificación real.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño e implementación de la CLI
period: 2026
featured: false
summary:
  - k: El problema
    v: "32 repositorios independientes, todos los servicios en el mismo puerto por defecto y un gateway que no arranca si falta un subgrafo."
  - k: La decisión
    v: "Una CLI en TypeScript que orquesta scripts de bash: clonar, configurar, diagnosticar y arrancar lo que cada persona necesita."
  - k: En qué terminó
    v: "El stack completo arranca con un comando y se detiene sin procesos huérfanos. Diez comandos, validados con ejecuciones reales."
metrics:
  - value: "32"
    label: repositorios que la CLI clona, configura y revisa
  - value: "10"
    label: comandos (clone, setup, dev, doctor, status, logs, restart, update, clean, remotes)
  - value: "~270 → ~55"
    label: conexiones estimadas a la base de datos compartida al arrancar todo el backend
  - value: "15"
    label: commits entre julio y agosto de 2026 (~1.800 líneas de TypeScript y ~2.200 de bash)
stack:
  - TypeScript
  - Node.js
  - Commander
  - Bash
  - Docker Compose
  - Kubernetes
  - Prisma
  - Redis
  - RabbitMQ
tags:
  - herramientas internas
  - experiencia de desarrollo
  - polyrepo
---

## El problema

La plataforma vive en 32 repositorios independientes: subgrafos GraphQL, un gateway federado, una API REST, dos frontends, workers de colas, cronjobs y los esquemas de Prisma.

Correrla en local tenía varios tropiezos. Todos los servicios usan el puerto 4000 por defecto. Cada subgrafo necesita el enlace al esquema compartido y su cliente de Prisma generado. Cada uno tiene su propio `.env`. El gateway compone el supergrafo al arrancar, así que si un subgrafo no responde, se cae. Y cada servicio abre por defecto unas 17 conexiones a la base de datos: con todo el backend arriba eran unas 270, compitiendo con los pods del entorno de desarrollo.

## Decisiones

**Una CLI delgada sobre scripts de bash.** `./learup` es TypeScript con Commander y delega el trabajo pesado en cuatro scripts (clone, setup, dev, remotes). Una futura interfaz gráfica debería llamar a esa misma capa. Costo: dos lenguajes que mantener y dependencia de herramientas Unix (`lsof`, `pgrep`, `sed` de BSD). macOS es el objetivo principal, WSL2 es el camino para Windows, en Linux funciona con fricción y Windows nativo quedó fuera.

**Asistente por defecto, flags para scripts.** Sin argumentos, `dev` pregunta modo, frontends, backend, workers e infraestructura. Costo: dos puntos de entrada que mantener alineados.

**Redis y RabbitMQ: Docker o port-forward, con advertencia.** Docker Compose da colas y caché vacías y aisladas. El port-forward conecta con las del clúster, que son compartidas: la CLI lo advierte y sugiere el comando para escalar los workers del clúster a cero, pero no lo ejecuta. Costo: ese paso queda en manos del desarrollador.

**Variables de entorno en tiempo de ejecución.** `dev` asigna un puerto único a cada servicio y pasa URLs y credenciales como variables del proceso, sin reescribir los `.env`. Costo: `restart` tuvo que pasar por el controlador de `dev` para no perder esas variables. La primera versión arrancaba el servicio sin ellas.

**Límite de conexiones por niveles.** 15 para el servicio de usuarios (dispara unos 55 DataLoaders en paralelo), 5 para los servicios pesados, 4 para el gateway y 2 para el resto, con `pool_timeout` de 30 s para que las consultas esperen en cola en vez de fallar. Costo: bajo carga las consultas esperan, y el preflight todavía modifica archivos de conexión dentro de los repositorios de servicio.

**Parches locales con seguimiento.** Un stack completo no arrancaba por cuatro servicios rotos: clientes de Prisma 4 contra un esquema de Prisma 6, Django importando un módulo retirado en Python 3.13 y una dependencia no declarada. La CLI los rodea y las notas de versión dejan la corrección pendiente en cada repositorio. Costo: el parche esconde deuda que el equipo de cada servicio tiene que pagar.

## Resultado

- El Quick Start quedó en clonar, descargar el archivo de entorno, `setup` y `dev`.
- En una ejecución real de `stack`, los 15 subgrafos respondieron en 6 s, el gateway compuso el supergrafo con 538 campos de consulta raíz y Ctrl+C detuvo todo sin procesos huérfanos.
- `doctor` revisa los 32 repositorios, las ramas remotas, las dependencias, la configuración y los puertos ocupados, y sale con error si algo bloquea.

Cada entrega quedó en las notas de versión con su matriz de verificación. No hay suite de pruebas unitarias.

## Qué haría distinto

Tendría un solo registro de repositorios desde el primer commit. Una auditoría encontró que `clean` y `update` duplicaban la lista, `status` y `logs` ignoraban los workers y `doctor` solo veía 18 de los 32 repositorios. También escribiría pruebas unitarias para las partes puras, como la reescritura de URLs de RabbitMQ y la resolución del plan del asistente.
