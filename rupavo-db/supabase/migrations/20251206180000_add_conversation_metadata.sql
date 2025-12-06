-- Migration: Add metadata for conversation memory management
-- Optimizes AI context window by tracking summaries and token usage

alter table public.ai_conversations
  add column if not exists summary text,               -- Short summary of the conversation up to this point
  add column if not exists is_summary boolean default false, -- Mark if this message is a summary
  add column if not exists token_count integer,       -- Approximate token count for this message
  add column if not exists cumulative_tokens integer, -- Total tokens used in this conversation
  add column if not exists metadata jsonb;            -- Additional metadata (e.g., intent, entities, etc.)

-- Create index for efficient queries
create index if not exists idx_ai_conversations_thread_created 
  on public.ai_conversations(shop_id, thread_id, created_at desc);

create index if not exists idx_ai_conversations_summary 
  on public.ai_conversations(shop_id, is_summary) 
  where is_summary = true;

-- Add column to track last summarized message for context windowing
alter table public.ai_conversations
  add column if not exists last_summary_id uuid references public.ai_conversations(id) on delete set null;
