---
slug: workflow-engine
lang: es
order: 3
title: Un motor de workflows para dejar de escribir un script por cliente
project: Motor de workflows
headline: Cada cliente nuevo necesitaba que un ingeniero escribiera código. Construí un motor de grafos para que lo configuren las personas que conocen los datos.
domain: Plataforma SaaS de gestión de ensayos clínicos
role: Technical Lead
period: 2026
confidential: true
featured: true
summary:
  - k: El problema
    v: "Había un script por cliente, casi iguales entre sí, e ingeniería era el cuello de botella para incorporar clientes."
  - k: La decisión
    v: "Un motor de grafos con la definición guardada en base de datos, con vista previa por nodo."
  - k: En qué terminó
    v: "Incorporar un cliente pasa a ser una tarea de configuración en lugar de una tarea de ingeniería."
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

Cada cliente nuevo requería que un ingeniero escribiera código: repositorio, pipeline de despliegue y código nuevo cada vez, no una configuración.

La plataforma tiene que sincronizarse con sistemas externos de captura de datos clínicos, y cada cliente usa el suyo, con su propia estructura de formularios y su forma de nombrar las cosas. La solución que había era un script por cliente: extraer, transformar, cargar, notificar. Funcionaba bien mientras había pocos clientes.

Los scripts compartían casi toda la lógica y se diferenciaban justo en la parte importante. Arreglar un bug significaba buscarlo en todas las copias, y casi siempre quedaba alguna sin arreglar. El equipo técnico se había convertido en el cuello de botella para incorporar clientes, y los data managers, que son quienes mejor entienden los datos, no podían tocar nada.

## El enfoque

En vez de intentar escribir mejores scripts, lo planteé como un problema de producto: que quien conoce los datos pueda construir el flujo sin depender de ingeniería.

## Cómo lo construimos

**Un motor de grafos en lugar de un framework de scripts.** El flujo se modela como un DAG y su definición se guarda en base de datos, no en el código. Hay un catálogo de tipos de tarea (extraer, transformar, cargar, notificar, comparar, condicional, mapear) que se combinan en tiempo de ejecución. Para agregar una capacidad se registra un tipo de tarea nuevo; para agregar un cliente se dibuja un grafo.

**Construir sobre la plataforma en vez de adoptar un orquestador.** Evalué usar una herramienta establecida del ecosistema y la descarté por dos motivos: integrarla con la autenticación y los permisos de la plataforma habría sido un parche permanente, y necesitábamos una interfaz específica del dominio, que entendiera de formularios clínicos y mapeos semánticos, no un editor de DAG genérico. Es una decisión discutible en los dos sentidos, así que dejé documentado el razonamiento para poder revisarla más adelante.

**Probar un nodo sin ejecutar todo el pipeline.** Esto fue lo que hizo que la herramienta fuera práctica. Hay un modo de vista previa con muestreo limitado que ejecuta un solo nodo y muestra su salida al momento. Sin eso, cada cambio obligaba a correr el flujo completo y esperar, y con un ciclo tan lento la herramienta visual no se habría usado.

**Ver los datos entre nodos.** El resultado de cada nodo se guarda en el propio nodo y se pasa como contexto al siguiente, con un inspector desplegable en cada uno. Así se ve qué entra y qué sale en cada paso, algo que con los scripts no era posible.

## El problema de rendimiento en la vista previa

La primera versión de la vista previa era demasiado lenta para usarla. Al cargar los datos de configuración se lanzaba una cascada de consultas individuales, un N+1 que la capa de acceso a datos ocultaba en el código.

La reescribí con consultas por lotes usando cláusulas `IN` y una caché de vida corta. Mejoró un orden de magnitud: pasamos de una espera que cortaba el trabajo a una respuesta inmediata.

Lo que aprendí: la funcionalidad estaba completa, pero si la vista previa era lenta nadie la iba a usar, así que el rendimiento era un requisito y no una optimización para el final. Si lo hiciera otra vez, lo mediría antes de construir la interfaz encima.

## Resultado

El motor se usa para pipelines de sincronización reales y es la base sobre la que se irá migrando la lógica duplicada de los scripts por cliente.

Incorporar un cliente pasa a ser una tarea de configuración en lugar de una tarea de ingeniería. El equipo técnico deja de ser el cuello de botella y los data managers pueden trabajar directamente con los flujos.
