export const getTafqeet = async (amount: number): Promise<string> => {
  if (amount < 0) {
    return "المبلغ يجب أن يكون موجبًا.";
  }
  if (amount === 0) {
    return "صفر";
  }

  try {
    const response = await fetch('/api/tafqeet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server error generating tafqeet:', errorData);
      return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
    }

    const data = await response.json();
    return data.text || "لم يتمكن الذكاء الاصطناعي من إنشاء النص. حاول مرة أخرى.";
  } catch (error) {
    console.error("Network or fetch error:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};
