
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available as an environment variable
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTafqeet = async (amount: number): Promise<string> => {
  if (amount < 0) {
    return "المبلغ يجب أن يكون موجبًا.";
  }
  if (amount === 0) {
    return "صفر";
  }

  const prompt = `Convert the number ${amount} into Arabic currency text (Tafqeet) for a legal document. The format should be 'فقط [amount in words] جنيهًا مصريًا لا غير'. For example, for the number 507923, the output must be 'فقط خمسمائة وسبعة آلاف وتسعمائة وثلاثة وعشرون جنيهًا مصريًا لا غير'. Only return the final Arabic text and nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });
    
    // Use the robust .text accessor
    const text = response.text;

    if (!text) {
        return "لم يتمكن الذكاء الاصطناعي من إنشاء النص. حاول مرة أخرى.";
    }

    // Basic cleanup
    return text.trim();

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};
