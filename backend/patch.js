const fs = require('fs');
let code = fs.readFileSync('src/routes/goal.routes.ts', 'utf8');

const suggestionsEndpoint = `

router.post('/suggestions', async (req: Request, res: Response) => {
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

    const parsed = JSON.parse(response.text || '{}');
    const suggestions = parsed.suggestions || [];
    
    res.status(200).json({
      status: 'success',
      data: suggestions
    });
  } catch (error: any) {
    console.error('Error generating goal suggestions:', error);
    res.status(500).json({ error: true, message: 'Failed to generate suggestions' });
  }
});
`;

code = code.replace('export default router;', suggestionsEndpoint + '\\nexport default router;');
fs.writeFileSync('src/routes/goal.routes.ts', code);
console.log('Added POST /suggestions');
