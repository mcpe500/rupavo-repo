import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const MIN_WITHDRAWAL_AMOUNT = 10000 // IDR 10,000

interface PayoutRequest {
  shop_id: string
  amount: number
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders() })
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders() }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Verify user from JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders() }
      )
    }

    if (req.method === 'POST') {
      const body: PayoutRequest = await req.json()

      // Validate request
      if (!body.shop_id || !body.amount) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: shop_id, amount' }),
          { status: 400, headers: corsHeaders() }
        )
      }

      if (body.amount < MIN_WITHDRAWAL_AMOUNT) {
        return new Response(
          JSON.stringify({ error: `Minimum withdrawal amount is Rp ${MIN_WITHDRAWAL_AMOUNT.toLocaleString('id-ID')}` }),
          { status: 400, headers: corsHeaders() }
        )
      }

      // Verify shop ownership
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id, name, owner_id')
        .eq('id', body.shop_id)
        .single()

      if (shopError || !shop) {
        return new Response(
          JSON.stringify({ error: 'Shop not found' }),
          { status: 404, headers: corsHeaders() }
        )
      }

      if (shop.owner_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'You are not the owner of this shop' }),
          { status: 403, headers: corsHeaders() }
        )
      }

      // Get available balance
      const { data: balance, error: balanceError } = await supabase
        .from('shop_balances')
        .select('available_balance, pending_withdrawal')
        .eq('shop_id', body.shop_id)
        .single()

      if (balanceError) {
        console.error('Error fetching balance:', balanceError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch balance' }),
          { status: 500, headers: corsHeaders() }
        )
      }

      const availableBalance = balance?.available_balance || 0

      if (body.amount > availableBalance) {
        return new Response(
          JSON.stringify({ 
            error: `Insufficient balance. Available: Rp ${availableBalance.toLocaleString('id-ID')}`,
            available_balance: availableBalance
          }),
          { status: 400, headers: corsHeaders() }
        )
      }

      // Get bank details from shop payment settings
      const { data: bankSettings, error: bankError } = await supabase
        .from('shop_payment_settings')
        .select('bank_name, bank_account_number, bank_account_holder')
        .eq('shop_id', body.shop_id)
        .single()

      if (bankError || !bankSettings?.bank_name || !bankSettings?.bank_account_number) {
        return new Response(
          JSON.stringify({ error: 'Please set up your bank account first in settings' }),
          { status: 400, headers: corsHeaders() }
        )
      }

      // Create payout request
      const { data: payout, error: payoutError } = await supabase
        .from('payouts')
        .insert({
          shop_id: body.shop_id,
          amount: body.amount,
          status: 'pending',
          bank_name: bankSettings.bank_name,
          bank_account_number: bankSettings.bank_account_number,
          bank_account_holder: bankSettings.bank_account_holder || '',
          requested_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (payoutError) {
        console.error('Error creating payout:', payoutError)
        return new Response(
          JSON.stringify({ error: 'Failed to create withdrawal request' }),
          { status: 500, headers: corsHeaders() }
        )
      }

      console.log(`Payout requested: ${payout.id} - Rp ${body.amount} for shop ${shop.name}`)

      return new Response(
        JSON.stringify({
          success: true,
          payout_id: payout.id,
          amount: body.amount,
          status: 'pending',
          message: 'Withdrawal request submitted successfully. Processing may take 1-3 business days.'
        }),
        { headers: corsHeaders() }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders() }
    )

  } catch (error) {
    console.error('Payout error:', error)
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
