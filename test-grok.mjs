import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const key = process.env.GROK_API_KEY || process.env.GEMINI_API_KEY;
console.log('KEY_PRESENT', !!key);
console.log('GROK_API_KEY', !!process.env.GROK_API_KEY);
console.log('GEMINI_API_KEY', !!process.env.GEMINI_API_KEY);
console.log('AI_PROVIDER', process.env.AI_PROVIDER);
if (!key) {
  console.error('MISSING_KEY');
  process.exit(1);
}
const body = { model: 'grok-4.5', input: 'Hello' };
const resp = await fetch('https://api.x.ai/v1/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + key
  },
  body: JSON.stringify(body)
});
console.log('STATUS', resp.status);
console.log(await resp.text());
