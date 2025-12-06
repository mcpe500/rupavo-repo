-- Enhanced storefront layouts for AI-generated Etalase Toko Online
-- Adds theme configuration and design metadata

-- Add theme and version tracking columns
ALTER TABLE public.storefront_layouts 
ADD COLUMN IF NOT EXISTS theme jsonb,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS design_prompt text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing records to have default theme if null
UPDATE public.storefront_layouts
SET theme = jsonb_build_object(
  'mode', 'light',
  'primary_color', '#136F63',
  'secondary_color', '#FF7A3C',
  'background_color', '#F8FAFC',
  'accent_style', 'modern-warm'
)
WHERE theme IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_storefront_layouts_shop_active 
ON public.storefront_layouts(shop_id, is_active);

-- Add comment for documentation
COMMENT ON TABLE public.storefront_layouts IS 'AI-generated storefront designs (Etalase Toko Online) with custom themes and layouts';
COMMENT ON COLUMN public.storefront_layouts.theme IS 'Color scheme and visual theme (primary_color, secondary_color, mode, etc)';
COMMENT ON COLUMN public.storefront_layouts.layout IS 'Page structure with hero, sections, product grids, footer config';
COMMENT ON COLUMN public.storefront_layouts.version IS 'Design version number, incremented on regeneration';
COMMENT ON COLUMN public.storefront_layouts.design_prompt IS 'User prompt or preferences used to generate this design';
