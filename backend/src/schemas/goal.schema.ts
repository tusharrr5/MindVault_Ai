import { z } from 'zod';

export const createGoalSchema = z.object({
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

export const updateGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(100, 'Title is too long').optional(),
    description: z.string().max(1000, 'Description is too long').optional(),
    category: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    targetDate: z.string().nullable().optional(),
    progress: z.number().min(0).max(100).optional(),
    status: z.enum(['Not Started', 'In Progress', 'Completed']).optional(),
    linkedJournals: z.array(z.string()).optional(),
  }),
});
