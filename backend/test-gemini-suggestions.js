require('dotenv').config({ path: 'backend/.env' });
const { GoogleGenAI, Type } = require('@google/genai');

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `Based on the following user psychological analysis, suggest 3 highly relevant personal growth goals.\n\nAnalysis:\n{}`,
      config: {
        systemInstruction: "You are a supportive, insightful personal growth coach. Provide exactly 3 actionable, measurable, and highly relevant goal suggestions based on the user's emotional and psychological patterns. Keep titles short and descriptions encouraging.",
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
                },
                required: ['title', 'description', 'category', 'priority']
              }
            }
          },
          required: ['suggestions']
        }
      }
    });
    console.log("Response:", response.text);
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}
run();
