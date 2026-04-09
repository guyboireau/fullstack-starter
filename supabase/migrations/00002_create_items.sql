-- =============================================
-- Migration: Create items table (CRUD example)
-- =============================================

CREATE TABLE IF NOT EXISTS public.items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own items
CREATE POLICY "Users can view their own items"
  ON public.items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON public.items FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
