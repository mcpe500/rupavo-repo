-- Migration: Create product-images storage bucket with RLS policies
-- Created: 2025-12-06

-- Create public bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images');

-- RLS Policy: Allow public read access for product images
CREATE POLICY "Public can view product images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'product-images');

-- RLS Policy: Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update product images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'product-images');

-- RLS Policy: Allow authenticated users to delete their images
CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'product-images');
