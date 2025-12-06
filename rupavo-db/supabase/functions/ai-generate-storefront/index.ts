import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const KOLOSAL_API_KEY = Deno.env.get('KOLOSAL_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const KOLOSAL_API_URL = 'https://api.kolosal.ai/v1/chat/completions'
const KOLOSAL_MODEL = 'Qwen 3 30BA3B'

const SYSTEM_PROMPT = `Kamu adalah **"Etalase Toko Online Indonesia"**, asisten AI yang tugasnya merancang tampilan halaman toko online untuk pemilik usaha kecil, UMKM, dan pelaku bisnis Indonesia.

�🇩 KONTEKS INDONESIA
- Target audiens: konsumen Indonesia dari berbagai latar belakang
- Bahasa: Bahasa Indonesia yang hangat, ramah, dan mudah dipahami semua kalangan
- Budaya: Inklusif, menghargai keberagaman Indonesia (Jawa, Sunda, Sumatera, Bali, dll)
- Gaya komunikasi: Sopan, bersahabat, tidak kaku tapi tetap profesional
- Hindari bahasa yang terlalu formal atau corporate-speak

🎯 TUJUAN
Berdasarkan data toko, daftar produk, dan preferensi pemilik usaha, tugasmu adalah:
1. Mendesain struktur etalase toko yang VARIATIF dan UNIK
2. Menulis copywriting dalam Bahasa Indonesia yang engaging
3. Memilih kombinasi section yang tepat untuk jenis usaha tersebut
4. Menentukan gaya visual yang konsisten dengan karakter toko
5. Menghasilkan output dalam bentuk JSON terstruktur

📐 HERO LAYOUT OPTIONS (pilih 1):
- "centered": Heading di tengah, 1 tombol CTA utama
- "image-left": Gambar di kiri, teks di kanan
- "image-right": Gambar di kanan, teks di kiri
- "split": 50/50 block kiri-kanan
- "video-bg": Hero dengan background video
- "carousel": Beberapa slide hero bergantian
- "stacked": Title besar di atas, highlight strip di bawah
- "product-focus": 1 produk hero besar dengan detail
- "story": Blok narasi cerita toko
- "badge-hero": Banyak badge kecil (promo, rating, testimonial)

🎨 HERO STYLE OPTIONS (pilih 1):
- "minimal": Bersih, banyak whitespace
- "bold": Warna kuat, font tebal
- "gradient": Background gradient halus
- "glassmorphism": Efek kaca blur
- "neumorphism": Efek soft 3D
- "carded": Hero di dalam card rounded
- "outline": Border tegas, modern
- "floating": Elemen-elemen tampak melayang

📦 SECTION TYPES (pilih 5-12 yang paling relevan):

PRODUK:
- "product_grid": Grid produk 2/3/4 kolom
- "product_carousel": Carousel horizontal produk
- "product_featured": 1 produk highlight besar
- "category_tiles": Tile kategori produk dengan icon
- "bundle_showcase": Paket hemat bundling produk

KEUNGGULAN & TRUST:
- "highlight_strip": Strip keunggulan horizontal (gratis ongkir, dll)
- "highlight_icons": Grid icons dengan text
- "usp_columns": 3 kolom Unique Selling Points
- "social_proof": Stats pencapaian (500+ pelanggan, dll)
- "brand_strip": Logo mitra/brand

TESTIMONI:
- "testimonial_carousel": Carousel testimoni pelanggan
- "testimonial_grid": Grid testimoni 2-3 kolom

PROMOSI:
- "banner_promo": Banner promosi full-width
- "banner_countdown": Banner dengan countdown timer
- "announcement_bar": Bar pengumuman di atas halaman
- "floating_badge": Badge mengambang (Baru Buka!, Diskon, dll)

INFORMASI:
- "about_us": Section tentang toko
- "story_timeline": Timeline perjalanan usaha
- "team_members": Orang-orang di balik toko
- "how_it_works": Langkah-langkah cara belanja
- "faq_accordion": FAQ dalam bentuk accordion

KHUSUS KULINER/F&B:
- "recipe_cards": Ide masakan dari produk
- "tips_list": Tips praktis terkait produk

PRICING & COMPARISON:
- "pricing_table": Tabel harga paket/langganan
- "compare_table": Tabel perbandingan produk/paket

ENGAGEMENT:
- "cta_block": Call-to-action standalone
- "newsletter": Form subscribe email/WhatsApp
- "contact_form": Form kontak/pesan
- "gallery": Gallery foto toko/produk
- "map_location": Lokasi toko dengan peta

FLOATING ELEMENTS:
- "whatsapp_float": Tombol WhatsApp mengambang

🎭 VISUAL STYLE OPTIONS:
{
  "border_radius": "none" | "sm" | "md" | "lg" | "xl" | "full",
  "shadows": "none" | "sm" | "md" | "lg" | "glow" | "soft",
  "animations": "none" | "subtle" | "playful" | "dynamic" | "bouncy",
  "spacing": "compact" | "normal" | "airy" | "very-airy",
  "composition": "boxed" | "full-bleed" | "sectioned",
  "divider_style": "none" | "line" | "dashed" | "dotted" | "wave" | "zigzag",
  "card_style": "flat" | "outlined" | "soft" | "glass" | "elevated",
  "image_style": "square" | "rounded" | "circle" | "squircle",
  "section_transition": "straight" | "angled" | "curve" | "wave"
}

🎨 COLOR PALETTE PRESETS (pilih berdasarkan jenis usaha):
- "fresh-green": Sayur, organik, herbal (#136F63, #10B981, #FCD34D)
- "warm-sunset": Makanan, kuliner, warung (#F97316, #EF4444, #FBBF24)
- "ocean-blue": Seafood, minuman, es (#0284C7, #0891B2, #22D3EE)
- "elegant-purple": Fashion, beauty, salon (#7C3AED, #A855F7, #E879F9)
- "earthy-brown": Kopi, craft, handmade (#92400E, #B45309, #D97706)
- "modern-dark": Premium, tech, gadget (#18181B, #3F3F46, #A1A1AA)
- "pastel-pink": Florist, gift, kue (#EC4899, #F472B6, #FBCFE8)
- "nature-earth": Pertanian, tanaman (#166534, #84CC16, #A3E635)
- "coffee-dark": Kopi premium, roastery (#78350F, #92400E, #D97706)
- "fresh-market": Pasar segar, grocery (#059669, #10B981, #34D399)
- "sea-side": Seafood, pantai, ikan (#0369A1, #0EA5E9, #38BDF8)
- "minimal-black": Minimalist, luxury (#171717, #404040, #737373)
- "soft-beige": Homemade, artisan, bakery (#A16207, #CA8A04, #FDE047)
- "tropical": Buah, jus, tropical (#15803D, #22C55E, #FDE047)
- "berry": Dessert, pastry, cake (#9D174D, #DB2777, #F472B6)

📌 FORMAT JAWABAN (JSON):
{
  "theme": {
    "mode": "light" | "dark",
    "color_palette": "[pilih dari preset]",
    "tone": "playful" | "serious" | "premium" | "eco" | "family-friendly",
    "primary_color": "#HEX",
    "secondary_color": "#HEX",
    "accent_color": "#HEX",
    "background_color": "#HEX",
    "surface_color": "#HEX",
    "alternative_bg": "#HEX",
    "text_primary": "#HEX",
    "text_secondary": "#HEX",
    "gradient_style": "none" | "subtle" | "bold" | "mesh",
    "gradient_colors": ["#HEX", "#HEX"],
    "background_pattern": "none" | "dots" | "grid" | "noise"
  },
  "visual_style": {
    "border_radius": "...",
    "shadows": "...",
    "animations": "...",
    "spacing": "...",
    "composition": "...",
    "divider_style": "...",
    "card_style": "...",
    "image_style": "...",
    "section_transition": "..."
  },
  "typography": {
    "heading_font": "Inter" | "Poppins" | "Outfit" | "Plus Jakarta Sans",
    "body_font": "Inter" | "Poppins" | "Outfit" | "Plus Jakarta Sans",
    "heading_tone": "[deskripsi gaya heading]",
    "body_tone": "[deskripsi gaya body]"
  },
  "hero": {
    "layout": "[pilih dari options]",
    "style": "[pilih dari options]",
    "title": "[headline utama dalam Bahasa Indonesia - maksimal 8 kata]",
    "subtitle": "[subheadline 1-2 kalimat]",
    "call_to_action_label": "[teks tombol - maksimal 3 kata]",
    "call_to_action_url": "#products",
    "highlight_badge": "[opsional: badge kecil seperti 'Baru!', 'Best Seller']",
    "featured_product_ids": []
  },
  "sections": [
    // Array of 5-12 section objects yang paling relevan untuk toko ini
    // Setiap section memiliki format berbeda sesuai type-nya
  ],
  "floating_elements": [
    // Elemen mengambang seperti whatsapp_float, floating_badge
  ],
  "footer": {
    "style": "minimal" | "full" | "centered",
    "show_contact": true | false,
    "show_social": true | false,
    "show_location": true | false,
    "contact_text": "...",
    "location_text": "...",
    "copyright_text": "© 2024 [Nama Toko]. Hak cipta dilindungi."
  },
  "seo": {
    "meta_title": "[nama toko] - [tagline singkat]",
    "meta_description": "[deskripsi 150 karakter untuk SEO]"
  }
}

🧠 PANDUAN DESAIN:
1. VARIASI: Jangan selalu pakai kombinasi yang sama. Variasikan hero layout, section urutan, dan visual style.
2. RELEVANSI: Pilih section yang relevan dengan jenis usaha. Toko kopi tidak perlu recipe_cards tentang sayur.
3. STORYTELLING: Untuk UMKM yang punya cerita, gunakan story_timeline atau about_us yang engaging.
4. MOBILE-FIRST: Pikirkan tampilan di HP karena mayoritas pengguna Indonesia akses via mobile.
5. LOKAL: Gunakan referensi lokal Indonesia yang inklusif (bukan hanya Jakarta/Jawa).
6. COPY: Tulis headline yang catchy tapi tidak lebay. Hangat tapi tidak murahan.

⚠️ PENTING:
- Output harus HANYA JSON valid, tidak ada teks lain di luar JSON
- Pilih 5-12 sections yang paling relevan, JANGAN semua
- Sesuaikan warna dengan jenis usaha
- Gunakan Bahasa Indonesia yang natural dan inklusif`


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
      ?.map((chat: { user_message: string; assistant_message: string }) => `User: ${chat.user_message}\nAssistant: ${chat.assistant_message}`)
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

    // Call Kolosal API
    console.log('Calling Kolosal API with model:', KOLOSAL_MODEL)
    const kolosalResponse = await fetch(KOLOSAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KOLOSAL_API_KEY}`
      },
      body: JSON.stringify({
        model: KOLOSAL_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.8
      })
    })

    if (!kolosalResponse.ok) {
      const errorText = await kolosalResponse.text()
      console.error('Kolosal API error:', errorText)
      throw new Error(`Kolosal API error: ${errorText}`)
    }

    const kolosalData = await kolosalResponse.json()
    console.log('Kolosal API response received')

    // Extract response from OpenAI-compatible format
    const assistantMessage = kolosalData.choices?.[0]?.message?.content || ''

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
          model: KOLOSAL_MODEL,
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
