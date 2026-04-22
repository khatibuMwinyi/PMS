export async function redactSensitive(text: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const prompt = `Remove all human names, phone numbers, and exact street addresses from the following text. Return only the sanitized text.\n\n${text}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }
  const data = await response.json();
  // Extract generated text
  const sanitized = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return sanitized.trim();
}
