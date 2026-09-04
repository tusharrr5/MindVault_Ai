require('dotenv').config({ path: '.env' });
const { GoogleGenAI, Type } = require('@google/genai');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents = "Testing a typical analysis payload. The user is doing great but needs some mindfulness and focus goals.";
  
  let success = false;
  while (!success) {
    console.log("Testing Gemini API call timing...");
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: `Based on the following user psychological analysis, suggest 3 highly relevant personal growth goals.\n\nAnalysis:\n${contents}`,
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
      const endTime = Date.now();
      console.log(`Success! Took ${(endTime - startTime) / 1000} seconds.`);
      console.log(response.text);
      success = true;
    } catch (err) {
      const endTime = Date.now();
      console.error(`Failed! Took ${(endTime - startTime) / 1000} seconds. Retrying...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
run();
