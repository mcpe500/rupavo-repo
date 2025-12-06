import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const SYSTEM_PROMPT = `Kamu adalah **"Etalase Toko Online"**, asisten AI yang tugasnya merancang tampilan halaman toko online untuk pemilik usaha kecil dan UMKM.

🎯 TUJUAN
Berdasarkan:
- data toko,
- daftar produk (termasuk foto, harga, kategori),
- dan cuplikan percakapan pemilik usaha dengan sistem (chat history),

tugasmu adalah:
1. Mendesain struktur etalase toko (hero, bagian produk, highlight, footer, dll).
2. Menulis teks (headline, subheadline, deskripsi) dalam Bahasa Indonesia yang hangat, jelas, dan relevan dengan karakter usaha.
3. Menentukan gaya visual (tema warna, nuansa, vibe) yang konsisten dengan karakter toko.
4. Menghasilkan output dalam bentuk **template terstruktur** yang mudah dirender di frontend (Next.js).

📌 FORMAT JAWABAN
Selalu jawab dengan **SATU objek JSON valid** dalam format berikut:

{
  "theme": {
    "mode": "light",
    "primary_color": "#136F63",
    "secondary_color": "#FF7A3C",
    "background_color": "#F8FAFC",
    "accent_style": "modern-warm" 
  },
  "typography": {
    "heading_tone": "hangat, ramah, percaya diri",
    "body_tone": "sederhana, informatif, tidak terlalu kaku"
  },
  "hero": {
    "layout": "image-right", 
    "title": "Judul utama yang kuat dan relevan dengan toko",
    "subtitle": "Subjudul yang menjelaskan value utama toko dalam 1–2 kalimat",
    "call_to_action_label": "Teks tombol utama",
    "highlight_badge": "Badge pendek opsional",
    "featured_product_ids": []
  },
  "sections": [
    {
      "type": "highlight_strip",
      "items": ["Keunggulan 1", "Keunggulan 2", "Keunggulan 3"]
    },
    {
      "type": "product_grid",
      "title": "Judul bagian produk",
      "layout": "3-col",
      "product_ids": []
    }
  ],
  "footer": {
    "show_contact": true,
    "contact_text": "Teks kontak",
    "location_text": "Lokasi",
    "social_links": []
  },
  "copy_guidelines": {
    "do": ["Panduan 1", "Panduan 2"],
    "dont": ["Larangan 1", "Larangan 2"]
  }
}

🧠 CARA BERPIKIR SAAT MENDESAIN ETALASE

1. **Pahami karakter toko** dari category, style_profile, dan chat_memory
2. **Pilih tone teks** yang konsisten dengan jenis usaha
3. **Gunakan produk sebagai pusat desain** - highlight best seller
4. **Gunakan chat history** untuk preferensi warna dan gaya
5. **Desain fleksibel & mudah di-render** - JSON terstruktur, bukan HTML
6. **Kustomisasi tema warna & vibe** sesuai kategori usaha

PENTING: Output harus HANYA JSON valid, tidak ada teks lain di luar JSON.`

interface StorefrontRequest {
  shop_id: string
  user_prompt?: string
  chat_context?: string
}

serve(async (req) => {
  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders() })
    }

    const { shop_id, user_prompt, chat_context }: StorefrontRequest = await req.json()

    if (!shop_id) {
      return new Response(
        JSON.stringify({ error: 'shop_id is required' }),
        { status: 400, headers: corsHeaders() }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch shop data
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shop_id)
      .single()

    if (shopError || !shop) {
      return new Response(
        JSON.stringify({ error: 'Shop not found' }),
        { status: 404, headers: corsHeaders() }
      )
    }

    // Fetch active products with images
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, is_active')
      .eq('shop_id', shop_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    // Fetch recent chat history for context
    const { data: chatHistory } = await supabase
      .from('ai_conversations')
      .select('user_message, assistant_message')
      .eq('shop_id', shop_id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build context for AI
    const chatMemorySummary = chatHistory
      ?.map(chat => `User: ${chat.user_message}\nAssistant: ${chat.assistant_message}`)
      .join('\n\n') || 'Tidak ada riwayat chat.'

    const contextPayload = {
      shop: {
        name: shop.name,
        tagline: shop.tagline,
        description: shop.description,
        business_type: shop.business_type,
        style_profile: shop.style_profile
      },
      products: products || [],
      chat_memory: chatMemorySummary,
      user_request: user_prompt || 'Buatkan desain etalase toko online yang menarik dan sesuai dengan produk saya.'
    }

    const userMessage = `Berikut data toko dan produk yang akan dibuatkan etalase online:

${JSON.stringify(contextPayload, null, 2)}

Permintaan khusus dari pemilik toko:
${user_prompt || 'Buatkan desain etalase yang menarik sesuai dengan karakter toko dan produk saya.'}

Buatkan desain etalase toko online dalam format JSON sesuai spesifikasi.`

    // Call Claude API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.8,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    })

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text()
      throw new Error(`Anthropic API error: ${errorText}`)
    }

    const anthropicData = await anthropicResponse.json()
    const assistantMessage = anthropicData.content[0].text

    // Parse JSON from AI response
    let storefrontDesign
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/) || 
                       assistantMessage.match(/```\n([\s\S]*?)\n```/)
      
      const jsonText = jsonMatch ? jsonMatch[1] : assistantMessage
      storefrontDesign = JSON.parse(jsonText.trim())
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', assistantMessage)
      throw new Error('AI generated invalid JSON format')
    }

    // Extract theme and layout separately
    const { theme, ...layout } = storefrontDesign

    // Get existing layout to increment version
    const { data: existingLayout } = await supabase
      .from('storefront_layouts')
      .select('version')
      .eq('shop_id', shop_id)
      .single()

    const newVersion = existingLayout ? (existingLayout.version + 1) : 1

    // Save to database
    const { data: savedLayout, error: saveError } = await supabase
      .from('storefront_layouts')
      .upsert({
        shop_id: shop_id,
        theme: theme,
        layout: layout,
        version: newVersion,
        design_prompt: user_prompt || null,
        is_active: true,
        meta: {
          model: 'claude-3-5-sonnet-20241022',
          temperature: 0.8,
          generated_at: new Date().toISOString(),
          product_count: products?.length || 0,
          has_chat_context: !!chatHistory?.length
        }
      }, {
        onConflict: 'shop_id'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving storefront layout:', saveError)
      throw saveError
    }

    return new Response(
      JSON.stringify({
        success: true,
        layout: savedLayout,
        design: storefrontDesign,
        message: 'Etalase toko berhasil dibuat!'
      }),
      { headers: corsHeaders() }
    )

  } catch (error) {
    console.error('Error in ai-generate-storefront:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: corsHeaders() }
    )
  }
})

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}
