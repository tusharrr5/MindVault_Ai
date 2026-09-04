require('dotenv').config({ path: '.env' });
const { GoogleGenAI, Type } = require('@google/genai');
const { z } = require('zod');

const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(100, 'Title is too long'),
    description: z.string().max(1000, 'Description is too long').optional(),
    category: z.string(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
  }),
});

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  let success = false;
  let attempts = 0;
  while (!success && attempts < 5) {
    attempts++;
    try {
      console.log(`Attempt ${attempts}...`);
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: "Suggest 3 highly relevant personal growth goals based on typical user analysis.",
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
      
      console.log("Raw Response:", response.text);
      const parsed = JSON.parse(response.text || '{}');
      const suggestions = parsed.suggestions || [];
      console.log("Parsed length:", suggestions.length);
      
      const validSuggestions = suggestions.filter((s) => {
        const result = createGoalSchema.shape.body.safeParse(s);
        if (!result.success) {
          console.warn('Invalid AI suggestion:', JSON.stringify(result.error.issues));
          return false;
        }
        return true;
      });
      console.log("Valid length:", validSuggestions.length);
      success = true;
    } catch(e) {
      console.error("Error:", e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
run();
