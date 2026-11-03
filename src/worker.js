import Anthropic from '@anthropic-ai/sdk';

const MAX_TEXT = 1500;
const MAX_AUDIO = 16000000;
const PROFILE_KEY = /^[a-f0-9]{32}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CHANGES = 500;
const MAX_RECORD = 80000;
const DEFAULT_MODELS = 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash-lite';

const PROMPT = `You turn a lifter's spoken or typed workout note into JSON.
Weights are kilograms. Return only sets that were actually done.
"120 for 4, 4 and 7" means three sets of 120 kg: 4, 4 and 7 reps.
"warm up 100 6, 140 4" means warm-up sets; keep them and set warmup true. Never invent warm-up sets: add them only when the user says they warmed up or worked up. If they say they warmed up or worked up plate by plate without exact numbers, add warm-up sets below the first working weight in steps of one 20 kg plate per side (40 kg), starting at 60 kg, with fewer reps as it gets heavier (60x6, 100x4, 140x2, 180x1 style), and copy their usual warm-ups from the recent log if it has any. Reps in reserve N means rpe 10 minus N, never rpe N: "3 in reserve" is rpe 7, "8 reps in reserve" is rpe 2. Accessory work in minutes ("30 minutes of accessories") goes in accessoriesMinutes. For lifts measured in lengths, distance or time (sled drag, sled push, farmer's walk, carries), log kg as the load and reps as the number of lengths or rounds. If part of the note cannot be logged at all, put that part, in the user's words, in unclear, and still log everything else. Unclear holds only the user's own words or a short question to them, never your reasoning. A number said with "kg" or "kilos" is always the weight, never reps: "two sets of 12 kg curls" is two sets at kg 12. Never invent a number the user did not say. If the sets or weight are known but the reps are not ("two sets of 12 kg curls", "three sets reps"), still log those sets with reps 0, which means reps unknown, and put a short question in unclear, like "Dumbbell Curl 12 kg: how many reps?". If the weight is unknown, use kg 0 only for bodyweight lifts; otherwise ask in unclear.
"effort 70%" or "felt light" can become rpe (70% effort is about rpe 7).
Bodyweight exercises use kg 0, or the added weight.
Running, cycling, walking or other cardio goes in cardioMinutes.
Keep the exercise the user named, in Title Case English: "single arm tricep extension" is "Single Arm Tricep Extension", never a different exercise like "Triceps Pushdown". Use a name from the known list only when it is the same exercise, differing just in spelling, plural or word order. If they name no specific variant, use common names like "Bench Press", "Deadlift", "Hack Squat".
If the user says which day it happened, set date as YYYY-MM-DD from the calendar below. "Last Friday" or "on Friday" means the most recent Friday before today, never the week before. "Yesterday" is the day before today. If no day is mentioned, leave date out.
When a voice note is attached, listen to it, write what was said in transcript, and log from it. If text comes with the voice note, the text is the user's own corrected transcript of it: follow the text and do not log anything twice. Expect gym words: exercise names, kilos, reps and sets. Words you will hear often: paused or pause, close-grip, incline, reps, sets, RPE, RIR, warm-up, worked up, plates, per side, top set, back-off. Do not mishear "paused" as "post" or "pots", or "reps" as "wraps". "Paused" or "pause" said with bench or squat means the lift Pause Bench Press or Pause Squat. "At 9" or "at an 8" after a set means that rpe. "Three sets 130 for two" means three sets of 130 kg for 2 reps. Example: "I did 120 for two paused and then three sets 130 kg for two paused at 9" is Pause Bench Press 120x2, then 130x2 rpe 9 three times.
The user can also fix what is already logged. The recent log below lists their sessions. "This session" or "today" means the day in view. To delete a whole day, add it to remove with no exercise. To delete one exercise from a day, add it to remove with that exercise name. To change sets of an exercise already logged, add it to replace with the full new list of sets for that exercise on that day. Use exact dates and exercise names from the recent log. For edits and deletes, a weekday like "Friday" means the newest logged day in the recent log that falls on that weekday, not an empty day. When changing a set, the replace list must contain every set of that exercise on that day, with only the mentioned set changed. Keep each set's rpe and warmup from the recent log unless the user changes them: "I did the 130 for three sets" turns one 130x2@9 into three 130x2@9. If something logged was really done on another day ("that was actually Friday", "switch those two"), use move with from and to dates, and the exercise name when only one exercise moves. To switch two days, add a move each way. Never use remove and replace to move things. If the user names the session or says where it happened, like a gym or place ("at Sathedvik", "call it leg day"), put that short name in label, without words like "at". Only fill exercises for new sets that were actually done; leave it empty for pure edits or deletes.`;

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
    accessoriesMinutes: { type: 'INTEGER' },
    unclear: { type: 'STRING' },
    date: { type: 'STRING' },
    transcript: { type: 'STRING' },
    label: { type: 'STRING' },
    move: { type: 'ARRAY', items: { type: 'OBJECT', properties: { from: { type: 'STRING' }, to: { type: 'STRING' }, exercise: { type: 'STRING' } }, required: ['from', 'to'] } },
    remove: { type: 'ARRAY', items: { type: 'OBJECT', properties: { date: { type: 'STRING' }, exercise: { type: 'STRING' } }, required: ['date'] } },
    replace: { type: 'ARRAY', items: { type: 'OBJECT', properties: { date: { type: 'STRING' }, exercise: { type: 'STRING' }, sets: { type: 'ARRAY', items: { type: 'OBJECT', properties: { kg: { type: 'NUMBER' }, reps: { type: 'INTEGER' }, rpe: { type: 'NUMBER' }, warmup: { type: 'BOOLEAN' } }, required: ['kg', 'reps'] } } }, required: ['date', 'exercise', 'sets'] } }
  },
  required: ['exercises']
};

const toJsonSchema = (node) => {
  const type = node.type.toLowerCase();
  if (type === 'object') return { type, properties: Object.fromEntries(Object.entries(node.properties).map(([key, value]) => [key, toJsonSchema(value)])), required: node.required ?? [], additionalProperties: false };
  if (type === 'array') return { type, items: toJsonSchema(node.items) };
  return { type };
};
const JSON_SCHEMA = toJsonSchema(SCHEMA);

const RAMBLE = `The note is often a long spoken ramble. It can repeat itself, correct itself ("70, no, 100"), jump between exercises, and include talk that has nothing to do with training. Ignore the unrelated talk, use the latest correction, and put each set under the right exercise and day. If they describe the same sets twice, log them once.`;

const transcribe = async (env, audio) => {
  if (!env.AI) return '';
  try {
    const result = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio, initial_prompt: 'Gym log: bench press, paused bench, pause squat, hack squat, deadlift, incline, close-grip, lat pulldown, reps, sets, RPE, reps in reserve, warm-up, kilos, per side, top set.' });
    return String(result?.text ?? '').trim();
  } catch {
    return '';
  }
};

const askClaude = async (env, context, words) => {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2 });
  const response = await client.messages.create({
    model: env.CLAUDE_MODEL || 'claude-sonnet-5-5',
    max_tokens: 8000,
    system: [{ type: 'text', text: `${PROMPT}\n${RAMBLE}`, cache_control: { type: 'ephemeral' } }, { type: 'text', text: context }],
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: JSON_SCHEMA } },
    messages: [{ role: 'user', content: words }]
  });
  const text = response.content.find((block) => block.type === 'text')?.text;
  if (!text) throw new Error(`Claude stopped: ${response.stop_reason}`);
  return JSON.parse(text);
};

const IMPORT_PROMPT = `You turn a lifter's training history into JSON days. The text can be anything: notes, an app export, messages to themselves, a spoken ramble, in any order, with unrelated talk mixed in. Ignore everything that is not training.
Each day gets its date as YYYY-MM-DD. Use the calendar below for relative dates like "yesterday" or "last Friday". If a date has no year, use the most recent past date with that day and month. Training with no date at all goes on today's date only if the text says it was today; otherwise put it in unclear in the user's words.
Weights are kilograms; convert pounds (lb, lbs) to kg rounded to 0.5. "120 for 4, 4 and 7" means three sets of 120 kg: 4, 4 and 7 reps. "3x5 at 100" means three sets of 100 kg for 5 reps. Reps in reserve N means rpe 10 minus N. "At 9" after a set means rpe 9. Keep warm-up sets only when they are marked as warm-ups, and set warmup true. "Paused" or "pause" with bench or squat means the lift Pause Bench Press or Pause Squat. A number said with "kg" is always the weight. Never invent reps or weights; unknown reps are 0. Keep the exercise the user named in Title Case ("single arm tricep extension" is "Single Arm Tricep Extension"); use a known-list name only when it is the same exercise. Cardio goes in cardioMinutes, accessory work in minutes goes in accessoriesMinutes. If they named the session or said where it was, put a short name in label. Log each set once even if it is mentioned twice.`;

const DAY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    days: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          date: { type: 'STRING' },
          label: { type: 'STRING' },
          exercises: SCHEMA.properties.exercises,
          cardioMinutes: { type: 'INTEGER' },
          accessoriesMinutes: { type: 'INTEGER' }
        },
        required: ['date', 'exercises']
      }
    },
    unclear: { type: 'STRING' }
  },
  required: ['days']
};

const calendarFor = (today) => Array.from({ length: 14 }, (unused, index) => {
  const day = new Date(Date.parse(`${today}T12:00:00Z`) - index * 86400000);
  return `${day.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })} ${day.toISOString().slice(0, 10)}${index === 0 ? ' (today)' : ''}`;
}).join('\n');

const askAi = async (env, system, user, schema) => {
  if (env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2 });
      const response = await client.messages.create({
        model: env.CLAUDE_MODEL || 'claude-sonnet-5-5',
        max_tokens: 32000,
        system,
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: toJsonSchema(schema) } },
        messages: [{ role: 'user', content: user }]
      });
      const text = response.content.find((block) => block.type === 'text')?.text;
      if (text) return JSON.parse(text);
    } catch (error) {
      console.log('Claude failed, using Gemini', String(error).slice(0, 200));
    }
  }
  const models = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  let busy = false;
  for (const [attempt, model] of [...models, ...models].entries()) {
    if (attempt === models.length) {
      if (!busy) break;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: 'application/json', responseSchema: schema } })
    });
    if (!response.ok) {
      busy = busy || response.status === 429 || response.status >= 500;
      continue;
    }
    const data = await response.json();
    try {
      return JSON.parse(data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '');
    } catch {
      continue;
    }
  }
  throw new Error(busy ? 'The AI was busy. Try again in a minute.' : 'The AI could not read that.');
};

const chunksOf = (text, size = 8000) => {
  const chunks = [''];
  for (const line of text.split('\n')) {
    if (chunks.at(-1).length + line.length > size && chunks.at(-1)) chunks.push('');
    chunks[chunks.length - 1] += `${line}\n`;
  }
  return chunks.filter((chunk) => chunk.trim()).slice(0, 20);
};

const readDays = async (env, text, today, known) => {
  const system = `${IMPORT_PROMPT}\nToday is ${today}.\nCalendar, newest first:\n${calendarFor(today)}\nKnown exercises: ${known.join(', ') || 'none yet'}`;
  const chunks = chunksOf(text);
  const parts = [];
  for (let start = 0; start < chunks.length; start += 4) parts.push(...await Promise.all(chunks.slice(start, start + 4).map((chunk) => askAi(env, system, chunk, DAY_SCHEMA))));
  const days = parts.flatMap((part) => Array.isArray(part?.days) ? part.days : [])
    .filter((day) => DATE.test(day?.date ?? '') && day.date <= today)
    .map((day) => ({ ...clean({ exercises: day.exercises, cardioMinutes: day.cardioMinutes, accessoriesMinutes: day.accessoriesMinutes, label: day.label }, today), date: day.date }));
  const unclear = parts.map((part) => part?.unclear).filter(Boolean).join(' ').slice(0, 500);
  return { days, unclear };
};

const sameSets = (first, second) => first.length === second.length && first.every((set, index) => Number(set.kg) === Number(second[index].kg) && Number(set.reps) === Number(second[index].reps));

const mergeDays = (sessions, days) => {
  const summary = [];
  for (const day of days) {
    const session = sessions.get(day.date) ?? { date: day.date, exercises: [], cardio: 0 };
    let added = 0;
    for (const exercise of day.exercises) {
      const sets = exercise.sets.map((set) => ({ kg: String(set.kg), reps: Number(set.reps) > 0 ? String(set.reps) : '', ...(set.rpe ? { rpe: set.rpe } : {}), ...(set.warmup ? { warmup: true } : {}), edited: true }));
      const same = session.exercises.find((item) => item.name.toLowerCase() === exercise.name.toLowerCase());
      if (same && sameSets(same.sets, sets)) continue;
      if (same) same.sets.push(...sets);
      else session.exercises.push({ name: exercise.name, sets });
      added += sets.length;
    }
    if (day.cardioMinutes && !session.cardio) session.cardio = day.cardioMinutes;
    if (day.accessoriesMinutes) session.accessories = day.accessoriesMinutes;
    if (day.label && !session.label) session.label = day.label;
    sessions.set(day.date, session);
    summary.push({ date: day.date, sets: added, exercises: day.exercises.map((exercise) => exercise.name) });
  }
  return summary;
};

const addDays = async (env, key, days) => {
  if (!days.length) return [];
  const dates = [...new Set(days.map((day) => day.date))];
  const rows = (await env.DB.prepare(`SELECT date, data FROM sessions WHERE profile = ? AND date IN (${dates.map(() => '?').join(', ')})`).bind(key, ...dates).all()).results;
  const sessions = new Map(rows.filter((row) => row.data).map((row) => [row.date, JSON.parse(row.data)]));
  const summary = mergeDays(sessions, days);
  const now = Date.now();
  const changed = [...sessions.values()].filter((session) => days.some((day) => day.date === session.date));
  await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO profiles (id, created) VALUES (?, ?)').bind(key, now),
    env.DB.prepare('UPDATE profiles SET seq = seq + 1 WHERE id = ?').bind(key),
    ...changed.map((session) => env.DB.prepare('INSERT INTO sessions (profile, date, data, updated, seq) VALUES (?1, ?2, ?3, ?4, (SELECT seq FROM profiles WHERE id = ?1)) ON CONFLICT (profile, date) DO UPDATE SET data = excluded.data, updated = excluded.updated, seq = excluded.seq').bind(key, session.date, JSON.stringify(session), now))
  ]);
  return summary;
};

const speechToText = async (request, env) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Missing key.' }, 400);
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `speech:${key}` });
    if (!success) return json({ error: 'Slow down a little. Try again in a minute.' }, 429);
  }
  const body = await request.json().catch(() => null);
  const audio = typeof body?.audio === 'string' && /^[A-Za-z0-9+/=]+$/.test(body.audio) && body.audio.length <= MAX_AUDIO ? body.audio : '';
  if (!audio) return json({ error: 'No recording.' }, 400);
  const text = await transcribe(env, audio);
  return text ? json({ text }) : json({ error: 'Could not hear that. Try again.' }, 502);
};

const add = async (request, env, ctx) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Send your Exodia key in the x-exodia-key header.' }, 400);
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `add:${key}` });
    if (!success) return json({ error: 'Slow down a little. Try again in a minute.' }, 429);
  }
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 150000) : '';
  if (!text) return json({ error: 'Send your training as text.' }, 400);
  const today = typeof body?.today === 'string' && DATE.test(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const existing = (await env.DB.prepare('SELECT data FROM sessions WHERE profile = ? AND data IS NOT NULL ORDER BY date DESC LIMIT 200').bind(key).all()).results;
  const sent = Array.isArray(body?.known) ? body.known.filter((name) => typeof name === 'string').map((name) => name.slice(0, 60)) : [];
  const known = [...new Set([...existing.flatMap((row) => JSON.parse(row.data).exercises.map((exercise) => exercise.name)), ...sent])].slice(0, 100);
  try {
    const { days, unclear } = await readDays(env, text, today, known);
    if (body.dry === true) {
      const sessions = new Map();
      const added = mergeDays(sessions, days);
      return json({ added, unclear, sessions: [...sessions.values()] });
    }
    const added = await addDays(env, key, days);
    logCommand(request, env, ctx, body, text.slice(0, 500), { added, unclear, engine: 'add' });
    return json({ added, unclear });
  } catch (error) {
    logCommand(request, env, ctx, body, text.slice(0, 500), { error: String(error.message) });
    return json({ error: error.message }, 503);
  }
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
  const accessoriesMinutes = Math.min(300, Math.max(0, Math.round(Number(raw?.accessoriesMinutes) || 0)));
  const unclear = typeof raw?.unclear === 'string' ? raw.unclear.trim().slice(0, 300) : '';
  return { exercises, cardioMinutes, transcript, remove, replace, move, ...(accessoriesMinutes ? { accessoriesMinutes } : {}), ...(unclear ? { unclear } : {}), ...(label ? { label } : {}), ...(valid ? { date } : {}) };
};

const logCommand = (request, env, ctx, body, said, result) => {
  if (body?.dry === true) return;
  const profile = request.headers.get('x-exodia-key') ?? '';
  ctx.waitUntil(env.DB.prepare('INSERT INTO commands (at, profile, name, said, result) VALUES (?, ?, ?, ?, ?)')
    .bind(Date.now(), PROFILE_KEY.test(profile) ? profile.slice(0, 6) : 'unknown', typeof body?.name === 'string' ? body.name.slice(0, 40) : '', String(said || '').slice(0, 500), JSON.stringify(result).slice(0, 4000))
    .run()
    .catch(() => {}));
};

const SEARCH_PROMPT = `You find workouts in a lifting log. Each line of the log is one day: the date, the weekday, an optional name in quotes, then each exercise with its set count, its top set (kg x reps) and any PR sets.
Return the days that match the search, best match first, at most 6.
Match exercise names loosely: hack means Hack Squat, DL means Deadlift, bench means Bench Press, OHP means Overhead Press.
Numbers are kilograms unless the search says reps. "Top set" means the heaviest set of that exercise that day. "PR" means that day has a PR on that exercise.
Relative dates like "last Friday" or "two weeks ago" count from today.
For each day, why is under 8 words and names the set that matches, like "Deadlift 300 × 1, PR".
If nothing in the log matches, return an empty list. Never invent a date that is not in the log.`;

const SEARCH_SCHEMA = { type: 'OBJECT', properties: { results: { type: 'ARRAY', items: { type: 'OBJECT', properties: { date: { type: 'STRING' }, why: { type: 'STRING' } }, required: ['date', 'why'] } } }, required: ['results'] };

const search = async (request, env) => {
  if (!env.GEMINI_API_KEY) return json({ results: [] });
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === 'string' ? body.query.trim().slice(0, 200) : '';
  const index = typeof body?.index === 'string' ? body.index.slice(0, 16000) : '';
  const today = typeof body?.today === 'string' && DATE.test(body.today) ? body.today : '';
  if (!query || !index) return json({ results: [] });
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `search:${request.headers.get('x-exodia-key') || request.headers.get('cf-connecting-ip') || 'local'}` });
    if (!success) return json({ error: 'Slow down a little.' }, 429);
  }
  const models = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SEARCH_PROMPT}\nToday is ${today || 'unknown'}.` }] },
        contents: [{ role: 'user', parts: [{ text: `Log:\n${index}\n\nSearch: ${query}` }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 1024, responseMimeType: 'application/json', responseSchema: SEARCH_SCHEMA }
      })
    });
    if (response.status === 404 || response.status === 400) continue;
    if (!response.ok) return json({ error: 'The AI is not answering right now.' }, 502);
    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    try {
      const results = (JSON.parse(output).results || [])
        .filter((item) => typeof item?.date === 'string' && DATE.test(item.date) && index.includes(item.date))
        .slice(0, 6)
        .map((item) => ({ date: item.date, why: String(item.why ?? '').slice(0, 80) }));
      return json({ results });
    } catch {
      return json({ error: 'Could not read the AI answer.' }, 502);
    }
  }
  return json({ error: 'No AI model answered.' }, 502);
};

const parse = async (request, env, ctx) => {
  if (!env.GEMINI_API_KEY) return json({ error: 'AI is not set up yet. Try “bench 120x4x3”.' }, 503);
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const audio = typeof body?.audio === 'string' && /^[A-Za-z0-9+/=]+$/.test(body.audio) ? body.audio : '';
  if (text.length > MAX_TEXT) return json({ error: 'Keep it under 1500 characters.' }, 400);
  if (audio.length > MAX_AUDIO) {
    logCommand(request, env, ctx, body, text || 'Voice note', { error: 'Voice note too long' });
    return json({ error: 'Keep voice notes under six minutes.' }, 400);
  }
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
  const hint = typeof body?.hint === 'string' ? body.hint.slice(0, MAX_TEXT) : '';
  const context = `Today is ${weekday} ${today ?? 'unknown'}.\nCalendar, newest first:\n${calendar}\nKnown exercises: ${known.join(', ') || 'none yet'}\nDay in view: ${viewing}${focus ? `\nThe user is editing ${focus}. Treat their words as changes to that workout (use replace or remove with that date) unless they clearly add new sets.` : ''}\nRecent log, newest first:\n${recent || 'nothing logged yet'}`;
  const heard = audio ? await transcribe(env, audio) : '';
  const words = text || heard || (audio ? hint : '');
  if (env.ANTHROPIC_API_KEY && words) {
    try {
      const result = clean({ ...(await askClaude(env, context, `${words}${heard && hint && !text ? `\n\n(The phone's own speech-to-text heard: "${hint}". Use it only for unclear words.)` : ''}`)), transcript: heard || text }, today);
      logCommand(request, env, ctx, body, text || heard || 'Voice note', { ...result, engine: 'claude' });
      return json(result);
    } catch (error) {
      console.log('Claude failed, using Gemini', String(error).slice(0, 200));
    }
  }
  let lastError = '';
  let busy = false;
  for (const [attempt, model] of [...models, ...models].entries()) {
    if (attempt === models.length) {
      if (!busy) break;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${PROMPT}\n${RAMBLE}${hint ? `\nThe phone's own speech-to-text heard: "${hint}". Use it only to help with unclear words; the audio is the truth.` : ''}\nToday is ${weekday} ${today ?? 'unknown'}.\nCalendar, newest first:\n${calendar}\nKnown exercises: ${known.join(', ') || 'none yet'}\nDay in view: ${viewing}${focus ? `\nThe user is editing ${focus}. Treat their words as changes to that workout (use replace or remove with that date) unless they clearly add new sets.` : ''}\nRecent log, newest first:\n${recent || 'nothing logged yet'}` }] },
        contents: [{ role: 'user', parts: [...(audio ? [{ inlineData: { mimeType: 'audio/wav', data: audio } }] : []), { text: text || 'Log the sets in this voice note.' }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: 'application/json', responseSchema: SCHEMA }
      })
    });
    if (response.status === 404 || response.status === 400 || response.status === 429 || response.status >= 500) {
      lastError = `${model}: ${response.status} ${(await response.text()).slice(0, 160)}`;
      busy = busy || response.status === 429 || response.status >= 500;
      continue;
    }
    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    try {
      const result = clean(JSON.parse(output), today);
      logCommand(request, env, ctx, body, text || result.transcript, result);
      return json(result);
    } catch {
      logCommand(request, env, ctx, body, text || 'Voice note', { error: 'AI answer could not be read' });
      return json({ error: 'Could not read that. Try “bench 120 for 4, 4 and 7”.' }, 422);
    }
  }
  logCommand(request, env, ctx, body, text || 'Voice note', { error: `No AI model accepted it. ${lastError}` });
  if (busy) return json({ error: 'Google’s AI was busy. Your note is fine, try again in a minute.' }, 503);
  return json({ error: 'The AI could not read that note. Try again, or type it.' }, 502);
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
    ? { json: JSON.stringify({ name: String(body.meta.name ?? '').slice(0, 40), bests: body.meta.bests && typeof body.meta.bests === 'object' ? body.meta.bests : {}, log: Array.isArray(body.meta.log) ? body.meta.log.slice(0, 80) : [] }), updated: Math.round(body.meta.updated) }
    : null;
  if (meta && meta.json.length > MAX_RECORD * 4) return json({ error: 'Too big' }, 400);
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
    ...(result.accessoriesMinutes ? [`Accessories ${result.accessoriesMinutes} min`] : []),
    ...(result.unclear ? [`Did not understand: ${result.unclear}`] : []),
    ...(result.error ? [`Failed: ${result.error}`] : []),
    ...(result.date ? [`Day ${result.date}`] : [])
  ].join(' · ') || 'Nothing understood';
};

// Starts a Claude Code cloud session (a scheduled task with an API trigger) that changes the app and deploys it.
const startClaudeTask = async (text, env) => {
  const ask = text.trim().slice(0, 4000);
  if (!ask) return json({ error: 'Say what to change.' }, 400);
  // Pasted secrets often carry a trailing newline or spaces, which break the URL or the auth header.
  // Accept the Fire URL, or any link or text that contains the task id (trig_…), and build the Fire URL from it.
  const rawUrl = (env.CLAUDE_TASK_URL || '').trim();
  const taskId = rawUrl.match(/trig_[A-Za-z0-9]+/)?.[0];
  const taskUrl = /\/fire$/.test(rawUrl) ? rawUrl : taskId ? `https://api.anthropic.com/v1/claude_code/routines/${taskId}/fire` : rawUrl;
  const token = (env.CLAUDE_TASK_TOKEN || '').trim().replace(/^Bearer\s+/i, '');
  if (!taskUrl || !token) return json({ error: 'Claude is not connected yet. Add CLAUDE_TASK_URL and CLAUDE_TASK_TOKEN to the Worker.' }, 503);
  if (!/^https?:\/\/[^\s]+\/fire$/.test(taskUrl)) return json({ error: `CLAUDE_TASK_URL should be the Fire URL ending in /fire (it starts with “${rawUrl.slice(0, 24)}”).` }, 503);
  let response;
  try {
    response = await fetch(taskUrl, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'anthropic-beta': 'experimental-cc-routine-2026-04-01', 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ text: ask })
    });
  } catch (error) {
    return json({ error: `Claude did not start: ${error.message}` }, 502);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: `Claude did not start (${response.status}): ${data.error?.message || 'no details'}` }, 502);
  return json({ ok: true, url: data.claude_code_session_url || '' });
};

const admin = async (request, env) => {
  if (!env.ADMIN_PROFILE || request.headers.get('x-exodia-key') !== env.ADMIN_PROFILE) return json({ error: 'Not found' }, 404);
  if (request.method === 'POST') {
    const body = await request.json().catch(() => null);
    if (typeof body?.claude === 'string') return startClaudeTask(body.claude, env);
    if (!Number.isInteger(body?.id) || !['new', 'planned', 'done', 'declined'].includes(body?.status)) return json({ error: 'Bad request' }, 400);
    await env.DB.prepare('UPDATE feedback SET status = ? WHERE id = ?').bind(body.status, body.id).run();
    return json({ ok: true });
  }
  const [commands, feedback] = await env.DB.batch([
    env.DB.prepare('SELECT at, profile, name, said, result FROM commands ORDER BY at DESC LIMIT 300'),
    env.DB.prepare('SELECT id, at, profile, name, kind, title, details, said, status FROM feedback ORDER BY at DESC LIMIT 200')
  ]);
  return json({
    commands: commands.results.map((row) => ({ at: row.at, who: row.name || row.profile, said: row.said, did: describe(row.result), raw: row.result })),
    feedback: feedback.results.map(({ profile, ...row }) => ({ ...row, who: row.name || profile.slice(0, 6) }))
  });
};

const FEEDBACK_PROMPT = `Someone using Exodia, a training log app, sends feedback by voice or text. Write it up for the developer. kind is "bug" if something is broken or confusing, otherwise "idea". title is at most 8 words. details keeps every specific thing they said (what they did, what happened, what they expected, what they want) in short clear sentences. Do not add your own ideas or judge the request.`;
const FEEDBACK_SCHEMA = { type: 'OBJECT', properties: { kind: { type: 'STRING' }, title: { type: 'STRING' }, details: { type: 'STRING' } }, required: ['kind', 'title', 'details'] };

const feedback = async (request, env, ctx) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Missing key.' }, 400);
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `feedback:${key}` });
    if (!success) return json({ error: 'Slow down a little. Try again in a minute.' }, 429);
  }
  const body = await request.json().catch(() => null);
  const audio = typeof body?.audio === 'string' && /^[A-Za-z0-9+/=]+$/.test(body.audio) && body.audio.length <= MAX_AUDIO ? body.audio : '';
  const said = (typeof body?.text === 'string' ? body.text.trim() : '') || (audio ? await transcribe(env, audio) : '');
  if (!said) return json({ error: 'Say or type what you want to tell Marcus.' }, 400);
  let report;
  try {
    report = await askAi(env, FEEDBACK_PROMPT, said.slice(0, 6000), FEEDBACK_SCHEMA);
  } catch {
    report = { kind: 'idea', title: said.slice(0, 60), details: said };
  }
  const kind = report.kind === 'bug' ? 'bug' : 'idea';
  const title = String(report.title || said).slice(0, 80);
  const details = String(report.details || said).slice(0, 2000);
  if (body.dry === true) return json({ kind, title, details, said });
  const name = typeof body?.name === 'string' ? body.name.slice(0, 40) : '';
  await env.DB.prepare('INSERT INTO feedback (at, profile, name, kind, title, details, said) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(Date.now(), key, name, kind, title, details, said.slice(0, 4000)).run();
  return json({ kind, title, details, said });
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
    if (url.pathname === '/api/admin') return admin(request, env);
    if (url.pathname === '/api/feedback') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return feedback(request, env, ctx);
    }
    const personal = url.pathname.match(/^\/me\/([a-f0-9]{32})\/?$/);
    if (personal || url.pathname === '/join' || url.pathname === '/join/') {
      let html = await (await env.ASSETS.fetch(new Request(new URL('/', url), request))).text();
      if (personal) html = html.replace('href="/manifest.webmanifest"', `href="/manifest.webmanifest?k=${personal[1]}"`);
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }
    if (url.pathname === '/api/transcribe') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return speechToText(request, env);
    }
    if (url.pathname === '/api/add') {
      if (request.method !== 'POST') return json({ error: 'Use POST with {"text": "your training"} and your x-exodia-key header.' }, 405);
      return add(request, env, ctx);
    }
    if (url.pathname === '/api/search') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return search(request, env);
    }
    if (url.pathname === '/api/parse') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return parse(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  }
};
