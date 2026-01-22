import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

type TestAiRequestBody = {
  prompt: string;
  snapshot: unknown;
};

type TestAiResponseBody = {
  ai_reply: string;
};

export async function POST(req: Request) {
  let body: TestAiRequestBody;
  try {
    body = (await req.json()) as TestAiRequestBody;
  } catch {
    return Response.json(
      { ai_reply: '' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
  const snapshot = body?.snapshot;
  if (!prompt) {
    return Response.json(
      { ai_reply: '' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const combinatedText = `${prompt}\n\n${JSON.stringify(
    snapshot ?? {},
    null,
    2
  )}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: combinatedText }] }],
    });
    const text = (response as any)?.text;
    const aiReply = typeof text === 'string' ? text : String(text ?? '');
    const payload: TestAiResponseBody = { ai_reply: aiReply };
    return Response.json(payload, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('test-ai generateContent error:', err);
    return Response.json(
      { ai_reply: '' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
