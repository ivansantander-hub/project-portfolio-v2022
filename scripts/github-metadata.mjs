/**
 * github-metadata.mjs
 *
 * Aplica descripción y topics a los repos de GitHub. Los repos hoy no tienen
 * ninguna de las dos cosas, y es la primera impresión de cualquier reclutador
 * técnico que abra el perfil.
 *
 * El token lo pones tú en el entorno y no se escribe en ningún archivo:
 *
 *   # PowerShell
 *   $env:GITHUB_TOKEN = "ghp_..."
 *   node scripts/github-metadata.mjs --dry-run     # ver qué haría
 *   node scripts/github-metadata.mjs               # aplicarlo
 *
 *   # Git Bash
 *   GITHUB_TOKEN=ghp_... node scripts/github-metadata.mjs --dry-run
 *
 * El token necesita scope `repo` (o `public_repo` si solo son públicos).
 * Crear en: https://github.com/settings/tokens
 *
 * Las descripciones salen de los README reales de cada repo, no están inventadas.
 */

const OWNER = 'ivansantander-hub';
const API = 'https://api.github.com';

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const dryRun = process.argv.includes('--dry-run');

if (!token && !dryRun) {
  console.error('\n  Falta GITHUB_TOKEN en el entorno.');
  console.error('  Corre con --dry-run para ver los cambios sin token.\n');
  process.exit(1);
}

/* ── Repos propios: descripción + topics ──────────────────────────────────── */
const repos = {
  'mini-astro': {
    description:
      'Generador de sitios estáticos con Atomic Design y valores por defecto seguros. Una dependencia, cero runtime en el navegador.',
    topics: ['static-site-generator', 'ssg', 'atomic-design', 'html', 'zero-javascript', 'nodejs'],
  },
  'blog-26': {
    description:
      'Blog y CMS propio en Astro con SSR: editor visual, borradores, historial de versiones con diff, imágenes en R2 y analítica sin terceros.',
    topics: ['astro', 'cms', 'postgresql', 'cloudflare-r2', 'typescript', 'ssr'],
  },
  'prisma-core': {
    description:
      'CRUD genérico por entidad generado desde el schema de Prisma con un solo comando sync. Next.js 16, MUI X Data Grid Pro y Atomic Design.',
    topics: ['prisma', 'nextjs', 'code-generation', 'crud', 'atomic-design', 'typescript'],
  },
  'po-master': {
    description:
      'Plataforma de Technical Product Owner: enriquece tareas de Notion con análisis técnico de GitLab usando la API de Claude.',
    topics: ['notion-api', 'gitlab', 'claude-api', 'product-management', 'automation', 'typescript'],
  },
  'flipper-idea': {
    description:
      'Subo — MVP de una app de transformación financiera personal gamificada. Next.js 16, App Router, React 19, Server Actions.',
    topics: ['nextjs', 'react', 'fintech', 'gamification', 'mvp', 'typescript'],
  },
  'scrum-poker': {
    description:
      'Planning poker en tiempo real. Monorepo con backend NestJS y frontend, autenticación, panel de administración y despliegue con Docker.',
    topics: ['nestjs', 'monorepo', 'planning-poker', 'websockets', 'docker', 'typescript'],
  },
  'langchain-api-server': {
    description:
      'Chat sobre documentos con RAG usando LangChain, con cliente web integrado y múltiples bases de conocimiento.',
    topics: ['langchain', 'rag', 'llm', 'vector-database', 'nodejs'],
  },
  'nextjs-supabase-base-project': {
    description:
      'Boilerplate de Next.js 16 con autenticación Supabase, Tailwind 4, i18n ES/EN, dark mode y Zustand.',
    topics: ['nextjs', 'supabase', 'boilerplate', 'tailwindcss', 'typescript', 'i18n'],
  },
  'script-lab': {
    description:
      'Gestor de guiones de cine generado íntegramente por un agente de IA propio a partir de una especificación. Prueba de esa herramienta.',
    topics: ['ai-generated', 'agent', 'experiment', 'html'],
  },
  'project-portfolio-v2022': {
    description:
      'Portafolio personal. Vanilla, sin frameworks de runtime, construido sobre mini-astro. Scroll cinematográfico con GSAP y modelos 3D.',
    topics: ['portfolio', 'gsap', 'vanilla-javascript', 'webgl', 'static-site'],
  },
};

/**
 * No son tuyos (forks o copias de proyectos ajenos) o no aportan nada al perfil.
 * Archivar o borrar es una acción destructiva: este script NO la hace.
 * Se listan para que decidas tú en la interfaz de GitHub.
 */
const cleanupCandidates = {
  'astro-basics': 'plantilla de ejemplo de Astro sin contenido propio',
  'opencode-builder': 'copia de opencode (proyecto de terceros)',
  'moltbot-v2': 'copia de moltworker de Cloudflare',
  'moltbot-sandbox-v4': 'copia de moltworker de Cloudflare',
  worldmonitor: 'fork',
  'stremio-web': 'fork',
  MoneyPrinterV2: 'fork',
};

async function api(path, method, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`);
  return res.json();
}

console.log(dryRun ? '\n  SIMULACIÓN — no se cambia nada\n' : '\n  Aplicando cambios\n');

let ok = 0, failed = 0;

for (const [name, meta] of Object.entries(repos)) {
  if (dryRun) {
    console.log(`  ${name}`);
    console.log(`    desc:   ${meta.description}`);
    console.log(`    topics: ${meta.topics.join(', ')}\n`);
    continue;
  }
  try {
    await api(`/repos/${OWNER}/${name}`, 'PATCH', { description: meta.description });
    await api(`/repos/${OWNER}/${name}/topics`, 'PUT', { names: meta.topics });
    console.log(`  ✓ ${name}`);
    ok++;
  } catch (err) {
    console.log(`  ✗ ${name} — ${err.message.split('\n')[0]}`);
    failed++;
  }
}

console.log('\n  ── Revisar a mano (este script no borra ni archiva) ──');
for (const [name, why] of Object.entries(cleanupCandidates)) {
  console.log(`    ${name.padEnd(22)} ${why}`);
}

console.log('\n  ── Nota ──');
console.log('    SGC / business-system no está en GitHub. Es tu proyecto más fuerte');
console.log('    y el portafolio lo presenta como caso principal. Considera publicarlo,');
console.log('    aunque sea sin datos de configuración.\n');

if (!dryRun) console.log(`  ${ok} actualizados, ${failed} con error\n`);
