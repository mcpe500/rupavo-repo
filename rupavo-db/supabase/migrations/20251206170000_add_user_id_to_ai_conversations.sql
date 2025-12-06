-- Migration: Add user_id to ai_conversations table
-- This connects ai_conversations directly with auth.users
-- Allows tracking conversations by user, even before a shop is created (e.g., onboarding)

-- Add user_id column to ai_conversations
alter table public.ai_conversations
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Create index for better query performance
create index if not exists idx_ai_conversations_user_id 
  on public.ai_conversations(user_id);

-- Make shop_id nullable to support pre-shop conversations (like onboarding)
alter table public.ai_conversations
  alter column shop_id drop not null;

-- Add constraint: either user_id or shop_id must be present
alter table public.ai_conversations
  add constraint ai_conversations_user_or_shop_check 
  check (user_id is not null or shop_id is not null);

-- Update RLS policy for ai_conversations to include user_id access
drop policy if exists "Owner can manage their chat logs" on public.ai_conversations;

create policy "User can manage their own conversations"
  on public.ai_conversations for all
  using (
    auth.uid() = user_id 
    or 
    shop_id in (select id from public.shops where owner_id = auth.uid())
  )
  with check (
    auth.uid() = user_id 
    or 
    shop_id in (select id from public.shops where owner_id = auth.uid())
  );

-- Backfill user_id for existing conversations based on shop ownership
-- This is optional and only runs if there are existing records
update public.ai_conversations
set user_id = (
  select owner_id 
  from public.shops 
  where shops.id = ai_conversations.shop_id
)
where user_id is null and shop_id is not null;
