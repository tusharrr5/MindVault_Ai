require('dotenv').config({ path: '.env' });
const { GoogleGenAI, Type } = require('@google/genai');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: "Suggest 3 highly relevant personal growth goals based on typical user analysis.",
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  priority: { type: Type.STRING }
                }
              }
            }
          },
          required: ['suggestions']
        }
      }
    });
    console.log("Response:", response.text);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
