---
slug: dashboards
lang: es
order: 7
title: Dashboards configurables por proyecto
project: Dashboards dinámicos
headline: Cada dashboard estaba escrito a mano y se alimentaba de un ETL por estudio. Los reemplazamos por un motor donde el dashboard es configuración guardada en base de datos y los datos se resuelven en el servidor.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño de la solución, pipeline de datos y base del motor
period: 2026
featured: false
summary:
  - k: El problema
    v: "Dashboards fijos en código, duplicados entre módulos y alimentados por un ETL por estudio. Cambiar una etiqueta pedía un despliegue."
  - k: La decisión
    v: "El dashboard como configuración en base de datos, un catálogo de widgets y un pipeline de datos en el servidor."
  - k: En qué terminó
    v: "Un motor con 19 tipos de widget y un mapa que dice qué widgets se pueden construir hoy con los datos que existen."
metrics:
  - value: "19"
    label: "tipos de widget en el catálogo"
  - value: "17 → 5"
    label: "reportes consolidados en grains por entidad"
  - value: "89"
    label: "widgets mapeados a su fuente de datos"
stack:
  - Next.js
  - TypeScript
  - GraphQL Federation
  - Recharts
  - Redis
  - Python
  - AWS S3
tags:
  - producto
  - datos
  - arquitectura
---

## El problema

Los dashboards de la plataforma estaban programados uno por uno. Varios mostraban los mismos datos en módulos distintos, y cada estudio tenía su propio ETL en Python con los identificadores de formularios escritos en el código. Cuando un cliente pedía ocultar un widget o cambiar una etiqueta en su proyecto, eso era un cambio de código y un despliegue. Algunos clientes terminaban armando sus reportes en herramientas de BI externas.

## Decisiones

**El dashboard es configuración, no código.** Cada dashboard y cada widget se guardan en base de datos: tipo de gráfica, fuente de datos, campos, filtros y posición en la grilla. Los dashboards "de fábrica" son presets hechos con los mismos componentes que puede usar cualquier administrador. Escribí la solución técnica de la que salió la lista de tareas y el primer commit del frontend del motor. Costo: el motor es la parte más grande del frontend y tiene casos especiales por familia de widget.

**Dos caminos de GraphQL que no se mezclan.** La edición (crear, mover, borrar widgets) vive en el servicio de proyectos, donde ya estaban los permisos. La resolución de datos vive en el servicio de analítica. Costo: una funcionalidad nueva a veces toca dos servicios.

**Los datos se resuelven en el servidor.** El frontend pide los datos de todo el dashboard en una sola consulta y el servidor interpreta la configuración de cada widget: obtener, enriquecer, calcular columnas, filtrar, agregar, ordenar, paginar y evaluar alertas. Escribí la primera versión de ese pipeline y del caché en Redis. Costo: el frontend no sabe qué campos va a recibir hasta que el servidor responde.

**El EDC se consulta bajo demanda con caché, no se copia.** Los datos del sistema externo de captura clínica no se duplican en PostgreSQL. Van por un proxy con caché en Redis de 5 minutos por defecto, configurable por proyecto, y cada widget puede mostrar si el dato viene del caché. Costo: un dato puede tener hasta ese tiempo de atraso.

**Menos reportes, más anchos.** Consolidé 17 reportes operativos en 5 grains por entidad (estudio, sitio, país, serie temporal de enrolamiento y análisis de sujetos) para que el frontend no tenga que cruzar reportes. La clave del reporte no depende del proyecto; el aislamiento está en la ruta de S3, así los presets sirven para cualquier proyecto sin reescribirlos. Costo: un cambio en un grain afecta a muchos widgets.

## Resultado

- La mayor parte del motor en el frontend la construyó el equipo sobre esa base. Hoy tiene 19 tipos de widget, cada uno con su documentación y, los que se pueden crear desde el catálogo, con su guion de QA manual.
- El equipo cambió la carga de versiones de widgets a una consulta por dashboard en lugar de una por widget; con 20 widgets eran 20 viajes al servidor.
- Crucé los 89 widgets de cuatro dashboards operativos contra el esquema y los datos reales: 69 se pueden construir con lo que existe y 20 necesitan tres migraciones, sobre todo un historial de cambios de estado que hoy no se guarda.
- Una corrida de verificación del pipeline consolidado generó los 5 grains en unos 30 segundos en un proyecto de prueba.

## Qué haría distinto

Haría el mapa de widgets contra datos antes de construir el catálogo. Lo hicimos después, y ahí apareció que una parte de los widgets dependía de fechas que la base no guarda.
