import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface MidtransNotification {
  transaction_id: string
  order_id: string
  gross_amount: string
  payment_type: string
  transaction_status: string
  fraud_status?: string
  signature_key: string
  status_code: string
  transaction_time?: string
  settlement_time?: string
  va_numbers?: Array<{ bank: string; va_number: string }>
  bill_key?: string
  biller_code?: string
  permata_va_number?: string
  merchant_id?: string
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders() })
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders() }
      )
    }

    const notification: MidtransNotification = await req.json()
    console.log('Midtrans notification received:', notification)

    // Verify signature
    const signatureKey = notification.signature_key
    const orderId = notification.order_id
    const statusCode = notification.status_code
    const grossAmount = notification.gross_amount

    const hash = createHash('sha512')
    hash.update(`${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`)
    const calculatedSignature = hash.digest('hex')

    if (signatureKey !== calculatedSignature) {
      console.error('Invalid signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: corsHeaders() }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get transaction from database
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*, orders(*)')
      .eq('midtrans_order_id', orderId)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found:', orderId)
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: corsHeaders() }
      )
    }

    // Map Midtrans status to our status
    let transactionStatus = 'pending'
    let paymentStatus = 'pending'
    let orderStatus = transaction.orders.status

    const transactionStatusCode = notification.transaction_status
    const fraudStatus = notification.fraud_status

    if (transactionStatusCode === 'capture') {
      if (fraudStatus === 'accept') {
        transactionStatus = 'settlement'
        paymentStatus = 'paid'
        orderStatus = 'confirmed'
      }
    } else if (transactionStatusCode === 'settlement') {
      transactionStatus = 'settlement'
      paymentStatus = 'paid'
      orderStatus = 'confirmed'
    } else if (transactionStatusCode === 'pending') {
      transactionStatus = 'pending'
      paymentStatus = 'pending'
      orderStatus = 'draft'
    } else if (transactionStatusCode === 'deny') {
      transactionStatus = 'failed'
      paymentStatus = 'failed'
      orderStatus = 'cancelled'
    } else if (transactionStatusCode === 'expire') {
      transactionStatus = 'expired'
      paymentStatus = 'expired'
      orderStatus = 'cancelled'
    } else if (transactionStatusCode === 'cancel') {
      transactionStatus = 'failed'
      paymentStatus = 'failed'
      orderStatus = 'cancelled'
    } else if (transactionStatusCode === 'refund') {
      transactionStatus = 'refunded'
      paymentStatus = 'refunded'
      orderStatus = 'cancelled'
    }

    // Update transaction
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({
        midtrans_transaction_id: notification.transaction_id,
        midtrans_status: transactionStatusCode,
        midtrans_payment_type: notification.payment_type,
        midtrans_fraud_status: fraudStatus,
        midtrans_response: notification,
        status: transactionStatus,
        settled_at: notification.settlement_time || null
      })
      .eq('id', transaction.id)

    if (updateTxError) {
      console.error('Error updating transaction:', updateTxError)
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: corsHeaders() }
      )
    }

    // Update order
    const orderUpdate: any = {
      payment_status: paymentStatus,
      status: orderStatus
    }

    // Set timestamps based on status
    if (paymentStatus === 'paid' && !transaction.orders.accepted_at) {
      orderUpdate.accepted_at = new Date().toISOString()
    }

    const { error: updateOrderError } = await supabase
      .from('orders')
      .update(orderUpdate)
      .eq('id', transaction.order_id)

    if (updateOrderError) {
      console.error('Error updating order:', updateOrderError)
    }

    // TODO: Send notification to merchant about new paid order
    // This could be push notification, email, or SMS

    console.log(`Payment processed: ${orderId} -> ${transactionStatus}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: transactionStatus,
        order_status: orderStatus 
      }),
      { headers: corsHeaders() }
    )

  } catch (error) {
    console.error('Webhook error:', error)
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
