import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function callWithRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isTransient =
      err?.status === 503 ||
      err?.status === 429 ||
      err?.message?.includes('503') ||
      err?.message?.includes('429') ||
      err?.message?.includes('high demand');
    if (retries > 0 && isTransient) {
      await new Promise((res) => setTimeout(res, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount } = req.body || {};
    const numAmount = Number(amount);

    if (isNaN(numAmount)) {
      return res.status(400).json({ error: 'قيمة غير صالحة' });
    }

    if (numAmount < 0) {
      return res.json({ text: 'المبلغ يجب أن يكون موجبًا.' });
    }

    if (numAmount === 0) {
      return res.json({ text: 'صفر' });
    }

    const prompt = `Convert the number ${numAmount} into Arabic currency text (Tafqeet) for a legal document. The format should be 'فقط [amount in words] جنيهًا مصريًا لا غير'. For example, for the number 507923, the output must be 'فقط خمسمائة وسبعة آلاف وتسعمائة وثلاثة وعشرون جنيهًا مصريًا لا غير'. Only return the final Arabic text and nothing else.`;

    let response;
    try {
      response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
        })
      );
    } catch (primaryErr) {
      response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        })
      );
    }

    const text = response?.text?.trim();

    if (!text) {
      return res.json({ text: 'لم يتمكن الذكاء الاصطناعي من إنشاء النص. حاول مرة أخرى.' });
    }

    return res.json({ text });
  } catch (error: any) {
    console.error('Error generating Tafqeet:', error);
    return res.status(500).json({
      error: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.',
      message: error?.message || 'Unknown error',
    });
  }
}
