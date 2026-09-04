const fs = require('fs');
let code = fs.readFileSync('src/routes/goal.routes.ts', 'utf8');

const targetMethod = `router.post('/suggestions', async (req: Request, res: Response) => {`;
const startIdx = code.indexOf(targetMethod);

const prefix = code.substring(0, startIdx);

const replacement = `router.post('/suggestions', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return res.status(500).json({ error: true, message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const macroDoc = await db.collection('users').doc(uid).collection('analysis').doc('macro').get();
    
    let contents = 'No comprehensive analysis available yet.';
    if (macroDoc.exists) {
      const data = macroDoc.data()?.analysis || {};
      contents = JSON.stringify(data);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
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
        break;
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
        console.warn(\`Gemini API transient error: \${errorMessage}. Retrying in \${delay}ms... (Attempt \${attempts + 1}/\${maxAttempts})\`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const parsed = JSON.parse(response?.text || '{}');
    const suggestions = parsed.suggestions || [];
    
    const validSuggestions = suggestions.filter((s: any) => {
      const result = createGoalSchema.shape.body.safeParse(s);
      if (!result.success) {
        console.warn('Invalid AI suggestion:', result.error.message);
        return false;
      }
      return true;
    });

    if (validSuggestions.length !== 3) {
      console.warn(\`AI returned \${validSuggestions.length} valid suggestions instead of 3.\`);
    }

    res.status(200).json({
      status: 'success',
      data: validSuggestions.slice(0, 3)
    });
  } catch (error: any) {
    console.error('Error generating goal suggestions:', error.message || error);
    res.status(500).json({ error: true, message: error.message || 'Failed to generate suggestions' });
  }
});
export default router;`;

code = prefix + replacement;
fs.writeFileSync('src/routes/goal.routes.ts', code);
console.log('Fixed file');
