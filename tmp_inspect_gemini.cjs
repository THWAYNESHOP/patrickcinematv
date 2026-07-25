const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const raw = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env = Object.fromEntries(raw.split(/\r?\n/).filter(Boolean).map((line) => {
  const [key, ...rest] = line.split('=');
  return [key, rest.join('=')];
}));
const key = env.GEMINI_API_KEY;
if (!key) {
  console.error('No GEMINI_API_KEY found');
  process.exit(1);
}
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
const body = {
  contents: [
    { parts: [{ text: 'hi' }] },
  ],
  generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
};
(async () => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text);
})();