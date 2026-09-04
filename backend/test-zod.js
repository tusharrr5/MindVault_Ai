const { z } = require('zod');

const schema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(100, 'Title is too long'),
    description: z.string().max(1000, 'Description is too long').optional(),
    category: z.string(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    targetDate: z.string().nullable().optional(),
    progress: z.number().min(0).max(100).optional(),
    status: z.enum(['Not Started', 'In Progress', 'Completed']).optional(),
    linkedJournals: z.array(z.string()).optional(),
  }),
});

const s = {
  title: "Daily Mindfulness Practice",
  description: "Dedicate 10 minutes every morning to deep breathing and meditation to center your mind and reduce anxiety.",
  category: "Mental Wellbeing",
  priority: "High"
};

const result = schema.shape.body.safeParse(s);
console.log("Success:", result.success);
if (!result.success) console.log(result.error.message);
