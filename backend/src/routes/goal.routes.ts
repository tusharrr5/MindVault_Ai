import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGoalSchema, updateGoalSchema } from '../schemas/goal.schema';
import { GoogleGenAI, Type } from '@google/genai';

const router = Router();
router.use(verifyToken);

router.post('/', validate(createGoalSchema), async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority, targetDate, status, linkedJournals } = req.body;
    const uid = req.user!.uid;

    const newGoalRef = db.collection('users').doc(uid).collection('goals').doc();
    const goalData = {
      id: newGoalRef.id,
      title,
      description: description || '',
      category: category || 'Personal',
      priority: priority || 'Medium',
      targetDate: targetDate || null,
      progress: 0,
      status: status || 'Not Started',
      linkedJournals: linkedJournals || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await newGoalRef.set(goalData);

    res.status(201).json({ status: 'success', data: goalData });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: true, message: 'Failed to create goal' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;

    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('goals')
      .orderBy('createdAt', 'desc')
      .get();

    const goals = snapshot.docs.map(doc => doc.data());
    res.status(200).json({ status: 'success', data: goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: true, message: 'Failed to fetch goals' });
  }
});

router.put('/:id', validate(updateGoalSchema), async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const goalId = req.params.id as string;
    const { title, description, category, priority, targetDate, progress, status, linkedJournals } = req.body;

    const goalRef = db.collection('users').doc(uid).collection('goals').doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: true, message: 'Goal not found' });
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (targetDate !== undefined) updates.targetDate = targetDate;
    if (progress !== undefined) updates.progress = progress;
    if (status !== undefined) updates.status = status;
    if (linkedJournals !== undefined) updates.linkedJournals = linkedJournals;

    await goalRef.update(updates);
    const updatedDoc = await goalRef.get();

    res.status(200).json({ status: 'success', data: updatedDoc.data() });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: true, message: 'Failed to update goal' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const goalId = req.params.id as string;

    const goalRef = db.collection('users').doc(uid).collection('goals').doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: true, message: 'Goal not found' });
    }

    await goalRef.delete();
    res.status(200).json({ status: 'success', message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: true, message: 'Failed to delete goal' });
  }
});

router.post('/insight', async (req: Request, res: Response) => {
  let goals: any[] = [];
  try {
    const uid = req.user!.uid;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return res.status(500).json({ error: true, message: 'An unexpected server error occurred. Please try again.' });
    }

    // Fetch active goals
    const goalsSnapshot = await db
      .collection('users')
      .doc(uid)
      .collection('goals')
      .where('status', '==', 'Active')
      .get();
    
    goals = goalsSnapshot.docs.map(doc => doc.data());
    
    if (goals.length === 0) {
      return res.status(200).json({ status: 'success', data: { insight: "Create some personal goals to start receiving AI growth insights!" } });
    }

    // Fetch recent journals
    const journalsSnapshot = await db
      .collection('users')
      .doc(uid)
      .collection('journals')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    const recentJournals = journalsSnapshot.docs.map(doc => doc.data());
    const journalSummaries = recentJournals.filter(j => j.aiAnalysis?.summary).map(j => `- Mood: ${j.aiAnalysis.mood} | Theme: ${j.aiAnalysis.themes?.join(',') || ''} | Summary: ${j.aiAnalysis.summary}`).join('\n');

    const goalsStr = goals.map(g => `- ${g.title} (${g.category}, ${g.progress}% completed)`).join('\n');

    const systemInstruction = `You are a supportive, insightful personal growth coach. Review the user's active goals and recent journal metadata, then write a short, motivational paragraph (3-4 sentences max) identifying what they are progressing well on, if any goal seems neglected, and a practical next step. Do not judge, only encourage.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `User's Active Goals:\n${goalsStr}\n\nRecent Journal Patterns:\n${journalSummaries || 'No recent analyzed journals.'}`,
      config: {
        systemInstruction,
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        insight: response.text
      }
    });
  } catch (error: any) {
    console.error('Error generating growth insight:', error.message);
    
    // Implement a graceful fallback based on actual goals if Gemini fails
    if (goals && goals.length > 0) {
      const activeCount = goals.length;
      const topGoal = goals.reduce((prev, current) => (prev.progress > current.progress) ? prev : current);
      
      const fallbackInsight = `You have ${activeCount} active goal${activeCount > 1 ? 's' : ''}. You're making the most progress on "${topGoal.title}" (${topGoal.progress}%). Keep up the great work and maintain this momentum!`;
      
      return res.status(200).json({
        status: 'success',
        data: {
          insight: fallbackInsight
        }
      });
    }

    res.status(500).json({ error: true, message: 'Failed to generate insight' });
  }
});



router.post('/suggestions', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return res.status(500).json({ error: true, message: 'An unexpected server error occurred. Please try again.' });
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
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const fetchPromise = ai.models.generateContent({
          model: 'gemini-3.5-flash',
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
        
        response = await Promise.race([fetchPromise, timeoutPromise]);
        break;
      } catch (err: any) {
        attempts++;
        const errorMessage = err.message || '';
        
        const isTransient = errorMessage.includes('503') || 
                            errorMessage.includes('UNAVAILABLE') || 
                            errorMessage.includes('429') ||
                            errorMessage.includes('capacity') ||
                            errorMessage.includes('timeout');
                            
        if (!isTransient || attempts >= maxAttempts) {
          throw err;
        }
        
        const delay = attempts * 1000;
        console.warn(`Gemini API transient error: ${errorMessage}. Retrying in ${delay}ms... (Attempt ${attempts + 1}/${maxAttempts})`);
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
      console.warn(`AI returned ${validSuggestions.length} valid suggestions instead of 3.`);
    }

    res.status(200).json({
      status: 'success',
      data: validSuggestions.slice(0, 3)
    });
  } catch (error: any) {
    console.error('Error generating goal suggestions:', error.message || error);
    res.status(500).json({ error: true, message: 'An unexpected server error occurred. Please try again.' });
  }
});
export default router;