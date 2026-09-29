---
slug: sgc
lang: es
order: 2
title: Un ERP multi-tenant para Colombia
project: SGC
headline: 85 modelos, 164 endpoints y 383 tests. Punto de venta, inventario, nómina y contabilidad colombiana, en un proyecto que desarrollo por mi cuenta.
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
    v: "En mucho software administrativo colombiano la contabilidad es un módulo añadido al final, y los libros no cuadran con el negocio."
  - k: La decisión
    v: "Poner la contabilidad en el centro: cada venta se registra junto con su asiento contable, en la misma transacción."
  - k: En qué terminó
    v: "Está desplegado y funcionando, con 85 modelos, 164 endpoints y 383 tests."
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

SGC es un sistema de gestión comercial multi-tenant que estoy construyendo para negocios colombianos: restaurantes, bares, gimnasios y tiendas. Tiene punto de venta, inventario, contabilidad, nómina, facturación electrónica, membresías, mensajería y un agente que responde preguntas en lenguaje natural. En parte lo empecé para ver cuánto de un ERP real puede mantener una sola persona si la arquitectura se piensa bien desde el principio.

## El problema de partida

En el software administrativo para pymes colombianas es habitual que la contabilidad sea un módulo que se añade al final, en vez de estar en el centro del sistema. Entonces los números del negocio y los libros no coinciden, y alguien acaba cuadrándolos a mano.

Además hay restricciones locales que hay que cumplir tal cual: el plan único de cuentas, el IVA del 19% con sus excepciones y la facturación electrónica ante la DIAN.

## Cinco decisiones de arquitectura y lo que cuestan

**Multi-tenancy por esquemas, no por base de datos.** Uso dos esquemas de Postgres en una sola base: uno global para usuarios y empresas, y otro para todo lo que pertenece a cada empresa. La contrapartida es que no hay seguridad a nivel de fila, así que el aislamiento depende de que el código lo respete. A cambio, el modelo es simple, las migraciones son únicas y las consultas entre módulos no tienen costo. Con un solo mantenedor y tests que cubren el aislamiento me parece un buen equilibrio; con un equipo lo haría de otra forma.

**Transacciones Serializable para todo lo que toca dinero o stock.** Ventas, recepción de compras, apertura y cierre de caja y asientos contables corren así, con reintentos, espera exponencial y actualizaciones atómicas de saldos. Es la decisión que tengo más clara: un punto de venta tiene concurrencia real (dos cajeros vendiendo la última unidad), y con inventario y dinero no basta con que funcione casi siempre. El costo es algo más de latencia y la complejidad de gestionar reintentos, y creo que compensa.

**La contabilidad como función central, no como módulo.** Cada evento que mueve dinero pasa por la misma función que crea el asiento contable, dentro de la misma transacción que la operación. Así no se puede registrar una venta sin su asiento: no hay un proceso que lo revise después, sino que el código no ofrece otra forma de hacerlo. Por eso los libros y el negocio no se desincronizan.

**Facturación electrónica a través de proveedores, no directamente contra la DIAN.** Integré cuatro proveedores autorizados detrás de una interfaz común. Conectarme directo a la DIAN habría sido más limpio en teoría, pero también un mantenimiento regulatorio constante que no veo viable llevar yo solo.

**Un agente de IA con acceso muy acotado.** SGC incluye un agente que traduce preguntas en lenguaje natural a SQL. Es la parte más delicada del sistema, porque una consulta mal acotada puede mostrar datos de una empresa a otra. Por eso tiene su propia suite de tests, dedicada a intentar romper ese aislamiento.

## El sistema en números

| | |
|---|---|
| Modelos de datos | 85 |
| Endpoints REST | 164 |
| Tests automatizados | 383 |
| Líneas de TypeScript | ~59.700 en 389 archivos |

Cubre punto de venta, inventario, contabilidad con plan único de cuentas, nómina, facturación electrónica, membresías de gimnasio con control de acceso, mensajería, suscripciones con Stripe, control de acceso por roles y generación de PDFs. Está desplegado y funcionando.

## Lo que haría distinto

Empezaría por el modelo contable. Lo hice después del punto de venta y tuve que volver sobre operaciones ya escritas para conectarlas. Si el asiento contable hubiera sido la primera pieza, cada operación habría quedado conectada desde el principio.

Además, el aislamiento por convención tiene un límite: vale mientras el proyecto lo mantenga yo solo, pero cuando entre alguien más lo migraré a seguridad a nivel de fila.
