require('dotenv').config({ path: '.env' });
const { GoogleGenAI, Type } = require('@google/genai');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  let response;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: "Suggest 3 highly relevant personal growth goals based on typical user analysis.",
        config: {
          systemInstruction: "You are a supportive, insightful personal growth coach.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING }
                  },
                  required: ['title']
                }
              }
            },
            required: ['suggestions']
          }
        }
      });
      console.log("Success:", response.text);
      break; // Success
    } catch (err) {
      attempts++;
      const errorMessage = err.message || '';
      const isTransient = errorMessage.includes('503') || 
                          errorMessage.includes('UNAVAILABLE') || 
                          errorMessage.includes('429') ||
                          errorMessage.includes('capacity');
                          
      if (!isTransient || attempts >= maxAttempts) {
        console.log("Final throw:", errorMessage);
        break;
      }
      
      const delay = attempts * 1000;
      console.warn(`Transient error. Retrying in ${delay}ms... (Attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
run();
