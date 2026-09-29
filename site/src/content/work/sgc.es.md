---
slug: sgc
lang: es
order: 11
title: "Talonaria: un ERP multi-tenant para pymes colombianas"
project: Talonaria
headline: "En muchas pymes colombianas los libros no cuadran con el negocio. Talonaria es un ERP multi-tenant donde cada operación con dinero genera su asiento contable en la misma transacción."
domain: Proyecto propio
role: Desarrollador único · diseño, arquitectura y desarrollo
period: 2026 – presente
featured: false
links:
  - label: Ver Talonaria
    href: https://talonaria.co
summary:
  - k: El problema
    v: "La contabilidad suele ser un módulo agregado al final; los libros no cuadran con el negocio."
  - k: La decisión
    v: "Contabilidad como función central: cada operación con dinero crea su asiento en la misma transacción, y si el asiento no cuadra, la operación no ocurre."
  - k: En qué terminó
    v: "Producto desplegado en talonaria.co, en pre-lanzamiento y sin clientes todavía, con CI, versiones automáticas y respaldos diarios, mantenido por una sola persona."
metrics:
  - value: "91"
    label: "modelos de datos"
  - value: "~300"
    label: "endpoints HTTP"
  - value: "1.138"
    label: "casos de test"
  - value: "~78k"
    label: "líneas de TypeScript"
stack:
  - Next.js
  - TypeScript
  - PostgreSQL
  - Prisma
  - Jotai
  - Lucia
  - Stripe
  - Wompi
  - Cloudflare R2
  - OpenAI
  - Anthropic
  - Vitest
  - Playwright
  - GitHub Actions
  - Railway
tags:
  - producto propio
  - arquitectura
  - fintech
---

Talonaria es un sistema de gestión comercial multi-tenant para restaurantes, gimnasios, tiendas y agencias en Colombia. Cubre punto de venta con caja, inventario, compras con retenciones, cartera, contabilidad sobre el plan único de cuentas, nómina, facturación y nómina electrónicas ante la DIAN, cotizaciones, órdenes y proyectos, membresías con control de acceso, comisiones, mensajería interna, roles y permisos por empresa, generación de PDFs y un agente que responde preguntas en lenguaje natural. Se vende como suscripción mensual, con prueba gratis.

## El problema

En el software administrativo para pymes colombianas la contabilidad suele ser un módulo que se agrega al final. Los números del negocio y los libros no coinciden, y alguien termina cuadrándolos a mano.

A eso se suman restricciones locales que no admiten interpretación: plan único de cuentas, IVA con varias tarifas (19 %, 5 %, exento y excluido), retenciones en la fuente, de IVA y de ICA según el régimen de cada parte, y documentos electrónicos ante la DIAN: factura, notas crédito y débito, documento soporte y nómina. Y una restricción propia: el sistema lo mantiene una sola persona, así que la arquitectura tiene que reducir el trabajo de mantenimiento desde el principio.

## Decisiones

**Contabilidad como función central, no como módulo.** Todo evento que mueve dinero (venta, compra, pago a proveedor, cobro de cartera, gasto, movimiento de caja, nómina, comisión, nota crédito) pasa por la misma función que crea el asiento, dentro de la misma transacción que la operación. No existe forma de registrar una venta sin su asiento, así que no hace falta un proceso que concilie después. Una auditoría contable y tributaria interna, en julio de 2026, encontró que esa función avisaba y seguía cuando faltaba una cuenta o el asiento quedaba desbalanceado, así que una venta podía completarse con la contabilidad a medias. Desde entonces lanza un error y aborta la transacción entera. *Trade-off:* una cuenta mal configurada bloquea la operación en vez de dejarla pasar; prefiero un error visible a unos libros incompletos.

**Serializable, con reintentos, para dinero y stock.** Ventas, recepción de compras, apertura y cierre de caja, notas crédito y débito, anticipos de comisión, anulación de facturas y asientos corren en transacciones Serializable con reintentos y espera exponencial. Un punto de venta tiene concurrencia real: dos cajeros vendiendo la última unidad. Al principio solo la venta y las compras reintentaban; el resto abría la transacción aislada pero, cuando PostgreSQL abortaba una de dos operaciones que se pisaban, el usuario veía un error genérico a mitad de un cobro. Ahora todas pasan por el mismo envoltorio, y una prueba lo exige. *Trade-off:* algo más de latencia y la complejidad de manejar reintentos.

**Multi-tenancy por esquemas de Postgres, sin RLS.** Una sola base con dos esquemas: `public`, con 20 modelos para usuarios, empresas, sesiones, planes y suscripciones, y `tenant`, con 71 modelos para los datos de cada empresa, todos con `companyId`. El aislamiento es por convención: cada consulta filtra por empresa, y una suite de pruebas intenta leer, editar y borrar recursos de otra empresa sobre 13 tipos de recurso, comprobando además que los datos de la víctima sigan intactos. *Trade-off:* sin seguridad a nivel de fila, el aislamiento depende de que el código lo respete; a cambio, el modelo es simple, hay un solo esquema que sincronizar y las consultas entre módulos no tienen costo. Con un solo mantenedor y pruebas de aislamiento es un equilibrio razonable; con un equipo no lo sería.

**Facturación electrónica mediante proveedores, no directa contra la DIAN.** Los documentos electrónicos salen por proveedores tecnológicos autorizados detrás de una interfaz común: factura, notas crédito y débito, documento soporte con sus notas de ajuste, nómina electrónica, consulta de estado y descargas. Hay dos implementados: Factus, probado contra su sandbox, y Matias. Una versión anterior de la pantalla ofrecía otros tres proveedores que nunca se implementaron; los quité y dejé una sola lista de proveedores reales, que una prueba mantiene alineada con el código. *Trade-off:* la conexión directa sería más limpia en teoría, pero implica certificados, firma y un mantenimiento regulatorio constante que una persona no puede sostener.

**Agente de IA con acceso acotado.** AURA traduce preguntas en lenguaje natural a consultas, con OpenAI o Anthropic detrás de la misma interfaz, elegibles por empresa. Tiene herramientas predefinidas y una de SQL de solo lectura con lista blanca de tablas, límite de rondas y de frecuencia por usuario, y cuota de consultas según el plan. Es la parte más delicada: una consulta mal acotada podría exponer datos de una empresa a otra. En septiembre de 2026, al verificar su documentación contra el código, encontré que el filtro por empresa solo se aplicaba a la primera tabla de la consulta, así que una unión podía traer datos de otras empresas. Ahora se acota cada tabla que tenga la columna y una tabla fuera de la lista blanca rechaza la consulta. Tiene su propia suite dedicada a intentar romper ese aislamiento, y otra que falla si el esquema que se le describe al modelo se desvía del real.

**Cobro de la suscripción detrás de una pasarela intercambiable.** Empecé con Stripe, pero Stripe no acepta empresas colombianas como comercio. El cobro pasó a una abstracción con dos proveedores: las suscripciones existentes siguen en Stripe y las nuevas se cobran con Wompi (Bancolombia), en pesos, con tarjeta, Nequi, cuenta Bancolombia o Daviplata. La tarjeta se tokeniza en el navegador y el número nunca pasa por el servidor. *Trade-off:* con Wompi el motor de cobro recurrente es mío: un cron diario cobra, reintenta al día siguiente, a los tres días y a la semana, y solo suspende tras el cuarto fallo. Los avisos de pago que la pasarela reenvía se reconocen y se ignoran; antes de eso, cada reenvío extendía el período un mes más.

**Versiones que se cortan solas desde el CHANGELOG.** Railway despliega cada commit que llega a `main`. Cada PR con un cambio visible deja su línea en el CHANGELOG, y cuando el CI pasa en `main` un workflow deduce el número de versión de las categorías (añadido, corregido, cambio incompatible), actualiza el CHANGELOG y `package.json`, etiqueta el commit y publica la versión en GitHub. La versión se ve en el menú lateral y en un endpoint de salud, así que se sabe qué corre en producción sin entrar al panel del proveedor. El proyecto sigue en 0.x a propósito: la 1.0.0 será la versión con la que opere el primer cliente real. *Trade-off:* la disciplina de escribir el CHANGELOG en cada PR; a cambio, nadie decide números ni crea etiquetas a mano.

## Resultado

Está desplegado en talonaria.co y funcionando, en pre-lanzamiento: el registro público, la prueba gratis y el cobro están montados, pero todavía no lo opera ningún cliente real. El primer commit es del 7 de marzo de 2026.

A septiembre de 2026, las cifras de la cabecera son: 91 modelos Prisma; unos 300 handlers HTTP repartidos en 204 archivos de rutas; 1.138 casos de prueba en 106 archivos, entre Vitest y Playwright; y unas 78.000 líneas de TypeScript en 509 archivos. El historial suma 344 commits y 40 versiones etiquetadas, hasta la v0.27.1; las anteriores a septiembre se asignaron retroactivamente a partir del historial de git.

La operación está automatizada con tres workflows de GitHub Actions:

- **CI** en cada PR y push a `main`: tipos, build de producción y la suite completa contra un Postgres de servicio. Es la única puerta antes de producción. Durante un tiempo el CI daba verde corriendo 361 de 672 pruebas, porque las suites HTTP se saltaban sin servidor y saltarse contaba como éxito; ahora levanta el build de producción y la regla es que una prueba solo se salta por lo que el entorno no puede dar.
- **Release**, descrito arriba.
- **Respaldo diario**: `pg_dump` a Cloudflare R2 con 30 días de retención, verificado antes y después de subir, y un script de restauración probado de punta a punta sobre una base desechable.

Buena parte del trabajo han sido auditorías internas con fecha y plan de remediación: una contable y tributaria (28 hallazgos, 6 críticos, cerrada en cuatro bloques: cobro de facturas a crédito, pago a proveedores, retenciones en compras, valores de nómina de 2026, entre otros), una de seguridad y pruebas el mismo día de un despliegue (la protección CSRF solo comprobaba que la cabecera existiera) y dos de documentación, que verificaron cada afirmación contra el código. En la misma línea, el centro de ayuda describía funciones que nunca existieron; se reescribió en guías Markdown verificadas contra el código, y una prueba falla si una guía cita una ruta o un menú que no existe.

## Qué haría distinto

Empezaría por el modelo contable: lo construí después del punto de venta y tuve que volver sobre operaciones ya escritas para conectarlas. Tendría migraciones versionadas desde el principio: con la sincronización directa del esquema, cada cambio destructivo (un estado que desaparece de un enum, una columna que cambia de tipo) exigió un script SQL escrito a mano y probado contra una copia con datos antes de desplegar. Montaría el CI contra el build de producción desde el primer día, en vez de descubrir meses después que parte de las pruebas nunca corría. Y cuando entre otra persona al proyecto, migraré el aislamiento a seguridad a nivel de fila.
