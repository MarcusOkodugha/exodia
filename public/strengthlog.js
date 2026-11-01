'use strict';

const STRENGTHLOG_NAMES = {
  'hack squat machine': 'Hack Squat',
  'triceps pushdown with rope': 'Triceps Pushdown',
  'dumbbell lateral raise': 'Lateral Raise',
  'dumbbell chest press': 'Dumbbell Bench Press',
  'lying leg curl': 'Leg Curl',
  'barbell squat': 'Squat',
  'conventional deadlift': 'Deadlift'
};

const splitCsvLine = (line) => {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quoted) {
      if (character === '"' && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else cell += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') {
      cells.push(cell);
      cell = '';
    } else cell += character;
  }
  cells.push(cell);
  return cells;
};

const localIsoDate = (milliseconds) => {
  const date = new Date(milliseconds);
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseStrengthLog = (text) => {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error('That file is empty.');
  const header = splitCsvLine(lines[0]).map((name) => name.trim());
  const column = (name) => header.indexOf(name);
  const columns = { start: column('start'), exercise: column('exercise'), weight: column('weight'), reps: column('reps'), warmup: column('warmup') };
  if (Object.values(columns).some((index) => index < 0)) throw new Error('This does not look like a StrengthLog export.');
  const sessions = new Map();
  let skippedWarmups = 0;
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const start = Number(cells[columns.start]);
    const rawName = (cells[columns.exercise] || '').trim();
    const kg = Number(cells[columns.weight]);
    const reps = Math.round(Number(cells[columns.reps]));
    if (!start || !rawName || !(reps > 0) || !(kg >= 0)) continue;
    if (cells[columns.warmup] === 'true') {
      skippedWarmups += 1;
      continue;
    }
    const date = localIsoDate(start);
    const name = STRENGTHLOG_NAMES[rawName.toLowerCase()] || rawName;
    if (!sessions.has(date)) sessions.set(date, new Map());
    const exercises = sessions.get(date);
    if (!exercises.has(name)) exercises.set(name, []);
    exercises.get(name).push({ kg: String(kg), reps: String(reps), edited: true });
  }
  return {
    skippedWarmups,
    sessions: [...sessions.entries()].map(([date, exercises]) => ({ date, exercises: [...exercises.entries()].map(([name, sets]) => ({ name, sets })) }))
  };
};

if (typeof module !== 'undefined') module.exports = { parseStrengthLog };
