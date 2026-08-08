---
slug: sgc
lang: es
order: 2
title: Un ERP multi-tenant para Colombia
project: SGC
headline: 85 modelos, 164 endpoints y 383 tests. Punto de venta, inventario, nómina y contabilidad colombiana real. Construido de cero, por una persona.
domain: Proyecto propio
role: Diseño, arquitectura y desarrollo
period: 2025 – presente
confidential: false
featured: true
links:
  - label: Ver el producto
    href: https://business-system.up.railway.app/landing
summary:
  - k: El problema
    v: "En el software administrativo colombiano la contabilidad es un módulo pegado al final. Los libros y el negocio no cuadran."
  - k: La decisión
    v: "La contabilidad como función central. Ningún camino del código permite registrar una venta sin su asiento."
  - k: En qué terminó
    v: "Sistema desplegado y funcionando. 85 modelos, 164 endpoints, 383 tests. Verificado sobre el código."
metrics:
  - value: "85"
    label: "modelos de datos"
  - value: "164"
    label: "endpoints REST"
  - value: "383"
    label: "tests automatizados"
  - value: "~60k"
    label: "líneas de TypeScript"
stack:
  - Next.js
  - TypeScript
  - PostgreSQL
  - Prisma
  - Jotai
  - Stripe
  - Cloudflare R2
tags:
  - producto propio
  - arquitectura
  - fintech
---

> ¿Cuánto de un ERP real puede sostener una sola persona, si las decisiones de arquitectura son correctas desde el principio?

Esa es la pregunta que quería responder. SGC es la respuesta en construcción: un sistema de gestión comercial multi-tenant para negocios colombianos — restaurantes, bares, gimnasios, tiendas. Punto de venta, inventario, contabilidad, nómina, facturación electrónica, membresías, mensajería, y un agente que responde preguntas en lenguaje natural.

## El problema que quería evitar

El software administrativo para pymes colombianas falla casi siempre en el mismo punto: la contabilidad es un módulo pegado al final, no el centro del sistema. El resultado es que los números del negocio y los libros contables no coinciden, y alguien termina cuadrando a mano.

A eso se suman restricciones locales que no se pueden simplificar: el plan único de cuentas, el 19% de IVA con sus excepciones, la facturación electrónica ante la DIAN.

## Cinco decisiones, con sus costos

**Multi-tenancy por esquemas, no por base de datos.** Dos esquemas de Postgres en una sola base: uno global para usuarios y empresas, otro para todo lo que pertenece a una empresa. El trade-off es explícito — no hay seguridad a nivel de fila que me proteja de mí mismo. A cambio obtengo un modelo simple, migraciones únicas y consultas entre módulos sin costo. Para un sistema con un solo mantenedor y tests que cubren el aislamiento, es la relación correcta. Con un equipo, la respuesta sería otra.

**Todo lo que toca dinero o stock corre en transacciones Serializable.** Ventas, recepción de compras, apertura y cierre de caja, asientos contables — con reintentos, espera exponencial y mutaciones atómicas de saldos. Es la decisión de la que estoy más seguro: un punto de venta tiene concurrencia real, dos cajeros vendiendo el último producto, y "casi siempre correcto" no es una opción cuando hablas de inventario y dinero. El costo es latencia y complejidad de reintentos. Lo pago sin discutir.

**La contabilidad es una función central, no un módulo.** Todo evento que mueve dinero pasa por la misma función que crea el asiento contable, dentro de la misma transacción que la operación. La consecuencia: es imposible registrar una venta sin su asiento — no porque haya un proceso que lo revise después, sino porque no existe un camino en el código que lo permita. Los libros no se desincronizan del negocio porque no son dos sistemas.

**Facturación electrónica a través de proveedores, no contra la DIAN.** Integré cuatro proveedores autorizados detrás de una interfaz común. Integrar directo habría sido más "puro" y una fuente permanente de mantenimiento regulatorio que no me interesa sostener solo.

**El agente de IA está encerrado a propósito.** SGC incluye un agente que traduce preguntas en lenguaje natural a SQL — la parte más peligrosa del sistema, donde una consulta mal acotada es una fuga de datos entre empresas. Tiene una suite de tests dedicada solo a intentar romper ese aislamiento.

## Verificado sobre el código, no estimado

| | |
|---|---|
| Modelos de datos | 85 |
| Endpoints REST | 164 |
| Tests automatizados | 383 |
| Líneas de TypeScript | ~59.700 en 389 archivos |

Cubre punto de venta, inventario, contabilidad con plan único de cuentas, nómina, facturación electrónica, membresías de gimnasio con control de acceso, mensajería, suscripciones con Stripe, control de acceso por roles y generación de PDFs. Está desplegado y funcionando.

## Lo que cambiaría

Habría empezado por el modelo contable. Lo construí después del punto de venta y tuve que volver sobre operaciones ya escritas para engancharlas — si el asiento contable hubiera sido la primera abstracción, cada operación habría nacido conectada.

Y el aislamiento por convención tiene fecha de caducidad. Hoy es correcto para un mantenedor; el día que entre alguien más, migro a seguridad a nivel de fila. Prefiero decirlo ahora que descubrirlo con una fuga.
