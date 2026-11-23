---
slug: kinora
lang: es
order: 5
title: Un estudio creativo donde la IA propone y la persona aprueba
project: Kinora
headline: "Una app de escritorio para que un equipo pequeño planee una serie de videos, haga cada episodio y lo publique. Cada cambio es una operación tipada y reversible: se hace a mano o la propone un agente, y la persona la aprueba."
domain: "Proyecto propio · Producto de escritorio"
role: "Product owner y desarrollador · arquitectura, producto y código"
period: "Octubre 2026 – presente"
featured: true
links:
  - label: Herramientas nativas en GitHub
    href: https://github.com/ivansantander-hub/kinora-toolchain
summary:
  - k: El problema
    v: "Las herramientas de video asumen una persona frente a una línea de tiempo; un agente de IA no tiene dónde trabajar sin romper el proyecto."
  - k: La decisión
    v: "Todo cambio es una operación tipada que se puede deshacer; el agente propone, la persona aprueba, y los originales nunca salen de su disco."
  - k: Dónde va
    v: "Editor completo y estudio de planeación terminados; sigue la publicación a YouTube, Instagram y Facebook."
metrics:
  - value: "277"
    label: "commits en 17 días"
  - value: "~100"
    label: "decisiones de arquitectura documentadas"
  - value: "16"
    label: "paquetes y apps en el monorepo"
media:
  image: /img/casos/kinora/editor.webp
  alt: "El editor de Kinora con la línea de tiempo, el visor y el inspector"
points:
  - "**Operaciones, no clics:** cada cambio es una operación validada que se puede deshacer."
  - "**La IA propone, la persona aprueba:** el agente trabaja en el mismo proyecto sin romperlo."
  - "**Sin conexión y sin licencias pagas:** los originales nunca salen del disco."
gallery:
  - src: /img/casos/kinora/proyectos.webp
    alt: "Pantalla de inicio de Kinora con los proyectos"
    caption: Proyectos
  - src: /img/casos/kinora/medios.webp
    alt: "Biblioteca de medios de Kinora"
    caption: Medios
  - src: /img/casos/kinora/transcripcion.webp
    alt: "Edición por transcripción en Kinora"
    caption: Editar desde el texto
moreLabel: "Ver el detalle: cómo trabaja el agente"
stack:
  - TypeScript
  - Electron
  - React 19
  - Playwright
  - pnpm · Turborepo
tags:
  - producto
  - ia
  - escritorio
---

Kinora es un estudio creativo de escritorio para Mac y Windows. Un equipo pequeño de contenido lo usa para planear una serie, hacer cada episodio y, pronto, publicarlo. El repositorio es privado; la cadena de herramientas nativas que descarga la app (ffmpeg y whisper.cpp, fijados y verificados) es pública.

## Dónde trabaja un agente

Un editor de video normal está pensado para una persona con el mouse. Si un agente de IA edita el mismo proyecto, cualquier error queda mezclado con el trabajo humano y no hay forma limpia de revisarlo. La pregunta de producto fue cómo darle al agente un lugar seguro dentro del editor.

## Cómo se resolvió

**Operaciones, no clics.** Cortar, mover, titular, cambiar el color o el sonido es una operación con tipo, que se valida y se puede deshacer. La misma operación la ejecuta la persona desde la interfaz o la propone el agente desde un panel, donde se aprueba una por una.

**Cualquier agente, empezando por el propio.** El agente por defecto es Claude Code con la suscripción de la persona, pero las herramientas, las instrucciones y la lógica están separadas para que pueda ser cualquier otro. *Trade-off:* más capas que conectar un solo modelo, a cambio de no depender de un proveedor.

**Offline y sin licencias de pago.** La app funciona sin conexión, los originales se quedan en el disco de la persona y ninguna dependencia cuesta dinero ni arrastra código GPL enlazado.

**Decisiones por escrito.** Cada decisión de arquitectura queda en un registro numerado, y el roadmap marca cada tarea como hecha cuando se cierra su pull request. TypeScript estricto, sin `any`, con validación en los bordes, y pruebas end-to-end que corren contra la app empaquetada, en segundo plano.

## Estado

Terminados: el editor (capas, sonido, cortes, títulos, transiciones, velocidad, subtítulos, efectos, color y exportes de calidad) y el estudio de planeación (ideas con puntaje, series, calendario y un productor que propone la semana). Lo siguiente es publicar a YouTube, Instagram y Facebook desde el calendario.
