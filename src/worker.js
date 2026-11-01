const MAX_TEXT = 400;
const DEFAULT_MODELS = 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash-lite';

const PROMPT = `You turn a lifter's spoken or typed workout note into JSON.
Weights are kilograms. Return only sets that were actually done.
"120 for 4, 4 and 7" means three sets of 120 kg: 4, 4 and 7 reps.
"warm up 100 6, 140 4" means warm-up sets; set warmup true for those.
"effort 70%" or "felt light" can become rpe (70% effort is about rpe 7).
Bodyweight exercises use kg 0, or the added weight.
Running, cycling, walking or other cardio goes in cardioMinutes.
Use common English exercise names like "Bench Press", "Deadlift", "Hack Squat".
Prefer a name from the known list when it matches.`;

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
    cardioMinutes: { type: 'INTEGER' }
  },
  required: ['exercises']
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const clean = (raw) => {
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
  return { exercises, cardioMinutes };
};

const parse = async (request, env) => {
  if (!env.GEMINI_API_KEY) return json({ error: 'AI is not set up yet. Try “bench 120x4x3”.' }, 503);
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > MAX_TEXT) return json({ error: 'Keep it under 400 characters.' }, 400);
  const deviceId = typeof body?.deviceId === 'string' ? body.deviceId.slice(0, 64) : 'unknown';
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  for (const key of [`device:${deviceId}`, `ip:${ip}`]) {
    if (env.PARSE_LIMITER) {
      const { success } = await env.PARSE_LIMITER.limit({ key });
      if (!success) return json({ error: 'Slow down a little. Try again in a minute.' }, 429);
    }
  }
  const known = Array.isArray(body?.known) ? body.known.filter((name) => typeof name === 'string').slice(0, 40).map((name) => name.slice(0, 60)) : [];
  const models = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${PROMPT}\nKnown exercises: ${known.join(', ') || 'none yet'}` }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 500, responseMimeType: 'application/json', responseSchema: SCHEMA }
      })
    });
    if (response.status === 404 || response.status === 400) continue;
    if (response.status === 429) return json({ error: 'The free AI quota is used up for now. Try “bench 120x4x3”.' }, 429);
    if (!response.ok) return json({ error: 'The AI is not answering right now.' }, 502);
    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    try {
      return json(clean(JSON.parse(output)));
    } catch {
      return json({ error: 'Could not read that. Try “bench 120 for 4, 4 and 7”.' }, 422);
    }
  }
  return json({ error: 'No AI model available right now.' }, 502);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const seed = url.pathname.match(/^\/api\/seed\/([a-f0-9]{48})$/);
    if (seed && request.method === 'GET') {
      const data = env.SEED ? await env.SEED.get(seed[1]) : null;
      if (!data) return json({ error: 'Not found' }, 404);
      return new Response(data, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
    if (url.pathname === '/api/parse') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return parse(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
