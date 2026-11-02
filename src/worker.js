const MAX_TEXT = 400;
const MAX_AUDIO = 14000000;
const PROFILE_KEY = /^[a-f0-9]{32}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CHANGES = 500;
const MAX_RECORD = 80000;
const DEFAULT_MODELS = 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash-lite';

const PROMPT = `You turn a lifter's spoken or typed workout note into JSON.
Weights are kilograms. Return only sets that were actually done.
"120 for 4, 4 and 7" means three sets of 120 kg: 4, 4 and 7 reps.
"warm up 100 6, 140 4" means warm-up sets; keep them and set warmup true. If they say they warmed up or worked up plate by plate without exact numbers, add warm-up sets below the first working weight in steps of one 20 kg plate per side (40 kg), starting at 60 kg, with fewer reps as it gets heavier (60x6, 100x4, 140x2, 180x1 style), and copy their usual warm-ups from the recent log if it has any. Reps in reserve N is the same as rpe 10 minus N: "3 in reserve" is rpe 7.
"effort 70%" or "felt light" can become rpe (70% effort is about rpe 7).
Bodyweight exercises use kg 0, or the added weight.
Running, cycling, walking or other cardio goes in cardioMinutes.
Use common English exercise names like "Bench Press", "Deadlift", "Hack Squat".
Prefer a name from the known list when it matches.
If the user says which day it happened, set date as YYYY-MM-DD from the calendar below. "Last Friday" or "on Friday" means the most recent Friday before today, never the week before. "Yesterday" is the day before today. If no day is mentioned, leave date out.
When a voice note is attached, listen to it, write what was said in transcript, and log from it. If text comes with the voice note, the text is the user's own corrected transcript of it: follow the text and do not log anything twice. Expect gym words: exercise names, kilos, reps and sets.
The user can also fix what is already logged. The recent log below lists their sessions. "This session" or "today" means the day in view. To delete a whole day, add it to remove with no exercise. To delete one exercise from a day, add it to remove with that exercise name. To change sets of an exercise already logged, add it to replace with the full new list of sets for that exercise on that day. Use exact dates and exercise names from the recent log. For edits and deletes, a weekday like "Friday" means the newest logged day in the recent log that falls on that weekday, not an empty day. When changing a set, the replace list must contain every set of that exercise on that day, with only the mentioned set changed. If something logged was really done on another day ("that was actually Friday", "switch those two"), use move with from and to dates, and the exercise name when only one exercise moves. To switch two days, add a move each way. Never use remove and replace to move things. If the user names the session or says where it happened, like a gym or place ("at Sathedvik", "call it leg day"), put that short name in label, without words like "at". Only fill exercises for new sets that were actually done; leave it empty for pure edits or deletes.`;

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
    transcript: { type: 'STRING' },
    label: { type: 'STRING' },
    move: { type: 'ARRAY', items: { type: 'OBJECT', properties: { from: { type: 'STRING' }, to: { type: 'STRING' }, exercise: { type: 'STRING' } }, required: ['from', 'to'] } },
    remove: { type: 'ARRAY', items: { type: 'OBJECT', properties: { date: { type: 'STRING' }, exercise: { type: 'STRING' } }, required: ['date'] } },
    replace: { type: 'ARRAY', items: { type: 'OBJECT', properties: { date: { type: 'STRING' }, exercise: { type: 'STRING' }, sets: { type: 'ARRAY', items: { type: 'OBJECT', properties: { kg: { type: 'NUMBER' }, reps: { type: 'INTEGER' }, rpe: { type: 'NUMBER' } }, required: ['kg', 'reps'] } } }, required: ['date', 'exercise', 'sets'] } }
  },
  required: ['exercises']
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const cleanSet = (set) => ({ kg: Math.min(1000, Math.max(0, Number(set?.kg) || 0)), reps: Math.min(100, Math.max(0, Math.round(Number(set?.reps) || 0))), ...(Number(set?.rpe) >= 1 && Number(set?.rpe) <= 10 ? { rpe: Number(set.rpe) } : {}), ...(set?.warmup === true ? { warmup: true } : {}) });

const clean = (raw, today) => {
  const exercises = (Array.isArray(raw?.exercises) ? raw.exercises : [])
    .slice(0, 12)
    .map((exercise) => ({
      name: String(exercise?.name ?? '').slice(0, 60).trim(),
      sets: (Array.isArray(exercise?.sets) ? exercise.sets : [])
        .slice(0, 20)
        .map(cleanSet)
        .filter((set) => set.reps > 0)
    }))
    .filter((exercise) => exercise.name && exercise.sets.length > 0);
  const cardioMinutes = Math.min(600, Math.max(0, Math.round(Number(raw?.cardioMinutes) || 0)));
  const date = typeof raw?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null;
  const valid = date && today && date <= today && Date.parse(today) - Date.parse(date) <= 60 * 86400000;
  const transcript = typeof raw?.transcript === 'string' ? raw.transcript.slice(0, MAX_TEXT).trim() : '';
  const remove = (Array.isArray(raw?.remove) ? raw.remove : [])
    .filter((item) => typeof item?.date === 'string' && DATE.test(item.date))
    .slice(0, 20)
    .map((item) => ({ date: item.date, ...(typeof item.exercise === 'string' && item.exercise.trim() ? { exercise: item.exercise.trim().slice(0, 60) } : {}) }));
  const replace = (Array.isArray(raw?.replace) ? raw.replace : [])
    .filter((item) => typeof item?.date === 'string' && DATE.test(item.date) && typeof item.exercise === 'string' && Array.isArray(item.sets))
    .slice(0, 20)
    .map((item) => ({ date: item.date, exercise: item.exercise.trim().slice(0, 60), sets: item.sets.slice(0, 20).map(cleanSet).filter((set) => set.reps > 0) }));
  const label = typeof raw?.label === 'string' ? raw.label.trim().slice(0, 40) : '';
  const move = (Array.isArray(raw?.move) ? raw.move : [])
    .filter((item) => DATE.test(item?.from ?? '') && DATE.test(item?.to ?? '') && item.from !== item.to)
    .slice(0, 10)
    .map((item) => ({ from: item.from, to: item.to, ...(typeof item.exercise === 'string' && item.exercise.trim() ? { exercise: item.exercise.trim().slice(0, 60) } : {}) }));
  return { exercises, cardioMinutes, transcript, remove, replace, move, ...(label ? { label } : {}), ...(valid ? { date } : {}) };
};

const parse = async (request, env, ctx) => {
  if (!env.GEMINI_API_KEY) return json({ error: 'AI is not set up yet. Try “bench 120x4x3”.' }, 503);
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const audio = typeof body?.audio === 'string' && /^[A-Za-z0-9+/=]+$/.test(body.audio) ? body.audio : '';
  if (text.length > MAX_TEXT) return json({ error: 'Keep it under 400 characters.' }, 400);
  if (audio.length > MAX_AUDIO) return json({ error: 'Keep voice notes under four minutes.' }, 400);
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
  const recent = typeof body?.recent === 'string' ? body.recent.slice(0, 4000) : '';
  const viewing = typeof body?.viewing === 'string' && DATE.test(body.viewing) ? body.viewing : today;
  const focus = typeof body?.focus === 'string' ? body.focus.slice(0, 200) : '';
  const known = Array.isArray(body?.known) ? body.known.filter((name) => typeof name === 'string').slice(0, 40).map((name) => name.slice(0, 60)) : [];
  const models = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${PROMPT}\nToday is ${weekday} ${today ?? 'unknown'}.\nCalendar, newest first:\n${calendar}\nKnown exercises: ${known.join(', ') || 'none yet'}\nDay in view: ${viewing}${focus ? `\nThe user is editing ${focus}. Treat their words as changes to that workout (use replace or remove with that date) unless they clearly add new sets.` : ''}\nRecent log, newest first:\n${recent || 'nothing logged yet'}` }] },
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
      const result = clean(JSON.parse(output), today);
      const profile = request.headers.get('x-exodia-key') ?? '';
      ctx.waitUntil(env.DB.prepare('INSERT INTO commands (at, profile, name, said, result) VALUES (?, ?, ?, ?, ?)')
        .bind(Date.now(), PROFILE_KEY.test(profile) ? profile.slice(0, 6) : 'unknown', typeof body?.name === 'string' ? body.name.slice(0, 40) : '', (text || result.transcript || '').slice(0, 500), JSON.stringify(result).slice(0, 4000))
        .run()
        .catch(() => {}));
      return json(result);
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
    ? { json: JSON.stringify({ name: String(body.meta.name ?? '').slice(0, 40), bests: body.meta.bests && typeof body.meta.bests === 'object' ? body.meta.bests : {}, log: Array.isArray(body.meta.log) ? body.meta.log.slice(0, 30) : [] }), updated: Math.round(body.meta.updated) }
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
    admin: Boolean(env.ADMIN_PROFILE) && key === env.ADMIN_PROFILE,
    cursor: profile.seq,
    sessions: rows.map((row) => ({ date: row.date, updated: row.updated, data: row.data ? JSON.parse(row.data) : null })),
    meta: profile.meta && profile.meta_seq > since ? { ...JSON.parse(profile.meta), updated: profile.meta_updated } : null
  });
};

const describe = (raw) => {
  const result = JSON.parse(raw || '{}');
  const sets = (list) => list.map((set) => `${set.kg}×${set.reps}${set.rpe ? `@${set.rpe}` : ''}${set.warmup ? 'w' : ''}`).join(', ');
  return [
    ...(result.exercises || []).map((exercise) => `Add ${exercise.name} ${sets(exercise.sets)}`),
    ...(result.cardioMinutes ? [`Add cardio ${result.cardioMinutes} min`] : []),
    ...(result.remove || []).map((item) => `Remove ${item.exercise ? `${item.exercise} from ` : ''}${item.date}`),
    ...(result.replace || []).map((item) => `Change ${item.exercise} on ${item.date} to ${sets(item.sets)}`),
    ...(result.move || []).map((item) => `Move ${item.exercise ? `${item.exercise} ` : ''}from ${item.from} to ${item.to}`),
    ...(result.label ? [`Name day “${result.label}”`] : []),
    ...(result.date ? [`Day ${result.date}`] : [])
  ].join(' · ') || 'Nothing understood';
};

const admin = async (request, env) => {
  if (!env.ADMIN_PROFILE || request.headers.get('x-exodia-key') !== env.ADMIN_PROFILE) return json({ error: 'Not found' }, 404);
  const { results } = await env.DB.prepare('SELECT at, profile, name, said, result FROM commands ORDER BY at DESC LIMIT 300').all();
  return json({ commands: results.map((row) => ({ at: row.at, who: row.name || row.profile, said: row.said, did: describe(row.result), raw: row.result })) });
};

const manifest = async (request, env, url) => {
  const response = await env.ASSETS.fetch(new Request(new URL('/manifest.webmanifest', url), request));
  const data = await response.json();
  const key = url.searchParams.get('k') ?? '';
  if (PROFILE_KEY.test(key)) data.start_url = `/me/${key}`;
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/manifest+json', 'cache-control': 'no-store' } });
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/sync') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return sync(request, env);
    }
    if (url.pathname === '/manifest.webmanifest') return manifest(request, env, url);
    if (url.pathname === '/api/admin' && request.method === 'GET') return admin(request, env);
    const personal = url.pathname.match(/^\/me\/([a-f0-9]{32})\/?$/);
    if (personal) {
      const html = await (await env.ASSETS.fetch(new Request(new URL('/', url), request))).text();
      return new Response(html.replace('href="/manifest.webmanifest"', `href="/manifest.webmanifest?k=${personal[1]}"`), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }
    if (url.pathname === '/api/parse') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return parse(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  }
};
