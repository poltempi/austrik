import { createClient } from '@supabase/supabase-js';

function getEnv(name, fallbackNames = []) {
  if (process.env[name]) return process.env[name];
  for (const alt of fallbackNames) {
    if (process.env[alt]) return process.env[alt];
  }
  return undefined;
}

const supabaseUrl = getEnv('SUPABASE_URL', ['PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']);
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(String(supabaseUrl), String(serviceRoleKey));

function toSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildPosts() {
  const titles = [
    'Unlocking Your Mind: How Shifting Your Perspective Boosts Creativity.',
    'The Power of Reframing: Turning Challenges into Opportunities.',
    'A Shift in Perspective: How Empathy Can Transform Relationships.',
    'Navigating Change: Why a Growth Mindset Matters.',
    'Mental Models: Tools for Clear and Effective Thinking.',
    'Strategies to Broaden Your Perspective and See the Big Picture.',
    'The Art of Letting Go: How Changing Your Perspective Reduces Stress.',
    "Disruptive Thinking: How to Adopt an Innovator's Perspective.",
    'Embracing Radical Ideas and Stepping Outside the Box.',
    'Adopting a Long-Term Perspective in Decision-Making.',
    'A Guide to Blepharoplasty (Eyelid Surgery).',
    'A Guide to PDO Thread Lifts.',
    'Laser Eye Surgery: Options and Offers.',
    'Effective Treatments for Macular Degeneration.',
    'Osteoporosis: Effective Treatments and Breakthroughs.',
    'Understanding Ductal Carcinoma: Types, Treatments, and Costs.',
    "Exploring Alzheimer's Treatment: Understanding and Managing the Disease.",
    'A Guide to Stomach Cancer Treatments.',
    'Metastatic Prostate Cancer Treatment.',
    'Understanding Gout and Its Effective Treatments.'
  ];

  const topicToUnsplashQuery = (title) => {
    if (title.toLowerCase().includes('creativ')) return 'creativity,brain,ideas';
    if (title.toLowerCase().includes('reframing')) return 'mindset,opportunity';
    if (title.toLowerCase().includes('empathy')) return 'empathy,people,conversation';
    if (title.toLowerCase().includes('growth mindset')) return 'growth,mindset,learning';
    if (title.toLowerCase().includes('mental models')) return 'strategy,thinking,framework';
    if (title.toLowerCase().includes('big picture')) return 'horizon,panorama,abstract';
    if (title.toLowerCase().includes('letting go')) return 'calm,meditation,nature';
    if (title.toLowerCase().includes('disruptive')) return 'innovation,lightbulb,abstract';
    if (title.toLowerCase().includes('radical')) return 'abstract,color,geometry';
    if (title.toLowerCase().includes('long-term')) return 'mountain,trail,longroad';
    if (title.toLowerCase().includes('blepharoplasty')) return 'eyelids,face,clinic';
    if (title.toLowerCase().includes('pdo')) return 'aesthetics,clinic,dermatology';
    if (title.toLowerCase().includes('laser eye')) return 'laser,ophthalmology,clinic';
    if (title.toLowerCase().includes('macular')) return 'eye,retina,ophthalmology';
    if (title.toLowerCase().includes('osteoporosis')) return 'bone,health,calcium';
    if (title.toLowerCase().includes('ductal carcinoma')) return 'oncology,medical,clinic';
    if (title.toLowerCase().includes('alzheimer')) return 'alzheimer,brain,care';
    if (title.toLowerCase().includes('stomach cancer')) return 'oncology,hospital';
    if (title.toLowerCase().includes('prostate')) return 'healthcare,hospital,doctor';
    if (title.toLowerCase().includes('gout')) return 'gout,foot,pain';
    return 'health,wellness';
  };

  const buildExcerpt = (title) => {
    const clean = title.replace(/[.]+$/, '');
    return `${clean} — practical notes, examples and what actually works.`;
  };

  const md = {
    mindsetIntro: (title) => `# ${title}\n\nChanging how we frame a problem often changes the solution we reach. Below is a practical take drawn from workshop notes, interviews and field practice — no fluff.`,
    healthIntro: (title) => `# ${title}\n\nThis guide summarizes how clinicians approach the topic, what patients usually ask, and the trade‑offs that matter when choosing a treatment. Always discuss with your doctor.`,
    bullets: (items) => items.map((i) => `- ${i}`).join('\n'),
    section: (h, body) => `\n\n## ${h}\n\n${body}`,
    footer: `\n\n> Note: This article is educational and not a substitute for professional advice.`
  };

  const posts = titles.map((title, i) => {
    const isHealth = /(blepharoplasty|pdo|laser eye|macular|osteoporosis|carcinoma|alzheimer|stomach cancer|prostate|gout)/i.test(title);
    const published = new Date(Date.UTC(2025, 1, 1 + i, 10, 0, 0)).toISOString();
    const cover = `https://source.unsplash.com/1600x900/?${encodeURIComponent(topicToUnsplashQuery(title))}`;
    const intro = isHealth ? md.healthIntro(title) : md.mindsetIntro(title);
    const body = isHealth
      ? md.section('What it is', 'Plain‑language definition and why it matters in day‑to‑day life.') +
        md.section('Current options', md.bullets([
          'First‑line approaches most clinicians start with',
          'Alternatives when first‑line fails',
          'Follow‑up and monitoring that patients often overlook'
        ])) +
        md.section('Costs and access', 'What typically drives cost up, and tips to ask your insurer or clinic.')
      : md.section('A concrete example', 'Rewriting the question “How do we sell more?” to “How do we make it easier to buy?” often unlocks better experiments.') +
        md.section('Micro‑practices', md.bullets([
          'Keep a “two versions” journal: the initial take and a reframed version',
          'Borrow a mental model (e.g., Inversion, Second‑Order Thinking) and apply it to a current task',
          'Run a short, low‑risk test and write down what surprised you'
        ])) +
        md.section('Common blockers', 'Time pressure, over‑attachment to the first idea, and lack of outside input.');

    return {
      slug: toSlug(title),
      title,
      excerpt: buildExcerpt(title),
      content_md: `${intro}${body}${md.footer}`,
      cover_image_url: cover,
      published_at: published
    };
  });

  return posts;
}

async function main() {
  // Ensure categories are present
  const categories = [
    { name: 'Health', description: 'Articles about physical well-being, treatments for diseases, medical conditions, and aesthetic procedures.' },
    { name: 'Mindset', description: 'Content focused on personal development, mental tools, perspective shifts, and inner growth.' }
  ];
  try { await supabase.from('categories').upsert(categories, { onConflict: 'name' }); } catch {}
  const { data: catRows } = await supabase.from('categories').select('id, name');
  const healthId = catRows?.find((c) => c.name === 'Health')?.id || null;
  const mindsetId = catRows?.find((c) => c.name === 'Mindset')?.id || null;

  if (getEnv('PURGE_OLD_SAMPLE') === '1') {
    await supabase.from('posts').delete().ilike('slug', 'post-%');
    await supabase.from('posts').delete().eq('slug', 'hola-mundo');
    await supabase.from('posts').delete().eq('slug', 'primer-post');
  }

  const posts = buildPosts();
  const postsWithCategory = posts.map((p) => {
    const isHealth = /(blepharoplasty|pdo|laser eye|macular|osteoporosis|carcinoma|alzheimer|stomach cancer|prostate|gout)/i.test(p.title);
    return { ...p, category_id: isHealth ? healthId : mindsetId };
  });
  const { error, count } = await supabase
    .from('posts')
    .upsert(postsWithCategory, { onConflict: 'slug', ignoreDuplicates: false, count: 'exact' });

  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
  console.log(`Seed completed. Upserted ${posts.length} posts.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


