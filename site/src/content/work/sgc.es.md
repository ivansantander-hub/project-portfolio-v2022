---
slug: sgc
lang: es
order: 2
title: Un ERP multi-tenant para Colombia
project: SGC
headline: "En muchas pymes colombianas los libros no cuadran con el negocio. SGC es un ERP multi-tenant donde cada venta genera su asiento contable en la misma transacción."
domain: Proyecto propio
role: Desarrollador único · diseño, arquitectura y desarrollo
period: 2025 – presente
confidential: false
featured: true
links:
  - label: Ver el producto
    href: https://business-system.up.railway.app/landing
summary:
  - k: El problema
    v: "La contabilidad suele ser un módulo agregado al final; los libros no cuadran con el negocio."
  - k: La decisión
    v: "Contabilidad como función central: cada operación con dinero crea su asiento en la misma transacción."
  - k: En qué terminó
    v: "ERP desplegado y funcionando, mantenido por una sola persona."
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

SGC es un sistema de gestión comercial multi-tenant para restaurantes, bares, gimnasios y tiendas en Colombia. Cubre punto de venta, inventario, contabilidad con plan único de cuentas, nómina, facturación electrónica, membresías con control de acceso, mensajería, suscripciones con Stripe, roles y generación de PDFs, además de un agente que responde preguntas en lenguaje natural.

## El problema

En el software administrativo para pymes colombianas la contabilidad suele ser un módulo que se agrega al final. Los números del negocio y los libros no coinciden, y alguien termina cuadrándolos a mano.

A eso se suman restricciones locales que no admiten interpretación: plan único de cuentas, IVA del 19 % con sus excepciones y facturación electrónica ante la DIAN. Y una restricción propia: el sistema lo mantiene una sola persona, así que la arquitectura tiene que reducir el trabajo de mantenimiento desde el principio.

## Decisiones

**Contabilidad como función central, no como módulo.** Todo evento que mueve dinero pasa por la misma función que crea el asiento contable, dentro de la misma transacción que la operación. No existe forma de registrar una venta sin su asiento; no hace falta un proceso que concilie después.

**Serializable, con reintentos, para dinero y stock.** Ventas, recepción de compras, apertura y cierre de caja y asientos corren en transacciones Serializable con reintentos, espera exponencial y actualizaciones atómicas de saldos. Un punto de venta tiene concurrencia real (dos cajeros vendiendo la última unidad). *Trade-off:* algo más de latencia y la complejidad de manejar reintentos.

**Multi-tenancy por esquemas de Postgres, sin RLS.** Un esquema global para usuarios y empresas y otro para los datos de cada empresa, en una sola base. *Trade-off:* sin seguridad a nivel de fila, el aislamiento depende de que el código lo respete; a cambio, el modelo es simple, las migraciones son únicas y las consultas entre módulos no tienen costo. Con un solo mantenedor y tests de aislamiento es un equilibrio razonable; con un equipo no lo sería.

**Facturación electrónica mediante proveedores, no directa contra la DIAN.** Integré cuatro proveedores autorizados detrás de una interfaz común. *Trade-off:* la conexión directa sería más limpia en teoría, pero implica un mantenimiento regulatorio constante que una persona no puede sostener.

**Agente de IA con acceso acotado.** El agente traduce preguntas en lenguaje natural a SQL, y es la parte más delicada: una consulta mal acotada podría exponer datos de una empresa a otra. Tiene su propia suite de tests dedicada a intentar romper ese aislamiento.

## Resultado

Está desplegado y funcionando. Las cifras de la cabecera corresponden a unas ~59.700 líneas de TypeScript repartidas en 389 archivos.

## Qué haría distinto

Empezaría por el modelo contable: lo construí después del punto de venta y tuve que volver sobre operaciones ya escritas para conectarlas. Y cuando entre otra persona al proyecto, migraré el aislamiento a seguridad a nivel de fila.
