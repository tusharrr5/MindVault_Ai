require('dotenv').config({ path: '.env' });
const { GoogleGenAI, Type } = require('@google/genai');
const admin = require('firebase-admin');

// Mock a huge macro doc
const mockMacro = {
  overallGrowth: "Significant progress in emotional regulation...",
  positivePatterns: ["Resilience", "Self-awareness", "Consistency"],
  behavioralPatterns: ["Tends to procrastinate when stressed", "Seeks social support when overwhelmed"],
  recommendations: ["Focus on stress management techniques", "Maintain social connections"],
  stressTriggers: ["Work deadlines", "Lack of sleep"]
};

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    console.log("Generating with Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `Based on the following user psychological analysis, suggest 3 highly relevant personal growth goals.\n\nAnalysis:\n${JSON.stringify(mockMacro)}`,
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
