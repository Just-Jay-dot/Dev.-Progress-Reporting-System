import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  
  if (!amount || amount < 1) {
    return res.status(400).json({ error: 'Invalid amount. Minimum is $1.00' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Support Dev. Progress Report System',
              description: 'Thank you for supporting the development of this tool!'
            },
            unit_amount: Math.round(amount * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:8080'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:8080'}/?payment=cancelled`,
      metadata: {
        source: 'docs-viewer'
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
  }
});

// Verify payment session
router.get('/verify-session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      customerEmail: session.customer_details?.email,
      createdAt: new Date(session.created * 1000).toISOString()
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to verify session', details: error.message });
  }
});

// Webhook handler (for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session.id);
      // Here you would typically:
      // - Update database with payment record
      // - Send confirmation email
      // - Update user account
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;

