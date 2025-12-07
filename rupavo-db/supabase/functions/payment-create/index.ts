import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')!
const MIDTRANS_IS_PRODUCTION = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STOREFRONT_URL = Deno.env.get('STOREFRONT_URL') || 'https://rupavo.com'

const PLATFORM_FEE_PERCENT = 0.05 // 5% platform fee

interface CreatePaymentRequest {
  order_id: string
  shop_id: string
  customer_name: string
  customer_email?: string
  customer_phone: string
  customer_address?: string
  items: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  delivery_fee?: number
  notes?: string
  additional_data?: Record<string, any>
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders() })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (req.method === 'POST') {
      const body: CreatePaymentRequest = await req.json()

      // Validate request
      if (!body.order_id || !body.shop_id || !body.customer_name || !body.items?.length) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: corsHeaders() }
        )
      }

      // Get shop info
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('*, shop_payment_settings(*)')
        .eq('id', body.shop_id)
        .single()

      if (shopError || !shop) {
        return new Response(
          JSON.stringify({ error: 'Shop not found' }),
          { status: 404, headers: corsHeaders() }
        )
      }

      // Check if shop accepts online orders
      if (!shop.shop_payment_settings?.accept_online_orders) {
        return new Response(
          JSON.stringify({ error: 'Shop does not accept online orders' }),
          { status: 400, headers: corsHeaders() }
        )
      }

      // Get products
      const productIds = body.items.map(item => item.product_id)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)

      if (productsError || !products?.length) {
        return new Response(
          JSON.stringify({ error: 'Products not found' }),
          { status: 404, headers: corsHeaders() }
        )
      }

      // Calculate order total
      let subtotal = 0
      const itemDetails: any[] = []

      for (const item of body.items) {
        const product = products.find(p => p.id === item.product_id)
        if (!product) {
          return new Response(
            JSON.stringify({ error: `Product ${item.product_id} not found` }),
            { status: 404, headers: corsHeaders() }
          )
        }

        const itemTotal = Number(product.price) * item.quantity
        subtotal += itemTotal

        itemDetails.push({
          id: product.id,
          price: Number(product.price),
          quantity: item.quantity,
          name: product.name
        })
      }

      const deliveryFee = body.delivery_fee || 0
      const grossAmount = subtotal + deliveryFee
      const platformFee = Math.round(grossAmount * PLATFORM_FEE_PERCENT)
      const merchantAmount = grossAmount - platformFee

      // Add delivery fee as item if applicable
      if (deliveryFee > 0) {
        itemDetails.push({
          id: 'delivery',
          price: deliveryFee,
          quantity: 1,
          name: 'Biaya Pengiriman'
        })
      }

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          shop_id: body.shop_id,
          source: 'storefront',
          status: 'draft',
          total_amount: grossAmount,
          order_type: 'online',
          payment_status: 'pending',
          payment_method: 'online',
          customer_name: body.customer_name,
          customer_phone: body.customer_phone,
          customer_address: body.customer_address,
          customer_notes: body.notes,
          delivery_fee: deliveryFee,
          merchant_received: merchantAmount,
          platform_fee: platformFee,
          additional_data: body.additional_data ? JSON.stringify(body.additional_data) : '{}'
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: corsHeaders() }
        )
      }

      // Create order items
      const orderItems = body.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
      }

      // Create Midtrans transaction
      const midtransOrderId = `${shop.slug}-${order.id.substring(0, 8)}-${Date.now()}`

      const midtransPayload = {
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: grossAmount
        },
        credit_card: {
          secure: true
        },
        customer_details: {
          first_name: body.customer_name,
          email: body.customer_email || `${body.customer_phone}@rupavo.com`,
          phone: body.customer_phone,
          shipping_address: body.customer_address ? {
            address: body.customer_address,
            city: '',
            postal_code: '',
            country_code: 'IDN'
          } : undefined
        },
        item_details: itemDetails,
        callbacks: {
          finish: `${STOREFRONT_URL}/payment/finish?order_id=${order.id}`,
        }
      }

      // Call Midtrans Snap API
      const midtransAuth = btoa(`${MIDTRANS_SERVER_KEY}:`)
      const midtransResponse = await fetch(MIDTRANS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${midtransAuth}`
        },
        body: JSON.stringify(midtransPayload)
      })

      if (!midtransResponse.ok) {
        const errorText = await midtransResponse.text()
        console.error('Midtrans error:', errorText)
        return new Response(
          JSON.stringify({ error: 'Failed to create payment' }),
          { status: 500, headers: corsHeaders() }
        )
      }

      const midtransData = await midtransResponse.json()

      // Save transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          order_id: order.id,
          shop_id: body.shop_id,
          payment_method: 'online',
          payment_provider: 'midtrans',
          amount: grossAmount,
          platform_fee: platformFee,
          merchant_amount: merchantAmount,
          midtrans_order_id: midtransOrderId,
          midtrans_response: midtransData,
          status: 'pending'
        })

      if (txError) {
        console.error('Error creating transaction:', txError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          snap_token: midtransData.token,
          snap_url: midtransData.redirect_url
        }),
        { headers: corsHeaders() }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders() }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
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
