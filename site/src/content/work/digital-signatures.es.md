---
slug: digital-signatures
lang: es
order: 6
title: Firmas electrónicas con un certificado de evidencia verificable
project: Firma electrónica y certificados
headline: Los flujos de firma del gestor documental terminan en un certificado con los datos de cada firmante. Construí el servicio que lo genera y, después, la firma digital PKCS#7 de los PDF con un registro que permite verificarlos.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · orquestación del flujo, servicio de certificados y firma digital
period: 2025 – 2026
confidential: true
featured: false
summary:
  - k: El problema
    v: "Un documento firmado por varias personas, internas y externas, necesita evidencia de quién firmó, cuándo y desde dónde, y una forma de comprobar que el PDF no cambió."
  - k: La decisión
    v: "Un worker que genera el certificado fuera de la petición, lo une al documento y firma los PDF al final, con hash SHA-256 y código de verificación."
  - k: En qué terminó
    v: "La firma PKCS#7 y la verificación salieron a producción en junio de 2026, con un certificado autofirmado."
metrics:
  - value: "50"
    label: "commits míos en el servicio de certificados, de 81 en total"
  - value: "3"
    label: "PDF firmados digitalmente por flujo: certificado, documento firmado y documento completo"
stack:
  - Node.js
  - TypeScript
  - RabbitMQ
  - PostgreSQL
  - Prisma
  - AWS S3
  - Handlebars
  - PKCS#7
  - Next.js
tags:
  - firma electrónica
  - seguridad
  - auditoría
---

## El problema

En el gestor documental, quien sube un PDF puede armar un flujo de firma: ubica campos (firma, iniciales, nombre, fecha, texto), asigna firmantes en orden y lo envía. Los firmantes pueden ser usuarios internos o externos; los externos entran con un enlace y un código de un solo uso que reciben por correo. Esa parte la hizo sobre todo el equipo: tokens y códigos se guardan como HMAC-SHA256 y tienen límite de intentos.

Cuando todos firman hay que dejar evidencia: quién firmó, cuándo, desde qué IP, y un documento final que no se pueda alterar sin que se note. Hacerlo en la petición del último firmante no era viable: hay que renderizar, convertir y unir PDF, subirlos a S3 y notificar.

## Decisiones

**El flujo en un orquestador con un validador aparte.** En agosto de 2025 repartí la mutación de firma, que vivía en un resolver largo, entre un orquestador, un servicio de flujo y un validador, con pruebas unitarias. El orquestador maneja las transiciones de estado y la sincronización de firmantes; cada firmante queda registrado con la IP desde la que firmó. Costo: más piezas para seguir una firma.

**Un worker por cola para el certificado.** Al completarse el flujo se publica un mensaje en RabbitMQ. En octubre de 2025 construí el worker que lo consume: arma un certificado HTML con una plantilla (documento, remitente, fechas, estado y una fila por firmante con su IP y sus campos), lo convierte a PDF con un servicio externo, lo une al documento (la versión firmada si existe) y registra cada archivo como una ruta tipada (original, convertido, firmado, certificado, completo). Costo: una dependencia externa y un estado "en proceso" que se puede quedar colgado.

**Reencolar lo que se queda colgado.** Agregué un proceso periódico que vuelve a publicar los flujos que llevan demasiado tiempo "en proceso", además de reintentos y una cola de mensajes muertos. Costo: es un sondeo sobre la base de datos que corre aparte del consumo normal de la cola.

**Firmar al final, después de unir.** En junio de 2026 agregué firma digital PKCS#7 con un certificado autofirmado. La primera versión firmaba antes de unir y la unión dejaba firmas inválidas en el documento completo, así que moví la firma al final. Cada PDF firmado genera un registro con su SHA-256, los datos del certificado (emisor, serie, huella, vigencia) y un código de verificación que el certificado muestra como QR. Costo: si la firma falla, el PDF queda sin firmar y solo se registra el error, para no bloquear la entrega.

**Estrategia de firma intercambiable.** La firma está detrás de una interfaz; hoy solo existe la implementación autofirmada y los proveedores comerciales quedaron sin implementar. Costo: un certificado autofirmado permite comprobar integridad, pero no respalda la identidad del firmante ante un tercero.

**Verificación pública.** Una página sin sesión recibe el código del QR o el archivo, del que el navegador calcula el SHA-256 para consultar por hash. El servidor compara el hash guardado con el objeto en S3, revisa la estructura de firma del PDF e informa si el certificado es autofirmado o está vencido. Cada verificación queda auditada.

## Resultado

- El certificado de firma está en producción desde finales de 2025; la firma PKCS#7, el hash SHA-256 y la URL de verificación salieron en la versión 1.5.0 del DMS, en junio de 2026.
- En diciembre de 2025 corregí un problema de concurrencia en el que se sobrescribían firmas al guardar; ahora los campos se fusionan.
- En junio de 2026 agregué firma escrita con fuente, cierre forzado por el propietario (los pendientes quedan como retirados) y regeneración de documentos.

## Qué haría distinto

Haría la firma digital y el registro de verificación junto con el certificado, en vez de agregarlos meses después como una segunda etapa.
