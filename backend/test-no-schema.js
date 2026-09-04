require('dotenv').config({ path: '.env' });
const { GoogleGenAI } = require('@google/genai');

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: "Suggest 3 highly relevant personal growth goals based on typical user analysis. Format as JSON with a 'suggestions' array.",
    });
    console.log("Response:", response.text);
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}
run();
