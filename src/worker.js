const MAX_TEXT = 400;
const MAX_AUDIO = 3000000;
const PROFILE_KEY = /^[a-f0-9]{32}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CHANGES = 500;
const MAX_RECORD = 20000;
const DEFAULT_MODELS = 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash-lite';

const PROMPT = `You turn a lifter's spoken or typed workout note into JSON.
Weights are kilograms. Return only sets that were actually done.
"120 for 4, 4 and 7" means three sets of 120 kg: 4, 4 and 7 reps.
"warm up 100 6, 140 4" means warm-up sets; set warmup true for those.
"effort 70%" or "felt light" can become rpe (70% effort is about rpe 7).
Bodyweight exercises use kg 0, or the added weight.
Running, cycling, walking or other cardio goes in cardioMinutes.
Use common English exercise names like "Bench Press", "Deadlift", "Hack Squat".
Prefer a name from the known list when it matches.
If the user says which day it happened, set date as YYYY-MM-DD from the calendar below. "Last Friday" or "on Friday" means the most recent Friday before today, never the week before. "Yesterday" is the day before today. If no day is mentioned, leave date out.
When a voice note is attached, listen to it, write what was said in transcript, and log from it. Expect gym words: exercise names, kilos, reps and sets.`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    exercises: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          sets: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { kg: { type: 'NUMBER' }, reps: { type: 'INTEGER' }, rpe: { type: 'NUMBER' }, warmup: { type: 'BOOLEAN' } },
              required: ['kg', 'reps']
            }
          }
        },
        required: ['name', 'sets']
      }
    },
    cardioMinutes: { type: 'INTEGER' },
    date: { type: 'STRING' },
    transcript: { type: 'STRING' }
  },
  required: ['exercises']
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const clean = (raw, today) => {
  const exercises = (Array.isArray(raw?.exercises) ? raw.exercises : [])
    .slice(0, 12)
    .map((exercise) => ({
      name: String(exercise?.name ?? '').slice(0, 60).trim(),
      sets: (Array.isArray(exercise?.sets) ? exercise.sets : [])
        .filter((set) => !set?.warmup)
        .slice(0, 20)
        .map((set) => ({ kg: Math.min(1000, Math.max(0, Number(set.kg) || 0)), reps: Math.min(100, Math.max(0, Math.round(Number(set.reps) || 0))) }))
        .filter((set) => set.reps > 0)
    }))
    .filter((exercise) => exercise.name && exercise.sets.length > 0);
  const cardioMinutes = Math.min(600, Math.max(0, Math.round(Number(raw?.cardioMinutes) || 0)));
  const date = typeof raw?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null;
  const valid = date && today && date <= today && Date.parse(today) - Date.parse(date) <= 60 * 86400000;
  const transcript = typeof raw?.transcript === 'string' ? raw.transcript.slice(0, MAX_TEXT).trim() : '';
  return valid ? { exercises, cardioMinutes, date, transcript } : { exercises, cardioMinutes, transcript };
};

const parse = async (request, env) => {
  if (!env.GEMINI_API_KEY) return json({ error: 'AI is not set up yet. Try “bench 120x4x3”.' }, 503);
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const audio = typeof body?.audio === 'string' && /^[A-Za-z0-9+/=]+$/.test(body.audio) ? body.audio : '';
  if (text.length > MAX_TEXT) return json({ error: 'Keep it under 400 characters.' }, 400);
  if (audio.length > MAX_AUDIO) return json({ error: 'Keep voice notes under a minute.' }, 400);
  if (!text && !audio) return json({ error: 'Say or type what you did.' }, 400);
  const deviceId = typeof body?.deviceId === 'string' ? body.deviceId.slice(0, 64) : 'unknown';
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  for (const key of [`device:${deviceId}`, `ip:${ip}`]) {
    if (env.PARSE_LIMITER) {
      const { success } = await env.PARSE_LIMITER.limit({ key });
      if (!success) return json({ error: 'Slow down a little. Try again in a minute.' }, 429);
    }
  }
  const today = typeof body?.today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : null;
  const weekday = today ? new Date(`${today}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }) : '';
  const calendar = today ? Array.from({ length: 14 }, (unused, index) => { const day = new Date(Date.parse(`${today}T12:00:00Z`) - index * 86400000); return `${day.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })} ${day.toISOString().slice(0, 10)}${index === 0 ? ' (today)' : index === 1 ? ' (yesterday)' : ''}`; }).join('\n') : '';
  const known = Array.isArray(body?.known) ? body.known.filter((name) => typeof name === 'string').slice(0, 40).map((name) => name.slice(0, 60)) : [];
  const models = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${PROMPT}\nToday is ${weekday} ${today ?? 'unknown'}.\nCalendar, newest first:\n${calendar}\nKnown exercises: ${known.join(', ') || 'none yet'}` }] },
        contents: [{ role: 'user', parts: [...(audio ? [{ inlineData: { mimeType: 'audio/wav', data: audio } }] : []), { text: text || 'Log the sets in this voice note.' }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 500, responseMimeType: 'application/json', responseSchema: SCHEMA }
      })
    });
    if (response.status === 404 || response.status === 400) continue;
    if (response.status === 429) return json({ error: 'The free AI quota is used up for now. Try “bench 120x4x3”.' }, 429);
    if (!response.ok) return json({ error: 'The AI is not answering right now.' }, 502);
    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    try {
      return json(clean(JSON.parse(output), today));
    } catch {
      return json({ error: 'Could not read that. Try “bench 120 for 4, 4 and 7”.' }, 422);
    }
  }
  return json({ error: 'No AI model available right now.' }, 502);
};

const sync = async (request, env) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Bad key' }, 400);
  if (env.SYNC_LIMITER) {
    const { success } = await env.SYNC_LIMITER.limit({ key });
    if (!success) return json({ error: 'Slow down a little.' }, 429);
  }
  const body = await request.json().catch(() => null);
  const since = Number.isInteger(body?.since) && body.since >= 0 ? body.since : 0;
  const changes = (Array.isArray(body?.changes) ? body.changes : [])
    .slice(0, MAX_CHANGES)
    .filter((change) => typeof change?.date === 'string' && DATE.test(change.date) && Number.isFinite(change.updated))
    .map((change) => ({ date: change.date, updated: Math.round(change.updated), data: change.data && typeof change.data === 'object' ? JSON.stringify(change.data) : null }))
    .filter((change) => change.data === null || change.data.length <= MAX_RECORD);
  const meta = body?.meta && typeof body.meta === 'object' && Number.isFinite(body.meta.updated)
    ? { json: JSON.stringify({ name: String(body.meta.name ?? '').slice(0, 40), bests: body.meta.bests && typeof body.meta.bests === 'object' ? body.meta.bests : {} }), updated: Math.round(body.meta.updated) }
    : null;
  if (meta && meta.json.length > MAX_RECORD) return json({ error: 'Too big' }, 400);
  const statements = [env.DB.prepare('INSERT OR IGNORE INTO profiles (id, created) VALUES (?, ?)').bind(key, Date.now())];
  if (changes.length || meta) statements.push(env.DB.prepare('UPDATE profiles SET seq = seq + 1 WHERE id = ?').bind(key));
  for (const change of changes) {
    statements.push(env.DB.prepare('INSERT INTO sessions (profile, date, data, updated, seq) VALUES (?1, ?2, ?3, ?4, (SELECT seq FROM profiles WHERE id = ?1)) ON CONFLICT (profile, date) DO UPDATE SET data = excluded.data, updated = excluded.updated, seq = excluded.seq WHERE excluded.updated > sessions.updated').bind(key, change.date, change.data, change.updated));
  }
  if (meta) statements.push(env.DB.prepare('UPDATE profiles SET meta = ?2, meta_updated = ?3, meta_seq = seq WHERE id = ?1 AND ?3 > meta_updated').bind(key, meta.json, meta.updated));
  statements.push(env.DB.prepare('SELECT date, data, updated FROM sessions WHERE profile = ? AND seq > ?').bind(key, since));
  statements.push(env.DB.prepare('SELECT seq, meta, meta_updated, meta_seq FROM profiles WHERE id = ?').bind(key));
  const results = await env.DB.batch(statements);
  const rows = results.at(-2).results;
  const profile = results.at(-1).results[0];
  return json({
    cursor: profile.seq,
    sessions: rows.map((row) => ({ date: row.date, updated: row.updated, data: row.data ? JSON.parse(row.data) : null })),
    meta: profile.meta && profile.meta_seq > since ? { ...JSON.parse(profile.meta), updated: profile.meta_updated } : null
  });
};

const manifest = async (request, env, url) => {
  const response = await env.ASSETS.fetch(new Request(new URL('/manifest.webmanifest', url), request));
  const data = await response.json();
  const key = url.searchParams.get('k') ?? '';
  if (PROFILE_KEY.test(key)) data.start_url = `/#/me/${key}`;
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/manifest+json', 'cache-control': 'no-store' } });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/sync') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return sync(request, env);
    }
    if (url.pathname === '/manifest.webmanifest') return manifest(request, env, url);
    if (url.pathname === '/api/parse') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return parse(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
