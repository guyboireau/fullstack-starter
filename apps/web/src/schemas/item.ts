import { z } from 'zod';

export const itemStatusSchema = z.enum(['todo', 'in_progress', 'done']);
export type ItemStatus = z.infer<typeof itemStatusSchema>;

export const itemFormSchema = z.object({
  title:       z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().max(1000).optional(),
  status:      itemStatusSchema.default('todo'),
});
export type ItemFormValues = z.infer<typeof itemFormSchema>;

export const itemSchema = itemFormSchema.extend({
  id:         z.string().uuid(),
  user_id:    z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});
export type Item = z.infer<typeof itemSchema>;
