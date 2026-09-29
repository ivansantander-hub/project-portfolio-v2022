---
slug: avatar-studio
lang: es
order: 16
title: Un pipeline local para avatares que hablan
project: Avatar Studio
headline: "Probar si se pueden producir videos cortos de personajes ficticios hechos con IA, en español, usando sobre todo modelos abiertos en un Mac y alquilando GPU o API solo para el video."
domain: Proyecto propio
role: Desarrollador único · investigación, scripts y pruebas
period: "2026"
featured: false
summary:
  - k: El problema
    v: "Hacer videos de un personaje IA con voz en español natural sin depender de una plataforma cerrada para cada paso."
  - k: La decisión
    v: "Imagen y voz en local con modelos abiertos; el lip-sync, en GPU alquilada o por API."
  - k: En qué terminó
    v: "Pipeline de voz e imagen funcionando y dos clips piloto generados por API; sigue en pruebas."
metrics:
  - value: "4"
    label: "personajes ficticios definidos"
  - value: "40"
    label: "guiones escritos"
  - value: "1,2 min"
    label: "para generar un clip de 30 s por API"
  - value: "US$1,52"
    label: "costo de ese clip"
stack:
  - Python
  - uv
  - Chatterbox
  - Whisper
  - mflux
  - ffmpeg
  - OpenRouter
  - ComfyUI
tags:
  - producto propio
  - ia generativa
  - audio
---

Avatar Studio es un conjunto de scripts en Python para producir videos cortos, en formato vertical, de personajes ficticios que hablan a cámara. Cubre el perfil del personaje, sus imágenes, los fondos, la voz, el video con lip-sync y la edición final con subtítulos. Empezó como una carpeta local llamada `ai-influencer`; es el mismo código que hoy está en un repositorio privado.

## El problema

Quería saber cuánto de este flujo se puede hacer con modelos abiertos en mi propio Mac, y qué partes sí o sí necesitan GPU alquilada o un servicio pago. La parte difícil resultó ser la voz: los primeros audios en español sonaban planos o robóticos, y un personaje que habla mal no sirve aunque la imagen sea buena.

## Decisiones

**Voces clonadas de datasets abiertos, no diseñadas desde cero.** Primero probé a diseñar voces con Qwen3-TTS a partir de una descripción, y las descarté porque sonaban extranjeras o robóticas. Terminé clonando con Chatterbox a partir de hablantes anónimos de Common Voice (CC0) y de un corpus de español colombiano de Google (CC BY-SA), con un archivo de atribución por voz. Costo: dos de las cuatro voces exigen atribución en la descripción del personaje, y la calidad depende de lo expresivos que sean esos clips.

**La referencia se arma con los clips más expresivos.** Chatterbox copia la forma de hablar de la referencia, así que un script mide cuánto sube y baja el tono en cada clip del hablante y concatena los más vivos hasta unos 20 segundos. Costo: es una métrica simple (rango de tono) que no captura todo lo que hace natural una voz.

**Locución frase por frase, con varias tomas y Whisper como filtro.** El guion se parte en trozos de al menos 8 palabras (con 3 salían 11 cortes y sonaba robótico), se generan varias tomas por trozo, Whisper confirma que dice el texto (similitud mínima 0,85), se descartan las lentas o arrastradas y gana la de más variación de tono. Al final se une con pausas y se normaliza a -14 LUFS con ffmpeg. Costo: generar tres tomas por frase multiplica el tiempo de cada audio.

**Imagen en local, video fuera.** Fondos, vistas del personaje y el primer cuadro se generan en el Mac con mflux (Z-Image Turbo y FLUX.2 klein, cuantizados a 8 bits). Para el lip-sync dejé preparada una sesión de RunPod con InfiniteTalk en ComfyUI y un script de instalación, y en paralelo un script que pide el video a HeyGen Avatar IV vía OpenRouter. Costo: el video no es local, y por API se paga por segundo.

## Resultado

Están los cuatro personajes con perfil, 40 guiones y el pipeline de voz e imagen funcionando. Los dos clips piloto que registré son de un mismo guion, hechos por API: uno de 30,4 s que tardó 1,2 min y costó US$1,52, y otro de 25,2 s en 1080p que tardó 2,2 min, con un costo estimado de US$1,26 y audio de Gemini vía OpenRouter. Ninguno está marcado todavía como utilizable, y la sesión de InfiniteTalk en RunPod no tiene mediciones: su tiempo es una estimación. El repositorio tiene un solo commit.

## Qué haría distinto

Llevaría el registro de pruebas desde el primer día en un formato que se pueda comparar, en lugar de carpetas numeradas con scripts para escuchar. Y probaría el video con un solo personaje y un solo guion antes de escribir 40: la parte de video es la que más puede cambiar el resto.
