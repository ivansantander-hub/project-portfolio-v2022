---
slug: workflow-engine
lang: es
order: 3
title: Del script por cliente al pipeline que se dibuja
project: Motor de workflows
headline: Cada cliente nuevo necesitaba que un ingeniero escribiera código. Lo convertí en un grafo que dibuja quien entiende los datos.
domain: Plataforma SaaS de gestión de ensayos clínicos
role: Technical Lead
period: 2026
confidential: true
featured: true
summary:
  - k: El problema
    v: "Un script por cliente, casi iguales entre sí. Ingeniería era el cuello de botella para incorporar clientes."
  - k: La decisión
    v: "Un motor de grafos con la definición en base de datos, no en el código. Y previsualización por nodo."
  - k: En qué terminó
    v: "Incorporar un cliente pasa de ser tarea de ingeniería a tarea de configuración."
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

## El contexto

La plataforma tiene que sincronizarse con sistemas externos de captura de datos clínicos.

Cada cliente usa el suyo. Con su estructura de formularios y su forma de nombrar las cosas.

La solución histórica fue escribir un script por cliente. Extraer, transformar, cargar, notificar.

Funcionaba.

El problema aparece cuando esa lista deja de ser corta.

## El problema

Los scripts eran casi iguales. Pero solo casi.

Compartían casi toda la lógica y divergían justo en la parte que importaba. Arreglar un bug significaba encontrarlo en todas las copias.

Y siempre había una copia donde nadie lo arregló.

Pero lo peor era otra cosa:

> cada cliente nuevo requería que un ingeniero escribiera código.

No una configuración. No un formulario. Código, repositorio, pipeline de despliegue.

El equipo técnico se había vuelto el cuello de botella para incorporar clientes. Y la gente que de verdad entendía los datos —los data managers— no podía tocar nada.

## La decisión de fondo

Dejar de tratarlo como "escribir mejores scripts".

Empezar a tratarlo como un problema de producto: quien conoce los datos debería poder construir el flujo sin pasar por ingeniería.

## Las decisiones

**Un motor de grafos, no un framework de scripts.**

El flujo se modela como un DAG cuya definición vive en base de datos, no en el código.

Un catálogo de tipos de tarea —extraer, transformar, cargar, notificar, comparar, condicional, mapear— se combina en tiempo de ejecución.

Agregar una capacidad es registrar un tipo de tarea. Agregar un cliente es dibujar un grafo.

**Construir sobre lo que ya existe en vez de adoptar un orquestador.**

Evalué traer una herramienta establecida del ecosistema. La descarté por dos razones.

La integración con la autenticación y los permisos de la plataforma habría sido un injerto permanente. Y la interfaz que necesitábamos era específica del dominio: no un DAG genérico, sino uno que entiende de formularios clínicos y mapeos semánticos.

Es una decisión que se puede argumentar en los dos sentidos. Lo importante fue dejar escrito el porqué, para que sea revisable.

**Probar un nodo, no el pipeline entero.**

Esta es la decisión que hizo la herramienta usable.

Un modo de vista previa con muestreo limitado permite ejecutar un solo nodo y ver sus datos de salida al instante.

Sin eso, cada iteración implica correr todo el flujo y esperar. Y una herramienta visual con un ciclo lento no la usa nadie.

**Los datos se ven pasar entre nodos.**

El resultado de un nodo se guarda sobre el nodo mismo y se inyecta como contexto en el siguiente. Cada uno lleva su inspector desplegable.

El usuario ve lo que entra y lo que sale en cada paso. Que es exactamente lo que un script no te deja ver.

## El detalle que decidió el proyecto

La primera versión del preview era inutilizable.

Cargar los datos de configuración disparaba una cascada de consultas individuales. El clásico N+1, escondido detrás de una capa de acceso a datos que lo hacía invisible en el código.

Lo reescribí como consultas por lotes con cláusulas `IN`, más una caché de vida corta.

La diferencia fue de un orden de magnitud. De una espera que rompía el trabajo a una respuesta inmediata.

Lo cuento porque es la lección más transferible del proyecto:

> la funcionalidad estaba completa y el producto seguía siendo inservible.

El rendimiento no era una optimización al final. Era el requisito que decidía si alguien lo iba a usar.

## En qué terminó

El motor entró en uso para pipelines de sincronización reales y quedó como la base destinada a absorber la lógica duplicada de los scripts.

El cambio importante no es técnico.

Incorporar un cliente pasa de ser una tarea de ingeniería a una tarea de configuración. El equipo técnico deja de ser el cuello de botella y la gente que entiende los datos recupera el control.

## Qué haría distinto

Habría medido el rendimiento del preview antes de construir el editor visual.

Invertí en la interfaz asumiendo que la capa de datos respondería bien. Terminé arreglando los cimientos con la casa puesta.
