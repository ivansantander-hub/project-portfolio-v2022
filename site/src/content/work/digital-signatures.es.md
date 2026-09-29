---
slug: digital-signatures
lang: es
order: 6
title: Firmas electrónicas con evidencia verificable
project: Firma electrónica
headline: Trabajé en los flujos de firma del gestor documental, que terminan en un documento con la evidencia de quién firmó y una forma de verificarlo después.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · orquestación del flujo, generación de evidencia y firma de documentos
featured: false
summary:
  - k: El problema
    v: "Un documento firmado por varias personas, internas y externas, necesita evidencia de la firma y una forma de comprobar que no cambió."
  - k: La decisión
    v: "Generar la evidencia fuera de la petición del usuario y firmar el documento final para poder verificarlo."
  - k: En qué terminó
    v: "Flujos de firma con un documento de evidencia y verificación posterior."
stack:
  - TypeScript
  - Node.js
  - React
  - PostgreSQL
tags:
  - firma electrónica
  - seguridad
  - auditoría
---

## El problema

En el gestor documental, quien sube un documento puede armar un flujo de firma: define dónde firma cada persona, asigna a los firmantes y lo envía. Los firmantes pueden ser usuarios internos o externos. El acceso de los firmantes externos lo trabajó sobre todo el equipo.

Cuando todos firman hay que dejar evidencia de quién firmó y cuándo, y un documento final que no se pueda alterar sin que se note. Hacer todo eso dentro de la acción del último firmante no era viable: el trabajo de generar y armar los documentos es pesado.

## Decisiones

**Separar el flujo en piezas con responsabilidades claras.** Dividí la lógica de firma, que estaba concentrada en un solo lugar, en partes que manejan el estado del flujo, las reglas y la validación, con pruebas. Costo: hay más piezas que seguir para entender una firma de principio a fin.

**Generar la evidencia en segundo plano.** Al completarse el flujo, un proceso aparte arma el documento de evidencia con los datos de cada firmante y lo une al documento firmado. El usuario no espera ese trabajo. Costo: hay que vigilar que ese proceso termine y retomarlo si no lo hace.

**Firmar el resultado final y permitir verificarlo.** El documento final se firma para que cualquier alteración se pueda detectar, y cualquiera que lo reciba puede verificarlo después. Costo: la verificación es otra superficie que hay que mantener y probar.

## Resultado

- Los flujos de firma terminan en un documento con evidencia de cada firmante.
- Quien recibe un documento firmado puede comprobar después que no fue modificado.

## Qué haría distinto

Construiría la firma del documento y la verificación junto con la evidencia, en lugar de agregarlas en una segunda etapa.
