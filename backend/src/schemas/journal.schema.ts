import { z } from 'zod';

export const createJournalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(100, 'Title is too long'),
    content: z
      .string()
      .min(1, 'Journal content cannot be empty')
      .max(10000, 'Journal content exceeds maximum length of 10,000 characters'),
    goalId: z.string().optional(),
  }),
});

// Used to validate the structure before sending to DB or Gemini
