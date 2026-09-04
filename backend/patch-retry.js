const fs = require('fs');
let code = fs.readFileSync('src/routes/goal.routes.ts', 'utf8');

const oldCode = `    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: \`Based on the following user psychological analysis, suggest 3 highly relevant personal growth goals.\\n\\nAnalysis:\\n\${contents}\`,
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

    const parsed = JSON.parse(response.text || '{}');`;

const newCode = `    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let response: any;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: \`Based on the following user psychological analysis, suggest 3 highly relevant personal growth goals.\\n\\nAnalysis:\\n\${contents}\`,
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
        break; // Success
      } catch (err: any) {
        attempts++;
        const errorMessage = err.message || '';
        
        const isTransient = errorMessage.includes('503') || 
                            errorMessage.includes('UNAVAILABLE') || 
                            errorMessage.includes('429') ||
                            errorMessage.includes('capacity');
                            
        if (!isTransient || attempts >= maxAttempts) {
          throw err;
        }
        
        const delay = attempts * 1000;
        console.warn(\`Gemini API transient error (\${errorMessage}). Retrying in \${delay}ms... (Attempt \${attempts + 1}/\${maxAttempts})\`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const parsed = JSON.parse(response?.text || '{}');`;

if (code.includes('const response = await ai.models.generateContent')) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/routes/goal.routes.ts', code);
  console.log('Patched with retry');
} else {
  console.log('Already patched or not found');
}
