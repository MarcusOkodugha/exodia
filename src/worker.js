import Anthropic from '@anthropic-ai/sdk';

const MAX_TEXT = 1500;
const MAX_AUDIO = 16000000;
const PROFILE_KEY = /^[a-f0-9]{32}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CHANGES = 500;
const MAX_RECORD = 80000;
// Logging reads with full Flash models first; the Lite ones are only the fallback when those are busy.
// Gemini models that just failed or hung, until when to skip them (per Worker instance).
const COOLING = new Map();
// Google's free tier says why it refused. A used-up daily quota only comes back at midnight Pacific time, a per-minute
// one after its retryDelay, so the model sits out exactly that long instead of being asked again on every note.
const pacificMidnight = () => {
  const now = new Date();
  const there = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const next = new Date(there);
  next.setHours(24, 0, 0, 0);
  return now.getTime() + (next - there);
};
const coolDown = (model, status, body = '') => {
  if (status !== 429 && status < 500) return '';
  let until = Date.now() + 60000;
  let why = status === 429 ? 'busy' : 'down';
  if (status === 429) {
    let details = [];
    try { details = JSON.parse(body)?.error?.details || []; } catch { /* not JSON */ }
    const quota = details.flatMap((detail) => detail.violations || []).map((violation) => violation.quotaId || '').join(' ');
    const retry = Number.parseFloat(details.find((detail) => detail.retryDelay)?.retryDelay || '');
    if (/PerDay/i.test(quota)) {
      until = pacificMidnight();
      why = 'daily quota used up';
    } else if (retry > 0) {
      until = Date.now() + retry * 1000;
      why = `per-minute quota, back in ${Math.round(retry)} s`;
    }
  }
  COOLING.set(model, Math.max(COOLING.get(model) || 0, until));
  return why;
};
const cooling = (model) => COOLING.get(model) > Date.now();
// Short workout notes don't need long thinking; low thinking answers in a fraction of the time.
const THINK_LOW = true;
const DEFAULT_MODELS = 'gemini-3.8-flash,gemini-3.5-flash,gemini-3.7-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite';

const PROMPT = `You turn a lifter's spoken or typed workout note into JSON. The app is in English: the note may be in Swedish or any language, but write every exercise name, cardioName and label in short English ("knäböj" is "Squat", "marklyft" is "Deadlift", "bänkpress" is "Bench Press", "fotboll" is "Football", "benpass" is "Leg day"), and write unclear in the language the user used.
A note is a remark about a session that is not sets or minutes: how it felt, the equipment or gym, a cue, a plan to try next time ("felt heavy, their benches are worse than an Eleiko bench"). Put it in note: short, cleaned up, in the user's own language and words, never invented. A message that starts with "Note:" is only a note: log no sets from it, even if it has numbers. A note can also come with sets in the same message: log the sets and put the remark in note. Numbers that describe a plan, a feeling or a comparison are not sets. If the note is about another session ("my latest bench session", "yesterday's squats"), set date to that day from the recent log.
Feedback only when the user literally says the word "feedback" or "feature" (for example "feedback: the mic is slow"): then put that part in feedback in their own words and log nothing for it. Without one of those words, everything is training, never feedback.
Weights are kilograms. Return only sets that were actually done.
"120 for 4, 4 and 7" means three sets of 120 kg: 4, 4 and 7 reps.
"warm up 100 6, 140 4" means warm-up sets; keep them and set warmup true. Never invent warm-up sets: add them only when the user says they warmed up or worked up. If they say they warmed up or worked up plate by plate without exact numbers, add warm-up sets below the first working weight in steps of one 20 kg plate per side (40 kg), starting at 60 kg, with fewer reps as it gets heavier (60x6, 100x4, 140x2, 180x1 style), and copy their usual warm-ups from the recent log if it has any. Reps in reserve N means rpe 10 minus N, never rpe N: "3 in reserve" is rpe 7, "8 reps in reserve" is rpe 2. Accessory work in minutes ("30 minutes of accessories") goes in accessoriesMinutes. For lifts measured in lengths, distance or time (sled drag, sled push, farmer's walk, carries), log kg as the load and reps as the number of lengths or rounds. If part of the note cannot be logged at all, put that part, in the user's words, in unclear, and still log everything else. Unclear holds only the user's own words or a short question to them, never your reasoning. Pullover, pull-over or lat pullover is the exercise Lat Pullover (Dumbbell Pullover when they say dumbbell), never Lat Pulldown; pulldown and pullover are different exercises. A number said with "kg" or "kilos" is always the weight, never reps: "two sets of 12 kg curls" is two sets at kg 12. Never invent a number the user did not say. When the user changes only the weight or only the reps of a logged set ("make the last set 15 kg instead of 17.5"), keep the other numbers of that set exactly as the recent log has them and don't ask about them. If a change or a new set still misses a number you can't find anywhere (like reps), make the change anyway with reps 0, which shows as ? in the app, and put a short question in unclear; never drop the whole change because one number is missing. If the sets or weight are known but the reps are not ("two sets of 12 kg curls", "three sets reps"), still log those sets with reps 0, which means reps unknown, and put a short question in unclear, like "Dumbbell Curl 12 kg: how many reps?". If the weight is unknown, use kg 0 only for bodyweight lifts; otherwise ask in unclear. For pull-ups, chin-ups, dips, push-ups and muscle-ups, kg is only the weight added on top of the body (kg 0 when nothing was added). When the user's bodyweight is given and a set's weight is within 5 kg of it, that set is bodyweight only: kg 0. When a weight is clearly bodyweight plus a plate (more than the bodyweight), subtract the bodyweight. Whenever you use unclear, also give fill and, if you can, guess. fill is the note written out as one log line with everything you did catch and ___ for each number you are missing, in the app's words, like "Overhead Press ___ kg × ___ reps, 3 sets" or "Bench Press 100 kg × 5, 5 sets, then Squat ___ kg × ___". guess is your single best complete reading of the note as a log line when the sound or the recent log makes one likely ("Overhead Press 60 kg × 6, 3 sets"); leave guess out when you would only be making numbers up.
"effort 70%" or "felt light" can become rpe (70% effort is about rpe 7).
Bodyweight exercises use kg 0, or the added weight.
Running, cycling, walking, sports and other cardio go in cardioMinutes, and what it was goes in cardioName in short Title Case English ("Football", "Cycling", "Running", "Walk", "Plyometrics", "Padel"); leave cardioName out when they only said "cardio". If the user changes or corrects the cardio already logged for a day ("change the cardio to 50", "50 minutes instead of 60", "it was 50, not 60"), put the new total in cardioMinutes and set cardioTotal true; otherwise cardioMinutes is added to what is there.
Keep the exercise the user named, in Title Case English: "single arm tricep extension" is "Single Arm Tricep Extension", never a different exercise like "Triceps Pushdown". Use a name from the known list only when it is the same exercise, differing just in spelling, plural or word order. If they name no specific variant, use common names like "Bench Press", "Deadlift", "Hack Squat".
If the user says which day it happened, set date as YYYY-MM-DD from the calendar below; a full date with a year ("26th of July 2024") is used exactly as said, however long ago. A note that only says when something happened, with no lifts or numbers ("this was 26th of July 2024", "that was yesterday"), is about the newest entry in the recent log: use move from that day to the new date (with the exercise when only one exercise was just added). Never log sets the user did not say in this note. "Last Friday" or "on Friday" means the most recent Friday before today, never the week before. "Yesterday" is the day before today. If no day is mentioned, leave date out.
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
    cardioName: { type: 'STRING' },
    cardioTotal: { type: 'BOOLEAN' },
    accessoriesMinutes: { type: 'INTEGER' },
    unclear: { type: 'STRING' },
    fill: { type: 'STRING' },
    guess: { type: 'STRING' },
    feedback: { type: 'STRING' },
    date: { type: 'STRING' },
    transcript: { type: 'STRING' },
    label: { type: 'STRING' },
    note: { type: 'STRING' },
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

const RAMBLE = `Spoken numbers come out mangled: "220 for 2" can arrive as "224 2", "2:24 2", "220 42", "220 4-2", "220 4 2" or "two twenty four two", because "for" sounds like 4 and gets glued to the numbers. Weight comes first, then reps; if a number looks like weight and reps glued together, split it, and prefer weights close to what this person lifted on that exercise in the recent log.\nSpeech-to-text garbles gym words badly, so read for what was meant: "tricep pusha down" is Triceps Pushdown, "bench pres" or "bench breast" is Bench Press, "dead lift" or "that lift" is Deadlift, "squad" is Squat, "for" or "four" can be the number 4 or the word for, "times" or "x" separates weight and reps, "kilo" and "kg" are kilograms. Match to the closest exercise in the known list or the recent log when the sounds fit, work out the numbers from context (weight first, then reps, then sets), and log it. Use unclear only when you truly cannot tell.\nThe note is often a long spoken ramble. It can repeat itself, correct itself ("70, no, 100"), jump between exercises, and include talk that has nothing to do with training. Ignore the unrelated talk, use the latest correction, and put each set under the right exercise and day. If they describe the same sets twice, log them once.`;

// Speech-to-text writes "220 for 2" as "220 4-2" or "220 4/2". After a weight, a 4 glued to the reps by a dash or slash
// is the word "for": read it as "220 for 2" before the AI sees it.
const unglue = (text) => String(text || '').replace(/\b(\d{2,3}(?:[.,]\d{1,2})?)(\s*(?:kg|kgs|kilos?|kilo)?)\s+4\s*[-–—/]\s*(\d{1,2})\b/gi, '$1$2 for $3');

const transcribe = async (env, audio, known = []) => {
  if (!env.AI) return '';
  try {
    // Whisper gets the gym words plus the lifts this person has logged, so it hears "pushdown", not "push down town".
    const vocabulary = ['bench press', 'paused bench', 'pause squat', 'hack squat', 'deadlift', 'incline', 'close-grip', 'lat pulldown', ...known.map((name) => name.toLowerCase())];
    const prompt = `Gym log, kilos, sets and reps: ${[...new Set(vocabulary)].slice(0, 40).join(', ')}, RPE, reps in reserve, warm-up, per side, top set.`;
    let result = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio, initial_prompt: prompt });
    // Gym noise makes Whisper guess the language wrong ("zwei, zehn minuten" for an English note). Notes here are
    // English or Swedish, so any other guess is heard again as English.
    const language = String(result?.transcription_info?.language || '');
    if (language && !['en', 'sv'].includes(language)) result = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio, initial_prompt: prompt, language: 'en' });
    const text = String(result?.text ?? '').trim();
    // Whisper makes these up when a recording has no speech in it (silence, a mic that picked up nothing).
    // Treat them as "heard nothing" so the app says so, instead of sending "Thank you very much." on.
    return SILENCE_WORDS.test(text) ? '' : text;
  } catch {
    return '';
  }
};
const SILENCE_WORDS = /^(?:(?:thank you(?: very much| so much| for watching)?|thanks(?: for watching)?|you|bye|tack(?: för att du tittade)?|undertexter[^.]*)[.!?,\s]*)+$/i;

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

const IMPORT_PROMPT = `You turn a lifter's training history into JSON days. The app is in English: the note may be in Swedish or any language, but write every exercise name, cardioName and label in short English ("knäböj" is "Squat", "marklyft" is "Deadlift", "bänkpress" is "Bench Press", "fotboll" is "Football", "benpass" is "Leg day"), and write unclear in the language the user used. The text can be anything: notes, an app export, messages to themselves, a spoken ramble, in any order, with unrelated talk mixed in. Ignore everything that is not training.
Each day gets its date as YYYY-MM-DD. Use the calendar below for relative dates like "yesterday" or "last Friday". If a date has no year, use the most recent past date with that day and month. Training with no date at all goes on today's date only if the text says it was today; otherwise put it in unclear in the user's words.
Training programs and plans often have no real dates, only days and weeks (Day 7, Week 2 Day 3, W3D2, "Day A", a sheet called "Day 6-10"). Never invent dates for them. Give each such day programDay: its number counted from the program's first training day across the whole file, using sheet names, sheet order ("Sheet 3 of 7") and day labels to know where you are (a sheet "Day 6-10" holds days 6 to 10; "Week 2 Day 3" with 5 days a week is day 8). Set date to "" for those days. Set programStart (YYYY-MM-DD) if the user's note or the text says when the program started, and daysPerWeek if it says or shows how many training days a week. Every day in the text is a separate day: never merge two days into one.
Get as much in as you can. A missing value never drops an exercise: "4x5" or "4 sets of 5" is four sets of 5 reps; reps without a weight get weight 0; a weight without reps gets reps 0; a percentage of a max becomes kg from the known best in the note (best × percentage, rounded to 2.5), otherwise weight 0. Ranges like "8-10" take the low end.
Weights are kilograms; convert pounds (lb, lbs) to kg rounded to 0.5. "120 for 4, 4 and 7" means three sets of 120 kg: 4, 4 and 7 reps. "3x5 at 100" means three sets of 100 kg for 5 reps. Reps in reserve N means rpe 10 minus N. "At 9" after a set means rpe 9. Keep warm-up sets only when they are marked as warm-ups, and set warmup true. "Paused" or "pause" with bench or squat means the lift Pause Bench Press or Pause Squat. A number said with "kg" is always the weight. Never invent reps or weights; unknown reps are 0. Keep the exercise the user named in Title Case ("single arm tricep extension" is "Single Arm Tricep Extension"); use a known-list name only when it is the same exercise. Cardio and sports go in cardioMinutes, with what it was in cardioName ("Football", "Cycling"); accessory work in minutes goes in accessoriesMinutes. If they named the session or said where it was, put a short name in label. Log each set once even if it is mentioned twice. For pull-ups, chin-ups, dips, push-ups and muscle-ups, kg is only the weight added on top of the body (kg 0 when nothing was added). When the user's bodyweight is given and a set's weight is within 5 kg of it, that set is bodyweight only: kg 0. When a weight is clearly bodyweight plus a plate (more than the bodyweight), subtract the bodyweight.`;

const DAY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    days: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          date: { type: 'STRING' },
          programDay: { type: 'INTEGER' },
          label: { type: 'STRING' },
          exercises: SCHEMA.properties.exercises,
          cardioMinutes: { type: 'INTEGER' },
          cardioName: { type: 'STRING' },
          accessoriesMinutes: { type: 'INTEGER' }
        },
        required: ['date', 'exercises']
      }
    },
    unclear: { type: 'STRING' },
    programStart: { type: 'STRING' },
    daysPerWeek: { type: 'INTEGER' }
  },
  required: ['days']
};

const calendarFor = (today) => Array.from({ length: 14 }, (unused, index) => {
  const day = new Date(Date.parse(`${today}T12:00:00Z`) - index * 86400000);
  return `${day.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })} ${day.toISOString().slice(0, 10)}${index === 0 ? ' (today)' : ''}`;
}).join('\n');

// Imports are read by stronger models that think first (a whole program needs reasoning); the light ones are the fallback.
const IMPORT_MODELS = 'gemini-pro-latest,gemini-3.1-pro-preview,gemini-3.8-flash,gemini-3.7-flash,gemini-flash-latest,gemini-3.5-flash';
// Why each import model said no (quota, busy, not found), so the import can say which AI really read it.
let refusals = [];
const askAi = async (env, system, user, schema, strong = false) => {
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
  const light = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  const strongOnes = (env.GEMINI_IMPORT_MODELS || IMPORT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  // Imports: the strong models get three rounds (they are often busy for a few seconds) before a light one may answer.
  const order = strong ? [...strongOnes, 'wait', ...strongOnes, 'wait', ...strongOnes, 'wait', ...light] : [...light, 'wait', ...light];
  let busy = false;
  const dead = new Set();
  for (const model of order) {
    if (dead.has(model)) continue;
    if (model === 'wait') {
      if (!busy) {
        if (strong) continue;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, strong ? 4000 : 1500));
      continue;
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature: 0, maxOutputTokens: strong ? 65536 : 8192, responseMimeType: 'application/json', responseSchema: schema } })
    });
    if (!response.ok) {
      const reason = strong || response.status === 404 ? await response.text().catch(() => '') : '';
      // A model that doesn't exist or has no free quota won't answer on the next round either.
      if (response.status === 404 || /quota/i.test(reason)) dead.add(model);
      else busy = busy || response.status === 429 || response.status >= 500;
      if (strong) refusals.push(`${model} ${response.status} ${reason.replace(/\s+/g, ' ').slice(0, 160)}`);
      continue;
    }
    const data = await response.json();
    try {
      const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '');
      if (parsed && typeof parsed === 'object' && strong) Object.defineProperty(parsed, 'model', { value: model });
      return parsed;
    } catch {
      continue;
    }
  }
  throw new Error(busy ? 'The AI was busy. Try again in a minute.' : 'The AI could not read that.');
};

// A piece that starts in the middle of a sheet repeats the sheet's name, so the AI always knows where it is.
const SHEET_LINE = /^### Sheet \d+ of \d+: /;
const chunksOf = (text, size = 8000) => {
  const chunks = [''];
  let sheet = '';
  for (const line of text.split('\n')) {
    if (SHEET_LINE.test(line)) sheet = line;
    if (chunks.at(-1).length + line.length > size && chunks.at(-1)) chunks.push(sheet && line !== sheet ? `${sheet} (continued)\n` : '');
    chunks[chunks.length - 1] += `${line}\n`;
  }
  return chunks.filter((chunk) => chunk.trim()).slice(0, 40);
};

const readDays = async (env, text, today, known, context = '', defer = false) => {
  refusals = [];
  const system = `${IMPORT_PROMPT}\nToday is ${today}.\nCalendar, newest first:\n${calendarFor(today)}\nKnown exercises: ${known.join(', ') || 'none yet'}${context ? `\nThe user's note about this data (use it for dates, the program's start and length, and anything else it says): "${context}"` : ''}`;
  // At most 6 pieces per request (the app sends big imports in parts): Workers Free allows 50 outside calls per request.
  const chunks = chunksOf(text).slice(0, 6);
  const parts = [];
  let failed = 0;
  let lastError = null;
  for (let start = 0; start < chunks.length; start += 3) {
    for (const outcome of await Promise.allSettled(chunks.slice(start, start + 3).map((chunk) => askAi(env, system, chunk, DAY_SCHEMA, true)))) {
      if (outcome.status === 'fulfilled') parts.push(outcome.value);
      else {
        failed += 1;
        lastError = outcome.reason;
      }
    }
  }
  if (!parts.length && lastError) throw lastError;
  const all = parts.flatMap((part) => Array.isArray(part?.days) ? part.days : []);
  let guessed = '';
  let program = null;
  // Program days get their dates here, the same way for every piece: start + whole weeks + the day's place in its week.
  const numbered = all.filter((day) => Number.isInteger(day?.programDay) && day.programDay > 0);
  if (numbered.length) {
    const note = `${context} ${text.slice(0, 2000)}`;
    const startText = parts.map((part) => part?.programStart).find((value) => DATE.test(value ?? ''));
    const lastDay = Math.max(...numbered.map((day) => day.programDay));
    const weeks = Number((note.match(/(\d+)\s*(?:-\s*)?weeks?/i) || [])[1]) || 0;
    const perWeek = Math.min(7, Math.max(1, parts.map((part) => part?.daysPerWeek).find((value) => Number.isInteger(value) && value > 0)
      || Number((note.match(/(\d)\s*(?:workouts?|sessions?|days?|times|pass)\s*(?:a|per|\/|i)\s*(?:week|vecka)/i) || [])[1])
      || (() => {
        // Sheets named in blocks ("Day 6-10") are usually one week each.
        const block = text.match(/^### Sheet \d+ of \d+: .*?(\d+)\s*[-–]\s*(\d+)/m);
        const size = block ? Number(block[2]) - Number(block[1]) + 1 : 0;
        return size >= 2 && size <= 7 ? size : 0;
      })()
      || (weeks ? Math.ceil(lastDay / weeks) : 4)));
    const offset = (programDay) => 7 * Math.floor((programDay - 1) / perWeek) + Math.round(((programDay - 1) % perWeek) * 7 / perWeek);
    const shift = (iso, days) => new Date(Date.parse(`${iso}T12:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
    let start = startText;
    if (!start && defer) {
      // The app sends a long file in parts; without a start date only the app sees the whole program, so it dates it.
      program = { perWeek, days: numbered.map((day) => ({ programDay: day.programDay, ...clean({ exercises: day.exercises, cardioMinutes: day.cardioMinutes, cardioName: day.cardioName, accessoriesMinutes: day.accessoriesMinutes, label: day.label }, today) })) };
      for (const day of numbered) day.date = '';
    } else {
      if (!start) {
        start = shift(today, -1 - offset(lastDay));
        guessed = `No start date was given, so the program ends yesterday and starts ${start}. Add a note like "started 7 March 2024" to place it right.`;
      }
      for (const day of numbered) day.date = shift(start, offset(day.programDay));
    }
  }
  const days = all
    .filter((day) => DATE.test(day?.date ?? '') && day.date <= today)
    .map((day) => ({ ...clean({ exercises: day.exercises, cardioMinutes: day.cardioMinutes, cardioName: day.cardioName, accessoriesMinutes: day.accessoriesMinutes, label: day.label }, today), date: day.date }));
  const unclear = [guessed, ...parts.map((part) => part?.unclear)].filter(Boolean).join(' ').slice(0, 500);
  return { days, unclear, failed, models: [...new Set(parts.map((part) => part?.model).filter(Boolean))], refused: [...new Set(refusals)].slice(0, 8), program };
};

const containsSets = (have, want) => {
  const left = have.map((set) => `${Number(set.kg)}x${Number(set.reps)}`);
  return want.every((set) => {
    const index = left.indexOf(`${Number(set.kg)}x${Number(set.reps)}`);
    if (index < 0) return false;
    left.splice(index, 1);
    return true;
  });
};
const sameSets = (first, second) => first.length === second.length && first.every((set, index) => Number(set.kg) === Number(second[index].kg) && Number(set.reps) === Number(second[index].reps));

// Same rule as the app: the same lift with the same sets is left alone; a lift already on that day from before is
// replaced by this import (newest wins); within one import, sets of the same lift on the same day are kept together.
const mergeDays = (sessions, days) => {
  const summary = [];
  const fromThis = new Set();
  for (const day of days) {
    const session = sessions.get(day.date) ?? { date: day.date, exercises: [], cardio: 0 };
    let added = 0;
    for (const exercise of day.exercises) {
      const sets = exercise.sets.map((set) => ({ kg: String(set.kg), reps: Number(set.reps) > 0 ? String(set.reps) : '', ...(set.rpe ? { rpe: set.rpe } : {}), ...(set.warmup ? { warmup: true } : {}), edited: true, imported: true }));
      const key = `${day.date}|${exercise.name.toLowerCase()}`;
      const same = session.exercises.find((item) => item.name.toLowerCase() === exercise.name.toLowerCase());
      if (same && !fromThis.has(key) && containsSets(same.sets, sets)) {
        fromThis.add(key);
        continue;
      }
      if (same && fromThis.has(key)) same.sets.push(...sets);
      else if (same) same.sets = [...sets, ...same.sets.filter((set) => !set.imported && !sets.some((other) => sameSets([set], [other])))];
      else session.exercises.push({ name: exercise.name, sets });
      fromThis.add(key);
      added += sets.length;
    }
    if (day.cardioMinutes && !session.cardio) session.cardio = day.cardioMinutes;
    if (day.cardioName && !session.cardioName) session.cardioName = day.cardioName;
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
  // D1 takes at most 100 values per query, so look the days up 90 at a time.
  const rows = [];
  for (let start = 0; start < dates.length; start += 90) {
    const group = dates.slice(start, start + 90);
    rows.push(...(await env.DB.prepare(`SELECT date, data FROM sessions WHERE profile = ? AND date IN (${group.map(() => '?').join(', ')})`).bind(key, ...group).all()).results);
  }
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

// Import of a table the app could not read by itself: the AI only says which column holds what (from the first rows),
// and the app reads every row on the phone. One small call, whatever the file size.
const COLUMNS_PROMPT = `You get the first rows of a lifting log table. Each line is "row N:" then the cells, numbered [0], [1], ... Say which row is the header (-1 if there is none) and which column index holds each thing, or -1 if no column does.
date: the day of the workout. exercise: the exercise name. weight: the load lifted. reps: repetitions. sets: a number of sets when one row stands for several sets (not a set number or order). rpe: RPE. rir: reps in reserve. warmup: a column that marks warm-up sets or the set type. label: the workout or session name. unit: a column with the weight unit.
weightUnit is "lb" if weights are in pounds, otherwise "kg". dateOrder is "dmy", "mdy" or "ymd" for how dates are written.`;
const COLUMNS_SCHEMA = {
  type: 'OBJECT',
  properties: Object.fromEntries([...['headerRow', 'date', 'exercise', 'weight', 'reps', 'sets', 'rpe', 'rir', 'warmup', 'label', 'unit'].map((name) => [name, { type: 'INTEGER' }]), ['weightUnit', { type: 'STRING' }], ['dateOrder', { type: 'STRING' }]]),
  required: ['headerRow', 'date', 'exercise', 'weight', 'reps']
};
const columns = async (request, env) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Missing key.' }, 400);
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `columns:${key}` });
    if (!success) return limited(env, request, 'columns', 'Slow down a little. Try again in a minute.');
  }
  const body = await request.json().catch(() => null);
  const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 15).map((row, index) => `row ${index}: ${(Array.isArray(row) ? row : []).slice(0, 40).map((cell, column) => `[${column}] ${String(cell ?? '').slice(0, 60)}`).join(' | ')}`) : [];
  if (!rows.length) return json({ error: 'No rows.' }, 400);
  try {
    return json(await askAi(env, COLUMNS_PROMPT, rows.join('\n'), COLUMNS_SCHEMA));
  } catch (error) {
    return json({ error: error.message }, 503);
  }
};

// A name is an account: once someone has it, typing it on a new phone (or after deleting the app, or on a fresh
// /join link) opens that person's latest log instead of an empty one. The admin profile is never handed out this way.
const nameLookup = async (request, env) => {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, 40) : '';
  if (!name) return json({ error: 'No name.' }, 400);
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `name:${request.headers.get('cf-connecting-ip') || 'x'}` });
    if (!success) return json({ error: 'Slow down a little. Try again in a minute.' }, 429);
  }
  // Two profiles with one name (from before names were accounts): the one written to last wins.
  const row = await env.DB.prepare("SELECT id FROM profiles p WHERE lower(trim(json_extract(meta, '$.name'))) = ?1 ORDER BY coalesce((SELECT max(updated) FROM sessions s WHERE s.profile = p.id), 0) DESC, meta_updated DESC LIMIT 1").bind(name).first();
  if (!row) return json({ free: true });
  if (row.id === env.ADMIN_PROFILE) return json({ taken: true });
  return json({ key: row.id });
};

const speechToText = async (request, env) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Missing key.' }, 400);
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `speech:${key}` });
    if (!success) return limited(env, request, 'speech', 'Slow down a little. Try again in a minute.');
  }
  const body = await request.json().catch(() => null);
  const audio = typeof body?.audio === 'string' && /^[A-Za-z0-9+/=]+$/.test(body.audio) && body.audio.length <= MAX_AUDIO ? body.audio : '';
  if (!audio) return json({ error: 'No recording.' }, 400);
  const known = Array.isArray(body?.known) ? body.known.filter((name) => typeof name === 'string').slice(0, 40).map((name) => name.slice(0, 60)) : [];
  const text = await transcribe(env, audio, known);
  return text ? json({ text }) : json({ error: 'Could not hear that. Try again.' }, 502);
};

const add = async (request, env, ctx) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Send your Exodia key in the x-exodia-key header.' }, 400);
  if (env.PARSE_LIMITER) {
    const { success } = await env.PARSE_LIMITER.limit({ key: `add:${key}` });
    if (!success) return limited(env, request, 'add', 'Slow down a little. Try again in a minute.');
  }
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 48000) : '';
  if (!text) return json({ error: 'Send your training as text.' }, 400);
  const today = typeof body?.today === 'string' && DATE.test(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const existing = (await env.DB.prepare('SELECT data FROM sessions WHERE profile = ? AND data IS NOT NULL ORDER BY date DESC LIMIT 200').bind(key).all()).results;
  const sent = Array.isArray(body?.known) ? body.known.filter((name) => typeof name === 'string').map((name) => name.slice(0, 60)) : [];
  const known = [...new Set([...existing.flatMap((row) => JSON.parse(row.data).exercises.map((exercise) => exercise.name)), ...sent])].slice(0, 100);
  try {
    const weighs = Number(body?.bodyweight) >= 30 && Number(body?.bodyweight) <= 250 ? `The user weighs ${Number(body.bodyweight)} kg.` : '';
    const context = [typeof body?.context === 'string' ? body.context.trim().slice(0, 1500) : '', weighs].filter(Boolean).join('\n');
    const { days, unclear, failed, models, refused, program } = await readDays(env, text, today, known, context, body.dry === true && body.defer === true);
    if (body.dry === true) {
      const sessions = new Map();
      const added = mergeDays(sessions, days);
      return json({ added, unclear, failed, models, refused, sessions: [...sessions.values()], ...(program ? { program } : {}) });
    }
    const added = await addDays(env, key, days);
    logCommand(request, env, ctx, body, text.slice(0, 500), { added: added.slice(0, 40), days: added.length, unclear, failed, engine: 'add' });
    return json({ added, unclear, failed });
  } catch (error) {
    logCommand(request, env, ctx, body, text.slice(0, 500), { error: String(error.message) });
    // Say plainly what went wrong; the technical reason stays in the admin log.
    const saving = /D1|SQL|database/i.test(String(error.message));
    return json({ error: saving ? 'Saving to the database failed, so nothing was added. Marcus can see why in Admin.' : error.message }, 503);
  }
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
// Our own per-person limit (10 a minute) was hit: kept as an error event so the admin dashboard shows it.
const limited = async (env, request, what, message) => {
  const key = request.headers.get('x-exodia-key') || '';
  await env.DB.prepare('INSERT INTO events (at, profile, kind, detail) VALUES (?, ?, ?, ?)').bind(Date.now(), PROFILE_KEY.test(key) ? key : 'anonymous', 'error', `Too many requests (${what})`).run().catch(() => {});
  return json({ error: message }, 429);
};

const cleanSet = (set) => ({ kg: Math.min(1000, Math.max(0, Number(set?.kg) || 0)), reps: Math.min(100, Math.max(0, Math.round(Number(set?.reps) || 0))), ...(Number(set?.rpe) >= 1 && Number(set?.rpe) <= 10 ? { rpe: Number(set.rpe) } : {}), ...(set?.warmup === true ? { warmup: true } : {}) });

// A full date said or typed ("26th of July 2024", "July 26, 2024", "26/7/2024", "2024-07-26", "7 mars 2024"), read
// without AI: when the AI forgets it, the sets would land on today.
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'ma', 'jun', 'jul', 'aug', 'sep', 'o', 'nov', 'dec'];
const monthOf = (word) => {
  const name = word.toLowerCase();
  if (/^(may|maj)/.test(name)) return 5;
  if (/^(oct|okt)/.test(name)) return 10;
  if (/^mar/.test(name)) return 3;
  const index = MONTHS.findIndex((start) => start.length > 2 && name.startsWith(start));
  return index >= 0 ? index + 1 : 0;
};
const MONTH_WORD = '(jan(?:uary|uari)?|feb(?:ruary|ruari)?|mar(?:ch|s)?|apr(?:il)?|ma[yj]|jun[ei]?|jul[iy]?|aug(?:ust|usti)?|sep(?:t|tember)?|o[ck]t(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const saidDates = (text) => {
  const found = new Set();
  const add = (year, month, day) => {
    if (year >= 1980 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) found.add(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };
  const lower = String(text || '').toLowerCase();
  for (const match of lower.matchAll(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g)) add(+match[1], +match[2], +match[3]);
  for (const match of lower.matchAll(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/g)) add(+match[3], +match[2], +match[1]);
  for (const match of lower.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th|e|a)?(?:\\s+of)?\\s+${MONTH_WORD}\\.?,?\\s+(\\d{4})\\b`, 'g'))) add(+match[3], monthOf(match[2]), +match[1]);
  for (const match of lower.matchAll(new RegExp(`\\b${MONTH_WORD}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, 'g'))) add(+match[3], monthOf(match[1]), +match[2]);
  return [...found];
};
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
  const cardioName = cardioMinutes && typeof raw?.cardioName === 'string' && !/^cardio$/i.test(raw.cardioName.trim()) ? raw.cardioName.trim().replace(/\s+/g, ' ').slice(0, 30) : '';
  const date = typeof raw?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null;
  // Any past day the user names counts (old training added later), but nothing in the future or before 1980.
  const valid = date && today && date <= today && date >= '1980-01-01';
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
  const unclear = typeof raw?.unclear === 'string' ? raw.unclear.trim().slice(0, 1000) : '';
  const feedback = typeof raw?.feedback === 'string' ? raw.feedback.trim().slice(0, 2000) : '';
  // With a question: the note as far as it was caught, with ___ where a number is missing, and a best full reading.
  const fill = unclear && typeof raw?.fill === 'string' ? raw.fill.trim().slice(0, 300) : '';
  const guess = unclear && typeof raw?.guess === 'string' && /\d/.test(raw.guess) ? raw.guess.trim().slice(0, 300) : '';
  return { exercises, cardioMinutes, ...(cardioName ? { cardioName } : {}), transcript, remove, replace, move, ...(cardioMinutes && raw?.cardioTotal === true ? { cardioTotal: true } : {}), ...(accessoriesMinutes ? { accessoriesMinutes } : {}), ...(unclear ? { unclear } : {}), ...(fill ? { fill } : {}), ...(guess ? { guess } : {}), ...(feedback ? { feedback } : {}), ...(label ? { label } : {}), ...(valid ? { date } : {}) };
};

// A friend's message that isn't training (nothing to log, AI couldn't read it) goes to Marcus as feedback, so it shows
// up in his list instead of getting lost. Marcus's own messages don't: he talks to the app all day.
const logsNothing = (result) => !result?.exercises?.length && !result?.cardioMinutes && !result?.accessoriesMinutes && !result?.remove?.length && !result?.replace?.length && !result?.move?.length && !result?.label && !result?.feedback;
const keepAsFeedback = (request, env, ctx, body, said, result) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key) || key === env.ADMIN_PROFILE || !result?.unclear || !logsNothing(result) || !said?.trim() || body?.dry === true) return;
  const name = typeof body?.name === 'string' ? body.name.slice(0, 40) : '';
  ctx.waitUntil(env.DB.prepare('INSERT INTO feedback (at, profile, name, kind, title, details, said) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(Date.now(), key, name, 'idea', said.trim().slice(0, 80), `Typed in the main box, not training: "${said.trim().slice(0, 1500)}"`, said.slice(0, 4000)).run().catch(() => null));
};

const logCommand = (request, env, ctx, body, said, result) => {
  if (body?.dry === true) return;
  const profile = request.headers.get('x-exodia-key') ?? '';
  ctx.waitUntil(env.DB.prepare('INSERT INTO commands (at, profile, name, said, result) VALUES (?, ?, ?, ?, ?)')
    .bind(Date.now(), PROFILE_KEY.test(profile) ? profile.slice(0, 6) : 'unknown', typeof body?.name === 'string' ? body.name.slice(0, 40) : '', String(said || '').slice(0, 2000), JSON.stringify(result).slice(0, 4000))
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
    if (!success) return limited(env, request, 'search', 'Slow down a little.');
  }
  // Search is easy: Lite models first, so the full Flash models' small free daily quota stays for notes.
  const all = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean).reverse();
  const models = all.filter((model) => !cooling(model)).length ? all.filter((model) => !cooling(model)) : all;
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
    if (response.status === 429 || response.status >= 500) {
      coolDown(model, response.status, await response.text().catch(() => ''));
      continue;
    }
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
  const begun = Date.now();
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
      if (!success) return limited(env, request, 'parse', 'Slow down a little. Try again in a minute.');
    }
  }
  const today = typeof body?.today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : null;
  const weekday = today ? new Date(`${today}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }) : '';
  const calendar = today ? Array.from({ length: 14 }, (unused, index) => { const day = new Date(Date.parse(`${today}T12:00:00Z`) - index * 86400000); return `${day.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })} ${day.toISOString().slice(0, 10)}${index === 0 ? ' (today)' : index === 1 ? ' (yesterday)' : ''}`; }).join('\n') : '';
  const recent = typeof body?.recent === 'string' ? body.recent.slice(0, 4000) : '';
  const viewing = typeof body?.viewing === 'string' && DATE.test(body.viewing) ? body.viewing : today;
  const focus = typeof body?.focus === 'string' ? body.focus.slice(0, 200) : '';
  const asked = typeof body?.asked === 'string' ? body.asked.slice(0, 600) : '';
  const known = Array.isArray(body?.known) ? body.known.filter((name) => typeof name === 'string').slice(0, 40).map((name) => name.slice(0, 60)) : [];
  const models = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((model) => model.trim()).filter(Boolean);
  const hint = typeof body?.hint === 'string' ? body.hint.slice(0, MAX_TEXT) : '';
  const weighs = Number(body?.bodyweight) >= 30 && Number(body?.bodyweight) <= 250 ? `\nThe user weighs ${Number(body.bodyweight)} kg.` : '';
  const context = `Today is ${weekday} ${today ?? 'unknown'}.${weighs}\nCalendar, newest first:\n${calendar}\nKnown exercises: ${known.join(', ') || 'none yet'}\nDay in view: ${viewing}${focus ? `\nThe user is editing ${focus}. Plain sets ("75 kg T-bar 10 reps", "one more at 100 for 5", "add 3x10 curls") are new sets for that day: put them in exercises with that date, so they are added after the sets already there, even for an exercise already in the workout. Use replace or remove with that date only when they ask to change or remove something ("change", "make it", "should be", "was", "not", "instead", "wrong", "fix", "remove", "delete", or a set number like "set 2 is 80"), and then change only the sets they name, keeping every other set as it was.` : ''}${asked ? `\nExodia's last question to the user: "${asked}". If this message answers it, complete what was asked: use the exercise and day named in the question, even if the answer is garbled or names a similar exercise ("lat pulldown overs" answering a question about Lat Pullover is Lat Pullover).` : ''}\nRecent log, newest first:\n${recent || 'nothing logged yet'}`;
  // The app asks Whisper first so it can show your words at once, and sends them along: no second Whisper run.
  const heard = audio ? unglue(typeof body?.heard === 'string' && body.heard.trim() ? body.heard.trim().slice(0, MAX_TEXT) : await transcribe(env, audio, known)) : '';
  const words = unglue(text) || heard || (audio ? hint : '');
  if (env.ANTHROPIC_API_KEY && words) {
    try {
      const result = clean({ ...(await askClaude(env, context, `${words}${heard && hint && !text ? `\n\n(The phone's own speech-to-text heard: "${hint}". Use it only for unclear words.)` : ''}`)), transcript: heard || text }, today);
      logCommand(request, env, ctx, body, text || heard || 'Voice note', { ...result, engine: 'claude', ms: Date.now() - begun });
      keepAsFeedback(request, env, ctx, body, text || heard, result);
      return json({ ...result, engine: 'claude' });
    } catch (error) {
      console.log('Claude failed, using Gemini', String(error).slice(0, 200));
    }
  }
  let lastError = '';
  let busy = false;
  const system = `${PROMPT}\n${RAMBLE}${heard ? `\nWhisper, a strong speech-to-text tuned to gym words, heard: "${heard}". Use it together with the audio; when they disagree on a word, pick what makes sense for lifting.` : ''}${hint ? `\nThe phone's own live speech-to-text heard: "${hint}". It is often wrong, use it only as a last resort for unclear words.` : ''}\nToday is ${weekday} ${today ?? 'unknown'}.${weighs}\nCalendar, newest first:\n${calendar}\nKnown exercises: ${known.join(', ') || 'none yet'}\nDay in view: ${viewing}${focus ? `\nThe user is editing ${focus}. Plain sets ("75 kg T-bar 10 reps", "one more at 100 for 5", "add 3x10 curls") are new sets for that day: put them in exercises with that date, so they are added after the sets already there, even for an exercise already in the workout. Use replace or remove with that date only when they ask to change or remove something ("change", "make it", "should be", "was", "not", "instead", "wrong", "fix", "remove", "delete", or a set number like "set 2 is 80"), and then change only the sets they name, keeping every other set as it was.` : ''}${asked ? `\nExodia's last question to the user: "${asked}". If this message answers it, complete what was asked: use the exercise and day named in the question, even if the answer is garbled or names a similar exercise ("lat pulldown overs" answering a question about Lat Pullover is Lat Pullover).` : ''}\nRecent log, newest first:\n${recent || 'nothing logged yet'}`;
  const trace = [];
  // Saved with each note so speed per model can be read from the commands table: "3.5-flash 200 2140".
  const timing = () => ({ ms: Date.now() - begun, tried: trace.map((step) => `${step.model.replace('gemini-', '')} ${step.status} ${step.ms}`) });
  let asking = 0;
  const ask = async (all, rounds) => {
    // Models that just failed sit out a minute (unless nothing else is left), so the next note doesn't wait on them.
    const fresh = all.filter((model) => !cooling(model));
    const list = fresh.length ? fresh : all;
    for (let round = 0; round < rounds; round += 1) {
      if (round && !busy) break;
      if (round) await new Promise((resolve) => setTimeout(resolve, 1500 * round));
      for (const model of list) {
        const started = Date.now();
        // Busy Google: the strong models get 10 s of the note's time in all, then a Lite model answers (1–3 s). A note
        // that waited 40 s for three busy models before Flash-Lite read it in 2 s is what this stops.
        const lite = /lite/.test(model);
        asking = asking || started;
        const spare = asking + 10000 - started;
        if (!lite && spare < 2500 && list.some((other) => /lite/.test(other))) continue;
        // Google sometimes hangs for minutes when busy; with low thinking a normal answer takes 1–3 s, so give up on a
        // model after 7 s (18 s with audio) and ask the next one instead of keeping the person waiting.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), Math.min(audio ? 18000 : 7000, lite || !list.some((other) => /lite/.test(other)) ? Infinity : spare));
        let response;
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [...(audio ? [{ inlineData: { mimeType: 'audio/wav', data: audio } }] : []), { text: text || 'Log the sets in this voice note.' }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: 'application/json', responseSchema: SCHEMA, ...(THINK_LOW ? { thinkingConfig: { thinkingLevel: 'low' } } : {}) }
          }),
          signal: controller.signal
        });
        } catch (error) {
          clearTimeout(timer);
          trace.push({ model, status: 'timeout', ms: Date.now() - started });
          COOLING.set(model, Math.max(COOLING.get(model) || 0, Date.now() + 60000));
          lastError = `${model}: no answer in time`;
          busy = true;
          continue;
        }
        trace.push({ model, status: response.status, ms: Date.now() - started });
        if (!response.ok) {
          clearTimeout(timer);
          const reason = await response.text().catch(() => '');
          const why = coolDown(model, response.status, reason);
          lastError = `${model}: ${response.status} ${why || reason.replace(/\s+/g, ' ').slice(0, 160)}`;
          trace.at(-1).error = lastError.slice(0, 160);
          busy = busy || response.status === 429 || response.status >= 500;
          continue;
        }
        const data = await response.json().catch(() => null);
        clearTimeout(timer);
        const output = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
        try {
          return { result: clean(JSON.parse(output), today), model };
        } catch {
          lastError = `${model}: answer could not be read`;
        }
      }
    }
    return null;
  };
  const logs = (result) => Boolean(result.exercises?.length || result.cardioMinutes || result.remove?.length || result.replace?.length || result.move?.length || result.accessoriesMinutes || result.label);
  // A set is only real if its weight or reps were actually said (typed, or heard in the voice note): an AI that copies
  // a day from the recent log ("this was 26 July" became five deadlift sets) is caught here.
  const said = `${text} ${heard} ${hint}`.toLowerCase().replace(/(\d),(\d)/g, '$1.$2');
  const spoken = new Set((said.match(/\d+(?:\.\d+)?/g) || []).map(Number));
  const wordNumbers = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/.test(said);
  const invented = (result) => !(audio && !heard) && !wordNumbers && (result.exercises || []).some((exercise) => exercise.sets.length && exercise.sets.every((set) => !spoken.has(Number(set.kg)) && !spoken.has(Number(set.reps))));
  // Strongest Flash first (Gemini 3.8 Flash), Lite models only as a last resort, for voice and text alike.
  const tries = audio && env.GEMINI_VOICE_MODEL ? [...new Set([env.GEMINI_VOICE_MODEL, ...models])] : models;
  // The app's background second try: straight to the stronger models, no hurry (the note already got its quick answer).
  const strongModels = (env.GEMINI_IMPORT_MODELS || IMPORT_MODELS).split(',').map((model) => model.trim()).filter((model) => model && !/pro/.test(model));
  let found = body?.strong === true ? await ask(strongModels, 1) : await ask(tries, 2);
  // Not understood (and not feedback): a stronger model that thinks first gets one more look before giving up.
  // The second look only gets a note that's still young: after 12 s you'd rather hear "which lift?" than wait 40 s.
  if ((!found || (!logs(found.result) && !found.result.feedback)) && Date.now() - begun < 12000) {
    const strong = (env.GEMINI_IMPORT_MODELS || IMPORT_MODELS).split(',').map((model) => model.trim()).filter((model) => model && !/pro/.test(model));
    const second = await ask(strong, 2);
    if (second && (!found || logs(second.result) || second.result.feedback)) found = second;
  }
  if (found && invented(found.result)) {
    found.result.exercises = found.result.exercises.filter((exercise) => exercise.sets.some((set) => spoken.has(Number(set.kg)) || spoken.has(Number(set.reps))));
    if (!logs(found.result) && !found.result.unclear) found.result.unclear = 'Which lift and numbers? Say it like "bench 100 for 5".';
  }
  if (found) {
    const result = found.result;
    const dates = saidDates(`${text} ${heard}`).filter((date) => !today || date <= today);
    if (dates.length === 1 && (result.exercises?.length || result.cardioMinutes) && !result.move?.length && result.date !== dates[0]) result.date = dates[0];
    logCommand(request, env, ctx, body, text || result.transcript, { engine: found.model, ...timing(), ...result });
    keepAsFeedback(request, env, ctx, body, text || result.transcript, result);
    return json({ ...result, engine: found.model, ...(body?.dry === true ? { trace } : {}) });
  }
  logCommand(request, env, ctx, body, text || 'Voice note', { error: `No AI model accepted it. ${lastError}`, ...timing() });
  if (busy) return json({ error: 'Google’s AI was busy. Your note is fine, try again in a minute.', transcript: heard }, 503);
  return json({ error: 'The AI could not read that note. Try again, or type it.', transcript: heard }, 502);
};

// Two versions of one day: start from the newest and add what the other one has that it lacks (whole lifts, or
// sets of a lift). A day deleted on one side and changed on the other keeps the training.
const mergeDay = (newestJson, otherJson) => {
  if (!otherJson) return newestJson;
  if (!newestJson) return otherJson;
  try {
    const newest = JSON.parse(newestJson);
    const other = JSON.parse(otherJson);
    for (const exercise of other.exercises || []) {
      const same = (newest.exercises || []).find((item) => item.name.toLowerCase() === exercise.name.toLowerCase());
      if (!same) {
        newest.exercises = [...(newest.exercises || []), exercise];
        continue;
      }
      const left = same.sets.map((set) => `${Number(set.kg)}x${Number(set.reps)}`);
      for (const set of exercise.sets || []) {
        const index = left.indexOf(`${Number(set.kg)}x${Number(set.reps)}`);
        if (index >= 0) left.splice(index, 1);
        else same.sets.push(set);
      }
    }
    newest.cardio = Math.max(Number(newest.cardio) || 0, Number(other.cardio) || 0);
    if (!newest.label && other.label) newest.label = other.label;
    if (newest.accessories == null && other.accessories != null) newest.accessories = other.accessories;
    return JSON.stringify(newest);
  } catch {
    return newestJson;
  }
};
const mergeMeta = (currentJson, incomingJson, incomingNewer) => {
  try {
    const current = JSON.parse(currentJson || '{}');
    const incoming = JSON.parse(incomingJson);
    const seen = new Set();
    const log = [...(incoming.log || []), ...(current.log || [])]
      .filter((entry) => {
        const id = `${entry?.at}|${entry?.said}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .sort((first, second) => (second.at || 0) - (first.at || 0))
      .slice(0, 80);
    const bests = { ...(current.bests || {}) };
    // A phone that still has the bench best new phones wrongly started with (2–5 Nov) can't write it back.
    const leaked = JSON.stringify(incoming.bests || {}) === '{"Bench Press":145}';
    for (const [name, value] of Object.entries(leaked ? {} : incoming.bests || {})) bests[name] = Math.max(Number(bests[name]) || 0, Number(value) || 0);
    const name = incomingNewer ? incoming.name : current.name || incoming.name;
    const bodyNow = incomingNewer ? incoming.body || current.body : current.body || incoming.body;
    // Gym visits are only ever added: a device on an older Exodia (no visits) never wipes them.
    // Same day on both: what each copy knows is kept (place, time, how long, what you did and how hard), the incoming
    // copy winning only where it actually says something, so a phone with an older plain copy can't undo any of it.
    const asVisit = (visit) => (typeof visit === 'string' ? { place: visit } : visit && typeof visit === 'object' ? visit : {});
    const richer = (one, other) => {
      const merged = { ...asVisit(other) };
      for (const [key, value] of Object.entries(asVisit(one))) if (value !== '' && value !== null && value !== undefined && !(key === 'minutes' && !(Number(value) > 0))) merged[key] = value;
      return Object.keys(merged).length === 1 && merged.place ? merged.place : merged;
    };
    const visits = { ...(current.visits || {}) };
    for (const [date, visit] of Object.entries(incoming.visits || {})) visits[date] = visits[date] ? richer(visit, visits[date]) : visit;
    return JSON.stringify({ name: String(name ?? '').slice(0, 40), bests, log, ...(bodyNow ? { body: bodyNow } : {}), ...(Object.keys(visits).length ? { visits } : {}) });
  } catch {
    return incomingJson;
  }
};
const sync = async (request, env) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Bad key' }, 400);
  if (env.SYNC_LIMITER) {
    const { success } = await env.SYNC_LIMITER.limit({ key });
    if (!success) return limited(env, request, 'sync', 'Slow down a little.');
  }
  const body = await request.json().catch(() => null);
  // Someone opened a private /me/ link: only say whose it is and whether it has a log, so the app can ask before opening it.
  if (body?.peek === true) {
    const row = await env.DB.prepare('SELECT meta, (SELECT count(*) FROM sessions WHERE profile = ?1 AND data IS NOT NULL) AS days FROM profiles WHERE id = ?1').bind(key).first();
    let name = '';
    try { name = String(JSON.parse(row?.meta || '{}').name || '').slice(0, 40); } catch { name = ''; }
    return json({ name, days: row?.days || 0 });
  }
  const since = Number.isInteger(body?.since) && body.since >= 0 ? body.since : 0;
  const changes = (Array.isArray(body?.changes) ? body.changes : [])
    .slice(0, MAX_CHANGES)
    .filter((change) => typeof change?.date === 'string' && DATE.test(change.date) && Number.isFinite(change.updated))
    .map((change) => ({ date: change.date, updated: Math.round(change.updated), base: Number.isFinite(change.base) ? Math.round(change.base) : null, data: change.data && typeof change.data === 'object' ? JSON.stringify(change.data) : null }))
    .filter((change) => change.data === null || change.data.length <= MAX_RECORD);
  const meta = body?.meta && typeof body.meta === 'object' && Number.isFinite(body.meta.updated)
    ? { json: JSON.stringify({ name: String(body.meta.name ?? '').slice(0, 40), bests: body.meta.bests && typeof body.meta.bests === 'object' ? body.meta.bests : {}, log: Array.isArray(body.meta.log) ? body.meta.log.slice(0, 80) : [], ...(Number(body.meta.body?.kg) >= 30 && Number(body.meta.body?.kg) <= 250 && ['male', 'female'].includes(body.meta.body?.sex) ? { body: { kg: Number(body.meta.body.kg), sex: body.meta.body.sex, ...(Number(body.meta.body.cm) >= 120 && Number(body.meta.body.cm) <= 230 ? { cm: Math.round(Number(body.meta.body.cm)) } : {}) } } : {}), ...cleanVisits(body.meta.visits) }), updated: Math.round(body.meta.updated) }
    : null;
  if (meta && meta.json.length > MAX_RECORD * 4) return json({ error: 'Too big' }, 400);
  const now = Date.now();
  const statements = [env.DB.prepare('INSERT OR IGNORE INTO profiles (id, created) VALUES (?, ?)').bind(key, now)];
  if (changes.length || meta) statements.push(env.DB.prepare('UPDATE profiles SET seq = seq + 1 WHERE id = ?').bind(key));
  // Apps that say which version of a day they edited (base) never lose work to a clock that is off: an edit on top of
  // the newest version simply wins; an edit on top of an older one is merged into the newest, nothing dropped.
  // The server's own clock stamps every write. Older apps without base keep the old newest-stamp-wins rule.
  const existing = new Map();
  const knowing = changes.filter((change) => change.base !== null);
  for (let index = 0; index < knowing.length; index += 90) {
    const group = knowing.slice(index, index + 90);
    const found = await env.DB.prepare(`SELECT date, data, updated FROM sessions WHERE profile = ? AND date IN (${group.map(() => '?').join(',')})`).bind(key, ...group.map((change) => change.date)).all();
    for (const row of found.results) existing.set(row.date, row);
  }
  for (const change of changes) {
    if (change.base === null) {
      statements.push(env.DB.prepare('INSERT INTO sessions (profile, date, data, updated, seq) VALUES (?1, ?2, ?3, ?4, (SELECT seq FROM profiles WHERE id = ?1)) ON CONFLICT (profile, date) DO UPDATE SET data = excluded.data, updated = excluded.updated, seq = excluded.seq WHERE excluded.updated > sessions.updated').bind(key, change.date, change.data, change.updated));
      continue;
    }
    const row = existing.get(change.date);
    const data = row && change.base < row.updated ? mergeDay(row.data, change.data) : change.data;
    statements.push(env.DB.prepare('INSERT INTO sessions (profile, date, data, updated, seq) VALUES (?1, ?2, ?3, ?4, (SELECT seq FROM profiles WHERE id = ?1)) ON CONFLICT (profile, date) DO UPDATE SET data = excluded.data, updated = excluded.updated, seq = excluded.seq').bind(key, change.date, data, Math.max(now, (row?.updated || 0) + 1)));
  }
  if (meta) {
    // The log, bests and name from two devices are combined, never one replacing the other.
    const current = await env.DB.prepare('SELECT meta, meta_updated FROM profiles WHERE id = ?').bind(key).first();
    const merged = mergeMeta(current?.meta, meta.json, meta.updated >= (current?.meta_updated || 0));
    statements.push(env.DB.prepare('UPDATE profiles SET meta = ?2, meta_updated = ?3, meta_seq = seq WHERE id = ?1').bind(key, merged, Math.max(now, (current?.meta_updated || 0) + 1)));
  }
  statements.push(env.DB.prepare('SELECT date, data, updated FROM sessions WHERE profile = ? AND seq > ?').bind(key, since));
  statements.push(env.DB.prepare('SELECT seq, meta, meta_updated, meta_seq FROM profiles WHERE id = ?').bind(key));
  const results = await env.DB.batch(statements);
  const rows = results.at(-2).results;
  const profile = results.at(-1).results[0];
  // Logs two people ended up sharing: SPLIT_PROFILES (a secret) maps the profile key to the names, owner first.
  let split = null;
  try {
    split = JSON.parse(env.SPLIT_PROFILES || '{}')[key] || null;
  } catch {
    split = null;
  }
  return json({
    ...(split ? { split } : {}),
    admin: Boolean(env.ADMIN_PROFILE) && key === env.ADMIN_PROFILE,
    cursor: profile.seq,
    sessions: rows.map((row) => ({ date: row.date, updated: row.updated, data: row.data ? JSON.parse(row.data) : null })),
    // A device that asks (just opened, or missing the bodyweight) always gets the profile, even if it synced past its last change.
    meta: profile.meta && (profile.meta_seq > since || body?.wantMeta === true) ? { ...JSON.parse(profile.meta), updated: profile.meta_updated } : null
  });
};

const describe = (raw) => {
  const result = JSON.parse(raw || '{}');
  const sets = (list) => list.map((set) => `${set.kg}×${set.reps}${set.rpe ? `@${set.rpe}` : ''}${set.warmup ? 'w' : ''}`).join(', ');
  return [
    ...(result.exercises || []).map((exercise) => `Add ${exercise.name} ${sets(exercise.sets)}`),
    ...(result.cardioMinutes ? [`Add ${result.cardioName || 'cardio'} ${result.cardioMinutes} min`] : []),
    ...(result.remove || []).map((item) => `Remove ${item.exercise ? `${item.exercise} from ` : ''}${item.date}`),
    ...(result.replace || []).map((item) => `Change ${item.exercise} on ${item.date} to ${sets(item.sets)}`),
    ...(result.move || []).map((item) => `Move ${item.exercise ? `${item.exercise} ` : ''}from ${item.from} to ${item.to}`),
    ...(result.label ? [`Name day “${result.label}”`] : []),
    ...(result.accessoriesMinutes ? [`Accessories ${result.accessoriesMinutes} min`] : []),
    ...(result.unclear ? [`Did not understand: ${result.unclear}`] : []),
    ...(result.feedback ? [`Feedback: ${result.feedback}`] : []),
    ...(result.build === 'started' ? ['Change request started'] : []),
    ...(result.error ? [`Failed: ${result.error}`] : []),
    ...(result.date ? [`Day ${result.date}`] : [])
  ].join(' · ') || 'Nothing understood';
};

// Every change request is kept in the commands table with how it went, so nothing sent from the admin panel is lost.
const logChange = (env, ctx, ask, result) => {
  const write = env.DB.prepare('INSERT INTO commands (at, profile, name, said, result) VALUES (?, ?, ?, ?, ?)').bind(Date.now(), env.ADMIN_PROFILE, 'Change request', ask, JSON.stringify(result)).run().catch(() => {});
  if (ctx) ctx.waitUntil(write);
};
// Exodia can build from more than one Claude account. Each account has its own scheduled task with an API trigger,
// kept as Worker secrets: CLAUDE_TASK_URL + CLAUDE_TASK_TOKEN (account 1), CLAUDE_TASK_URL_2 + CLAUDE_TASK_TOKEN_2
// (account 2), and _3. Marcus picks which one builds in Admin (saved as a "Builder" row in commands); if that one
// can't start, the next one is tried.
const BUILDER_SLOTS = [1, 2, 3];
const builderSecrets = (env, slot) => {
  const suffix = slot === 1 ? '' : `_${slot}`;
  const rawUrl = (env[`CLAUDE_TASK_URL${suffix}`] || '').trim();
  // Pasted secrets often carry a trailing newline or spaces, which break the URL or the auth header.
  // Accept the Fire URL, or any link or text that contains the task id (trig_…), and build the Fire URL from it.
  const taskId = rawUrl.match(/trig_[A-Za-z0-9]+/)?.[0];
  const url = /\/fire$/.test(rawUrl) ? rawUrl : taskId ? `https://api.anthropic.com/v1/claude_code/routines/${taskId}/fire` : rawUrl;
  const token = (env[`CLAUDE_TASK_TOKEN${suffix}`] || '').trim().replace(/^Bearer\s+/i, '');
  return { slot, url, token, ready: Boolean(url && token && /^https?:\/\/[^\s]+\/fire$/.test(url)) };
};
const builders = (env) => BUILDER_SLOTS.map((slot) => builderSecrets(env, slot)).filter((builder) => builder.url || builder.token);
const pickedBuilder = async (env) => {
  const row = await env.DB.prepare("SELECT said FROM commands WHERE name = 'Builder' ORDER BY at DESC LIMIT 1").first().catch(() => null);
  // Account 2 by default: Account 1's builds start but have not landed since 4 Nov 2026. A pick in Admin wins.
  return Number(row?.said) || 2;
};
const startClaudeTask = async (text, env, ctx) => {
  const ask = text.trim().slice(0, 4000);
  const response = await startClaudeTaskNow(ask, env);
  const body = await response.clone().json().catch(() => ({}));
  if (ask) logChange(env, ctx, ask, response.ok ? { build: 'started', url: body.url || '', account: body.account } : { build: 'failed', error: body.error || `HTTP ${response.status}` });
  return response;
};
// Starts a Claude Code cloud session (a scheduled task with an API trigger) that changes the app and deploys it.
const startClaudeTaskNow = async (text, env) => {
  const ask = text.trim().slice(0, 4000);
  if (!ask) return json({ error: 'Say what to change.' }, 400);
  const ready = builders(env).filter((builder) => builder.ready);
  if (!ready.length) return json({ error: 'Exodia builder is not connected yet. Add CLAUDE_TASK_URL and CLAUDE_TASK_TOKEN to the Worker.' }, 503);
  const picked = await pickedBuilder(env);
  const order = [...ready.filter((builder) => builder.slot === picked), ...ready.filter((builder) => builder.slot !== picked)];
  const errors = [];
  for (const builder of order) {
    try {
      const response = await fetch(builder.url, {
        method: 'POST',
        headers: { authorization: `Bearer ${builder.token}`, 'anthropic-beta': 'experimental-cc-routine-2026-04-01', 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ text: ask })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) return json({ ok: true, url: data.claude_code_session_url || '', account: builder.slot });
      errors.push(`account ${builder.slot}: ${response.status} ${data.error?.message || 'no details'}`);
    } catch (error) {
      errors.push(`account ${builder.slot}: ${error.message}`);
    }
  }
  return json({ error: `Exodia did not start (${errors.join('; ')})` }, 502);
};

// What people do in the app (opens, pages, taps, things that went wrong), sent in small batches, for the admin
// dashboard. Only the kind and a short name of what was tapped; never training data or what was typed.
const EVENT_KINDS = ['open', 'view', 'tap', 'stuck'];
const events = async (request, env) => {
  if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Missing key.' }, 400);
  const body = await request.json().catch(() => null);
  const now = Date.now();
  const list = (Array.isArray(body?.events) ? body.events : []).slice(0, 60)
    .filter((event) => EVENT_KINDS.includes(event?.kind))
    .map((event) => ({ kind: event.kind, detail: String(event.detail ?? '').slice(0, 60), at: Number.isFinite(event.at) && event.at <= now && event.at > now - 7 * 86400000 ? event.at : now }));
  if (list.length) await env.DB.batch(list.map((event) => env.DB.prepare('INSERT INTO events (at, profile, kind, detail) VALUES (?, ?, ?, ?)').bind(event.at, key, event.kind, event.detail))).catch(() => {});
  return json({ ok: true });
};

// The admin dashboard: everyone who has an Exodia, how much they use it, what they tap and where they get stuck.
const DAY = 86400000;
const stats = async (env) => {
  const now = Date.now();
  const week = now - 7 * DAY;
  const [profiles, days, opens, taps, views, stuck, said, limits, failures] = await env.DB.batch([
    env.DB.prepare('SELECT id, meta, created FROM profiles'),
    env.DB.prepare("SELECT profile, COUNT(*) AS days, MIN(date) AS first, MAX(date) AS last, SUM(date >= ?) AS changed FROM sessions WHERE data IS NOT NULL AND data NOT LIKE '%\"exercises\":[]%' GROUP BY profile").bind(new Date(week).toISOString().slice(0, 10)),
    env.DB.prepare("SELECT profile, COUNT(*) AS opens, SUM(at > ?) AS week, MAX(at) AS last FROM events WHERE kind = 'open' GROUP BY profile").bind(week),
    env.DB.prepare("SELECT detail, COUNT(*) AS n, COUNT(DISTINCT profile) AS people FROM events WHERE kind = 'tap' AND at > ? AND profile IS NOT ? GROUP BY detail ORDER BY n DESC LIMIT 15").bind(now - 30 * DAY, env.ADMIN_PROFILE),
    env.DB.prepare("SELECT detail, COUNT(*) AS n, COUNT(DISTINCT profile) AS people FROM events WHERE kind = 'view' AND at > ? AND profile IS NOT ? GROUP BY detail ORDER BY n DESC LIMIT 10").bind(now - 30 * DAY, env.ADMIN_PROFILE),
    env.DB.prepare("SELECT at, profile, detail FROM events WHERE kind = 'stuck' AND profile IS NOT ? ORDER BY at DESC LIMIT 20").bind(env.ADMIN_PROFILE),
    env.DB.prepare("SELECT profile, COUNT(*) AS sent, SUM(result LIKE '%\"unclear\"%' OR result LIKE '%\"error\"%') AS missed, MAX(at) AS last FROM commands WHERE name IS NOT 'Builder' AND name IS NOT 'Change request' GROUP BY profile"),
    env.DB.prepare("SELECT detail, COUNT(*) AS n, COUNT(DISTINCT profile) AS people, MAX(at) AS last FROM events WHERE kind = 'error' AND at > ? GROUP BY detail").bind(now - 30 * DAY),
    env.DB.prepare("SELECT 'AI: ' || substr(json_extract(result, '$.error'), 1, 50) AS detail, COUNT(*) AS n, COUNT(DISTINCT profile) AS people, MAX(at) AS last FROM commands WHERE result LIKE '%\"error\"%' AND at > ? GROUP BY detail").bind(now - 30 * DAY)
  ]);
  const by = (rows) => new Map(rows.results.map((row) => [row.profile, row]));
  const [dayMap, openMap, saidMap] = [by(days), by(opens), by(said)];
  const people = profiles.results.map((row) => {
    let meta = {};
    try { meta = JSON.parse(row.meta || '{}'); } catch { /* keep empty */ }
    const day = dayMap.get(row.id) || {};
    const open = openMap.get(row.id) || {};
    const sent = saidMap.get(row.id) || {};
    return {
      id: row.id.slice(0, 6), mine: row.id === env.ADMIN_PROFILE, name: String(meta.name || '').slice(0, 40), joined: row.created > 1000 ? row.created : 0,
      days: day.days || 0, first: day.first || '', last: day.last || '', changedWeek: day.changed || 0,
      opens: open.opens || 0, opensWeek: open.week || 0, lastOpen: open.last || 0,
      sent: sent.sent || 0, missed: sent.missed || 0, lastSent: sent.last || 0
    };
  });
  const names = new Map(people.map((person) => [person.id, person.name]));
  return {
    people,
    taps: taps.results, views: views.results,
    errors: [...limits.results, ...failures.results].sort((first, second) => second.last - first.last),
    stuck: stuck.results.map((row) => ({ at: row.at, who: names.get(row.profile.slice(0, 6)) || row.profile.slice(0, 6), detail: row.detail }))
  };
};

let statsCache = { at: 0, value: null };
const cachedStats = async (env) => {
  if (statsCache.value && Date.now() - statsCache.at < 60000) return statsCache.value;
  const value = await stats(env).catch((error) => ({ error: String(error.message || error).slice(0, 120) }));
  if (!value.error) statsCache = { at: Date.now(), value };
  return value;
};
const admin = async (request, env, ctx) => {
  if (!env.ADMIN_PROFILE || request.headers.get('x-exodia-key') !== env.ADMIN_PROFILE) return json({ error: 'Not found' }, 404);
  if (request.method === 'POST') {
    const body = await request.json().catch(() => null);
    if (typeof body?.claude === 'string') return startClaudeTask(body.claude, env, ctx);
    if (BUILDER_SLOTS.includes(body?.builder)) {
      await env.DB.prepare('INSERT INTO commands (at, profile, name, said, result) VALUES (?, ?, ?, ?, ?)').bind(Date.now(), env.ADMIN_PROFILE, 'Builder', String(body.builder), '{}').run();
      return json({ ok: true, builder: body.builder });
    }
    if (!Number.isInteger(body?.id) || !['new', 'planned', 'done', 'declined'].includes(body?.status)) return json({ error: 'Bad request' }, 400);
    await env.DB.prepare('UPDATE feedback SET status = ? WHERE id = ?').bind(body.status, body.id).run();
    return json({ ok: true });
  }
  // The dashboard reads every profile and event (about 4,000 rows), so only the Admin page asks for it (?dashboard=1),
  // never the red pill's refresh every 30 seconds; the same isolate reuses it for a minute.
  const wantsDashboard = new URL(request.url).searchParams.get('dashboard') === '1';
  const dashboard = wantsDashboard ? await cachedStats(env) : undefined;
  const [commands, feedback] = await env.DB.batch([
    env.DB.prepare("SELECT at, profile, name, said, result FROM commands WHERE name IS NOT 'Builder' ORDER BY at DESC LIMIT 300"),
    env.DB.prepare('SELECT id, at, profile, name, kind, title, details, said, status FROM feedback ORDER BY at DESC LIMIT 200')
  ]);
  return json({
    builders: builders(env).map(({ slot, ready }) => ({ slot, ready })),
    builder: await pickedBuilder(env),
    dashboard,
    commands: commands.results.map((row) => ({ at: row.at, who: row.name || row.profile, mine: row.profile === env.ADMIN_PROFILE, said: row.said, did: describe(row.result), raw: row.result })),
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
    if (!success) return limited(env, request, 'feedback', 'Slow down a little. Try again in a minute.');
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

// 'marcus' stays reserved so /marcus is never a named invite; it is simply not a page any more.
const RESERVED_PATHS = ['join', 'marcus', 'api', 'me', 'fist', 'splash'];
const personalInvite = (pathname) => {
  let name = '';
  try { name = decodeURIComponent(pathname.slice(1)).replace(/\/$/, ''); } catch { return ''; }
  return /^\p{L}[\p{L}\- ]{0,29}$/u.test(name) && !RESERVED_PATHS.includes(name.toLowerCase()) ? name : '';
};

// Gym visits read from another app's visit list: { "YYYY-MM-DD": "club" }, kept with the profile.
const cleanVisits = (visits) => {
  if (!visits || typeof visits !== 'object') return {};
  const kept = Object.entries(visits).filter(([date, visit]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && (typeof visit === 'string' || typeof visit?.place === 'string')).slice(-4000)
    .map(([date, visit]) => [date, typeof visit === 'string' ? visit.slice(0, 60) : { place: visit.place.slice(0, 60), ...(/^\d{1,2}:\d{2}$/.test(visit.time || '') ? { time: visit.time } : {}), ...(Number(visit.minutes) > 0 && Number(visit.minutes) < 600 ? { minutes: Math.round(Number(visit.minutes)) } : {}) }]);
  return kept.length ? { visits: Object.fromEntries(kept) } : {};
};
const VISITS_PROMPT = `These pictures are frames of a screen recording or screenshots of a gym app's visit history (often Swedish, like "Träning, Stockholm Liljeholmen" with "02 Nov, 2026" under it). The frames overlap, so the same visit appears in several. List every visit once: date as YYYY-MM-DD; time as HH:MM and minutes as how long the visit lasted, only when the picture shows them (check-in and check-out times, or a duration), otherwise leave them out; and place as the club or gym name exactly as written (keep the chain name if shown, like "Nordic Wellness Stockholm Liljeholmen"; otherwise the place, like "Stockholm Liljeholmen"). A date with no year is the most recent past one. Only visits you can read fully; never invent one. If no visit list is shown, return an empty list.`;
const readVisits = async (request, env, ctx) => {
  const key = request.headers.get('x-exodia-key') || '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Not allowed' }, 403);
  const body = await request.json().catch(() => null);
  const images = Array.isArray(body?.images) ? body.images.filter((image) => typeof image === 'string' && image.length < 700000).slice(0, 12) : [];
  if (!images.length) return json({ error: 'No pictures came through. Try again.' }, 400);
  const today = typeof body?.today === 'string' ? body.today.slice(0, 10) : '';
  const schema = { type: 'OBJECT', properties: { visits: { type: 'ARRAY', items: { type: 'OBJECT', properties: { date: { type: 'STRING' }, place: { type: 'STRING' }, time: { type: 'STRING' }, minutes: { type: 'INTEGER' } }, required: ['date', 'place'] } } }, required: ['visits'] };
  // The same guard as reading notes (it works every day): low thinking answers in seconds, a model that hangs is
  // dropped after 20 s and the next one asked, and a busy model sits out a minute. Without it a call hung for minutes.
  let busy = false;
  let lastError = '';
  const empties = [];
  const all = (env.GEMINI_MODELS || DEFAULT_MODELS).split(',').map((name) => name.trim()).filter(Boolean);
  const fresh = all.filter((model) => !cooling(model));
  // Models resting after being busy come last instead of not at all, so the strong ones still get asked.
  for (const model of [...fresh, ...all.filter((name) => !fresh.includes(name))]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: `${VISITS_PROMPT}\nToday is ${today || 'unknown'}.` }] }, contents: [{ role: 'user', parts: [...images.map((data) => ({ inlineData: { mimeType: 'image/jpeg', data } })), { text: 'List the gym visits in these pictures.' }] }], generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: 'application/json', responseSchema: schema, ...(THINK_LOW ? { thinkingConfig: { thinkingLevel: 'low' } } : {}) } }),
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timer);
      COOLING.set(model, Math.max(COOLING.get(model) || 0, Date.now() + 60000));
      lastError = `${model}: no answer in 20 s`;
      busy = true;
      continue;
    }
    if (!response.ok) {
      clearTimeout(timer);
      const reason = await response.text().catch(() => '');
      lastError = `${model}: ${response.status} ${coolDown(model, response.status, reason) || reason.replace(/\s+/g, ' ').slice(0, 120)}`;
      busy = busy || response.status === 429 || response.status >= 500;
      continue;
    }
    const data = await response.json().catch(() => null);
    clearTimeout(timer);
    try {
      const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '');
      const visits = (Array.isArray(parsed?.visits) ? parsed.visits : []).filter((visit) => /^\d{4}-\d{2}-\d{2}$/.test(visit?.date) && (!today || visit.date <= today)).map((visit) => ({ date: visit.date, place: String(visit.place || '').slice(0, 60), ...(visit.time ? { time: String(visit.time).slice(0, 5) } : {}), ...(Number(visit.minutes) > 0 ? { minutes: Math.round(Number(visit.minutes)) } : {}) }));
      // An empty list from one model isn't trusted: a weaker one sometimes reads nothing in pictures another reads fine.
      if (!visits.length) {
        lastError = `${model}: read no visits`;
        empties.push(model);
        continue;
      }
      logCommand(request, env, ctx, { name: body?.name }, `Gym visits: ${images.length} pictures`, { visits: visits.length, first: visits.map((visit) => visit.date).sort()[0] || '', engine: model });
      return json({ visits, model });
    } catch {
      lastError = `${model}: answer could not be read`;
      continue;
    }
  }
  // Every model read nothing: these pictures really have no visits (not an error).
  if (empties.length && !busy) {
    logCommand(request, env, ctx, { name: body?.name }, `Gym visits: ${images.length} pictures`, { visits: 0, empty: empties });
    return json({ visits: [], empty: empties });
  }
  logCommand(request, env, ctx, { name: body?.name }, `Gym visits: ${images.length} pictures`, { error: lastError || (busy ? 'busy' : 'unreadable'), empty: empties });
  return json({ error: busy ? 'The AI was busy. Try again in a minute.' : 'Could not read the visits in that.' }, 503);
};

const manifest = async (request, env, url) => {
  const response = await env.ASSETS.fetch(new Request(new URL('/manifest.webmanifest', url), request));
  const data = await response.json();
  const key = url.searchParams.get('k') ?? '';
  // With a key, the installed app opens on that log. Without one there's no start_url at all, so the phone keeps the
  // address the page is on when it's added (the app moves it to /me/<key> once there's a log): a home-screen app on
  // iPhone gets its own empty storage, and opening at / would mean a fresh, empty Exodia.
  if (PROFILE_KEY.test(key)) data.start_url = `/me/${key}`;
  else delete data.start_url;
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/manifest+json', 'cache-control': 'no-store' } });
};

// The portfolio's demo link (?demo) shows Marcus's real training: dates, lifts, kg and reps only, never a name,
// key, note or log. Cached an hour so visitors don't read the database each time.
let demoCache = { at: 0, body: null };
const demo = async (env) => {
  if (!env.ADMIN_PROFILE) return json({ sessions: [] });
  // Every portfolio visit opens two copies (computer and phone): one read per isolate every 10 minutes is plenty.
  if (demoCache.body && Date.now() - demoCache.at < 600000) return new Response(demoCache.body, { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } });
  const [rows, profile] = await Promise.all([
    env.DB.prepare('SELECT data FROM sessions WHERE profile = ? AND data IS NOT NULL ORDER BY date').bind(env.ADMIN_PROFILE).all(),
    env.DB.prepare('SELECT meta FROM profiles WHERE id = ?').bind(env.ADMIN_PROFILE).first(),
  ]);
  const number = (value) => (Number.isFinite(Number(value)) && String(value).trim() !== '' ? String(value) : '');
  const sessions = (rows.results || []).map((row) => {
    const day = JSON.parse(row.data);
    return {
      date: String(day.date),
      ...(day.label ? { label: String(day.label).slice(0, 30) } : {}),
      ...(Number(day.cardio) > 0 ? { cardio: Number(day.cardio) } : {}),
      ...(Number(day.accessories) > 0 ? { accessories: Number(day.accessories) } : {}),
      exercises: (day.exercises || []).map((exercise) => ({
        name: String(exercise.name).slice(0, 60),
        sets: (exercise.sets || []).map((set) => ({ kg: number(set.kg), reps: number(set.reps), ...(number(set.rpe) ? { rpe: number(set.rpe) } : {}), ...(set.warmup ? { warmup: true } : {}) })),
      })),
    };
  }).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day.date) && day.exercises.length);
  const body = JSON.parse(profile?.meta || '{}').body;
  demoCache = { at: Date.now(), body: JSON.stringify({ sessions, ...(body ? { body } : {}) }) };
  return new Response(demoCache.body, { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } });
};

// Beta and launch: bigger features ship behind a name. Until Marcus taps Launch in Admin (a row in features with
// launched_at), only he and test profiles (a name starting "Test ") get them; everyone else sees nothing new.
const BETA = [{ name: 'friends', title: 'Friends and Train together' }, { name: 'notifications', title: 'Notifications' }];
let launchedCache = { at: 0, names: new Set() };
const launchedFeatures = async (env, fresh = false) => {
  if (!fresh && Date.now() - launchedCache.at < 30000) return launchedCache.names;
  const { results } = await env.DB.prepare('SELECT name FROM features WHERE launched_at IS NOT NULL').all().catch(() => ({ results: [] }));
  launchedCache = { at: Date.now(), names: new Set(results.map((row) => row.name)) };
  return launchedCache.names;
};
const features = async (request, env) => {
  const key = request.headers.get('x-exodia-key') ?? '';
  const isAdmin = Boolean(env.ADMIN_PROFILE) && key === env.ADMIN_PROFILE;
  if (request.method === 'POST') {
    if (!isAdmin) return json({ error: 'Not found' }, 404);
    const body = (await request.json().catch(() => null)) || {};
    if (!BETA.some((feature) => feature.name === body.name)) return json({ error: 'Unknown feature.' }, 400);
    await env.DB.prepare('INSERT INTO features (name, launched_at) VALUES (?1, ?2) ON CONFLICT(name) DO UPDATE SET launched_at = ?2').bind(body.name, body.launch ? Date.now() : null).run();
    await launchedFeatures(env, true);
  }
  const launched = await launchedFeatures(env, request.method === 'POST');
  return json({ launched: [...launched], ...(isAdmin ? { beta: BETA.map((feature) => ({ ...feature, launched: launched.has(feature.name) })) } : {}) });
};

// Friends and Train together (beta "friends": see above).
// Friends know each other by a handle, never by the profile key. A friend gets only what the other person shares:
// recent sessions (for recovery and Exodia), their best set per lift (for strength levels), their name. Never what
// they said or typed, never gym visits, and bodyweight only when shared (otherwise rounded to 5 kg for the levels).
const PLAN_KINDS = ['Push', 'Pull', 'Legs', 'Full body', 'Move'];
const SHARE_KEYS = ['recovery', 'strength', 'workouts', 'bodyweight', 'gym', 'findable'];
const HANDLE = /^[a-f0-9]{16}$/;
const metaName = (meta) => {
  try {
    return String(JSON.parse(meta || '{}').name || '').trim().slice(0, 40);
  } catch {
    return '';
  }
};
const tester = (name) => /^test\s/i.test(name);
const hexId = (bytes) => [...crypto.getRandomValues(new Uint8Array(bytes))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
// Names Marcus asked to start private (not findable until they choose), kept in the database, not in this public code.
const privateNames = async (env) => {
  const row = await env.DB.prepare("SELECT said FROM commands WHERE name = 'Friends: private names' ORDER BY at DESC LIMIT 1").first().catch(() => null);
  return new Set(String(row?.said || '').toLowerCase().split(',').map((name) => name.trim()).filter(Boolean));
};
const sharingFor = async (env, profile, name, privates) => {
  const known = await env.DB.prepare('SELECT * FROM sharing WHERE profile = ?').bind(profile).first();
  if (known) return known;
  const hidden = (privates || await privateNames(env)).has(name.toLowerCase());
  await env.DB.prepare('INSERT OR IGNORE INTO sharing (profile, handle, findable, bodyweight, updated) VALUES (?, ?, ?, 1, ?)').bind(profile, hexId(8), hidden ? 0 : 1, Date.now()).run();
  return env.DB.prepare('SELECT * FROM sharing WHERE profile = ?').bind(profile).first();
};
const linkBetween = (env, one, two) => env.DB.prepare('SELECT a, b, status FROM friends WHERE (a = ?1 AND b = ?2) OR (a = ?2 AND b = ?1)').bind(one, two).first();
const friendKeys = async (env, key) => {
  const { results } = await env.DB.prepare("SELECT CASE WHEN a = ?1 THEN b ELSE a END AS other FROM friends WHERE status = 'friends' AND (a = ?1 OR b = ?1)").bind(key).all();
  return new Set(results.map((row) => row.other));
};
const shareSet = (set) => ({ kg: Number(set?.kg) || 0, reps: Number(set?.reps) || 0, ...(Number(set?.rpe) ? { rpe: Number(set.rpe) } : {}), ...(set?.warmup ? { warmup: true } : {}) });
const shareSession = (date, data) => ({
  date,
  ...(data.label ? { label: String(data.label).slice(0, 30) } : {}),
  ...(Number(data.cardio) > 0 ? { cardio: Number(data.cardio) } : {}),
  exercises: (data.exercises || []).map((exercise) => ({ name: String(exercise.name || '').slice(0, 60), sets: (exercise.sets || []).map(shareSet) })).filter((exercise) => exercise.name),
});
// What one friend sees of another.
const friendView = async (env, profile, share, isAdmin, today) => {
  const row = await env.DB.prepare('SELECT meta FROM profiles WHERE id = ?').bind(profile).first();
  let meta = {};
  try {
    meta = JSON.parse(row?.meta || '{}');
  } catch {
    meta = {};
  }
  const out = { handle: share.handle, name: metaName(row?.meta), shares: Object.fromEntries(SHARE_KEYS.filter((key) => key !== 'findable').map((key) => [key, Boolean(share[key])])) };
  const since = dayPlus(today, -21);
  const { results } = await env.DB.prepare('SELECT date, data FROM sessions WHERE profile = ? AND data IS NOT NULL').bind(profile).all();
  const recent = [];
  const tops = new Map();
  for (const { date, data } of results) {
    let day;
    try {
      day = JSON.parse(data);
    } catch {
      continue;
    }
    if (date >= since && date <= dayPlus(today, 1)) recent.push(shareSession(date, day));
    for (const exercise of day.exercises || []) {
      for (const set of exercise.sets || []) {
        const kg = Number(set.kg) || 0;
        const reps = Number(set.reps) || 0;
        if (set.warmup || !(reps > 0)) continue;
        const name = String(exercise.name || '').slice(0, 60);
        const known = tops.get(name);
        if (!known || kg > known.set.kg || (kg === known.set.kg && reps > known.set.reps)) tops.set(name, { date, set: shareSet(set) });
      }
    }
  }
  // Recovery and Exodia need the last 3 weeks; the day list shows them only when workouts are shared.
  out.sessions = share.recovery || share.workouts ? recent.sort((one, two) => two.date.localeCompare(one.date)) : [];
  // Strength levels need the heaviest set of each lift, nothing more.
  out.tops = share.strength ? [...tops].map(([name, top]) => ({ name, date: top.date, set: top.set })) : [];
  const body = meta.body && Number(meta.body.kg) > 0 ? meta.body : null;
  // Height goes with bodyweight: shared exactly when bodyweight is, so Train together can line people up by height.
  if (body && (share.strength || share.bodyweight)) out.body = { sex: body.sex === 'female' ? 'female' : 'male', kg: share.bodyweight ? Number(body.kg) : Math.round(Number(body.kg) / 5) * 5, exact: Boolean(share.bodyweight), ...(share.bodyweight && Number(body.cm) > 0 ? { cm: Number(body.cm) } : {}) };
  if (isAdmin) {
    const open = await env.DB.prepare("SELECT at, detail FROM events WHERE profile = ? AND kind = 'open' ORDER BY at DESC LIMIT 1").bind(profile).first();
    const last = await env.DB.prepare('SELECT max(at) AS at FROM events WHERE profile = ?').bind(profile).first();
    const stuck = await env.DB.prepare("SELECT count(*) AS n FROM events WHERE profile = ? AND kind = 'stuck' AND at > ?").bind(profile, Date.now() - 2 * 86400000).first();
    out.admin = { online: last?.at || open?.at || null, phone: String(open?.detail || '').split(' · ')[1] || '', errors: stuck?.n || 0 };
  }
  return out;
};
const planOut = async (env, plan, key) => {
  const members = JSON.parse(plan.members || '[]');
  const people = [];
  for (const member of members) {
    const row = await env.DB.prepare('SELECT s.handle, p.meta FROM profiles p LEFT JOIN sharing s ON s.profile = p.id WHERE p.id = ?').bind(member).first();
    if (row) people.push({ handle: row.handle || '', name: metaName(row.meta), ...(member === key ? { me: true } : {}) });
  }
  const by = await env.DB.prepare('SELECT meta FROM profiles WHERE id = ?').bind(plan.by).first();
  const noteBy = plan.note && plan.note_by ? (plan.note_by === key ? 'me' : metaName((await env.DB.prepare('SELECT meta FROM profiles WHERE id = ?').bind(plan.note_by).first())?.meta)) : '';
  let muscles = [];
  try { muscles = JSON.parse(plan.muscles || '[]'); } catch { /* old row */ }
  return { id: plan.id, date: plan.date, kind: plan.kind, by: plan.by === key ? 'me' : metaName(by?.meta), members: people, version: plan.version, updated: plan.updated, note: plan.note || '', noteBy, muscles };
};
const myPlan = (env, date, key) => env.DB.prepare('SELECT * FROM plans WHERE date = ?1 AND EXISTS (SELECT 1 FROM json_each(plans.members) WHERE value = ?2) ORDER BY updated DESC LIMIT 1').bind(date, key).first();
const dayPlus = (iso, days) => {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
// Notifications. Only what's useful: a friend adds you to a workout, changes or moves it, leaves it, asks to be your
// friend or accepts. No reminders, nothing about not logging. A push carries no data: the device asks /api/push for
// what to show, so nothing is encrypted per device. The sender key (VAPID) is made here the first time and kept in D1.
const PUSH_HOSTS = /^https:\/\/(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com|[a-z0-9.-]+\.push\.apple\.com)\//;
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (text) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));
let vapid = null;
const vapidKeys = async (env) => {
  if (vapid) return vapid;
  let row = await env.DB.prepare("SELECT value FROM app_keys WHERE name = 'vapid'").first();
  if (!row) {
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
    await env.DB.prepare("INSERT OR IGNORE INTO app_keys (name, value) VALUES ('vapid', ?)").bind(JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, d: jwk.d })).run();
    row = await env.DB.prepare("SELECT value FROM app_keys WHERE name = 'vapid'").first();
  }
  const jwk = JSON.parse(row.value);
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  vapid = { key, public: b64url(new Uint8Array([4, ...fromB64url(jwk.x), ...fromB64url(jwk.y)])) };
  return vapid;
};
const pushTo = async (env, endpoint) => {
  const { key, public: publicKey } = await vapidKeys(env);
  const text = (value) => b64url(new TextEncoder().encode(JSON.stringify(value)));
  const unsigned = `${text({ typ: 'JWT', alg: 'ES256' })}.${text({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'https://exodia.marcusokodugha.workers.dev' })}`;
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
  return fetch(endpoint, { method: 'POST', headers: { authorization: `vapid t=${unsigned}.${b64url(signature)}, k=${publicKey}`, ttl: '86400', urgency: 'high', 'content-length': '0' } });
};
// Tell these people (profile keys). Only people with notifications on get a row and a push.
const notify = async (env, profiles, notice) => {
  const now = Date.now();
  for (const profile of new Set(profiles)) {
    const { results } = await env.DB.prepare('SELECT endpoint FROM push_subs WHERE profile = ?').bind(profile).all();
    if (!results.length) continue;
    await env.DB.prepare('INSERT INTO notices (profile, title, body, url, created) VALUES (?, ?, ?, ?, ?)').bind(profile, notice.title.slice(0, 120), notice.body.slice(0, 200), notice.url, now).run();
    for (const { endpoint } of results) {
      const response = await pushTo(env, endpoint).catch(() => null);
      if (response && (response.status === 404 || response.status === 410)) await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(endpoint).run();
    }
  }
};
const notificationsOn = async (env, key, name) => (Boolean(env.ADMIN_PROFILE) && key === env.ADMIN_PROFILE) || tester(name) || (await launchedFeatures(env)).has('notifications');
const pushRoute = async (request, env) => {
  if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
  const body = (await request.json().catch(() => null)) || {};
  if (body.action === 'key') return json({ key: (await vapidKeys(env)).public });
  const endpoint = typeof body.endpoint === 'string' && body.endpoint.length < 1000 && PUSH_HOSTS.test(body.endpoint) ? body.endpoint : '';
  if (!endpoint) return json({ error: 'Missing endpoint.' }, 400);
  // The device's service worker, woken by a push: what to show. Newer than what this device showed, else the newest.
  if (body.action === 'latest') {
    const sub = await env.DB.prepare('SELECT profile, last FROM push_subs WHERE endpoint = ?').bind(endpoint).first();
    if (!sub) return json({ notices: [] });
    let { results } = await env.DB.prepare('SELECT id, title, body, url FROM notices WHERE profile = ? AND id > ? AND created > ? ORDER BY id DESC LIMIT 4').bind(sub.profile, sub.last, Date.now() - 2 * 86400000).all();
    if (results.length) await env.DB.prepare('UPDATE push_subs SET last = ? WHERE endpoint = ?').bind(results[0].id, endpoint).run();
    else ({ results } = await env.DB.prepare('SELECT id, title, body, url FROM notices WHERE profile = ? ORDER BY id DESC LIMIT 1').bind(sub.profile).all());
    return json({ notices: results });
  }
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Missing key.' }, 400);
  const me = await env.DB.prepare('SELECT meta FROM profiles WHERE id = ?').bind(key).first();
  if (!me || !(await notificationsOn(env, key, metaName(me.meta)))) return json({ error: 'Not found' }, 404);
  if (body.action === 'subscribe') {
    await env.DB.prepare('INSERT INTO push_subs (endpoint, profile, last, created) VALUES (?1, ?2, (SELECT COALESCE(MAX(id), 0) FROM notices), ?3) ON CONFLICT(endpoint) DO UPDATE SET profile = excluded.profile').bind(endpoint, key, Date.now()).run();
  } else if (body.action === 'unsubscribe') {
    await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ? AND profile = ?').bind(endpoint, key).run();
  } else if (body.action === 'test') {
    const sub = await env.DB.prepare('SELECT 1 FROM push_subs WHERE endpoint = ? AND profile = ?').bind(endpoint, key).first();
    if (sub) await notify(env, [key], { title: 'Notifications are on', body: 'You get one when a friend adds you to a workout or changes it.', url: '/#/together' });
  }
  return json({ ok: true });
};
const planDay = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
const social = async (request, env, which, ctx) => {
  if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
  const key = request.headers.get('x-exodia-key') ?? '';
  if (!PROFILE_KEY.test(key)) return json({ error: 'Missing key.' }, 400);
  if (env.SYNC_LIMITER) {
    const { success } = await env.SYNC_LIMITER.limit({ key: `social:${key}` });
    if (!success) return json({ error: 'Slow down a little.' }, 429);
  }
  const me = await env.DB.prepare('SELECT id, meta FROM profiles WHERE id = ?').bind(key).first();
  const myName = metaName(me?.meta);
  const isAdmin = Boolean(env.ADMIN_PROFILE) && key === env.ADMIN_PROFILE;
  const launched = (await launchedFeatures(env)).has('friends');
  if (!me || (!isAdmin && !tester(myName) && !launched)) return json({ error: 'Not found' }, 404);
  const body = (await request.json().catch(() => null)) || {};
  const serverToday = new Date().toISOString().slice(0, 10);
  const today = typeof body.today === 'string' && DATE.test(body.today) && Math.abs(new Date(body.today) - new Date(serverToday)) <= 2 * 86400000 ? body.today : serverToday;
  const privates = await privateNames(env);
  const mine = await sharingFor(env, key, myName, privates);
  const other = async (handle) => {
    if (typeof handle !== 'string' || !HANDLE.test(handle)) return null;
    return env.DB.prepare('SELECT s.*, p.meta FROM sharing s JOIN profiles p ON p.id = s.profile WHERE s.handle = ?').bind(handle).first();
  };
  // Notices go out after the answer, so a slow push service never slows the app.
  const tell = (profiles, notice) => {
    const others = profiles.filter((profile) => profile && profile !== key);
    if (others.length) ctx?.waitUntil(notify(env, others, notice).catch(() => {}));
  };
  return which === 'friends' ? friendsAction(env, body, { key, isAdmin, myName, mine, privates, other, today, launched, tell }) : togetherAction(env, body, { key, other, today, myName, tell });
};
const friendsAction = async (env, body, { key, isAdmin, myName, mine, privates, other, today, launched, tell }) => {
  const action = body.action || 'list';
  const now = Date.now();
  if (action === 'search') {
    const query = typeof body.q === 'string' ? body.q.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 40) : '';
    // No name typed: everyone public who has logged something, so friends can be added from the list without searching.
    if (query.length === 1) return json({ people: [] });
    const all = query.length === 0;
    const { results } = await env.DB.prepare("SELECT p.id, p.meta, s.findable FROM profiles p LEFT JOIN sharing s ON s.profile = p.id WHERE lower(trim(json_extract(p.meta, '$.name'))) LIKE ?1 || '%' AND p.id != ?2 AND EXISTS (SELECT 1 FROM sessions WHERE profile = p.id AND data IS NOT NULL) ORDER BY p.meta_updated DESC LIMIT ?3").bind(query.replace(/[%_]/g, ''), key, all ? 300 : 40).all();
    const seen = new Set();
    const people = [];
    for (const row of results) {
      const name = metaName(row.meta);
      const lower = name.toLowerCase();
      if (!name || seen.has(lower)) continue;
      seen.add(lower);
      // Before launch, test profiles only ever find each other and Marcus.
      if (!launched && !isAdmin && !tester(name) && row.id !== env.ADMIN_PROFILE) continue;
      const link = await linkBetween(env, key, row.id);
      const findable = row.findable === null || row.findable === undefined ? !privates.has(lower) : Boolean(row.findable);
      if (!findable && !link) continue;
      const share = await sharingFor(env, row.id, name, privates);
      people.push({ handle: share.handle, name, status: !link ? 'none' : link.status === 'friends' ? 'friends' : link.a === key ? 'asked' : 'asks' });
      // Test profiles stay out of the list everyone sees.
      if (all && tester(name) && !tester(myName)) people.pop();
      if (people.length >= (all ? 80 : 8)) break;
    }
    return json({ people });
  }
  if (action === 'sharing') {
    const settings = body.settings && typeof body.settings === 'object' ? body.settings : {};
    const keys = SHARE_KEYS.filter((name) => typeof settings[name] === 'boolean');
    if (keys.length) await env.DB.prepare(`UPDATE sharing SET ${keys.map((name) => `${name} = ?`).join(', ')}, updated = ? WHERE profile = ?`).bind(...keys.map((name) => (settings[name] ? 1 : 0)), now, key).run();
  } else if (action === 'hide' && isAdmin) {
    // Marcus only: off People on Exodia and search. Their log and friends stay.
    const target = await other(body.handle);
    if (!target) return json({ error: 'Not found' }, 404);
    await env.DB.prepare('UPDATE sharing SET findable = 0, updated = ? WHERE profile = ?').bind(now, target.profile).run();
  } else if (['ask', 'accept', 'decline', 'remove'].includes(action)) {
    const target = await other(body.handle);
    if (!target || target.profile === key) return json({ error: 'Not found' }, 404);
    const link = await linkBetween(env, key, target.profile);
    const accepted = () => tell([target.profile], { title: `${myName} accepted your friend request`, body: 'You can see each other and train together now.', url: `/#/friend/${mine.handle}` });
    if (action === 'ask') {
      if (link?.status === 'asked' && link.a === target.profile) {
        await env.DB.prepare("UPDATE friends SET status = 'friends', at = ? WHERE a = ? AND b = ?").bind(now, target.profile, key).run();
        accepted();
      } else if (!link) {
        if (!target.findable) return json({ error: 'Not found' }, 404);
        await env.DB.prepare("INSERT OR IGNORE INTO friends (a, b, status, at) VALUES (?, ?, 'asked', ?)").bind(key, target.profile, now).run();
        tell([target.profile], { title: `${myName} wants to be your friend`, body: 'Tap to answer.', url: '/#/friends' });
      }
    } else if (action === 'accept') {
      if (link?.status === 'asked' && link.a === target.profile) {
        await env.DB.prepare("UPDATE friends SET status = 'friends', at = ? WHERE a = ? AND b = ?").bind(now, target.profile, key).run();
        accepted();
      }
    } else {
      // No, cancel and remove are the same: the link goes, in either direction.
      await env.DB.prepare('DELETE FROM friends WHERE (a = ?1 AND b = ?2) OR (a = ?2 AND b = ?1)').bind(key, target.profile).run();
    }
  }
  // The list: you, who asked you, who you asked, your friends with what they share, your plans.
  const { results: links } = await env.DB.prepare('SELECT a, b, status, at FROM friends WHERE a = ?1 OR b = ?1 ORDER BY at DESC').bind(key).all();
  const friends = [];
  const requests = [];
  const asked = [];
  for (const link of links) {
    const otherKey = link.a === key ? link.b : link.a;
    const row = await env.DB.prepare('SELECT meta FROM profiles WHERE id = ?').bind(otherKey).first();
    if (!row) continue;
    const name = metaName(row.meta);
    const share = await sharingFor(env, otherKey, name, privates);
    if (link.status === 'friends') friends.push(await friendView(env, otherKey, share, isAdmin, today));
    else if (link.a === key) asked.push({ handle: share.handle, name });
    else requests.push({ handle: share.handle, name });
  }
  const fresh = await env.DB.prepare('SELECT * FROM sharing WHERE profile = ?').bind(key).first();
  return json({ me: { handle: fresh.handle, name: myName, shares: Object.fromEntries(SHARE_KEYS.map((name) => [name, Boolean(fresh[name])])) }, friends, requests, asked, plans: await plansFor(env, key, today) });
};
const plansFor = async (env, key, today) => {
  const { results } = await env.DB.prepare('SELECT * FROM plans WHERE date >= ?1 AND EXISTS (SELECT 1 FROM json_each(plans.members) WHERE value = ?2) ORDER BY date').bind(dayPlus(today, -1), key).all();
  return Promise.all(results.map((plan) => planOut(env, plan, key)));
};
// Train together. Adding and removing people are small steps the server applies to the plan as it is now, so two
// people tapping at once never undo each other. Changing what to train needs the plan's version: if someone else
// changed it since, or picked it in the first place, the answer is the plan as it is, and the app asks first.
const togetherAction = async (env, body, { key, other, today, myName, tell }) => {
  const action = body.action || 'list';
  const now = Date.now();
  if (action === 'list') return json({ plans: await plansFor(env, key, today) });
  const date = typeof body.date === 'string' && DATE.test(body.date) ? body.date : '';
  if (!date || date < dayPlus(today, -1) || date > dayPlus(today, 90)) return json({ error: 'Pick a day from today on.' }, 400);
  const kind = PLAN_KINDS.includes(body.kind) ? body.kind : null;
  const friends = await friendKeys(env, key);
  let plan = await myPlan(env, date, key);
  const write = async (next, members, newKind, extra = {}) => {
    const changed = await env.DB.prepare('UPDATE plans SET kind = ?, members = ?, by = ?, version = version + 1, updated = ? WHERE id = ? AND version = ?').bind(newKind, JSON.stringify(members), extra.by || key, now, next.id, next.version).run();
    return changed.meta?.changes > 0;
  };
  const answer = async (status = 200, extra = {}) => {
    const fresh = await myPlan(env, date, key);
    return json({ plan: fresh ? await planOut(env, fresh, key) : null, plans: await plansFor(env, key, today), ...extra }, status);
  };
  const url = `/#/together/${date}`;
  const membersOf = (row) => (row ? JSON.parse(row.members) : []);
  if (action === 'add') {
    const target = await other(body.handle);
    if (!target || !friends.has(target.profile)) return json({ error: 'Only friends can be added.' }, 403);
    // They already have a plan that day with others: you join it (one plan per group and day).
    const theirs = await myPlan(env, date, target.profile);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      plan = await myPlan(env, date, key);
      if (!plan && theirs) {
        const members = [...new Set([...JSON.parse(theirs.members), key])];
        if (await env.DB.prepare('UPDATE plans SET members = ?, version = version + 1, updated = ? WHERE id = ? AND version = ?').bind(JSON.stringify(members), now, theirs.id, theirs.version).run().then((result) => result.meta?.changes > 0)) {
          tell(membersOf(theirs), { title: `${myName} joined ${theirs.kind.toLowerCase()} day`, body: planDay(date), url });
          return answer(200, { joined: true });
        }
        continue;
      }
      if (!plan) {
        await env.DB.prepare('INSERT INTO plans (id, date, kind, owner, by, members, version, updated) VALUES (?, ?, ?, ?, ?, ?, 1, ?)').bind(hexId(8), date, kind || 'Pull', key, key, JSON.stringify([key, target.profile]), now).run();
        tell([target.profile], { title: `${myName} added you to ${(kind || 'Pull').toLowerCase()} day`, body: planDay(date), url });
        return answer();
      }
      const members = JSON.parse(plan.members);
      if (members.includes(target.profile)) return answer();
      // Their own plan that day folds into yours.
      if (theirs && theirs.id !== plan.id) {
        const merged = [...new Set([...members, ...JSON.parse(theirs.members)])];
        if (await env.DB.prepare('UPDATE plans SET members = ?, version = version + 1, updated = ? WHERE id = ? AND version = ?').bind(JSON.stringify(merged), now, plan.id, plan.version).run().then((result) => result.meta?.changes > 0)) {
          await env.DB.prepare('DELETE FROM plans WHERE id = ?').bind(theirs.id).run();
          tell(membersOf(theirs), { title: `${myName} added you to ${plan.kind.toLowerCase()} day`, body: planDay(date), url });
          return answer();
        }
        continue;
      }
      if (await env.DB.prepare('UPDATE plans SET members = ?, version = version + 1, updated = ? WHERE id = ? AND version = ?').bind(JSON.stringify([...members, target.profile]), now, plan.id, plan.version).run().then((result) => result.meta?.changes > 0)) {
        tell([target.profile], { title: `${myName} added you to ${plan.kind.toLowerCase()} day`, body: planDay(date), url });
        return answer();
      }
    }
    return answer(409, { busy: true });
  }
  if (action === 'remove' || action === 'leave') {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      plan = await myPlan(env, date, key);
      if (!plan) return answer();
      let gone = key;
      if (action === 'remove') {
        const target = await other(body.handle);
        if (!target || !friends.has(target.profile)) return json({ error: 'Not found' }, 404);
        gone = target.profile;
      }
      const members = JSON.parse(plan.members).filter((member) => member !== gone);
      // A plan with one person left isn't training together any more.
      const done = members.length < 2
        ? await env.DB.prepare('DELETE FROM plans WHERE id = ? AND version = ?').bind(plan.id, plan.version).run()
        : await env.DB.prepare('UPDATE plans SET members = ?, version = version + 1, updated = ? WHERE id = ? AND version = ?').bind(JSON.stringify(members), now, plan.id, plan.version).run();
      if (done.meta?.changes > 0) {
        // Leaving tells the others; being taken off tells the one taken off.
        if (action === 'leave') tell(members, { title: `${myName} left ${plan.kind.toLowerCase()} day`, body: planDay(date), url });
        else tell([gone], { title: `${myName} took you off ${plan.kind.toLowerCase()} day`, body: planDay(date), url: '/#/together' });
        return answer();
      }
    }
    return answer(409, { busy: true });
  }
  if (action === 'move') {
    // The whole plan moves to another day, for everyone in it, unless someone already has a plan there.
    const to = typeof body.to === 'string' && DATE.test(body.to) ? body.to : '';
    if (!to || to < dayPlus(today, -1) || to > dayPlus(today, 90)) return json({ error: 'Pick a day from today on.' }, 400);
    if (!plan) return answer();
    for (const member of JSON.parse(plan.members)) if (await myPlan(env, to, member)) return answer(409, { taken: true });
    const moved = await env.DB.prepare('UPDATE plans SET date = ?, by = ?, version = version + 1, updated = ? WHERE id = ? AND version = ?').bind(to, key, now, plan.id, plan.version).run();
    if (!(moved.meta?.changes > 0)) return answer(409, { busy: true });
    tell(membersOf(plan), { title: `${myName} moved ${plan.kind.toLowerCase()} day`, body: `Now ${planDay(to)}`, url: `/#/together/${to}` });
    const fresh = await myPlan(env, to, key);
    return json({ plan: fresh ? await planOut(env, fresh, key) : null, plans: await plansFor(env, key, today) });
  }
  // Optional extras: a note for everyone in the plan, and the muscles you'll train. Last one written wins.
  if (action === 'note') {
    if (!plan) return answer();
    const note = typeof body.note === 'string' ? body.note.replace(/\s+/g, ' ').trim().slice(0, 200) : '';
    if (note === plan.note) return answer();
    await env.DB.prepare('UPDATE plans SET note = ?, note_by = ?, version = version + 1, updated = ? WHERE id = ?').bind(note, note ? key : '', now, plan.id).run();
    if (note) tell(membersOf(plan), { title: `${myName} added a note to ${plan.kind.toLowerCase()} day`, body: note, url });
    return answer();
  }
  if (action === 'muscles') {
    if (!plan) return answer();
    const muscles = Array.isArray(body.muscles) ? [...new Set(body.muscles.filter((muscle) => typeof muscle === 'string' && /^[a-zA-Z]{2,24}$/.test(muscle)))].slice(0, 20) : [];
    await env.DB.prepare('UPDATE plans SET muscles = ?, version = version + 1, updated = ? WHERE id = ?').bind(JSON.stringify(muscles), now, plan.id).run();
    return answer();
  }
  if (action === 'kind') {
    if (!kind) return json({ error: 'Pick Push, Pull, Legs, Full body or Move.' }, 400);
    if (!plan) return answer();
    if (plan.kind === kind) return answer();
    const version = Number(body.version);
    // Someone else picked it, or it changed since you looked: ask first.
    if (version !== plan.version || (plan.by !== key && body.confirm !== true)) return answer(409, { conflict: true });
    if (await write(plan, JSON.parse(plan.members), kind)) {
      tell(membersOf(plan), { title: `${myName} changed it to ${kind.toLowerCase()} day`, body: planDay(date), url });
      return answer();
    }
    return answer(409, { conflict: true });
  }
  return json({ error: 'Unknown action.' }, 400);
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/features') return features(request, env);
    if (url.pathname === '/api/friends') return social(request, env, 'friends', ctx);
    if (url.pathname === '/api/together') return social(request, env, 'together', ctx);
    if (url.pathname === '/api/push') return pushRoute(request, env);
    if (url.pathname === '/api/sync') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return sync(request, env);
    }
    if (url.pathname === '/manifest.webmanifest') return manifest(request, env, url);
    if (url.pathname === '/api/visits') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return readVisits(request, env, ctx);
    }
    if (url.pathname === '/api/admin') return admin(request, env, ctx);
    if (url.pathname === '/api/event') return events(request, env);
    if (url.pathname === '/api/models') {
      if (!env.ADMIN_PROFILE || request.headers.get('x-exodia-key') !== env.ADMIN_PROFILE) return json({ error: 'Not found' }, 404);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
      const data = await response.json().catch(() => ({}));
      return json((data.models || []).filter((model) => (model.supportedGenerationMethods || []).includes('generateContent')).map((model) => model.name.replace('models/', '')));
    }
    if (url.pathname === '/api/demo') return demo(env);
    if (url.pathname === '/api/feedback') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return feedback(request, env, ctx);
    }
    const personal = url.pathname.match(/^\/me\/([a-f0-9]{32})\/?$/);
    // /Patrik: an invite with the person's name in it. The app reads the name from the address.
    const invited = personalInvite(url.pathname);
    if (personal || invited || /^\/join\/?$/.test(url.pathname)) {
      let html = await (await env.ASSETS.fetch(new Request(new URL('/', url), request))).text();
      if (personal) html = html.replace('</head>', `<link rel="manifest" href="/manifest.webmanifest?k=${personal[1]}">\n</head>`);
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }
    if (url.pathname === '/api/name') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return nameLookup(request, env);
    }
    if (url.pathname === '/api/transcribe') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return speechToText(request, env);
    }
    if (url.pathname === '/api/columns') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405);
      return columns(request, env);
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
