// Import cert-prep-hub content (lessons, cheatsheets, questions, flashcards) into docs/<slug>/.
// Usage: node scripts/import-cert-prep-hub.mjs [contentDir] [docsDir]
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.argv[2] || path.join('..', 'cert-prep-hub', 'content'));
const DST = path.resolve(process.argv[3] || 'docs');

const CERTS = [
  ['aws-saa-c03', 'saa-c03'],
  ['aws-sap-c02', 'sap-c02'],
  ['aws-dop-c02', 'dop-c02'],
  ['aws-scs-c02', 'scs-c02'],
  ['aws-ans-c01', 'ans-c01'],
  ['aws-aif-c01', 'aif-c01'],
  ['cka', 'cka'],
  ['cks', 'cks'],
  ['claude-ccdv-f', 'ccdv-f'],
  ['claude-ccdv-p', 'ccdv-p'],
];

const pad = (n) => String(n).padStart(2, '0');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const listFiles = (dir, ext) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)).sort() : [];

function parseDoc(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = {};
  let body = raw;
  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const k = line.match(/^(\w+):\s*(.*)$/);
      if (!k) continue;
      let v = k[2].trim();
      if (/^".*"$/.test(v)) v = v.slice(1, -1).replace(/\\"/g, '"');
      fm[k[1]] = v;
    }
  }
  body = body.replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '');
  return { fm, body };
}

const restName = (file) => {
  const base = file.replace(/\.md$/, '');
  const r = base.replace(/^(?:[a-z0-9]+-)?(?:lesson-|cs-)?\d+-/, '');
  return r || base;
};
const indentCont = (s) => String(s ?? '').trim().replace(/\r\n/g, '\n').split('\n').join('\n  ');
const quoteAll = (s) => String(s ?? '').trim().replace(/\r\n/g, '\n').split('\n').map((l) => `> ${l}`.trimEnd()).join('\n');
const esc = (s) => String(s).replace(/\|/g, '\\|');

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/\r\n/g, '\n'), 'utf8');
}

const summary = [];

for (const [srcId, slug] of CERTS) {
  if (slug.startsWith('dva-')) throw new Error('Refusing to touch DVA: ' + slug);
  const src = path.join(SRC, srcId);
  const out = path.join(DST, slug);
  const meta = readJson(path.join(src, 'metadata.json'));
  const CODE = meta.code;
  const topics = [...meta.topics].sort((a, b) => a.order - b.order);
  const topicIdx = new Map(topics.map((t, i) => [t.id, i]));
  const tocName = `00-tong-quan-va-lo-trinh-${slug}.md`;

  fs.rmSync(out, { recursive: true, force: true });

  // ---- docs (lessons / cheatsheets)
  const loadDocs = (dir) =>
    listFiles(path.join(src, dir), '.md')
      .map((f) => {
        const d = parseDoc(path.join(src, dir, f));
        if (!topicIdx.has(d.fm.topicId)) console.warn(`  [warn] ${srcId}/${dir}/${f}: topicId "${d.fm.topicId}" not in metadata`);
        return { file: f, ...d };
      })
      .sort((a, b) => {
        const ta = topicIdx.has(a.fm.topicId) ? topicIdx.get(a.fm.topicId) : 1e6;
        const tb = topicIdx.has(b.fm.topicId) ? topicIdx.get(b.fm.topicId) : 1e6;
        return ta - tb || (Number(a.fm.order) || 0) - (Number(b.fm.order) || 0) || a.file.localeCompare(b.file);
      })
      .map((d, i) => ({ ...d, out: `${pad(i + 1)}-${restName(d.file)}.md` }));

  const lessons = loadDocs('lessons');
  const sheets = loadDocs('cheatsheets');
  const labsSkipped = listFiles(path.join(src, 'labs'), '.md').length;

  // ---- questions
  let qs = [];
  const seen = new Set();
  for (const f of listFiles(path.join(src, 'questions'), '.json')) {
    const arr = readJson(path.join(src, 'questions', f));
    if (!Array.isArray(arr)) throw new Error(`${srcId}/questions/${f}: not an array`);
    for (const q of arr) {
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      if (!['single_choice', 'multiple_choice'].includes(q.type)) throw new Error(`${q.id}: unknown type ${q.type}`);
      qs.push(q);
    }
  }
  const qByTopic = new Map();
  for (const q of qs) {
    if (!qByTopic.has(q.topicId)) qByTopic.set(q.topicId, []);
    qByTopic.get(q.topicId).push(q);
  }
  const exFile = new Map(); // topicId -> file name
  topics.forEach((t, i) => {
    if (qByTopic.has(t.id)) exFile.set(t.id, `${pad(i + 1)}-${t.id.replace(/^[^-]+-/, '')}.md`);
  });
  for (const tid of qByTopic.keys()) if (!exFile.has(tid)) console.warn(`  [warn] ${srcId}: questions with unknown topic ${tid}`);

  // ---- flashcards
  let fcs = [];
  for (const f of listFiles(path.join(src, 'flashcards'), '.json')) {
    const arr = readJson(path.join(src, 'flashcards', f));
    if (!Array.isArray(arr)) throw new Error(`${srcId}/flashcards/${f}: not an array`);
    fcs = fcs.concat(arr);
  }

  const tocLink = `[Mục lục ${CODE}](../${tocName})`;

  // lessons
  lessons.forEach((d, i) => {
    let body = d.body;
    if (!/^# /m.test(body)) body = `# ${d.fm.title || d.file}\n\n${body}`;
    const nav = [];
    if (i > 0) nav.push(`[← Bài trước](${lessons[i - 1].out})`);
    nav.push(tocLink);
    if (exFile.has(d.fm.topicId)) nav.push(`[Bài tập chủ đề](../bai-tap-tinh-huong/${exFile.get(d.fm.topicId)})`);
    if (i < lessons.length - 1) nav.push(`[Bài tiếp →](${lessons[i + 1].out})`);
    write(path.join(out, 'bai-hoc', d.out), `${body}\n\n---\n\n${nav.join(' | ')}\n`);
  });

  // cheatsheets
  sheets.forEach((d) => {
    let body = d.body;
    if (!/^# /m.test(body)) body = `# ${d.fm.title || d.file}\n\n${body}`;
    write(path.join(out, 'cheatsheets', d.out), `${body}\n\n---\n\n${tocLink}\n`);
  });

  // exercises
  for (const t of topics) {
    if (!exFile.has(t.id)) continue;
    const list = qByTopic.get(t.id);
    const parts = [];
    parts.push(`# Bài tập tình huống — ${t.title}\n`);
    parts.push(`> ${String(t.description || '').trim().replace(/\n/g, ' ')}\n> **Số câu hỏi:** ${list.length} câu · **Mẹo:** Tự chọn đáp án trước rồi bấm **Xem đáp án, Dịch nghĩa & Giải thích chi tiết**.\n\n---\n`);
    list.forEach((q, i) => {
      const correct = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      let s = `### Câu ${i + 1} \`${q.difficulty || 'medium'}\`\n\n${String(q.question).trim()}\n`;
      if (q.type === 'multiple_choice') s += `\n*(Chọn ${correct.length} đáp án)*\n`;
      s += '\n' + q.options.map((o) => `- **${o.id}.** ${indentCont(o.text)}`).join('\n') + '\n';
      s += `\n<details><summary>Xem đáp án, Dịch nghĩa & Giải thích chi tiết</summary>\n\n`;
      s += `${quoteAll(`**Ý nghĩa câu hỏi:** ${q.questionVi || ''}`)}\n\n`;
      s += `**Đáp án đúng:** **${correct.join(', ')}**\n\n`;
      if (q.overallExplanation && String(q.overallExplanation).trim()) s += `${String(q.overallExplanation).trim()}\n\n`;
      s += q.options.map((o) => `- **${o.id}${o.isCorrect ? ' (Đúng)' : ''}:** ${indentCont(o.explanation)}`).join('\n') + '\n';
      s += `\n</details>\n`;
      parts.push(s);
    });
    parts.push(`---\n\n${tocLink}\n`);
    write(path.join(out, 'bai-tap-tinh-huong', exFile.get(t.id)), parts.join('\n'));
  }

  // flashcards
  {
    const groups = new Map();
    for (const c of fcs) {
      const key = topicIdx.has(c.topicId) ? c.topicId : '__other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c);
    }
    const parts = [`# Thẻ ghi nhớ (Flashcards) — ${CODE}\n`, `> ${fcs.length} thẻ · Đọc mặt trước, tự trả lời rồi mở đáp án.\n`];
    let k = 0;
    const emit = (title, cards) => {
      parts.push(`## ${title}\n`);
      for (const c of cards) {
        k++;
        parts.push(`**${k}. ${String(c.front).trim()}**\n\n<details><summary>Xem đáp án</summary>\n\n${String(c.back).trim()}\n\n</details>\n`);
      }
    };
    for (const t of topics) if (groups.has(t.id)) emit(t.title, groups.get(t.id));
    if (groups.has('__other')) emit('Khác', groups.get('__other'));
    parts.push(`---\n\n[Mục lục ${CODE}](${tocName})\n`);
    write(path.join(out, 'the-ghi-nho.md'), parts.join('\n'));
  }

  // TOC
  {
    const L = [];
    L.push(`# ${meta.title} — Kiến thức, Cheatsheets & Bài tập\n`);
    L.push(`> ${String(meta.description || '').trim()}\n> **Tổng dung lượng:** **${lessons.length} bài học** + **${sheets.length} cheatsheets** + **${exFile.size} bộ bài tập tình huống** (**${qs.length} câu chuẩn thi có dịch nghĩa tiếng Việt**) + **${fcs.length} thẻ ghi nhớ**\n> **Nguồn:** cert-prep-hub (đã lược bỏ phần Hands-On Labs).\n`);
    L.push(`## 1. Cấu trúc & Tỷ trọng đề thi ${CODE}\n`);
    L.push(`- **Nhà cung cấp:** ${meta.provider} · **Cấp độ:** ${meta.level} · **Thời gian:** ${meta.durationMinutes} phút · **Số câu:** ${meta.examQuestionCount} · **Điểm đỗ:** ${meta.passingScore} / ${meta.maxScore}\n`);
    const weighted = meta.domains.filter((d) => typeof d.weightPercentage === 'number');
    if (weighted.length) {
      L.push('```mermaid\npie showData\n    title Tỷ trọng domain kỳ thi ' + CODE + '\n' +
        weighted.map((d) => `    "${d.title.replace(/"/g, "'")}" : ${d.weightPercentage}`).join('\n') + '\n```\n');
    }
    L.push('---\n');
    L.push(`## 2. Lộ trình theo Domain & Chủ đề\n`);
    for (const d of meta.domains) {
      const ts = topics.filter((t) => t.domainId === d.id);
      if (!ts.length) continue;
      L.push(`### ${d.title}${typeof d.weightPercentage === 'number' ? ` (${d.weightPercentage}%)` : ''}\n`);
      L.push('| # | Chủ đề | Bài học | Bài tập |\n|---|---|---|---|');
      for (const t of ts) {
        const ls = lessons.filter((x) => x.fm.topicId === t.id).map((x) => `[${esc(x.fm.title || x.out)}](bai-hoc/${x.out})`).join('<br>') || '—';
        const ex = exFile.has(t.id) ? `[${qByTopic.get(t.id).length} câu](bai-tap-tinh-huong/${exFile.get(t.id)})` : '—';
        L.push(`| ${topicIdx.get(t.id) + 1} | ${esc(t.title)} | ${ls} | ${ex} |`);
      }
      L.push('');
    }
    L.push(`## 3. Danh sách bài học\n`);
    L.push('| # | Bài học |\n|---|---|');
    lessons.forEach((x, i) => L.push(`| ${i + 1} | [${esc(x.fm.title || x.out)}](bai-hoc/${x.out}) |`));
    L.push('');
    L.push(`## 4. Cheatsheets tổng ôn\n`);
    sheets.forEach((x) => L.push(`- [${x.fm.title || x.out}](cheatsheets/${x.out})`));
    L.push('');
    L.push(`## 5. Thẻ ghi nhớ\n\n- [${fcs.length} thẻ ghi nhớ ${CODE}](the-ghi-nho.md)\n`);
    write(path.join(out, tocName), L.join('\n'));
  }

  summary.push({ cert: CODE, slug, lessons: lessons.length, sheets: sheets.length, exercises: exFile.size, questions: qs.length, flashcards: fcs.length, labsSkipped, title: meta.title });
}

// ---- link check
let broken = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) {
      const txt = fs.readFileSync(p, 'utf8');
      for (const m of txt.matchAll(/\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g)) {
        if (/^https?:/.test(m[1])) continue;
        const target = path.resolve(path.dirname(p), decodeURIComponent(m[1]));
        if (!fs.existsSync(target)) {
          console.error(`BROKEN LINK in ${p}: ${m[1]}`);
          broken++;
        }
      }
    }
  }
}
for (const [, slug] of CERTS) walk(path.join(DST, slug));

console.table(summary);
if (broken) {
  console.error(`${broken} broken link(s)`);
  process.exit(1);
}
console.log('OK: no broken links');
