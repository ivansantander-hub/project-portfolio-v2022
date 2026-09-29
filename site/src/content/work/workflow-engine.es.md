---
slug: workflow-engine
lang: es
order: 2
title: Un motor de workflows para dejar de escribir un script por cliente
project: Motor de workflows
headline: Incorporar un cliente exigía escribir y desplegar un script nuevo. Un motor de grafos configurable lo convierte en una tarea de configuración para quienes conocen los datos.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño del motor, decisión de arquitectura y optimización de la vista previa
period: 2026
confidential: true
featured: true
summary:
  - k: El problema
    v: "Un script casi idéntico por cliente. Cada incorporación pasaba por ingeniería."
  - k: La decisión
    v: "Un motor de grafos con la definición en base de datos y vista previa por nodo."
  - k: En qué terminó
    v: "Incorporar un cliente pasa a ser configuración, no desarrollo."
stack:
  - Python
  - FastAPI
  - React
  - React Flow
  - PostgreSQL
  - Prisma
tags:
  - arquitectura
  - datos
  - producto
---

## El problema

La plataforma se sincroniza con sistemas externos de captura de datos clínicos. Cada cliente usa uno distinto, con su propia estructura de formularios y su nomenclatura. La solución existente era un script por cliente (extraer, transformar, cargar, notificar), con su repositorio y su pipeline de despliegue.

- Los scripts compartían casi toda la lógica y se diferenciaban justo en la parte importante.
- Un bug había que corregirlo en todas las copias, y casi siempre quedaba alguna sin corregir.
- Cada cliente nuevo pasaba por ingeniería. Los data managers, que son quienes mejor entienden los datos, no podían tocar nada.

Lo planteé como un problema de producto, no de escribir mejores scripts: que quien conoce los datos pueda construir el flujo sin depender de ingeniería.

## Decisiones

**Motor de grafos con la definición en base de datos.** El flujo es un DAG guardado en base de datos, no en código. Un catálogo de siete tipos de tarea (extraer, transformar, cargar, notificar, comparar, condicional, mapear) se combina en tiempo de ejecución: una capacidad nueva es un tipo de tarea registrado; un cliente nuevo, un grafo. La alternativa, un framework de scripts compartido, habría reducido la duplicación, pero cada cliente seguiría pasando por ingeniería.

**Construir sobre la plataforma en lugar de adoptar un orquestador.** Evalué una herramienta establecida del ecosistema y la descarté: integrarla con la autenticación y los permisos de la plataforma habría sido un parche permanente, y hacía falta una interfaz de dominio (formularios clínicos, mapeos semánticos), no un editor de DAG genérico. Es una decisión discutible en ambos sentidos; dejé el razonamiento documentado para poder revisarla.

**Vista previa por nodo con muestreo.** Ejecuta un solo nodo con muestreo limitado y muestra su salida al momento. Sin ella, cada cambio obligaba a correr el flujo completo, un ciclo demasiado lento para una herramienta visual. El costo: se valida sobre una muestra, no sobre el volumen completo.

**Inspector entre nodos.** El resultado de cada nodo se guarda en el propio nodo y pasa como contexto al siguiente. Un inspector desplegable muestra qué entra y qué sale en cada paso, algo que los scripts no permitían.

**Rendimiento como requisito, no como optimización final.** La primera versión de la vista previa era demasiado lenta para usarse: al cargar la configuración se disparaba una cascada de consultas individuales, un N+1 oculto por la capa de acceso a datos. La reescribí con consultas por lotes (cláusulas `IN`) y una caché de vida corta. La mejora fue de un orden de magnitud: de una espera que cortaba el trabajo a una respuesta inmediata.

## Resultado

- El motor está en uso en pipelines de sincronización reales.
- Es la base a la que se irá migrando la lógica duplicada de los scripts por cliente.
- Ingeniería deja de ser el cuello de botella y los data managers trabajan directamente sobre los flujos.

## Qué haría distinto

Mediría el rendimiento de la vista previa antes de construir la interfaz encima. La funcionalidad estaba completa, pero una vista previa lenta no se habría usado.
