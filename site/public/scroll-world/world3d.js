/* world3d.js — el valle de noche.
   Three.js (MIT) dibuja Medellín: laderas de luces, el centro con torres, el Metrocable que sube a la cima.
   El scroll no mueve la página: mueve la cámara. Cada parada tiene su texto; solo el de la parada en foco se ve.
   Si no hay WebGL o se pide movimiento reducido, la página queda como lista normal (ver world.css). */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const doc = document, html = doc.documentElement;
const mqQuieta = matchMedia('(prefers-reduced-motion: reduce)');
mqQuieta.addEventListener('change', () => location.reload());

try {
  if (!mqQuieta.matches) arranca();
} catch (err) {
  console.warn('scroll-world: se queda en modo lista —', err && err.message);
  html.classList.remove('modo-mundo');
}

function arranca() {
  const qs = new URLSearchParams(location.search);
  const DBG = qs.has('debug');
  const Q_FIJA = parseFloat(qs.get('q')) || 0;
  const { paradas } = JSON.parse(doc.getElementById('geo').textContent);
  const canvas = doc.getElementById('lienzo');
  const escena = doc.getElementById('escena');
  const pista = doc.getElementById('pista');
  const hud = doc.getElementById('hud');
  const hudTxt = doc.getElementById('hud-txt');
  const navLinks = [...doc.querySelectorAll('.barra__nav a')];
  const NOMBRES = { inicio: 'Inicio', clinica: 'Plataforma clínica', propios: 'Proyectos propios', taller: 'El taller', contacto: 'Contacto' };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  if (!renderer.capabilities.isWebGL2) throw new Error('sin WebGL2');
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.setClearColor(0x04050a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 2, 7000);
  const comp = new EffectComposer(renderer);
  comp.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.38, 0.45, 0.82);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  /* ───────── utilidades ───────── */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function mulberry(a) {
    return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const R = mulberry(20260930);
  const hash2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const fbm = (x, y) => vnoise(x, y) * 0.6 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.1;

  /* ───────── terreno: el valle y la cima del Metrocable ───────── */
  const CIMA = { x: -620, z: -540 };
  function base(x, z) {
    const a = Math.abs(z);
    const t = Math.max(0, (a - 110) / 560);
    let h = Math.pow(t, 1.3) * 270 * (z < 0 ? 1.12 : 1);
    h += (fbm(x * 0.006 + 3, z * 0.006) - 0.5) * 46 * Math.min(1, t * 3);
    h += Math.sin(x * 0.004 + z * 0.002) * 10 * Math.min(1, t * 2);
    return h;
  }
  const PLAT = base(CIMA.x, CIMA.z);
  const H = (x, z) => lerp(base(x, z), PLAT, sstep(135, 72, Math.hypot(x - CIMA.x, z - CIMA.z)));

  /* ───────── uniformes y material de edificios (ventanas por shader) ───────── */
  const U = {
    uTime: { value: 0 },
    uFog: { value: new THREE.Color(0.03, 0.027, 0.05) },
    uFogD: { value: 0.00062 },
    uScale: { value: 600 },
  };
  const FOG_GLSL = `
    uniform vec3 uFog; uniform float uFogD;
    vec3 aplicaNiebla(vec3 c, vec3 w){ float d = length(w - cameraPosition); float f = 1.0 - exp(-pow(d * uFogD, 2.0)); return mix(c, uFog, clamp(f, 0.0, 1.0)); }`;

  const VERT_EDIF = `
    attribute vec4 aInfo;
    varying vec3 vW; varying vec3 vN; varying vec3 vL; varying vec4 vInfo;
    void main(){
      mat4 m = modelMatrix;
      #ifdef USE_INSTANCING
        m = modelMatrix * instanceMatrix;
      #endif
      vec4 wp = m * vec4(position, 1.0);
      vW = wp.xyz; vN = normalize(mat3(m) * normal); vL = position; vInfo = aInfo;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const FRAG_EDIF = `
    uniform float uTime; uniform float uFocus; uniform float uRadius;
    varying vec3 vW; varying vec3 vN; varying vec3 vL; varying vec4 vInfo;
    ${FOG_GLSL}
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){
      vec3 n = normalize(vN);
      float u = abs(n.x) > abs(n.z) ? vW.z : vW.x;
      if (uRadius > 0.0) u = atan(vL.z, vL.x) * uRadius;
      float cw = mix(3.7, 2.3, vInfo.z), ch = mix(4.1, 2.9, vInfo.z);
      vec2 g = vec2(u / cw, vW.y / ch);
      vec2 cell = floor(g), f = fract(g);
      float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.24, f.y) * step(f.y, 0.76);
      float r = hash(cell + vInfo.x * 17.0);
      float dens = mix(0.34, 0.5, vInfo.z) + uFocus * 0.22;
      vec2 fw = fwidth(g);
      float aa = smoothstep(0.3, 0.75, max(fw.x, fw.y));
      win = mix(win, 0.5, aa);
      float on = mix(step(r, dens), dens, aa) * (1.0 - step(0.9, n.y));
      float blink = step(0.965, hash(cell + 3.1 + vInfo.x)) * (0.5 + 0.5 * sin(uTime * 1.3 + r * 40.0));
      on *= 1.0 - blink * 0.7;
      float tone = hash(cell.yx + 9.0);
      vec3 warm = mix(vec3(1.0, 0.52, 0.14), vec3(1.0, 0.82, 0.38), step(0.45, tone));
      warm = mix(warm, vec3(1.0, 0.93, 0.78), step(0.88, tone));
      vec3 wall = mix(vec3(0.026, 0.03, 0.05), vec3(0.06, 0.036, 0.03), vInfo.y);
      float sh = 0.55 + 0.45 * clamp(dot(n, normalize(vec3(0.3, 0.8, 0.5))), 0.0, 1.0);
      vec3 col = wall * sh;
      col += warm * win * on * (0.75 + uFocus * 0.9);
      col += vec3(1.0, 0.5, 0.16) * exp(-max(vW.y, 0.0) / 7.0) * 0.035;
      vec3 vdir = normalize(cameraPosition - vW);
      float rim = pow(1.0 - abs(dot(n, vdir)), 2.4);
      col += vec3(0.2, 0.95, 0.5) * rim * uFocus * 0.9;
      col = aplicaNiebla(col, vW);
      gl_FragColor = vec4(col, 1.0);
    }`;

  function matEdificio() {
    return new THREE.ShaderMaterial({
      vertexShader: VERT_EDIF, fragmentShader: FRAG_EDIF,
      uniforms: { uTime: U.uTime, uFog: U.uFog, uFogD: U.uFogD, uFocus: { value: 0 }, uRadius: { value: 0 } },
    });
  }

  /* ───────── cielo, luna y estrellas (siguen a la cámara) ───────── */
  const fondo = new THREE.Group();
  scene.add(fondo);
  {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(4600, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false,
        vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `varying vec3 vD;
          void main(){
            float y = vD.y;
            vec3 hor = vec3(0.075, 0.04, 0.03), mid = vec3(0.025, 0.035, 0.1), top = vec3(0.008, 0.01, 0.03);
            vec3 c = mix(hor, mid, smoothstep(-0.02, 0.28, y));
            c = mix(c, top, smoothstep(0.2, 0.85, y));
            c += vec3(0.045, 0.02, 0.012) * exp(-abs(y) * 9.0) * (0.5 + 0.5 * vD.z * -1.0);
            c = mix(c, vec3(0.03, 0.027, 0.05), smoothstep(0.0, -0.4, y));
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    );
    sky.renderOrder = -10;
    fondo.add(sky);

    const n = 1800, pos = new Float32Array(n * 3), tw = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const th = R() * Math.PI * 2, ph = Math.acos(0.04 + R() * 0.96);
      pos.set([Math.sin(ph) * Math.cos(th) * 4300, Math.cos(ph) * 4300, Math.sin(ph) * Math.sin(th) * 4300], i * 3);
      tw.set([R() * 6.28, 0.6 + R() * 2.2], i * 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.BufferAttribute(tw, 2));
    fondo.add(new THREE.Points(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: U.uTime },
      vertexShader: `attribute vec2 aT; uniform float uTime; varying float vA;
        void main(){ vA = 0.45 + 0.4 * sin(uTime * aT.y + aT.x); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = 2.2; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.8, 0.86, 1.0) * vA * smoothstep(0.5, 0.1, d), 1.0); }',
    })));

    const c = doc.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(128, 128, 18, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,248,230,1)'); gr.addColorStop(0.16, 'rgba(255,246,225,0.95)'); gr.addColorStop(0.2, 'rgba(190,205,255,0.25)'); gr.addColorStop(1, 'rgba(120,150,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), fog: false, depthWrite: false, toneMapped: false, transparent: true }));
    moon.position.set(900, 1700, -3300);
    moon.scale.setScalar(900);
    fondo.add(moon);
  }

  /* ───────── terreno ───────── */
  {
    const g = new THREE.PlaneGeometry(4200, 2400, 280, 160);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)));
    scene.add(new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: { uFog: U.uFog, uFogD: U.uFogD },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `varying vec3 vW; ${FOG_GLSL}
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec3 c = vec3(0.012, 0.014, 0.027) * (0.85 + 0.3 * hash(floor(vW.xz / 9.0)));
          float g = exp(-max(vW.y, 0.0) / 55.0) * exp(-abs(vW.z) / 280.0);
          c += vec3(0.09, 0.05, 0.022) * g * 0.7;
          gl_FragColor = vec4(aplicaNiebla(c, vW), 1.0);
        }`,
    })));
  }

  /* ───────── edificios ───────── */
  const BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const cajaG = (w, h, d, y0 = 0) => new THREE.BoxGeometry(w, h, d).translate(0, y0 + h / 2, 0);

  function instanciados(lista, escalaClase) {
    const geo = BOX.clone();
    const info = new Float32Array(lista.length * 4);
    const mesh = new THREE.InstancedMesh(geo, matEdificio(), lista.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    lista.forEach((e, i) => {
      p.set(e.x, e.y - 6, e.z); s.set(e.w, e.h + 6, e.d);
      m.compose(p, q, s); mesh.setMatrixAt(i, m);
      info.set([R() * 100, e.tint, escalaClase, e.h], i * 4);
    });
    geo.setAttribute('aInfo', new THREE.InstancedBufferAttribute(info, 4));
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  }

  /* héroes: edificios singulares, uno por caso */
  const heroes = [];
  const FORMAS = ['frustum', 'twin', 'cylinder', 'stepped', 'podium', 'box'];
  function geoHeroe(forma, w, h, d) {
    let g;
    switch (forma) {
      case 'frustum': {
        g = new THREE.BoxGeometry(w, h + 6, d).translate(0, (h + 6) / 2 - 6, 0);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) if (p.getY(i) > h * 0.4) { p.setX(i, p.getX(i) * 0.58); p.setZ(i, p.getZ(i) * 0.58); }
        g.computeVertexNormals();
        break;
      }
      case 'twin':
        g = mergeGeometries([cajaG(w * 0.42, h + 6, d, -6).translate(-w * 0.3, 0, 0), cajaG(w * 0.42, h * 0.82 + 6, d, -6).translate(w * 0.3, 0, 0), cajaG(w * 0.3, 6, d * 0.7, h * 0.55).translate(0, 0, 0)]);
        break;
      case 'cylinder': g = new THREE.CylinderGeometry(w * 0.46, w * 0.5, h + 6, 28, 1).translate(0, (h + 6) / 2 - 6, 0); break;
      case 'stepped': g = mergeGeometries([cajaG(w, h * 0.55 + 6, d, -6), cajaG(w * 0.66, h * 0.3, d * 0.66, h * 0.55), cajaG(w * 0.34, h * 0.15, d * 0.34, h * 0.85)]); break;
      case 'podium': g = mergeGeometries([cajaG(w * 1.45, h * 0.18 + 6, d * 1.45, -6), cajaG(w * 0.72, h, d * 0.72, h * 0.18)]); break;
      default: g = cajaG(w, h + 6, d, -6);
    }
    return g;
  }
  function crearHeroe({ x, z, w, h, d, forma, tint = 0, clase = 0, y }) {
    const g = geoHeroe(forma, w, h, d);
    const n = g.attributes.position.count, info = new Float32Array(n * 4), seed = R() * 100;
    for (let i = 0; i < n; i++) info.set([seed, tint, clase, h], i * 4);
    g.setAttribute('aInfo', new THREE.BufferAttribute(info, 4));
    const mat = matEdificio();
    if (forma === 'cylinder') mat.uniforms.uRadius.value = w * 0.5;
    const mesh = new THREE.Mesh(g, mat);
    mesh.position.set(x, y ?? H(x, z), z);
    mesh.frustumCulled = false;
    scene.add(mesh);
    const hr = { mesh, mat, x, z, y: mesh.position.y, w, h, d, foco: 0 };
    heroes.push(hr);
    return hr;
  }

  /* avenida y calles del centro: corredor despejado de |z| < 110 */
  const CALLES = [
    { axis: 0, c: 0, a: -430, b: 430 }, { axis: 0, c: -56, a: -330, b: 330 }, { axis: 0, c: 56, a: -330, b: 330 },
    { axis: 1, c: -210, a: -100, b: 100 }, { axis: 1, c: -72, a: -100, b: 100 }, { axis: 1, c: 72, a: -100, b: 100 }, { axis: 1, c: 210, a: -100, b: 100 },
  ];

  /* 10 héroes clínicos a lo largo de la avenida */
  const clinicos = paradas.filter((p) => p.kind === 'caso' && p.cap === 'clinica');
  const propios = paradas.filter((p) => p.kind === 'caso' && p.cap === 'propios');
  clinicos.forEach((p, i) => {
    const x = -215 + i * 47.8;
    const lado = i % 2 ? 1 : -1;
    const h = 92 + ((i * 37) % 5) * 15 + (i % 3) * 10;
    p.hero = crearHeroe({ x, z: lado * 50, w: 24 + (i % 3) * 3, h, d: 24 + ((i + 1) % 3) * 3, forma: FORMAS[i % FORMAS.length], tint: (i % 3) * 0.2 });
  });

  /* centro: manzanas a ambos lados del corredor */
  {
    const lista = [];
    for (let x = -430; x <= 430; x += 15) {
      for (const zz of [1, -1]) {
        for (let k = 0; k < 11; k++) {
          const z = zz * (118 + k * 15 + R() * 4), xx = x + (R() - 0.5) * 5;
          if (R() < 0.12) continue;
          const dist = Math.hypot(xx, z * 0.8);
          const hh = 14 + Math.pow(R(), 2.2) * clamp(130 - dist * 0.16 - k * 6, 12, 125);
          lista.push({ x: xx, y: H(xx, z), z, w: 8 + R() * 6, d: 8 + R() * 6, h: hh, tint: R() < 0.2 ? 0.7 : 0 });
        }
      }
    }
    // podios bajos pegados a la avenida
    for (let x = -430; x <= 430; x += 22) {
      for (const zz of [1, -1]) {
        if (R() < 0.35) continue;
        const xx = x + (R() - 0.5) * 5, z = zz * (96 + R() * 8);
        if (clinicos.some((p) => Math.hypot(p.hero.x - xx, p.hero.z - z) < 38)) continue;
        lista.push({ x: xx, y: 0, z, w: 11 + R() * 6, d: 9 + R() * 4, h: 8 + R() * 14, tint: R() < 0.3 ? 0.6 : 0 });
      }
    }
    instanciados(lista, 0);
    // balizas rojas en las más altas
    const altas = lista.filter((e) => e.h > 88);
    const bp = new Float32Array(altas.length * 3);
    altas.forEach((e, i) => bp.set([e.x, e.y + e.h + 2.5, e.z], i * 3));
    const bg = new THREE.BufferGeometry();
    const all = new Float32Array(bp.length + heroes.length * 3);
    all.set(bp);
    heroes.forEach((hr, i) => all.set([hr.x, hr.y + hr.h + 3, hr.z], bp.length + i * 3));
    bg.setAttribute('position', new THREE.BufferAttribute(all, 3));
    scene.add(new THREE.Points(bg, puntos({ size: 2.2, color: [1, 0.12, 0.08], pulso: true })));
  }

  /* ───────── puntos luminosos (laderas, farolas, tráfico) ───────── */
  function puntos({ size, color, pulso = false, atributos = false }) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: U.uTime, uScale: U.uScale, uFog: U.uFog, uFogD: U.uFogD, uSize: { value: size }, uColor: { value: new THREE.Color(...color) }, uPulso: { value: pulso ? 1 : 0 } },
      vertexShader: `uniform float uTime, uScale, uSize, uPulso; uniform vec3 uColor; uniform float uFogD; uniform vec3 uFog;
        ${atributos ? 'attribute vec4 aP; attribute vec3 aC;' : ''} varying vec3 vC; varying float vF;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float tw = ${atributos ? '0.72 + 0.28 * sin(uTime * aP.y + aP.x * 6.283)' : '1.0'};
          tw *= mix(1.0, 0.25 + 0.75 * step(0.0, sin(uTime * 2.4 + position.x * 0.13)), uPulso);
          vC = ${atributos ? 'aC' : 'uColor'} * tw;
          float d = -mv.z;
          vF = 1.0 - exp(-pow(d * uFogD, 2.0));
          gl_PointSize = clamp(uSize * ${atributos ? 'aP.z' : '1.0'} * uScale / d, 1.2, 5.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `varying vec3 vC; varying float vF;
        void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC * a * (1.0 - vF * 0.75), 1.0); }`,
    });
  }

  /* luces de las comunas: racimos que trepan por las laderas */
  {
    const pos = [], P = [], C = [];
    const paleta = [[1.0, 0.46, 0.13], [1.05, 0.72, 0.28], [0.95, 0.82, 0.55], [1.1, 0.38, 0.1], [0.7, 0.8, 0.95]];
    const racimos = 120;
    for (let k = 0; k < racimos; k++) {
      const lado = R() < 0.55 ? -1 : 1;
      const cz = lado * (130 + Math.pow(R(), 0.85) * 520), cx = (R() - 0.5) * 2800;
      const n = 140 + Math.floor(R() * 330), sx = 26 + R() * 50, sz = 12 + R() * 26;
      const paletaK = R();
      for (let i = 0; i < n; i++) {
        const gx = (R() + R() + R() - 1.5) * sx, gz = (R() + R() + R() - 1.5) * sz;
        const x = cx + gx, z = cz + gz;
        if (Math.abs(z) < 118 && Math.abs(x) < 470) continue;
        pos.push(x, H(x, z) + 1.2 + R() * 4, z);
        P.push(R() * 6.28, 0.5 + R() * 2.4, 0.7 + R() * 1.1, 0);
        const c = paleta[paletaK < 0.6 ? (R() < 0.7 ? 0 : 1) : Math.floor(R() * paleta.length)];
        C.push(...c);
      }
    }
    // el corredor del centro: farolas a lo largo de las calles
    for (const c of CALLES) {
      for (let t = c.a; t <= c.b; t += 12) for (const off of [-7.5, 7.5]) {
        const x = c.axis === 0 ? t : c.c + off, z = c.axis === 0 ? c.c + off : t;
        pos.push(x, 9, z); P.push(R() * 6.28, 0.3, 0.8, 0); C.push(1.1, 0.55, 0.2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aP', new THREE.Float32BufferAttribute(P, 4));
    g.setAttribute('aC', new THREE.Float32BufferAttribute(C, 3));
    const pts = new THREE.Points(g, puntos({ size: 1.9, color: [1, 1, 1], atributos: true }));
    pts.frustumCulled = false;
    scene.add(pts);
  }

  /* casitas de la ladera (racimos con ventanas) */
  {
    const lista = [];
    for (let k = 0; k < 120; k++) {
      const lado = R() < 0.55 ? -1 : 1;
      const cz = lado * (150 + Math.pow(R(), 0.9) * 420), cx = (R() - 0.5) * 2200;
      const n = 28 + Math.floor(R() * 60);
      for (let i = 0; i < n; i++) {
        const x = Math.round((cx + (R() - 0.5) * 120) / 8) * 8, z = Math.round((cz + (R() - 0.5) * 60) / 8) * 8;
        if (Math.hypot(x - CIMA.x, z - CIMA.z) < 140) continue;
        lista.push({ x, y: H(x, z), z, w: 5 + R() * 3, d: 5 + R() * 3, h: 3.5 + R() * 6, tint: 0.55 + R() * 0.45 });
      }
    }
    instanciados(lista, 1);
  }

  /* tráfico por las calles del centro */
  {
    const n = 900, road = new Float32Array(n * 4), mov = new Float32Array(n * 4), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const c = CALLES[Math.floor(R() * CALLES.length)], dir = R() < 0.5 ? 1 : -1;
      road.set([c.axis, c.c, c.a, c.b], i * 4);
      mov.set([R(), (0.012 + R() * 0.02) * (c.b - c.a > 300 ? 0.8 : 1.6), dir, dir * (2.2 + R() * 2)], i * 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRoad', new THREE.BufferAttribute(road, 4));
    g.setAttribute('aMove', new THREE.BufferAttribute(mov, 4));
    const t = new THREE.Points(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: U.uTime, uScale: U.uScale, uFog: U.uFog, uFogD: U.uFogD },
      vertexShader: `uniform float uTime, uScale, uFogD; attribute vec4 aRoad, aMove; varying vec3 vC; varying float vF;
        void main(){
          float u = fract(aMove.x + uTime * aMove.y * aMove.z);
          float along = mix(aRoad.z, aRoad.w, u);
          vec3 p = aRoad.x < 0.5 ? vec3(along, 1.1, aRoad.y + aMove.w) : vec3(aRoad.y + aMove.w, 1.1, along);
          vC = aMove.z > 0.0 ? vec3(1.0, 0.9, 0.65) : vec3(1.0, 0.14, 0.07);
          vec4 mv = viewMatrix * vec4(p, 1.0); float d = -mv.z;
          vF = 1.0 - exp(-pow(d * uFogD, 2.0));
          gl_PointSize = clamp(1.4 * uScale / d, 1.2, 4.5);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: 'varying vec3 vC; varying float vF; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC * a * (1.0 - vF * 0.75), 1.0); }',
    }));
    t.frustumCulled = false;
    scene.add(t);
  }

  /* ───────── Metrocable: sube del valle a la cima ───────── */
  const cablePts = [];
  for (let i = 0; i <= 7; i++) {
    const t = i / 7;
    const x = lerp(-250, CIMA.x + 55, t) + Math.sin(t * 3.4) * 22, z = lerp(-118, CIMA.z + 40, t);
    cablePts.push(new THREE.Vector3(x, Math.max(H(x, z), t > 0.9 ? PLAT : 0) + 17 + 9 * Math.sin(t * Math.PI), z));
  }
  const cable = new THREE.CatmullRomCurve3(cablePts, false, 'centripetal');
  {
    const tubo = new THREE.Mesh(
      new THREE.TubeGeometry(cable, 260, 0.32, 5, false),
      new THREE.ShaderMaterial({ uniforms: { uFog: U.uFog, uFogD: U.uFogD }, vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }', fragmentShader: `varying vec3 vW; ${FOG_GLSL} void main(){ gl_FragColor = vec4(aplicaNiebla(vec3(0.34, 0.37, 0.45), vW), 1.0); }` }),
    );
    scene.add(tubo);
    // pilonas
    const pil = [];
    for (let i = 1; i < 14; i++) {
      const p = cable.getPointAt(i / 14);
      const gy = H(p.x, p.z);
      pil.push({ x: p.x, y: gy, z: p.z, w: 1.6, d: 1.6, h: p.y - gy + 2, tint: 0 });
    }
    const pm = new THREE.InstancedMesh(BOX.clone(), new THREE.MeshBasicMaterial({ color: 0x2a2e3a }), pil.length);
    const mm = new THREE.Matrix4();
    pil.forEach((e, i) => { mm.compose(new THREE.Vector3(e.x, e.y - 3, e.z), new THREE.Quaternion(), new THREE.Vector3(e.w, e.h + 3, e.d)); pm.setMatrixAt(i, mm); });
    scene.add(pm);
    const lam = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pil.flatMap((e) => [e.x, e.y + e.h - 1, e.z]), 3));
    scene.add(new THREE.Points(lam, puntos({ size: 1.3, color: [1.0, 0.5, 0.12], pulso: true })));
  }
  const cabinas = new THREE.InstancedMesh(new THREE.BoxGeometry(6.5, 4.6, 5.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 0.8, 0.4), toneMapped: false }), 20);
  cabinas.frustumCulled = false;
  scene.add(cabinas);
  const dummy = new THREE.Object3D(), tang = new THREE.Vector3();
  function mueveCabinas(t) {
    for (let i = 0; i < 20; i++) {
      const sube = i < 10;
      const u = (((i % 10) / 10 + t * 0.011 * (sube ? 1 : -1)) % 1 + 1) % 1;
      const p = cable.getPointAt(u);
      cable.getTangentAt(u, tang);
      dummy.position.set(p.x + (sube ? 3.2 : -3.2) * tang.z, p.y - 5.4, p.z - (sube ? 3.2 : -3.2) * tang.x);
      dummy.rotation.set(0, Math.atan2(tang.x, tang.z), Math.sin(t * 1.3 + i) * 0.04);
      dummy.updateMatrix();
      cabinas.setMatrixAt(i, dummy.matrix);
    }
    cabinas.instanceMatrix.needsUpdate = true;
  }

  /* héroes de la ladera: uno por proyecto propio, junto al cable */
  propios.forEach((p, i) => {
    const u = 0.17 + i * 0.095;
    const c = cable.getPointAt(u), tg = cable.getTangentAt(u);
    const lado = i % 2 ? 1 : -1;
    const x = c.x + lado * tg.z * 52, z = c.z - lado * tg.x * 52;
    p.u = u;
    p.hero = crearHeroe({ x, z, w: 15 + (i % 3) * 3, h: 17 + ((i * 5) % 4) * 5, d: 15 + ((i + 1) % 3) * 2, forma: FORMAS[(i + 2) % FORMAS.length], tint: 0.8, clase: 1 });
  });

  /* ───────── la cima: el taller y sus estaciones ───────── */
  const estaciones = {};
  {
    const Y = PLAT;
    const nave = new THREE.Group();
    nave.position.set(CIMA.x, Y, CIMA.z - 8);
    const W = 72, D = 34, Hh = 18;
    const dientes = [];
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Shape(); const tw = W / 5, th = 12;
      s.moveTo(0, 0); s.lineTo(tw, 0); s.lineTo(tw, th); s.lineTo(0, 0);
      const e = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false });
      e.translate(-W / 2 + i * tw, Hh, -D / 2);
      dientes.push(e);
    }
    const cuerpo = cajaG(W, Hh + 6, D, -6);
    const g = mergeGeometries([cuerpo, ...dientes].map((e) => (e.index ? e.toNonIndexed() : e)));
    const n = g.attributes.position.count, info = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) info.set([R() * 100, 0.4, 0, Hh], i * 4);
    g.setAttribute('aInfo', new THREE.BufferAttribute(info, 4));
    const mat = matEdificio();
    const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false;
    nave.add(mesh);
    const puerta = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.46, Hh * 0.72), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 0.7, 0.25), toneMapped: false }));
    puerta.position.set(-W * 0.18, Hh * 0.38, D / 2 + 0.1);
    nave.add(puerta);
    scene.add(nave);
    estaciones.taller = { mats: [mat], punto: new THREE.Vector3(CIMA.x, Y, CIMA.z - 8), alto: Hh + 12 };

    const tablero = (x, z, w, h, dens, clase = 0) => {
      const geo = mergeGeometries([cajaG(w, h, 1.4, 5).translate(0, 0, 0), cajaG(1.2, 5, 1.2, 0).translate(-w * 0.38, 0, 0), cajaG(1.2, 5, 1.2, 0).translate(w * 0.38, 0, 0)]);
      const nn = geo.attributes.position.count, inf = new Float32Array(nn * 4);
      for (let i = 0; i < nn; i++) inf.set([R() * 100 + dens, 0.2, clase, h], i * 4);
      geo.setAttribute('aInfo', new THREE.BufferAttribute(inf, 4));
      const m = matEdificio();
      const ms = new THREE.Mesh(geo, m); ms.position.set(x, Y, z); ms.frustumCulled = false; scene.add(ms);
      return { mats: [m], punto: new THREE.Vector3(x, Y, z), alto: h + 8 };
    };
    estaciones.tray = tablero(CIMA.x - 46, CIMA.z + 32, 24, 14, 1);
    estaciones.trab = tablero(CIMA.x - 12, CIMA.z + 42, 22, 14, 2);
    // banco del "cómo lidero": mesa baja con una lámpara
    {
      const geo = mergeGeometries([cajaG(20, 4.5, 8, 0), cajaG(0.7, 12, 0.7, 4.5).translate(6, 0, 0)]);
      const nn = geo.attributes.position.count, inf = new Float32Array(nn * 4);
      for (let i = 0; i < nn; i++) inf.set([R() * 100, 0.5, 0, 6], i * 4);
      geo.setAttribute('aInfo', new THREE.BufferAttribute(inf, 4));
      const m = matEdificio(); const ms = new THREE.Mesh(geo, m); ms.position.set(CIMA.x + 24, Y, CIMA.z + 36); ms.frustumCulled = false; scene.add(ms);
      estaciones.lidero = { mats: [m], punto: new THREE.Vector3(CIMA.x + 24, Y, CIMA.z + 36), alto: 14 };
    }
    estaciones.stack = tablero(CIMA.x + 54, CIMA.z + 24, 26, 15, 3);

    // farolas de la plataforma
    const fp = [];
    for (let a = 0; a < 26; a++) { const t = (a / 26) * Math.PI * 2; fp.push(CIMA.x + Math.cos(t) * (46 + (a % 2) * 20), Y + 7, CIMA.z + Math.sin(t) * (44 + (a % 2) * 18)); }
    const fg = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
    scene.add(new THREE.Points(fg, puntos({ size: 2.4, color: [1.1, 0.6, 0.2] })));
    const halo = new THREE.Mesh(new THREE.CircleGeometry(95, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.03, 0.018, 0.008), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.set(CIMA.x, Y + 0.6, CIMA.z);
    scene.add(halo);
  }

  /* cartelera de la llegada */
  const cartel = { x: CIMA.x + 98, z: CIMA.z + 66, rot: 0.62 };
  {
    const c = doc.createElement('canvas'); c.width = 1024; c.height = 560;
    const dibuja = () => {
      const x = c.getContext('2d');
      x.fillStyle = '#f4ead2'; x.fillRect(0, 0, 1024, 560);
      x.fillStyle = '#0a0a0a'; x.fillRect(28, 28, 968, 504);
      x.fillStyle = '#f2b705'; x.font = '700 40px Geist, system-ui, sans-serif'; x.textBaseline = 'alphabetic';
      x.fillText('MEDELLÍN · COLOMBIA', 70, 112);
      x.fillStyle = '#f4ead2'; x.font = '800 118px Geist, system-ui, sans-serif';
      x.fillText('Iván', 70, 262); x.fillText('Santander', 70, 384);
      x.fillStyle = '#34d17a'; x.font = '600 36px Geist Mono, monospace';
      x.fillText('TECH LEAD · TECHNICAL PRODUCT OWNER', 70, 468);
      tex.needsUpdate = true;
    };
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    dibuja(); doc.fonts && doc.fonts.ready.then(dibuja);
    const g = new THREE.Group();
    const Y = PLAT;
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(52, 28.4), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0.95, 0.92, 0.85) }));
    cara.position.y = Y + 26;
    const marco = new THREE.Mesh(new THREE.BoxGeometry(54.6, 31, 1.6), new THREE.MeshBasicMaterial({ color: 0x0d0f16 }));
    marco.position.set(0, Y + 26, -1.2);
    const pata = (dx) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2, 14, 2), new THREE.MeshBasicMaterial({ color: 0x1b1e28 })); m.position.set(dx, Y + 7, -1.6); return m; };
    g.add(marco, cara, pata(-18), pata(18));
    g.position.set(cartel.x, 0, cartel.z); g.rotation.y = cartel.rot;
    scene.add(g);
    cartel.punto = new THREE.Vector3(cartel.x, Y + 26, cartel.z);
  }

  /* haz de luz verde: marca el edificio en foco */
  const haz = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 520, 20, 1, true).translate(0, 260, 0),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uOn: { value: 0 } },
      vertexShader: 'varying float vY; void main(){ vY = position.y / 520.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uOn; varying float vY; void main(){ float a = pow(1.0 - vY, 1.6) * uOn; gl_FragColor = vec4(vec3(0.12, 0.6, 0.32) * a * 0.55, a * 0.55); }',
    }),
  );
  haz.visible = false; haz.frustumCulled = false;
  scene.add(haz);

  /* ───────── cámara: una pose por parada ───────── */
  const UP = new THREE.Vector3(0, 1, 0);
  const poses = [];
  function pose(pos, mira, desplaza = 0.16, fov = 46, claveSuelo = true) {
    pos = pos.clone();
    if (claveSuelo) pos.y = Math.max(pos.y, H(pos.x, pos.z) + 22);
    const f = mira.clone().sub(pos).normalize();
    const right = new THREE.Vector3().crossVectors(f, UP).normalize();
    const up = new THREE.Vector3().crossVectors(right, f).normalize();
    const dist = mira.distanceTo(pos), l = mira.clone();
    if (S.vertical) l.addScaledVector(up, -desplaza * dist * 1.15); else l.addScaledVector(right, desplaza * dist);
    return { p: pos, l, fov };
  }
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  function construyePoses() {
    poses.length = 0;
    const heroPose = (hr) => {
      const c = V3(hr.x, hr.y + hr.h * 0.5, hr.z);
      const lado = hr.z < 0 ? 1 : -1; // la cámara va por el lado contrario de la avenida
      return pose(V3(hr.x - 158, hr.y + hr.h * 0.58 + 50, lado * 30), c, 0.2, 48);
    };
    let ic = 0, ip = 0;
    for (const st of paradas) {
      switch (st.id) {
        case 'p-inicio': poses.push(pose(V3(120, 470, 1060), V3(-20, 30, -60), -0.2, 44)); break;
        case 'p-clinica': poses.push(pose(V3(-430, 170, 12), V3(-70, 75, 0), 0.12)); break;
        case 'p-propios': { const c0 = cable.getPointAt(0.04); poses.push(pose(V3(c0.x + 70, c0.y + 36, c0.z + 80), cable.getPointAt(0.34), 0.15)); break; }
        case 'p-taller': poses.push(pose(V3(CIMA.x - 90, PLAT + 62, CIMA.z + 160), estaciones.taller.punto.clone().add(V3(0, 12, 0)), 0.18)); break;
        case 'taller-trayectoria': poses.push(stationPose(estaciones.tray)); break;
        case 'taller-trabajo': poses.push(stationPose(estaciones.trab)); break;
        case 'taller-lidero': poses.push(stationPose(estaciones.lidero)); break;
        case 'taller-stack': poses.push(stationPose(estaciones.stack)); break;
        case 'p-contacto': poses.push(pose(V3(cartel.x + 70, PLAT + 56, cartel.z + 120), cartel.punto, 0.2)); break;
        default:
          if (st.cap === 'clinica') poses.push(heroPose(st.hero));
          else {
            const hr = st.hero, i = ip++;
            const cp = cable.getPointAt(clamp(st.u - 0.075, 0, 1));
            poses.push(pose(V3(cp.x, cp.y + 30, cp.z), V3(hr.x, hr.y + hr.h * 0.5 + 4, hr.z), 0.2, 52, false));
          }
      }
    }
  }
  function stationPose(e) {
    return pose(V3(e.punto.x + 30, e.punto.y + 40, e.punto.z + 105), V3(e.punto.x, e.punto.y + e.alto * 0.5, e.punto.z), 0.2, 50);
  }

  /* ───────── scroll → cámara ───────── */
  const S = { calidad: 1, dpr: 1, W: 1, H: 1, vertical: false, segs: [], total: 0, top: 0, cur: 0, foco: -1, ultimo: 0, destino: null, t0: performance.now() };
  const stops = paradas.map((p) => ({ ...p, el: doc.getElementById(p.id) }));
  const primeraDeCap = {};
  stops.forEach((s, i) => { if (!(s.cap in primeraDeCap)) primeraDeCap[s.cap] = i; });

  function medir() {
    S.W = escena.clientWidth || innerWidth;
    S.H = escena.clientHeight || innerHeight;
    S.vertical = S.W / S.H < 0.95;
    const dpr = Q_FIJA || Math.min(devicePixelRatio || 1, S.W < 900 ? 1.35 : 1.6) * S.calidad;
    S.dpr = dpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(S.W, S.H, false);
    comp.setPixelRatio(dpr);
    comp.setSize(S.W, S.H);
    bloom.resolution.set(S.W * dpr * 0.5, S.H * dpr * 0.5);
    camera.aspect = S.W / S.H;
    camera.updateProjectionMatrix();
    construyePoses();
    let y = 0;
    S.segs = [];
    stops.forEach((st, i) => {
      const h = st.hold * S.H;
      S.segs.push({ t: 'hold', i, a: y, b: y + h });
      y += h;
      if (i < stops.length - 1) {
        const d = poses[i].p.distanceTo(poses[i + 1].p);
        const m = (0.6 + Math.min(1.0, d / 900)) * S.H;
        S.segs.push({ t: 'move', i, a: y, b: y + m });
        y += m;
      }
    });
    S.total = y;
    pista.style.height = `${Math.ceil(y + S.H)}px`;
    S.top = pista.getBoundingClientRect().top + scrollY;
  }

  const posC = new THREE.Vector3(), lookC = new THREE.Vector3(), ctrl = new THREE.Vector3();
  function colocaCamara(py, t) {
    const y = clamp(py, 0, S.total);
    const seg = S.segs.find((s) => y <= s.b) || S.segs[S.segs.length - 1];
    const A = poses[seg.i];
    let idx, fov, sway = 1;
    if (seg.t === 'hold') {
      posC.copy(A.p); lookC.copy(A.l); fov = A.fov; idx = seg.i;
    } else {
      const B = poses[seg.i + 1];
      const e = ease(clamp((y - seg.a) / (seg.b - seg.a), 0, 1));
      const d = A.p.distanceTo(B.p);
      ctrl.copy(A.p).add(B.p).multiplyScalar(0.5);
      ctrl.y += Math.min(220, d * 0.3);
      const m = 1 - e;
      posC.set(m * m * A.p.x + 2 * m * e * ctrl.x + e * e * B.p.x, m * m * A.p.y + 2 * m * e * ctrl.y + e * e * B.p.y, m * m * A.p.z + 2 * m * e * ctrl.z + e * e * B.p.z);
      lookC.lerpVectors(A.l, B.l, e);
      fov = lerp(A.fov, B.fov, e) + Math.min(16, d / 40) * Math.sin(Math.PI * e);
      idx = e < 0.1 ? seg.i : e > 0.9 ? seg.i + 1 : -1;
      sway = 1 - Math.sin(Math.PI * e) * 0.8;
    }
    posC.x += Math.sin(t * 0.33) * 1.6 * sway; posC.y += Math.sin(t * 0.27) * 0.9 * sway; posC.z += Math.cos(t * 0.31) * 1.6 * sway;
    camera.position.copy(posC);
    camera.lookAt(lookC);
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    U.uScale.value = (S.H * renderer.getPixelRatio()) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    fondo.position.copy(camera.position);
    return idx;
  }

  /* ───────── foco ───────── */
  function objetoDe(st) {
    if (st.hero) return { mats: [st.hero.mat], punto: V3(st.hero.x, st.hero.y, st.hero.z), alto: st.hero.h };
    if (st.id === 'p-taller') return estaciones.taller;
    if (st.id === 'taller-trayectoria') return estaciones.tray;
    if (st.id === 'taller-trabajo') return estaciones.trab;
    if (st.id === 'taller-lidero') return estaciones.lidero;
    if (st.id === 'taller-stack') return estaciones.stack;
    return null;
  }
  stops.forEach((st) => { st.obj = objetoDe(st); });
  const todos = new Set(); stops.forEach((s) => s.obj && s.obj.mats.forEach((m) => todos.add(m)));
  let hazOn = 0;

  function enFoco(i) {
    if (i === S.foco) return;
    const ant = stops[S.foco];
    if (ant && ant.el) ant.el.classList.remove('is-foco');
    S.foco = i;
    if (i < 0) return;
    S.ultimo = i;
    const st = stops[i];
    st.el && st.el.classList.add('is-foco');
    const n = st.el && st.el.querySelector('.caso__n');
    hudTxt.textContent = `${NOMBRES[st.cap]}${n ? ` · ${n.textContent}` : ''}`;
    navLinks.forEach((a) => (a.dataset.cap === st.cap ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    if (S.destino === i) S.destino = null;
  }

  /* ───────── bucle ───────── */
  let lenis = null, ultT = performance.now(), activo = true;
  if (window.Lenis) lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1.1 });

  /* calidad adaptativa: si el equipo va justo, baja la resolución interna antes que perder fluidez */
  let acum = 0, nF = 0, enfria = 0;
  function adapta(dt) {
    if (Q_FIJA || DBG) return;
    acum += dt; nF++; enfria = Math.max(0, enfria - dt);
    if (nF < 40) return;
    const media = acum / nF; acum = 0; nF = 0;
    if (enfria > 0) return;
    if (media > 0.034 && S.calidad > 0.45) { S.calidad = Math.max(0.45, S.calidad * 0.8); enfria = 2.5; aplicaCalidad(); }
    else if (media < 0.0185 && S.calidad < 1) { S.calidad = Math.min(1, S.calidad * 1.12); enfria = 4; aplicaCalidad(); }
  }
  function aplicaCalidad() {
    const dpr = Math.min(devicePixelRatio || 1, S.W < 900 ? 1.35 : 1.6) * S.calidad;
    S.dpr = dpr;
    renderer.setPixelRatio(dpr); comp.setPixelRatio(dpr); comp.setSize(S.W, S.H);
    bloom.resolution.set(S.W * dpr * 0.5, S.H * dpr * 0.5);
  }

  /* al soltar el scroll entre dos paradas, termina el viaje hacia la siguiente (o vuelve a la anterior) */
  let yAnt = -1, tMov = 0, dirMov = 1;
  function ajusta(now) {
    if (scrollY !== yAnt) { dirMov = scrollY > yAnt ? 1 : -1; yAnt = scrollY; tMov = now; return; }
    if (DBG || S.destino != null || now - tMov < 230 || tMov === 0) return;
    const y = clamp(scrollY - S.top, 0, S.total);
    const seg = S.segs.find((s) => y <= s.b);
    if (!seg || seg.t !== 'move') return;
    irA(dirMov > 0 ? seg.i + 1 : seg.i);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (doc.hidden || !activo) return;
    const dt = Math.min(0.05, (now - ultT) / 1000);
    ultT = now;
    lenis && lenis.raf(now);
    const t = (now - S.t0) / 1000;
    U.uTime.value = t;
    S.cur = DBG ? scrollY : S.cur + (scrollY - S.cur) * (1 - Math.exp(-dt * 16));
    ajusta(now);
    adapta(dt);
    const idx = colocaCamara(S.cur - S.top, t);
    enFoco(idx);
    // brillo de foco y haz
    const objetivoFoco = S.foco >= 0 ? stops[S.foco].obj : null;
    for (const m of todos) {
      const meta = objetivoFoco && objetivoFoco.mats.includes(m) ? 1 : 0;
      const u = m.uniforms.uFocus;
      u.value += (meta - u.value) * (1 - Math.exp(-dt * 6));
    }
    const conHaz = objetivoFoco && (stops[S.foco].kind === 'caso' || stops[S.foco].kind === 'taller') ? 1 : 0;
    hazOn += (conHaz - hazOn) * (1 - Math.exp(-dt * 5));
    if (objetivoFoco) haz.position.set(objetivoFoco.punto.x, objetivoFoco.punto.y + objetivoFoco.alto, objetivoFoco.punto.z);
    haz.material.uniforms.uOn.value = hazOn;
    haz.visible = hazOn > 0.01;
    mueveCabinas(t);
    comp.render();
  }

  /* ───────── navegación ───────── */
  const holdDe = (i) => S.segs.find((s) => s.t === 'hold' && s.i === i);
  function irA(i) {
    i = clamp(i, 0, stops.length - 1);
    S.destino = i;
    const y = S.top + holdDe(i).a + 2;
    if (DBG) { scrollTo({ top: y, behavior: 'instant' }); S.destino = null; return; }
    if (lenis) lenis.scrollTo(y, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else scrollTo({ top: y, behavior: 'smooth' });
  }
  const actual = () => (S.destino != null ? S.destino : S.ultimo);
  function teclas(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const interactivo = e.target && e.target.closest && e.target.closest('a, button, input, textarea, select');
    let d = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') d = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') d = -1;
    else if (e.key === ' ' && !interactivo) d = e.shiftKey ? -1 : 1;
    else if (e.key === 'Home') { e.preventDefault(); irA(0); return; }
    else if (e.key === 'End') { e.preventDefault(); irA(stops.length - 1); return; }
    if (!d) return;
    e.preventDefault();
    irA(actual() + d);
  }
  addEventListener('keydown', teclas);
  addEventListener('wheel', () => { S.destino = null; }, { passive: true });
  addEventListener('touchstart', () => { S.destino = null; }, { passive: true });
  doc.addEventListener('focusin', (e) => {
    const art = e.target.closest && e.target.closest('.parada');
    const i = stops.findIndex((s) => s.el === art);
    if (i >= 0 && i !== S.ultimo && S.destino == null) irA(i);
  });
  navLinks.forEach((a) => a.addEventListener('click', (e) => { const cap = a.dataset.cap; if (cap in primeraDeCap) { e.preventDefault(); irA(primeraDeCap[cap]); } }));
  hud.querySelector('#ant').addEventListener('click', () => irA(actual() - 1));
  hud.querySelector('#sig').addEventListener('click', () => irA(actual() + 1));
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const f = S.ultimo; medir(); scrollTo({ top: S.top + holdDe(f).a + 2, behavior: 'instant' }); S.cur = scrollY; }, 160); });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); activo = false; html.classList.remove('modo-mundo'); hud.hidden = true; pista.style.height = ''; });
  doc.fonts && doc.fonts.ready.then(() => { medir(); });

  /* ───────── arranque ───────── */
  html.classList.add('modo-mundo');
  hud.hidden = false;
  medir();
  S.cur = scrollY;
  const ini = colocaCamara(S.cur - S.top, 0);
  enFoco(ini < 0 ? 0 : ini);
  if (location.hash) {
    const h = location.hash.slice(1);
    const i = stops.findIndex((s) => s.id === h || s.id === `p-${h}`);
    if (i >= 0) irA(i); else if (h in primeraDeCap) irA(primeraDeCap[h]);
  }
  if (DBG) window.__mundo = { irA, stops, S, camera, poses };
  requestAnimationFrame(frame);
  html.classList.add('mundo-listo');
}
