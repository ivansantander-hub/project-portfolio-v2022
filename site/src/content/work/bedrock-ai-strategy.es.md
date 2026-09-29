---
slug: bedrock-ai-strategy
lang: es
order: 4
title: Una estrategia para integrar IA sin sacar los datos clínicos del entorno controlado
project: Estrategia de IA con AWS Bedrock
headline: La plataforma no tenía IA en producción y maneja datos que no pueden salir de un entorno controlado. Escribí una propuesta de integración con AWS Bedrock y la probé con un spike de asistente que consulta datos de la plataforma respetando los permisos del usuario.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead / Technical Product Owner · estrategia de integración y spike
period: 2026
confidential: true
featured: false
summary:
  - k: El problema
    v: "Cero IA en producción, en un dominio con regulación, datos de pacientes y exigencia de trazabilidad."
  - k: La decisión
    v: "Bedrock por privacidad y BAA, detrás de un único servicio de IA que concentre redacción, auditoría y costos."
  - k: En qué terminó
    v: "Una propuesta en cuatro fases y un spike de asistente de solo lectura integrado en la rama de desarrollo."
metrics:
  - value: "4"
    label: fases en la hoja de ruta propuesta
  - value: "8"
    label: consultas GraphQL de solo lectura para el asistente
  - value: "~8.000"
    label: caracteres de contexto máximo por pregunta
stack:
  - AWS Bedrock
  - Claude
  - Next.js
  - GraphQL
  - TypeScript
  - AWS IAM
tags:
  - ia
  - arquitectura
  - privacidad
---

## El problema

La plataforma tenía unos 33 microservicios y ninguna funcionalidad de IA en producción. Antes de agregar cualquier cosa había cuatro restricciones: la regulación del sector (ICH-GCP, 21 CFR Part 11, GDPR), que los datos personales y de salud de pacientes no salgan del entorno controlado, que cada decisión de la IA sea trazable, y que el proveedor pueda firmar un BAA para procesar datos clínicos.

## Decisiones

**Bedrock en lugar de llamar directamente a las APIs de los modelos.** Documenté la comparación: en Bedrock los datos no se usan para entrenar, los proveedores de los modelos no los ven, hay BAA disponible, la región se elige y existe aislamiento por VPC con PrivateLink. Costo: quedamos atados a AWS y a cómo Bedrock expone cada modelo, que en la práctica trajo sus propios problemas de configuración.

**Un único servicio de IA como subgrafo del gateway existente.** Propuse un servicio centralizado con registro de prompts versionados, redacción de datos personales antes de enviar nada al modelo, cliente de Bedrock con modelos de respaldo, bitácora de auditoría, control de costos por cliente y proyecto, y límite de uso por cliente. Así la redacción y la auditoría viven en un solo lugar y cambiar de modelo no toca otros servicios. Costo: es un servicio más que desplegar y mantener en una arquitectura que ya tenía muchos.

**Un humano aprueba cada resultado de la IA.** Para cumplir con registros electrónicos, la propuesta trata cada versión de un prompt como la versión de un método y exige aprobación humana antes de que un resultado sea oficial. Costo: los flujos con IA siguen necesitando un paso manual.

**Modelo según el caso de uso.** Un modelo rápido y barato para clasificar documentos y responder consultas; uno intermedio para extraer datos y redactar; el más capaz solo para revisión de cumplimiento. Costo: más configuración y una lógica de enrutamiento que mantener.

**Un spike con datos de la plataforma y permisos del usuario.** Primero conecté un Bedrock Agent a una página del frontend, pero no tenía acceso a los datos de la plataforma. Al día siguiente lo reemplacé por llamadas directas a la API Converse con streaming: un clasificador de intención por palabras clave elige qué consultar, se ejecutan consultas GraphQL de solo lectura con el token de sesión del usuario (así solo ve lo que ya puede ver) y el resultado se inyecta en el prompt. Costo: el clasificador es rudimentario, el contexto tiene un tope, los archivos solo aportan metadatos y el historial vive en el navegador.

## Resultado

- La propuesta quedó escrita con arquitectura, casos de uso, modelos por caso, costos estimados por escenario y una hoja de ruta en cuatro fases.
- El spike quedó integrado en la rama de desarrollo, con los problemas de configuración documentados: perfiles de inferencia en lugar de IDs de modelo, el formulario de primer uso del proveedor y permisos de IAM que deben cubrir todas las regiones a las que enruta el perfil.
- Después agregué a LearUp Agent, mi asistente de código, la opción de usar Claude a través de Bedrock con credenciales de AWS.

## Qué haría distinto

Construiría la capa de redacción antes que el spike. La propuesta la ponía en el centro, pero el spike se hizo primero para validar la idea, y el orden debió ser el inverso.
