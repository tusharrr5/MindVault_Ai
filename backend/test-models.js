require('dotenv').config({ path: '.env' });
const { GoogleGenAI } = require('@google/genai');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const modelsToTest = ['gemini-3.5-flash-lite', 'gemini-1.5-flash', 'gemini-3.0-flash', 'gemini-3.5-flash'];
  
  for (const model of modelsToTest) {
    try {
      console.log(`\nTesting ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: "Say 'hello world'",
      });
      console.log(`Success on ${model}:`, response.text);
    } catch (err) {
      console.error(`Failed on ${model}:`, err.message);
    }
  }
}
run();
