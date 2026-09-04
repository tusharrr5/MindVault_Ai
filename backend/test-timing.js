require('dotenv').config({ path: '.env' });
const { GoogleGenAI, Type } = require('@google/genai');

async function run() {
  console.log("Testing Gemini API call timing natively...");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents = "Testing a typical analysis payload. The user is doing great but needs some mindfulness and focus goals.";
  
  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    try {
      const fetchPromise = ai.models.generateContent({
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
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout')), 15000)
      );
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const endTime = Date.now();
      console.log(`Success! Took ${(endTime - startTime) / 1000} seconds on attempt ${attempts + 1}.`);
      console.log(response.text);
      return;
    } catch (err) {
      attempts++;
      const errorMessage = err.message || '';
      console.error(`Failed attempt ${attempts} with error: ${errorMessage}`);
      
      const isTransient = errorMessage.includes('503') || 
                          errorMessage.includes('UNAVAILABLE') || 
                          errorMessage.includes('429') ||
                          errorMessage.includes('capacity') ||
                          errorMessage.includes('timeout');
                          
      if (!isTransient || attempts >= maxAttempts) {
        console.error("Final failure.");
        break;
      }
      console.log(`Retrying in ${attempts * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, attempts * 1000));
    }
  }
}
run();
