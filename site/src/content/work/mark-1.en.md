---
slug: mark-1
lang: en
order: 8
title: Real parts designed in code
project: Mark 1
headline: "Super 8's sibling, with FreeCAD: every part comes out of a Python script with its measurements at the top, and from it the 3D model, scale drawings, fabrication files and the numbers on how much it holds."
domain: "Personal project · Mechanical design and fabrication"
cardLine: "Mechanical design with FreeCAD"
role: "Sole author · modelling, drawings, analysis and site"
period: "November 2026 – present"
featured: false
links:
  - label: See the parts
    href: https://mark-1.pages.dev
  - label: Sibling project · Super 8
    href: https://super-8.pages.dev
summary:
  - k: The question
    v: "Can you design a part that really gets made, with drawings and calculations, without opening a CAD program's interface?"
  - k: The rule
    v: "The script is the source of truth; the model, drawings, dieline and video are rebuilt with one command."
  - k: Where it is
    v: "Two parts in two series: a cardboard box with dielines and drawings, and a PLA bracket checked with finite elements."
metrics:
  - value: "2"
    label: "published parts"
  - value: "3"
    label: "A3 sheets at 1:1 scale"
  - value: "4.3"
    label: "calculated safety factor"
media:
  video: /img/casos/mark-1/ensamble.mp4
  poster: /img/casos/mark-1/ensamble.webp
  alt: "The cardboard box folding from its die line, generated with FreeCAD"
points:
  - "**One part, one script:** the 3D model, scale drawings and die line all come from the same code."
  - "**Calculated before it is made:** the PLA bracket is tested with finite elements; safety factor 4.3."
  - "**Super 8’s sibling:** the same way of working, with FreeCAD and parts that are really made."
gallery:
  - src: /img/casos/mark-1/caja-3d.webp
    alt: "The lidded box open and closed"
    caption: Box · 3D model
  - src: /img/casos/mark-1/troquel.webp
    alt: "Dimensioned die line of the box base"
    caption: Die line at 1:1
  - src: /img/casos/mark-1/plano.webp
    alt: "Assembly drawing with views, section and detail"
    caption: Assembly drawing
  - src: /img/casos/mark-1/esfuerzo.webp
    alt: "Von Mises stress and deformation of the PLA bracket"
    caption: Bracket · finite elements
moreLabel: "Read the details: parts, drawings and calculations"
stack:
  - Python
  - FreeCAD
  - gmsh · CalculiX
  - matplotlib
  - ffmpeg
tags:
  - cad
  - fabrication
  - procedural
---

Mark 1 does with FreeCAD what Super 8 does with Blender: every part is a Python script, and FreeCAD builds it without opening its window. The same script produces the 3D model, dimensioned drawings, fabrication files and the numbers that say whether the part holds. Parts are grouped in series and live on their own site.

## Two parts, two series

**Packaging · cardboard box.** A two-piece micro-flute box: the script generates the model, the flat dielines (DXF, SVG and PDF at 1:1 scale), three A3 sheets with dimensions, section and detail, and an animation where each panel rotates on its fold line until the box closes. The McKee formula gives its weight and how much it holds when stacked.

**Printed supports · PLA bracket.** A shelf bracket for 3D printing, meshed with gmsh and solved with CalculiX under 5 kg: stress map, deflection and safety factor, with a hand calculation that confirms the order of magnitude.

## What it taught along the way

That a finite-element number gets checked before it gets believed: the peak stress sat on a sharp corner and moved with every mesh, so the highest value is reported along with the reason. That renaming code must produce the same files byte for byte. And that GUI tools can be driven without a single window showing up.
